/**
 * Unified Barba initialization for all pages.
 * Reuses preloader transition hooks exposed by preloader.js.
 */
(function () {
  function preventTransition(data) {
    var a = data.trigger;
    if (!a || !a.getAttribute("href")) return true;
    var raw = a.getAttribute("href");
    if (a.target === "_blank" || raw.charAt(0) === "#" || /^mailto:/i.test(raw) || /^tel:/i.test(raw)) return true;
    var url;
    try {
      url = new URL(raw, window.location.href);
    } catch (e) {
      return true;
    }
    if (!/^https?:$/i.test(url.protocol)) return true;
    if (url.origin !== window.location.origin) return true;
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return true;
    if (a.closest(".w-pagination-wrapper") || a.closest("[class*='pagination']") || a.closest("[data-w-id*='pagination']")) return true;
    if (url.search && /_page=\d+/.test(url.search)) return true;
    if (/\/post\/\w+\/\d{4,}/.test(url.pathname) || /\/p\/\d+/.test(url.pathname)) return true;
    return false;
  }

  function initBarbaTransitions() {
    if (typeof barba === "undefined") return false;
    if (!document.querySelector("[data-barba='wrapper']")) return false;
    if (!document.querySelector("[data-barba='container']")) return false;
    if (window.__barbaPreloaderInitDone) return true;
    window.__barbaPreloaderInitDone = true;

    barba.init({
      prevent: preventTransition,
      transitions: [{
        async leave() {
          if (window.__preloaderShowForTransition) return window.__preloaderShowForTransition();
          return Promise.resolve();
        },
        async enter(data) {
          var html = (data && data.next && data.next.html) || "";
          var titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          if (titleMatch) document.title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
          if (window.__preloaderHideAfterTransition) return window.__preloaderHideAfterTransition();
          return Promise.resolve();
        }
      }]
    });

    barba.hooks.after(function () {
      document.dispatchEvent(new CustomEvent("page:ready"));
    });
    return true;
  }

  if (!initBarbaTransitions()) {
    var tries = 0;
    var maxTries = 120; /* ~6s with 50ms polling */
    var timer = setInterval(function () {
      tries++;
      if (initBarbaTransitions() || tries >= maxTries) clearInterval(timer);
    }, 50);
  }
})();
