# Arc Innovations website

Static website for GitHub Pages; no build step or framework required.

## Preview

Run `python -m http.server 8000` from this directory, then open http://localhost:8000.
Publish the repository root using GitHub Pages. Keep CNAME for www.arcinnovations.it and review DNS before changing hosting. Existing case-study assets, SQL scripts, Python loader, videos and domain-verification file are preserved.

## Contact form

By default, the form validates fields and prepares a mailto draft. The visitor must send it in their email application. It never claims a draft has been delivered. WhatsApp and phone links use the supplied Italian number +39 351 656 5042; confirm that this number is registered for WhatsApp.

For direct delivery, set `contactEndpoint` in site-config.js to an HTTPS enquiry endpoint you own. The endpoint must accept JSON fields name, company, email, phone, service, message and return a 2xx response only after accepting the submission. Configure CORS for your domain, server-side validation, abuse protection, and a delivery mechanism. Keep all credentials on the server. Update the privacy notice for the selected provider, retention, recipients and transfers. Test failure and success delivery before enabling.

## Analytics and Search Console

Set your real GA4 measurement ID in site-config.js only after reviewing your analytics configuration and notices. Analytics loads after explicit opt-in, is rejected by default, and can be withdrawn using Cookie preferences on every page. Enquiry values and URL query parameters are excluded from the custom events. Events: page_view, consultation_click, whatsapp_click, phone_click, email_click, email_draft_prepared, enquiry_submitted. Custom page views omit the query and fragment; leave enhanced measurement OFF in GA4 to avoid additional automatic events collecting form interactions or full URLs. Test the property and consent settings before launch.

The original Google verification HTML file is retained. Ownership cannot be verified from a ZIP: confirm it belongs to your Search Console property, verify the domain or HTML method in your account, then submit https://www.arcinnovations.it/sitemap.xml. Search Console does not need an analytics script.

## Owner-provided details still needed

- Verified company and individual LinkedIn URLs, other professional social URLs. None invented.
- Confirm the generic team bios with each member; they are based only on existing titles, except Bilal's supplied specialization.
- Genuine testimonials, permission to publish them, and verified before/after metrics. Until then the site uses “What you can expect” and labels portfolio content as demos/concepts.
- Confirm legal controller identity/address, retention policy, hosting/email processors and any applicable transfers before publishing privacy notices. The supplied notices describe default behavior and are not a legal compliance certification. Reference sources: EU GDPR Article 13 (https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/) and Garante cookie guidance (https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876).
- Additional mailboxes sales@, support@ and bilal@ must be created through your email provider and tested before adding them to the website. info@ remains the published contact.

## File layout

- index.html: main conversion-focused page, team, process, industries, FAQs and enquiry form.
- Six root-level service pages; portfolio.html and preserved project detail pages.
- blog.html plus five articles; email-security-checklist.html is print friendly.
- site.css / site.js / site-config.js: shared presentation, interactions and public configuration.
- style.css and legacy-fixes.css: preserved project presentation and accessibility/mobile fixes.
- privacy-policy.html, cookie-policy.html, sitemap.xml, robots.txt.

All fonts on new pages are local. The homepage uses static content rather than autoplay video. Original videos remain available in vids but are not loaded by the homepage. Compressed WebP previews are included alongside originals.
