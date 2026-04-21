// https://red-holding.github.io/red-webflow/cookie/cookie.js
(function() {
  // Защита от двойного выполнения
  if (window.cookieConsentLoaded) return;
  window.cookieConsentLoaded = true;
  
  function initConsent() {
    let e = JSON.parse(localStorage.getItem("cookieConsent") || "{}");
    let t = document.querySelector(".cookie-wrapper");
    if (e.saved) {
      t?.classList.add("close");
      e.analytics && loadAnalytics();
      e.marketing && loadMarketing();
    } else {
      t?.classList.add("show");
    }
  }
  
  function loadAnalytics() {
    document.querySelectorAll('script[data-cookie-category="analytics"]').forEach(function(script) {
      script.type = "text/javascript";
      if (script.dataset.src) {
        script.src = script.dataset.src;
        script.removeAttribute("data-src");
      }
      if (script.textContent) eval(script.textContent);
    });
  }
  
  function loadMarketing() {
    document.querySelectorAll('script[data-cookie-category="marketing"]').forEach(function(script) {
      script.type = "text/javascript";
      if (script.dataset.src) {
        script.src = script.dataset.src;
        script.removeAttribute("data-src");
      }
      if (script.textContent) eval(script.textContent);
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initConsent);
  } else {
    initConsent();
  }
  
  document.addEventListener("click", function(e) {
    let t = e.target.closest("[data-popup-trigger]");
    if (t) {
      e.preventDefault();
      document.querySelector(`[data-popup="${t.getAttribute("data-popup-trigger")}"]`)?.classList.add("open");
    }
    let a = e.target.closest("[data-popup-close]");
    if (a) {
      e.preventDefault();
      document.querySelector(`[data-popup="${a.getAttribute("data-popup-close") || "cookie"}"]`)?.classList.remove("open");
    }
  });
  
  document.querySelectorAll('.toggle-wrapper input[type="checkbox"]').forEach(function(e) {
    let t = e.closest(".toggle-wrapper");
    t.classList.toggle("active", e.checked);
    e.addEventListener("change", function() { t.classList.toggle("active", e.checked); });
  });
  
  document.querySelector('[data-cookie="all"]')?.addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.setItem("cookieConsent", JSON.stringify({analytics: true, marketing: true, saved: true}));
    document.querySelector(".cookie-wrapper")?.classList.add("close");
    loadAnalytics();
    loadMarketing();
  });
  
  document.querySelector('[data-cookie="necessary"]')?.addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.setItem("cookieConsent", JSON.stringify({analytics: false, marketing: false, saved: true}));
    document.querySelector(".cookie-wrapper")?.classList.add("close");
  });
  
  document.addEventListener("click", function(e) {
    let t = e.target.closest(".btn-cookie");
    if (t) {
      e.preventDefault();
      let a = {necessary: true, saved: true};
      document.querySelectorAll('input[data-name="analytics"]').forEach(function(e) { a.analytics = e.checked; });
      document.querySelectorAll('input[data-name="marketing"]').forEach(function(e) { a.marketing = e.checked; });
      localStorage.setItem("cookieConsent", JSON.stringify(a));
      document.querySelector(".cookie-wrapper")?.classList.add("close");
      a.analytics && loadAnalytics();
      a.marketing && loadMarketing();
    }
  });
})();
