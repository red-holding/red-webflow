// https://red-holding.github.io/red-webflow/cookie/cookie.js
document.addEventListener("DOMContentLoaded", function () {
  const CONSENT_API_URL = "https://red-webflow-cookie-consent.general-407.workers.dev/api/consent";
  const LOCAL_STORAGE_KEY = "cookieConsent";
  const BANNER_SHOW_DELAY_MS = 650;
  let openBannerTimer = null;

  const defaultConsent = {
    necessary: true,
    analytics: false,
    marketing: false,
    saved: false,
  };

  // RU / AR banner text (13.11.2026, DGS). Runs only on pages with <html lang="ru"> or "ar"; English pages
  // are untouched. A text is replaced only when it is exactly the English banner text below, so a banner
  // already written in another language keeps its own words and links. Escaped to stay ASCII.
  const COOKIE_TEXT = {
    "Our site uses cookies": { ru: "\u041d\u0430\u0448 \u0441\u0430\u0439\u0442 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 cookies", ar: "\u064a\u0633\u062a\u062e\u062f\u0645 \u0645\u0648\u0642\u0639\u0646\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637" },
    "We use cookies for site functionality, analytics, and marketing.": { ru: "\u041c\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c cookies \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441\u0430\u0439\u0442\u0430, \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438 \u0438 \u043c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433\u0430. \u041d\u0430\u0436\u043c\u0438\u0442\u0435", ar: "\u0646\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0648\u0627\u0644\u062a\u0633\u0648\u064a\u0642. \u0627\u0641\u062a\u062d" },
    "Visit Manage Cookies": { ru: "\u00ab\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 cookies\u00bb", ar: "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637" },
    "to change preferences anytime.": { ru: ", \u0447\u0442\u043e\u0431\u044b \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u0432 \u043b\u044e\u0431\u043e\u0439 \u043c\u043e\u043c\u0435\u043d\u0442.", ar: "\u0644\u062a\u063a\u064a\u064a\u0631 \u062a\u0641\u0636\u064a\u0644\u0627\u062a\u0643 \u0641\u064a \u0623\u064a \u0648\u0642\u062a." },
    "Accept all": { ru: "\u041f\u0440\u0438\u043d\u044f\u0442\u044c \u0432\u0441\u0435", ar: "\u0642\u0628\u0648\u0644 \u0627\u0644\u0643\u0644" },
    "Reject non-essential": { ru: "\u0422\u043e\u043b\u044c\u043a\u043e \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u044b\u0435", ar: "\u0627\u0644\u0636\u0631\u0648\u0631\u064a\u0629 \u0641\u0642\u0637" },
    "Cookie Preference Center": { ru: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 cookies", ar: "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637" },
    "We use cookies for site functionality, analytics, and marketing. Manage your preferences below. To learn more, read our": { ru: "\u041c\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c cookies \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441\u0430\u0439\u0442\u0430, \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438 \u0438 \u043c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433\u0430. \u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439\u0442\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u043c\u0438 \u043d\u0438\u0436\u0435. \u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435 \u2014 \u0432", ar: "\u0646\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0648\u0627\u0644\u062a\u0633\u0648\u064a\u0642. \u064a\u0645\u0643\u0646\u0643 \u0625\u062f\u0627\u0631\u0629 \u062a\u0641\u0636\u064a\u0644\u0627\u062a\u0643 \u0623\u062f\u0646\u0627\u0647. \u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0632\u064a\u062f\u060c \u0627\u0637\u0651\u0644\u0639 \u0639\u0644\u0649" },
    "Privacy Policy.": { ru: "\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0435 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438.", ar: "\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629." },
    "Strictly Necessary Cookies (always active)": { ru: "\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u044b\u0435 cookies (\u0432\u0441\u0435\u0433\u0434\u0430 \u0430\u043a\u0442\u0438\u0432\u043d\u044b)", ar: "\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0636\u0631\u0648\u0631\u064a\u0629 (\u0645\u0641\u0639\u0651\u0644\u0629 \u062f\u0627\u0626\u0645\u0627\u064b)" },
    "Required for the site to work. Cannot be disabled.": { ru: "\u041e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b \u0434\u043b\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441\u0430\u0439\u0442\u0430. \u041d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c.", ar: "\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0648\u0642\u0639. \u0644\u0627 \u064a\u0645\u0643\u0646 \u062a\u0639\u0637\u064a\u0644\u0647\u0627." },
    "Analytics Cookies": { ru: "\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 cookies", ar: "\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u064a\u0629" },
    "Help us measure traffic and improve performance.": { ru: "\u041f\u043e\u043c\u043e\u0433\u0430\u044e\u0442 \u043d\u0430\u043c \u0438\u0437\u043c\u0435\u0440\u044f\u0442\u044c \u0442\u0440\u0430\u0444\u0438\u043a \u0438 \u0443\u043b\u0443\u0447\u0448\u0430\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0443 \u0441\u0430\u0439\u0442\u0430.", ar: "\u062a\u0633\u0627\u0639\u062f\u0646\u0627 \u0639\u0644\u0649 \u0642\u064a\u0627\u0633 \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0648\u062a\u062d\u0633\u064a\u0646 \u0623\u062f\u0627\u0621 \u0627\u0644\u0645\u0648\u0642\u0639." },
    "Marketing Cookies": { ru: "\u041c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433\u043e\u0432\u044b\u0435 cookies", ar: "\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u064a\u0629" },
    "Used to measure marketing campaigns effectiveness.": { ru: "\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f \u0434\u043b\u044f \u043e\u0446\u0435\u043d\u043a\u0438 \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u044b\u0445 \u043a\u0430\u043c\u043f\u0430\u043d\u0438\u0439.", ar: "\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0644\u0642\u064a\u0627\u0633 \u0641\u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u064a\u0629." },
    "Save Preferences": { ru: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438", ar: "\u062d\u0641\u0638 \u0627\u0644\u062a\u0641\u0636\u064a\u0644\u0627\u062a" },
  };

  function cookieLang() {
    const code = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
    return code === "ru" || code === "ar" ? code : null;
  }

  function localizeCookieBanner() {
    const lang = cookieLang();
    if (!lang) return;
    const roots = document.querySelectorAll('.cookie-wrapper, .cookie-popup, [data-modal="cookie"], [data-popup="cookie"]');
    roots.forEach((root) => {
      if (lang === "ar") root.setAttribute("dir", "rtl");
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        const raw = node.nodeValue || "";
        const key = raw.replace(/\s+/g, " ").trim();
        const entry = key && Object.prototype.hasOwnProperty.call(COOKIE_TEXT, key) ? COOKIE_TEXT[key] : null;
        if (!entry) return;
        const lead = /^\s/.test(raw) ? " " : "";
        const tail = /\s$/.test(raw) ? " " : "";
        // RU puts its comma right after the link text, without a space.
        node.nodeValue = (lead + entry[lang] + tail).replace(/^ ,/, ",");
        const link = node.parentElement && node.parentElement.closest("a[href]");
        const href = link ? link.getAttribute("href") : "";
        if (key === "Privacy Policy." && href && /^\/docs\//.test(href)) link.setAttribute("href", "/" + lang + href);
      });
    });
  }

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

  localizeCookieBanner();

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
