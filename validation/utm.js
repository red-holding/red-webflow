// ========== UTM Persistence + Forms (с page-url-contacts-form) ==========
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
const STORAGE_KEY = 'utm_session_2026';
const STORAGE_EXPIRE = 24 * 60 * 60 * 1000; // 24 часа

function getUtmParams() {
  // 1. Пробуем из URL
  const urlParams = new URLSearchParams(window.location.search);
  const utm = {};
  UTM_KEYS.forEach(key => {
    if (urlParams.has(key)) utm[key] = urlParams.get(key);
  });
  
  // 2. Fallback: localStorage
  if (Object.keys(utm).length === 0) {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const now = Date.now();
      if (stored.timestamp && (now - stored.timestamp) < STORAGE_EXPIRE) {
        Object.assign(utm, stored.utms);
      }
    } catch(e) {}
  }
  
  return utm;
}

function saveUtmToStorage() {
  const urlParams = new URLSearchParams(window.location.search);
  const utm = {};
  UTM_KEYS.forEach(key => {
    if (urlParams.has(key)) utm[key] = urlParams.get(key);
  });
  
  if (Object.keys(utm).length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        utms: utm,
        timestamp: Date.now()
      }));
    } catch(e) {}
  }
}

// ✅ Обновлено: + page-url-contacts-form
function fillUrlFields() {
  const fields = [
    document.getElementById('page-url-form'),
    document.getElementById('page-url-quiz'),
    document.getElementById('page-url-contacts-form')  // Добавлено
  ];
  
  const currentUrl = window.location.href;
  fields.forEach(field => {
    if (field) field.value = currentUrl;
  });
}

const UTM_FORM_IDS = ["wf-form-modal-static-quiz","wf-form-Form","wf-form-Form-main","jobs-form-static","contacts-form"];

function addUtmFieldsToForm(formId, utm) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  const hasUtmFields = Array.from(form.querySelectorAll('input[type="hidden"]'))
    .some(input => input.name && input.name.toLowerCase().startsWith('utm_'));
  
  if (!hasUtmFields) {
    Object.keys(utm).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.id = `${key}-${formId}`;
      input.value = utm[key];
      form.appendChild(input);
    });
    return true;
  }
  return false;
}

function initUtmForms() {
  const utm = getUtmParams();
  if (Object.keys(utm).length === 0) return;
  
  UTM_FORM_IDS.forEach(formId => addUtmFieldsToForm(formId, utm));
}

function bootUtm() {
  saveUtmToStorage();
  fillUrlFields();
  initUtmForms();
}

const utmObserver = new MutationObserver(mutations => {
  let shouldInit = false;
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.id && UTM_FORM_IDS.includes(node.id)) {
        shouldInit = true;
      }
    });
  });
  if (shouldInit) {
    fillUrlFields();
    initUtmForms();
  }
});

function startUtmObserver() {
  const body = document.body;
  if (body) utmObserver.observe(body, { childList: true, subtree: true });
}

// Инициализация
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootUtm();
    startUtmObserver();
  }, { once: true });
} else {
  bootUtm();
  startUtmObserver();
}
