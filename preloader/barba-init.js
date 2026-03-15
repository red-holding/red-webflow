/**
 * Unified Barba initialization for all pages.
 * Reuses preloader transition hooks exposed by preloader.js.
 */
(function () {
  var LOCAL_TRACE_KEY = "__preloaderAnimationTrace";
  var LOCAL_TRACE_LIMIT = 400;
  var manualNavigationInProgress = false;

  function safeClone(value) {
    if (typeof value === "undefined") return null;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return String(value);
    }
  }

  function getDomSnapshot() {
    var preloader = document.getElementById("preloader");
    var wrapper = document.querySelector("[data-barba='wrapper']");
    var container = document.querySelector("[data-barba='container']");
    function pick(el) {
      if (!el) return null;
      return {
        className: el.className || "",
        filter: el.style && el.style.filter ? el.style.filter : "",
        transition: el.style && el.style.transition ? el.style.transition : "",
        opacity: el.style && el.style.opacity ? el.style.opacity : ""
      };
    }
    return {
      href: window.location.href,
      readyState: document.readyState,
      manualNavigationInProgress: manualNavigationInProgress,
      preloader: pick(preloader),
      barbaWrapper: pick(wrapper),
      barbaContainer: pick(container)
    };
  }

  function persistLocalTrace(entry) {
    try {
      if (!window.localStorage) return;
      var raw = window.localStorage.getItem(LOCAL_TRACE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) arr = [];
      arr.push(entry);
      if (arr.length > LOCAL_TRACE_LIMIT) arr = arr.slice(arr.length - LOCAL_TRACE_LIMIT);
      window.localStorage.setItem(LOCAL_TRACE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function debugLog(runId, hypothesisId, location, message, data) {
    persistLocalTrace({
      ts: Date.now(),
      source: "barba-init.js",
      runId: runId,
      hypothesisId: hypothesisId,
      location: location,
      message: message,
      data: safeClone(data),
      snapshot: getDomSnapshot()
    });
    // #region agent log
    if (typeof fetch === "function") fetch("http://127.0.0.1:7548/ingest/89c36c11-1e9d-4666-b750-1158af6b5dc7", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4f333f" }, body: JSON.stringify({ sessionId: "4f333f", runId: runId, hypothesisId: hypothesisId, location: location, message: message, data: data, timestamp: Date.now() }) }).catch(function () {});
    // #endregion
  }

  function shouldInterceptForBarba(link, ev) {
    if (!link || !link.getAttribute("href")) return false;
    if (ev.defaultPrevented) return false;
    if (ev.button !== 0) return false;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return false;
    var raw = link.getAttribute("href");
    if (!raw || raw.charAt(0) === "#") return false;
    if (/^mailto:/i.test(raw) || /^tel:/i.test(raw) || /^javascript:/i.test(raw)) return false;
    if (link.target === "_blank") return false;
    if (link.hasAttribute("download")) return false;
    var url;
    try {
      url = new URL(raw, window.location.href);
    } catch (e) {
      return false;
    }
    if (!/^https?:$/i.test(url.protocol)) return false;
    if (url.origin !== window.location.origin) return false;
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return false;
    return true;
  }

  function bindImmediateBarbaNavigation() {
    if (window.__barbaManualNavBound) return;
    window.__barbaManualNavBound = true;
    document.addEventListener("click", function (ev) {
      if (manualNavigationInProgress) return;
      if (window.location.protocol === "file:") return;
      if (typeof window.barba === "undefined" || !window.__barbaPreloaderInitDone) return;
      var link = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
      if (!shouldInterceptForBarba(link, ev)) return;
      ev.preventDefault();
      ev.stopPropagation();
      var nextUrl;
      try {
        nextUrl = new URL(link.getAttribute("href"), window.location.href).href;
      } catch (e) {
        window.location.href = link.getAttribute("href");
        return;
      }
      manualNavigationInProgress = true;
      debugLog("pre-fix", "H3", "barba-init.js:manualNav", "manual preloader navigation start", { nextUrl: nextUrl });
      Promise.resolve(window.__preloaderShowForTransition ? window.__preloaderShowForTransition() : undefined)
        .catch(function () {})
        .then(function () {
          window.__preloaderLeaveHandled = true;
          window.barba.go(nextUrl);
        })
        .catch(function () {
          window.location.href = nextUrl;
        });
    }, true);
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
          if (window.__preloaderLeaveHandled) {
            window.__preloaderLeaveHandled = false;
            return Promise.resolve();
          }
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
      manualNavigationInProgress = false;
      document.dispatchEvent(new CustomEvent("page:ready"));
    });
    bindImmediateBarbaNavigation();
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
