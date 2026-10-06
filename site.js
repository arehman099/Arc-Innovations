(() => {
  'use strict';
  const config = window.ARC_CONFIG || {};
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const closeMenu = () => { nav?.classList.remove('open'); toggle?.setAttribute('aria-expanded','false'); };
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open',open); });
  nav?.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  const key = 'arc-analytics-consent-v1';
  const getChoice = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const setChoice = value => { try { localStorage.setItem(key,value); } catch {} };
  let choice = getChoice();
  let loaded = false;
  const validId = /^G-[A-Z0-9]+$/.test(config.analyticsId || '');
  const banner = document.querySelector('.cookie-banner');
  const loadAnalytics = () => {
    if(!validId || choice !== 'granted' || loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',config.analyticsId,{allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:false});
    // Do not transmit query parameters, form values or page fragments.
    window.gtag('event','page_view',{page_location:location.origin+location.pathname});
    const script = document.createElement('script'); script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.analyticsId);script.async=true;document.head.appendChild(script);
  };
  const track = event => { if(choice === 'granted' && loaded && window.gtag) window.gtag('event',event); };
  document.querySelectorAll('[data-cookie-settings]').forEach(b => b.addEventListener('click',()=>{if(banner)banner.hidden=false;}));
  document.querySelectorAll('[data-consent]').forEach(b => b.addEventListener('click',()=>{
    const old = choice; choice=b.dataset.consent;setChoice(choice);if(banner)banner.hidden=true;
    if(choice==='granted') loadAnalytics();
    else if(old==='granted') {
      if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied'});
      for(const cookie of document.cookie.split(';')) {
        const name=cookie.trim().split('=')[0];if(!/^_ga(?:_|$)/.test(name))continue;
        const domains=[null,location.hostname,'.'+location.hostname,'.'+location.hostname.split('.').slice(-2).join('.')];
        domains.forEach(domain=>{document.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'')+'; SameSite=Lax';});
      }
      location.reload();
    }
  }));
  if(validId && !['granted','denied'].includes(choice) && banner)banner.hidden=false;
  loadAnalytics();
  document.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    if(a.dataset.track==='whatsapp' || a.href.includes('wa.me/'))track('whatsapp_click');
    else if(a.hash==='#contact-info')track('consultation_click');
    else if(a.protocol==='tel:')track('phone_click');
    else if(a.protocol==='mailto:')track('email_click');
  }));
  const form = document.querySelector('#contact-form'); if(!form)return;
  const status = document.querySelector('#form-status');
  const button = form.querySelector('[type=submit]');
  const fallback = document.querySelector('#email-fallback');
  const requested = new URLSearchParams(location.search).get('service');
  if(requested && Array.from(form.elements.service.options).some(o=>o.value===requested))form.elements.service.value=requested;
  let endpoint='';try{const u=new URL(config.contactEndpoint);if(u.protocol==='https:')endpoint=u.href;}catch{}
  if(endpoint){button.textContent='Send enquiry ↗';status.textContent='Your details will be sent to our enquiry service.';}
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form));if(data.website)return;delete data.website;
    for(const k of Object.keys(data))data[k]=data[k].trim();
    if(!data.name || !data.message){status.textContent='Please enter a name and message, not only spaces.';return;}
    if(endpoint){
      button.disabled=true;status.textContent='Sending your enquiry…';
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
      try {const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});if(!response.ok)throw Error('Submission failed');status.textContent='Your enquiry has been submitted. Thank you.';form.reset();track('enquiry_submitted');}
      catch{status.textContent='We could not confirm delivery. Please email info@arcinnovations.it or use WhatsApp.';}
      finally{clearTimeout(timer);button.disabled=false;}
    }else{
      const service=form.elements.service.selectedOptions[0].text;
      const body=`Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${service}\n\n${data.message}`;
      const url='mailto:info@arcinnovations.it?subject='+encodeURIComponent('Website enquiry: '+service)+'&body='+encodeURIComponent(body);
      fallback.href=url;fallback.hidden=false;
      status.textContent='Your email draft is ready. Review and send it in your email app. Nothing has been sent by this website. If your app did not open, use the link below or email us directly.';
      track('email_draft_prepared');location.href=url;
    }
  });
})();
