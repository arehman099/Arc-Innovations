# etl/load_csv.py
import os
import argparse
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

# ---------- Config ----------
DEFAULT_TABLES = {
    "suppliers": {
        "file": "suppliers.csv",
        "columns": ["name", "email", "phone"],
        "date_cols": [],
    },
    "products": {
        "file": "products.csv",
        "columns": ["sku", "name", "unit_price", "reorder_level", "supplier_id"],
        "date_cols": [],
    },
    "customers": {
        "file": "customers.csv",
        "columns": ["name", "email"],
        "date_cols": [],
    },
    "orders": {
        "file": "orders.csv",
        "columns": ["customer_id", "order_date", "status"],
        "date_cols": ["order_date"],
    },
    "order_items": {
        "file": "order_items.csv",
        "columns": ["order_id", "product_id", "qty", "price"],
        "date_cols": [],
    },
    "stock_movements": {
        "file": "stock_movements.csv",
        "columns": ["product_id", "delta", "reason", "created_at"],
        "date_cols": ["created_at"],
    },
}

# ---------- Helpers ----------
def read_csv(path: str, usecols=None, parse_dates=None) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV not found: {path}")
    return pd.read_csv(
        path,
        usecols=usecols,
        parse_dates=parse_dates or [],
        keep_default_na=True,
        na_values=["", "NA", "NaN", "null", "None"],
    )

def ensure_schema(engine, schema_sql_path: str | None):
    if not schema_sql_path:
        return
    if not os.path.exists(schema_sql_path):
        raise FileNotFoundError(f"Schema SQL not found: {schema_sql_path}")
    with engine.begin() as conn, open(schema_sql_path, "r", encoding="utf-8") as f:
        conn.execute(text(f.read()))

def load_table(engine, table: str, df: pd.DataFrame, if_exists: str = "append"):
    if df.empty:
        print(f"[skip] {table}: dataframe is empty")
        return
    df = df.reset_index(drop=True)
    df.to_sql(
        name=table,
        con=engine,
        if_exists=if_exists,
        index=False,
        method="multi",
        chunksize=1000,
    )
    print(f"[ok]   {table}: loaded {len(df)} rows")

def build_engine(database_url: str):
    if not database_url:
        raise ValueError("DATABASE_URL is required. Example (Postgres): "
                         "postgresql+psycopg2://user:pass@host:5432/dbname")
    return create_engine(database_url, pool_pre_ping=True, future=True)

# ---------- Main ----------
def main():
    parser = argparse.ArgumentParser(description="Load CSVs into the DB (append by default).")
    parser.add_argument("--db", dest="database_url", default=os.getenv("DATABASE_URL"), help="SQLAlchemy URL")
    parser.add_argument("--data-dir", default=os.path.join(os.path.dirname(__file__), "data"), help="Folder with CSVs")
    parser.add_argument("--schema-sql", default=None, help="Optional path to 01_schema.sql to apply before loading")
    parser.add_argument("--if-exists", choices=["append", "replace", "fail"], default="append", help="Load mode")
    parser.add_argument("--only", nargs="*", default=None, help="Subset of tables to load (e.g. products orders)")
    args = parser.parse_args()

    engine = build_engine(args.database_url)
    ensure_schema(engine, args.schema_sql)

    tables = DEFAULT_TABLES
    if args.only:
        missing = [t for t in args.only if t not in tables]
        if missing:
            raise SystemExit(f"Unknown tables: {', '.join(missing)}. Known: {', '.join(tables.keys())}")
        tables = {k: v for k, v in tables.items() if k in args.only}

    for table, spec in tables.items():
        csv_path = os.path.join(args.data_dir, spec["file"])
        try:
            df = read_csv(csv_path, usecols=spec["columns"], parse_dates=spec["date_cols"])
            # Casts
            for col in df.columns:
                if col.endswith("_id") or col in {"qty", "delta", "reorder_level"}:
                    df[col] = pd.to_numeric(df[col], errors="coerce").astype("Int64")
                if col in {"unit_price", "price"}:
                    df[col] = pd.to_numeric(df[col], errors="coerce")
                if col in spec["date_cols"]:
                    df[col] = pd.to_datetime(df[col], errors="coerce", utc=False)
            load_table(engine, table, df, if_exists=args.if_exists)
        except FileNotFoundError:
            print(f"[miss] {table}: {csv_path} (skipped)")
        except Exception as e:
            print(f"[err]  {table}: {e}")
            raise

if __name__ == "__main__":
    main()
