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
  setTimeout(()=>focusQuoteStep(),80);
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
function syncEventTypeRequired(){
  const service = quoteForm.querySelector('input[name="service"]:checked')?.value || '';
  const eventType = document.getElementById('eventType');
  const eventTypeOther = document.getElementById('eventTypeOther');
  const otherWrap = document.getElementById('eventTypeOtherWrap');

  const invitation = service === 'Invitación digital';
  if(eventType) eventType.required = invitation;

  const isOther = invitation && eventType?.value === 'Otro';
  if(otherWrap) otherWrap.hidden = !isOther;
  if(eventTypeOther) eventTypeOther.required = isOther;
}

function setServiceContext(value){
  Object.values(contextBoxes).forEach(el=>el.classList.remove('visible'));
  if(contextBoxes[value]) contextBoxes[value].classList.add('visible');
  syncEventTypeRequired();
}
quoteForm.querySelectorAll('input[name="service"]').forEach(radio=>{
  radio.addEventListener('change',()=>setServiceContext(radio.value));
});

document.getElementById('eventType')?.addEventListener('change', syncEventTypeRequired);


function selectedValues(name){
  return [...quoteForm.querySelectorAll(`input[name="${name}"]:checked`)].map(el=>el.value);
}
function buildPayload(){
  const fd = new FormData(quoteForm);
  const service = fd.get('service') || '';
  let details = {};
  if(service === 'Invitación digital'){
    {
      const rawEventType = fd.get('eventType') || '';
      const otherEventType = fd.get('eventTypeOther') || '';
      const eventType = rawEventType === 'Otro'
        ? `Otro: ${otherEventType}`.trim()
        : rawEventType;
      details = {eventType, eventDate:fd.get('eventDate')||'', features:selectedValues('eventFeature')};
    }
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


const quoteSuccess = document.getElementById('quoteSuccess');
const quoteSuccessMessage = document.getElementById('quoteSuccessMessage');
const sendAnotherQuote = document.getElementById('sendAnotherQuote');
const closeQuoteSuccess = document.getElementById('closeQuoteSuccess');

function showQuoteSuccess(payload){
  const quoteDialog = document.querySelector('.quote-dialog');

  quoteHead.hidden = true;
  quoteForm.hidden = true;
  quoteSuccess.hidden = false;
  quoteDialog?.classList.add('success-mode');

  if(quoteSuccessMessage){
    if(payload.email){
      quoteSuccessMessage.textContent =
        `Recibimos tu solicitud y enviamos una confirmación a ${payload.email}. ` +
        `Vamos a revisar la información y podremos responderte por los datos de contacto que compartiste.`;
    }else{
      quoteSuccessMessage.textContent =
        'Recibimos tu solicitud correctamente. Vamos a revisarla y podremos responderte por WhatsApp. ' +
        'Si querés recibir confirmación por correo en otra solicitud, podés agregar tu email.';
    }
  }

  quoteSuccess.querySelector('button')?.focus({preventScroll:true});
}

function resetQuoteForAnotherRequest(){
  const quoteDialog = document.querySelector('.quote-dialog');

  quoteForm.reset();
  Object.values(contextBoxes).forEach(el=>el.classList.remove('visible'));
  document.getElementById('eventTypeOtherWrap')?.setAttribute('hidden','');
  const eventOther = document.getElementById('eventTypeOther');
  if(eventOther) eventOther.required = false;
  const eventType = document.getElementById('eventType');
  if(eventType) eventType.required = false;

  if(quoteSelectedService){
    quoteSelectedService.textContent='Todavía no elegiste un servicio';
  }

  formStatus.className='form-status';
  formStatus.textContent='';

  quoteSuccess.hidden = true;
  quoteHead.hidden = false;
  quoteForm.hidden = false;
  quoteDialog?.classList.remove('success-mode');

  currentQuoteStep = 0;
  showQuoteStep(0, false);
  quoteForm.scrollTop = 0;
  setTimeout(focusQuoteStep, 80);
}

sendAnotherQuote?.addEventListener('click', resetQuoteForAnotherRequest);

quoteForm.addEventListener('submit', e=>{
  e.preventDefault();
  formStatus.className='form-status';
  const invalidStep = firstInvalidQuoteStep();
  if(invalidStep !== -1){
    showQuoteStep(invalidStep);
    validateQuoteStep(invalidStep, true);
    return;
  }
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

  formStatus.textContent='Solicitud enviada.';
  formStatus.classList.add('show','success');

  // La entrega se realiza mediante POST tradicional al endpoint de Apps Script.
  // Mostramos una confirmación clara y permitimos iniciar otra solicitud.
  setTimeout(()=>{
    submitQuote.disabled=false;
    submitQuote.textContent='Enviar solicitud';
    showQuoteSuccess(payload);
  },650);
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


/* ==========================================================
   V19 · Quote wizard UX
   ========================================================== */
const quoteSteps = [...quoteForm.querySelectorAll('.form-step')];
const quoteNext = document.getElementById('quoteNext');
const quoteBack = document.getElementById('quoteBack');
const quoteCounter = document.getElementById('quoteStepCounter');
const quoteProgressFill = document.getElementById('quoteProgressFill');
const quoteRailSteps = [...document.querySelectorAll('[data-rail-step]')];
const quoteSelectedService = document.getElementById('quoteSelectedService');
let currentQuoteStep = 0;
let lastQuoteTrigger = null;

function visibleFocusable(root){
  return [...root.querySelectorAll(
    'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
}

function focusQuoteStep(){
  const step = quoteSteps[currentQuoteStep];
  if(!step) return;
  const first = visibleFocusable(step)[0];
  first?.focus({preventScroll:true});
}

function showQuoteStep(index, focus = true){
  if(index === 3) syncQuoteReview();
  currentQuoteStep = Math.max(0, Math.min(index, quoteSteps.length - 1));
  quoteSteps.forEach((step, i) => step.hidden = i !== currentQuoteStep);

  quoteRailSteps.forEach((item, i) => {
    const active = i === currentQuoteStep;
    item.classList.toggle('active', active);
    if(active) item.setAttribute('aria-current','step');
    else item.removeAttribute('aria-current');
  });

  if(quoteProgressFill){
    quoteProgressFill.style.width = `${((currentQuoteStep + 1) / quoteSteps.length) * 100}%`;
  }
  if(quoteCounter){
    quoteCounter.textContent = `Paso ${currentQuoteStep + 1} de ${quoteSteps.length}`;
  }

  quoteBack.style.display = currentQuoteStep === 0 ? 'none' : 'inline-flex';
  quoteNext.style.display = currentQuoteStep === quoteSteps.length - 1 ? 'none' : 'inline-flex';
  if(quoteNext){
    quoteNext.textContent = currentQuoteStep === 2 ? 'Revisar solicitud' : 'Continuar';
  }
  submitQuote.style.display = currentQuoteStep === quoteSteps.length - 1 ? 'inline-flex' : 'none';

  quoteForm.scrollTo({top:0, behavior:'smooth'});
  if(focus) setTimeout(focusQuoteStep, 80);
}

function validateQuoteStep(index, report = false){
  const step = quoteSteps[index];
  if(!step) return true;

  if(index === 0){
    const selected = quoteForm.querySelector('input[name="service"]:checked');
    if(!selected){
      const first = quoteForm.querySelector('input[name="service"]');
      if(report) first?.focus();
      return false;
    }
  }

  const required = [...step.querySelectorAll('[required]')];
  for(const field of required){
    if(!field.checkValidity()){
      if(report) field.reportValidity();
      return false;
    }
  }

  if(index === 2){
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    if(!phoneField.value.trim() && !emailField.value.trim()){
      if(report){
        formStatus.textContent='Ingresá un teléfono/WhatsApp o un correo electrónico para poder responderte.';
        formStatus.className='form-status show error';
        phoneField.focus();
      }
      return false;
    }
  }

  return true;
}

function firstInvalidQuoteStep(){
  for(let i=0;i<quoteSteps.length;i++){
    if(!validateQuoteStep(i, false)) return i;
  }
  return -1;
}

quoteNext?.addEventListener('click', () => {
  formStatus.className='form-status';
  if(!validateQuoteStep(currentQuoteStep, true)) return;
  showQuoteStep(currentQuoteStep + 1);
});

quoteBack?.addEventListener('click', () => {
  formStatus.className='form-status';
  showQuoteStep(currentQuoteStep - 1);
});

quoteForm.querySelectorAll('input[name="service"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if(quoteSelectedService) quoteSelectedService.textContent = radio.value;
  });
});

document.querySelectorAll('[data-open-quote]').forEach(el => {
  el.addEventListener('click', () => {
    lastQuoteTrigger = el;
    setTimeout(() => showQuoteStep(currentQuoteStep, false), 0);
  });
});

document.querySelectorAll('[data-close-quote]').forEach(el => {
  el.addEventListener('click', () => {
    setTimeout(() => lastQuoteTrigger?.focus(), 0);
  });
});

quoteModal.addEventListener('keydown', e => {
  if(e.key !== 'Tab' || !quoteModal.classList.contains('open')) return;
  const focusables = visibleFocusable(quoteModal);
  if(!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if(e.shiftKey && document.activeElement === first){
    e.preventDefault();
    last.focus();
  }else if(!e.shiftKey && document.activeElement === last){
    e.preventDefault();
    first.focus();
  }
});



/* ==========================================================
   V22 · Review request before submit
   ========================================================== */
function displayValue(value, fallback='No indicado'){
  const text = String(value || '').trim();
  return text || fallback;
}

function selectedTexts(selector){
  return [...quoteForm.querySelectorAll(selector)]
    .filter(el => el.checked)
    .map(el => el.value || el.closest('label')?.textContent?.trim())
    .filter(Boolean);
}

function syncQuoteReview(){
  const service = quoteForm.querySelector('input[name="service"]:checked')?.value || '—';
  const reviewService = document.getElementById('reviewService');
  const reviewServiceDetails = document.getElementById('reviewServiceDetails');
  const reviewIdea = document.getElementById('reviewIdea');
  const reviewTargetDate = document.getElementById('reviewTargetDate');
  const reviewBudget = document.getElementById('reviewBudget');
  const reviewName = document.getElementById('reviewName');
  const reviewPhone = document.getElementById('reviewPhone');
  const reviewEmail = document.getElementById('reviewEmail');
  const reviewCountry = document.getElementById('reviewCountry');

  if(reviewService) reviewService.textContent = service;
  if(reviewIdea) reviewIdea.textContent = displayValue(document.getElementById('idea')?.value, 'Sin descripción');
  if(reviewTargetDate) reviewTargetDate.textContent = displayValue(document.getElementById('targetDate')?.value, 'Por definir');
  if(reviewBudget) reviewBudget.textContent = displayValue(document.getElementById('budget')?.value, 'Prefiero conversarlo');
  if(reviewName) reviewName.textContent = displayValue(document.getElementById('clientName')?.value, '—');
  if(reviewPhone) reviewPhone.textContent = displayValue(document.getElementById('phone')?.value);
  if(reviewEmail) reviewEmail.textContent = displayValue(document.getElementById('email')?.value);
  if(reviewCountry) reviewCountry.textContent = displayValue(document.getElementById('country')?.value, '—');

  if(reviewServiceDetails){
    const details = [];

    if(service === 'Invitación digital'){
      const eventType = document.getElementById('eventType')?.value;
      const eventTypeOther = document.getElementById('eventTypeOther')?.value;
      const eventDate = document.getElementById('eventDate')?.value;
      const features = selectedTexts('#eventFields input[type="checkbox"]');
      if(eventType){
        details.push(`Evento: ${eventType === 'Otro' ? `Otro: ${displayValue(eventTypeOther, 'Sin especificar')}` : eventType}`);
      }
      if(eventDate) details.push(`Fecha del evento: ${eventDate}`);
      if(features.length) details.push(`Incluye: ${features.join(', ')}`);
    }

    if(service === 'Página web'){
      const businessType = document.getElementById('businessType')?.value;
      const webGoal = document.getElementById('webGoal')?.value;
      const features = selectedTexts('#webContext input[type="checkbox"]');
      if(businessType) details.push(`Proyecto: ${businessType}`);
      if(webGoal) details.push(`Objetivo: ${webGoal}`);
      if(features.length) details.push(`Funciones: ${features.join(', ')}`);
    }

    if(service === 'Procesos'){
      const problem = document.getElementById('processProblem')?.value;
      const needs = selectedTexts('#processContext input[type="checkbox"]');
      if(problem) details.push(`Situación: ${problem}`);
      if(needs.length) details.push(`Necesita: ${needs.join(', ')}`);
    }

    reviewServiceDetails.innerHTML = '';
    if(details.length){
      details.forEach(text => {
        const item = document.createElement('div');
        item.className = 'review-detail-item';
        item.textContent = text;
        reviewServiceDetails.appendChild(item);
      });
    }else{
      const item = document.createElement('div');
      item.className = 'review-detail-item';
      item.textContent = 'Sin detalles adicionales';
      reviewServiceDetails.appendChild(item);
    }
  }
}

document.querySelectorAll('[data-edit-step]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = Number(btn.dataset.editStep) - 1;
    showQuoteStep(target);
  });
});

showQuoteStep(0, false);


/* V23: keep dynamic required state consistent */
syncEventTypeRequired();
