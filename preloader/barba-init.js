/**
 * Unified Barba initialization for all pages.
 * Reuses preloader transition hooks exposed by preloader.js.
 */
(function () {
  function debugLog(runId, hypothesisId, location, message, data) {
    // #region agent log
    if (typeof fetch === "function") fetch("http://127.0.0.1:7548/ingest/89c36c11-1e9d-4666-b750-1158af6b5dc7", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4f333f" }, body: JSON.stringify({ sessionId: "4f333f", runId: runId, hypothesisId: hypothesisId, location: location, message: message, data: data, timestamp: Date.now() }) }).catch(function () {});
    // #endregion
  }
  debugLog("pre-fix", "H6", "barba-init.js:bootstrap", "barba init script bootstrap executed", {
    href: window.location.href,
    readyState: document.readyState
  });

  function preventTransition(data) {
    if (window.location.protocol === "file:") return true;
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
    debugLog("pre-fix", "H3", "barba-init.js:preventTransition", "transition allowed", { href: raw, pathname: url.pathname, search: url.search });
    return false;
  }

  function initBarbaTransitions() {
    if (window.location.protocol === "file:") {
      debugLog("pre-fix", "H3", "barba-init.js:initBarbaTransitions", "barba init skipped by file protocol", { protocol: window.location.protocol });
      return false;
    }
    if (typeof barba === "undefined") {
      debugLog("pre-fix", "H3", "barba-init.js:initBarbaTransitions", "barba init skipped: barba undefined", {});
      return false;
    }
    if (!document.querySelector("[data-barba='wrapper']")) {
      debugLog("pre-fix", "H3", "barba-init.js:initBarbaTransitions", "barba init skipped: wrapper missing", {});
      return false;
    }
    if (!document.querySelector("[data-barba='container']")) {
      debugLog("pre-fix", "H3", "barba-init.js:initBarbaTransitions", "barba init skipped: container missing", {});
      return false;
    }
    if (window.__barbaPreloaderInitDone) return true;
    window.__barbaPreloaderInitDone = true;
    debugLog("pre-fix", "H3", "barba-init.js:initBarbaTransitions", "barba init started", {});

    barba.init({
      prevent: preventTransition,
      transitions: [{
        async leave() {
          debugLog("pre-fix", "H3", "barba-init.js:leave", "barba leave hook called", {});
          if (window.__preloaderShowForTransition) return window.__preloaderShowForTransition();
          return Promise.resolve();
        },
        async enter(data) {
          debugLog("pre-fix", "H3", "barba-init.js:enter", "barba enter hook called", {});
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
