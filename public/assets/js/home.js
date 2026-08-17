/* MAEM Studio · Home behavior · V18 */
'use strict';


const header = document.getElementById('header');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 16), {passive:true});

menuBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open', open);
  menuBtn.textContent = open ? '×' : '☰';
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuBtn.textContent = '☰';
}));

document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
});

const io = new IntersectionObserver(entries => entries.forEach(e => {
  if(e.isIntersecting) {
    e.target.classList.add('visible');
    io.unobserve(e.target);
  }
}), {threshold:.1, rootMargin:'0px 0px -5% 0px'});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

setTimeout(() => document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible')), 90);


const quoteModal = document.getElementById('quoteModal');
const quoteForm = document.getElementById('quoteForm');
const formStatus = document.getElementById('formStatus');
const submitQuote = document.getElementById('submitQuote');

/*
  Cuando despleguemos el Apps Script, pegamos aquí su URL /exec.
  Mientras esté vacío, el formulario trabaja en MODO PREVIEW y no finge haber enviado datos.
*/
const MAEM_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwKxCcGpNZhXdukuquKFaQuRdPn5Cm3hq6xk2umoMFld9lRA0sMzzu-ZCBaMs5cuUVP/exec";

function openQuote(){
  quoteModal.classList.add('open');
  quoteModal.setAttribute('aria-hidden','false');
  document.body.classList.add('menu-open');
  setTimeout(()=>quoteModal.querySelector('input[name="service"]')?.focus(),80);
}
function closeQuote(){
  quoteModal.classList.remove('open');
  quoteModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('menu-open');
}
document.querySelectorAll('[data-open-quote]').forEach(el=>el.addEventListener('click',e=>{
  e.preventDefault(); openQuote();
}));
document.querySelectorAll('[data-close-quote]').forEach(el=>el.addEventListener('click',closeQuote));
addEventListener('keydown',e=>{if(e.key==='Escape' && quoteModal.classList.contains('open')) closeQuote()});

const contextBoxes = {
  'Invitación digital': document.getElementById('eventFields'),
  'Página web': document.getElementById('webFields'),
  'Procesos': document.getElementById('processFields')
};
function setServiceContext(value){
  Object.values(contextBoxes).forEach(el=>el.classList.remove('visible'));
  if(contextBoxes[value]) contextBoxes[value].classList.add('visible');
}
quoteForm.querySelectorAll('input[name="service"]').forEach(radio=>{
  radio.addEventListener('change',()=>setServiceContext(radio.value));
});

function selectedValues(name){
  return [...quoteForm.querySelectorAll(`input[name="${name}"]:checked`)].map(el=>el.value);
}
function buildPayload(){
  const fd = new FormData(quoteForm);
  const service = fd.get('service') || '';
  let details = {};
  if(service === 'Invitación digital'){
    details = {eventType:fd.get('eventType')||'', eventDate:fd.get('eventDate')||'', features:selectedValues('eventFeature')};
  } else if(service === 'Página web'){
    details = {businessType:fd.get('businessType')||'', goal:fd.get('webGoal')||'', features:selectedValues('webFeature')};
  } else if(service === 'Procesos'){
    details = {problem:fd.get('processProblem')||'', needs:selectedValues('processNeed')};
  }
  return {
    service,
    clientName:fd.get('clientName')||'',
    phone:fd.get('phone')||'',
    email:fd.get('email')||'',
    website:fd.get('website')||'',
    country:fd.get('country')||'',
    idea:fd.get('idea')||'',
    targetDate:fd.get('targetDate')||'',
    budget:fd.get('budget')||'',
    referral:fd.get('referral')||'',
    details,
    source:'MAEM Studio website',
    legalAccepted:document.getElementById('legalConsent')?.checked === true,
    legalVersion:'2026-08',
    createdAt:new Date().toISOString()
  };
}

quoteForm.addEventListener('submit', e=>{
  e.preventDefault();
  formStatus.className='form-status';
  if(!quoteForm.reportValidity()) return;

  const phoneField = document.getElementById('phone');
  const emailField = document.getElementById('email');
  if(!phoneField.value.trim() && !emailField.value.trim()){
    formStatus.textContent='Ingresá al menos un teléfono/WhatsApp o un correo electrónico.';
    formStatus.classList.add('show','error');
    phoneField.focus();
    return;
  }

  const payload = buildPayload();

  if(!MAEM_FORM_ENDPOINT){
    formStatus.textContent='El formulario todavía no tiene endpoint configurado.';
    formStatus.classList.add('show','error');
    return;
  }

  submitQuote.disabled=true;
  submitQuote.textContent='Enviando...';

  // POST HTML tradicional a iframe oculto:
  // evita depender de fetch/CORS/ContentService.
  let iframe = document.getElementById('maemSubmitFrame');
  if(!iframe){
    iframe = document.createElement('iframe');
    iframe.name = 'maemSubmitFrame';
    iframe.id = 'maemSubmitFrame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  const bridge = document.createElement('form');
  bridge.method = 'POST';
  bridge.action = MAEM_FORM_ENDPOINT;
  bridge.target = 'maemSubmitFrame';
  bridge.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'payload';
  input.value = JSON.stringify(payload);
  bridge.appendChild(input);

  document.body.appendChild(bridge);
  bridge.submit();
  bridge.remove();

  formStatus.textContent='Solicitud enviada. Estamos registrando la información...';
  formStatus.classList.add('show','success');

  // No borramos inmediatamente los datos: así, si algo falla durante
  // la prueba, el usuario no tiene que volver a escribirlos.
  setTimeout(()=>{
    submitQuote.disabled=false;
    submitQuote.textContent='Enviar solicitud →';
  },1200);
});



(() => {
  const modal = document.getElementById('legalModal');
  if (!modal) return;

  const docs = [...modal.querySelectorAll('[data-legal-doc]')];
  const closeBtn = modal.querySelector('[data-legal-close]');

  function openLegal(name){
    docs.forEach(doc => {
      doc.hidden = doc.dataset.legalDoc !== name;
    });
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('menu-open');
    setTimeout(() => closeBtn?.focus(), 40);
  }

  function closeLegal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('menu-open');
  }

  document.querySelectorAll('[data-legal-open]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openLegal(el.dataset.legalOpen);
    });
  });

  closeBtn?.addEventListener('click', closeLegal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeLegal();
  });

  addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeLegal();
  });
})();
