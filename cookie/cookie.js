// https://red-holding.github.io/red-webflow/cookie/cookie.js
document.addEventListener("DOMContentLoaded", function () {
  const CONSENT_API_URL = "https://red-webflow-cookie-consent.general-407.workers.dev/api/consent";
  const LOCAL_STORAGE_KEY = "cookieConsent";
  const BANNER_SHOW_DELAY_MS = 2500;
  let openBannerTimer = null;

  const defaultConsent = {
    necessary: true,
    analytics: false,
    marketing: false,
    saved: false,
  };

  const scriptLoadState = {
    essential: false,
    analytics: false,
    marketing: false,
  };

  function runDeferredScript(script) {
    if (script.dataset.cookieLoaded === "1") return Promise.resolve();

    return new Promise((resolve) => {
      script.dataset.cookieLoaded = "1";
      script.type = "text/javascript";

      const deferredSrc = script.dataset.src || "";
      if (deferredSrc) {
        const done = () => {
          script.removeEventListener("load", done);
          script.removeEventListener("error", done);
          resolve();
        };
        script.addEventListener("load", done, { once: true });
        script.addEventListener("error", done, { once: true });
        // Force ordered execution for deferred dependency chains.
        script.async = false;
        script.src = deferredSrc;
        script.removeAttribute("data-src");
        return;
      }

      if (script.textContent) {
        // Kept for backward compatibility with inline deferred snippets.
        eval(script.textContent);
      }
      resolve();
    });
  }

  async function loadEssential() {
    if (scriptLoadState.essential) return;
    const scripts = document.querySelectorAll('script[data-cookie-load="essential"]');
    for (const script of scripts) {
      await runDeferredScript(script);
    }
    scriptLoadState.essential = true;
  }

  async function loadAnalytics() {
    if (scriptLoadState.analytics) return;
    const scripts = document.querySelectorAll('script[data-cookie-category="analytics"]');
    for (const script of scripts) {
      await runDeferredScript(script);
    }
    scriptLoadState.analytics = true;
  }

  async function loadMarketing() {
    if (scriptLoadState.marketing) return;
    const scripts = document.querySelectorAll('script[data-cookie-category="marketing"]');
    for (const script of scripts) {
      await runDeferredScript(script);
    }
    scriptLoadState.marketing = true;
  }

  function applyConsent(consent) {
    const wrapper = document.querySelector(".cookie-wrapper");
    if (consent.saved) {
      if (openBannerTimer) {
        clearTimeout(openBannerTimer);
        openBannerTimer = null;
      }
      wrapper?.classList.remove("show");
      void loadEssential();
      if (consent.analytics) void loadAnalytics();
      if (consent.marketing) void loadMarketing();
    } else {
      if (!wrapper) return;
      if (openBannerTimer) clearTimeout(openBannerTimer);
      openBannerTimer = setTimeout(() => {
        wrapper.classList.add("show");
        openBannerTimer = null;
      }, BANNER_SHOW_DELAY_MS);
    }
  }

  function getConsentFromLocalStorage() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.saved) return null;
      return {
        necessary: true,
        analytics: !!parsed.analytics,
        marketing: !!parsed.marketing,
        saved: true,
      };
    } catch (error) {
      return null;
    }
  }

  function saveConsentToLocalStorage(consent) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(consent));
    } catch (error) {
      // Ignore storage quota/private mode errors.
    }
  }

  async function getConsentFromServer() {
    const response = await fetch(CONSENT_API_URL, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Failed to load consent");
    return response.json();
  }

  async function saveConsentToServer(consent) {
    const response = await fetch(CONSENT_API_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    });
    if (!response.ok) throw new Error("Failed to save consent");
    return response.json();
  }

  async function migrateLegacyLocalStorageConsent() {
    try {
      const migrated = getConsentFromLocalStorage();
      if (!migrated) return;
      await saveConsentToServer(migrated);
    } catch (error) {
      // Keep local fallback if migration fails.
    }
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-popup-trigger]");
    if (trigger) {
      event.preventDefault();
      document
        .querySelector(
          `[data-popup="${trigger.getAttribute("data-popup-trigger")}"]`,
        )
        ?.classList.add("open");
    }

    const close = event.target.closest("[data-popup-close]");
    if (close) {
      event.preventDefault();
      document
        .querySelector(
          `[data-popup="${close.getAttribute("data-popup-close") || "cookie"}"]`,
        )
        ?.classList.remove("open");
    }
  });

  document
    .querySelectorAll('.toggle-wrapper input[type="checkbox"]')
    .forEach((input) => {
      const wrapper = input.closest(".toggle-wrapper");
      wrapper.classList.toggle("active", input.checked);
      input.addEventListener("change", () =>
        wrapper.classList.toggle("active", input.checked),
      );
    });

  document.querySelector('[data-cookie="all"]')?.addEventListener("click", async (event) => {
    event.preventDefault();
    const consent = { necessary: true, analytics: true, marketing: true, saved: true };
    applyConsent(consent);
    saveConsentToLocalStorage(consent);
    try {
      await saveConsentToServer(consent);
    } catch (error) {
      console.error("Cookie consent save failed:", error);
    }
  });

  document
    .querySelector('[data-cookie="necessary"]')
    ?.addEventListener("click", async (event) => {
      event.preventDefault();
      const consent = {
        necessary: true,
        analytics: false,
        marketing: false,
        saved: true,
      };
      applyConsent(consent);
      saveConsentToLocalStorage(consent);
      try {
        await saveConsentToServer(consent);
      } catch (error) {
        console.error("Cookie consent save failed:", error);
      }
    });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".btn-cookie");
    if (!button) return;
    event.preventDefault();
    const consent = { necessary: true, analytics: false, marketing: false, saved: true };
    document
      .querySelectorAll('input[data-name="analytics"]')
      .forEach((input) => (consent.analytics = input.checked));
    document
      .querySelectorAll('input[data-name="marketing"]')
      .forEach((input) => (consent.marketing = input.checked));
    applyConsent(consent);
    saveConsentToLocalStorage(consent);
    try {
      await saveConsentToServer(consent);
    } catch (error) {
      console.error("Cookie consent save failed:", error);
    }
  });

  (async function initConsent() {
    await migrateLegacyLocalStorageConsent();
    const localConsent = getConsentFromLocalStorage();
    if (localConsent) {
      applyConsent({ ...defaultConsent, ...localConsent });
    }
    try {
      const consent = await getConsentFromServer();
      if (consent?.saved) {
        saveConsentToLocalStorage(consent);
      }
      const resolvedConsent = localConsent?.saved
        ? { ...defaultConsent, ...consent, ...localConsent }
        : { ...defaultConsent, ...consent };
      applyConsent(resolvedConsent);
    } catch (error) {
      console.error("Cookie consent load failed:", error);
      applyConsent(localConsent ? { ...defaultConsent, ...localConsent } : defaultConsent);
    }
  })();
});
