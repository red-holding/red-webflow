/**
 * Preloader: первая загрузка и переходы (Barba).
 * Экспортирует в window: __preloaderShowForTransition, __preloaderHideAfterTransition.
 */
(function () {
  var PRELOADER_ICON_HIDE_MS = 500;  /* через 0.5s скрыть иконку и начать снятие блюра */
  var PRELOADER_TOTAL_MS = 1500;     /* первая загрузка: итого ~1.5s */
  var PRELOADER_UNBLUR_MS = 1000;   /* длительность снятия блюра при первой загрузке */
  var TRANSITION_BLUR_MS = 700;      /* этап 1: блюр */
  var TRANSITION_END_MS = 700;       /* этап 2: уход в чёрный (до вызова Barba swap) */
  var TRANSITION_UNBLUR_MS = 1200;   /* снятие блюра на новой странице */
  var TRANSITION_BLUR_PX = 16;
  var preloaderActive = false;
  var animationStarted = false;
  var scrollPosition = 0;
  var lockedScrollLogged = false;

  function debugLog(runId, hypothesisId, location, message, data) {
    // #region agent log
    if (typeof fetch === "function") fetch("http://127.0.0.1:7548/ingest/89c36c11-1e9d-4666-b750-1158af6b5dc7", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4f333f" }, body: JSON.stringify({ sessionId: "4f333f", runId: runId, hypothesisId: hypothesisId, location: location, message: message, data: data, timestamp: Date.now() }) }).catch(function () {});
    // #endregion
  }
  debugLog("pre-fix", "H6", "preloader.js:bootstrap", "preloader script bootstrap executed", {
    href: window.location.href,
    readyState: document.readyState
  });

  function getPreloaderEls() {
    return {
      preloader: document.getElementById("preloader"),
      pageWrapper: document.querySelector(".page-wrapper"),
      /* При переходе Barba блюрим обёртку — контейнер может подменяться и блюр теряется */
      transitionTarget: document.querySelector("[data-barba='wrapper']") || document.querySelector(".page-wrapper")
    };
  }

  function resetPreloaderState() {
    var els = getPreloaderEls();
    if (!els.preloader || !els.pageWrapper) return;
    els.preloader.classList.remove("load", "icon-hide", "close", "cover", "reveal", "active", "blur", "end");
    els.pageWrapper.classList.remove("load", "transition-blur", "blur");
    els.pageWrapper.style.transition = "";
    els.pageWrapper.style.filter = "";
    if (els.transitionTarget && els.transitionTarget !== els.pageWrapper) {
      els.transitionTarget.classList.remove("load", "transition-blur", "blur");
      els.transitionTarget.style.transition = "";
      els.transitionTarget.style.filter = "";
    }
    els.preloader.style.transition = "";
    els.preloader.style.opacity = "";
    els.pageWrapper.offsetHeight;
    var icon = els.preloader.querySelector(".preloader-icon");
    if (icon) {
      icon.style.opacity = "1";
      icon.style.animationPlayState = "running";
      icon.style.transform = "rotate(0deg)";
    }
  }

  function lockScroll() {
    if (preloaderActive) return;
    preloaderActive = true;
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    debugLog("pre-fix", "H4", "preloader.js:lockScroll", "lockScroll called", {
      scrollPosition: scrollPosition,
      bodyNoScrollBefore: document.body.classList.contains("no-scroll"),
      htmlClassName: document.documentElement.className
    });
    document.body.style.top = "-" + scrollPosition + "px";
    document.body.classList.add("no-scroll");
  }

  function unlockScroll() {
    debugLog("pre-fix", "H5", "preloader.js:unlockScroll:before", "unlockScroll before restore", {
      savedScrollPosition: scrollPosition,
      currentScrollY: window.pageYOffset || document.documentElement.scrollTop,
      bodyNoScrollBefore: document.body.classList.contains("no-scroll")
    });
    preloaderActive = false;
    animationStarted = false;
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo(0, scrollPosition);
    debugLog("pre-fix", "H5", "preloader.js:unlockScroll:after", "unlockScroll after restore", {
      savedScrollPosition: scrollPosition,
      currentScrollY: window.pageYOffset || document.documentElement.scrollTop,
      bodyNoScrollAfter: document.body.classList.contains("no-scroll")
    });
  }

  function startPreloaderAnimation() {
    if (animationStarted) return;
    animationStarted = true;
    var els = getPreloaderEls();
    debugLog("pre-fix", "H1", "preloader.js:startPreloaderAnimation:entry", "startPreloaderAnimation entry", {
      hasPreloader: !!(els && els.preloader),
      hasPageWrapper: !!(els && els.pageWrapper),
      preloaderClassName: els && els.preloader ? els.preloader.className : null
    });
    if (!els.preloader || !els.pageWrapper) {
      unlockScroll();
      return;
    }
    var start = Date.now();
    var easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    setTimeout(function () {
      els.preloader.classList.add("icon-hide");
      els.preloader.classList.add("load");
      els.preloader.classList.remove("end", "blur", "active");
      debugLog("pre-fix", "H2", "preloader.js:startPreloaderAnimation:phase", "first-load classes switched to load/icon-hide", {
        preloaderClassName: els.preloader.className,
        pageWrapperClassName: els.pageWrapper.className
      });
      els.pageWrapper.style.transition = "filter " + PRELOADER_UNBLUR_MS + "ms " + easing;
      els.pageWrapper.classList.add("load");
      setTimeout(function () {
        els.preloader.classList.add("close");
        unlockScroll();
      }, Math.max(PRELOADER_TOTAL_MS - (Date.now() - start), 0));
    }, PRELOADER_ICON_HIDE_MS);
  }

  function shouldRunPreloader() {
    var path = window.location.pathname || "";
    if (/\/404\.html$|\/401\.html$/i.test(path)) return false;
    if (/\/component-/.test(path)) return false;
    return true;
  }

  function initPreloader() {
    var shouldRun = shouldRunPreloader();
    debugLog("pre-fix", "H1", "preloader.js:initPreloader", "initPreloader triggered", {
      shouldRun: shouldRun,
      readyState: document.readyState,
      animationStarted: animationStarted,
      preloaderActive: preloaderActive,
      hasPreloaderEl: !!document.getElementById("preloader"),
      hasBarbaWrapper: !!document.querySelector("[data-barba='wrapper']"),
      hasBarbaContainer: !!document.querySelector("[data-barba='container']")
    });
    if (!shouldRun) return;
    lockScroll();
    requestAnimationFrame(startPreloaderAnimation);
  }

  function getBlurTargets(els) {
    var targets = [];
    if (els.transitionTarget) targets.push(els.transitionTarget);
    if (els.pageWrapper && targets.indexOf(els.pageWrapper) === -1) targets.push(els.pageWrapper);
    return targets;
  }

  function showPreloaderForTransition() {
    resetPreloaderState();
    lockScroll();
    var els = getPreloaderEls();
    debugLog("pre-fix", "H3", "preloader.js:showPreloaderForTransition:entry", "showPreloaderForTransition called", {
      hasPreloader: !!(els && els.preloader),
      hasPageWrapper: !!(els && els.pageWrapper),
      hasTransitionTarget: !!(els && els.transitionTarget),
      preloaderClassName: els && els.preloader ? els.preloader.className : null
    });
    if (!els.preloader || !els.pageWrapper) return Promise.resolve();
    var easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    var blurTargets = getBlurTargets(els);
    els.preloader.classList.add("blur");
    els.preloader.classList.remove("load", "close", "icon-hide", "end");
    els.preloader.style.transition = "opacity " + TRANSITION_END_MS + "ms " + easing;
    blurTargets.forEach(function (target) {
      target.classList.remove("load");
      target.style.transition = "filter " + TRANSITION_BLUR_MS + "ms " + easing;
      target.style.filter = "blur(0px)";
      target.offsetHeight;
    });
    blurTargets.forEach(function (target) {
      target.classList.add("blur");
      target.style.filter = "blur(" + TRANSITION_BLUR_PX + "px)";
    });
    return new Promise(function (resolve) {
      setTimeout(function () {
        els.preloader.classList.remove("blur");
        els.preloader.classList.add("end");
        debugLog("pre-fix", "H2", "preloader.js:showPreloaderForTransition:toEnd", "transition switched to end", {
          preloaderClassName: els.preloader.className
        });
        setTimeout(resolve, TRANSITION_END_MS);
      }, TRANSITION_BLUR_MS);
    });
  }

  function hidePreloaderAfterTransition() {
    var els = getPreloaderEls();
    debugLog("pre-fix", "H3", "preloader.js:hidePreloaderAfterTransition:entry", "hidePreloaderAfterTransition called", {
      hasPreloader: !!(els && els.preloader),
      hasPageWrapper: !!(els && els.pageWrapper),
      hasTransitionTarget: !!(els && els.transitionTarget)
    });
    if (!els.preloader || !els.pageWrapper) return Promise.resolve();
    var targets = getBlurTargets(els);
    var easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    return new Promise(function (resolve) {
      targets.forEach(function (target) {
        target.classList.add("blur");
        target.classList.remove("load");
        target.style.filter = "blur(" + TRANSITION_BLUR_PX + "px)";
      });
      els.preloader.classList.remove("blur");
      els.preloader.classList.add("end");
      els.preloader.classList.remove("icon-hide", "load", "close");
      els.preloader.style.transition = "opacity " + TRANSITION_UNBLUR_MS + "ms " + easing;
      requestAnimationFrame(function () {
        els.preloader.classList.remove("end");
        els.preloader.classList.add("load");
      });
      setTimeout(function () {
        targets.forEach(function (target) {
          target.classList.remove("blur");
          target.classList.add("load");
          target.style.transition = "filter " + TRANSITION_UNBLUR_MS + "ms " + easing;
          target.style.filter = "blur(0px)";
        });
        els.preloader.classList.add("icon-hide");
        els.preloader.classList.add("close");
        unlockScroll();
        debugLog("pre-fix", "H3", "preloader.js:hidePreloaderAfterTransition:done", "hidePreloaderAfterTransition completed", {
          preloaderClassName: els.preloader.className
        });
        resolve();
      }, TRANSITION_UNBLUR_MS);
    });
  }

  function shouldUseHardNavigationFallback() {
    if (window.location.protocol === "file:") return true;
    if (typeof window.barba === "undefined") return true;
    if (!document.querySelector("[data-barba='wrapper']")) return true;
    if (!document.querySelector("[data-barba='container']")) return true;
    return false;
  }

  function shouldInterceptLinkClick(link, ev) {
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
    var isHttp = /^https?:$/i.test(url.protocol);
    var isFile = /^file:$/i.test(url.protocol);
    if (!isHttp && !isFile) return false;
    if (isHttp && url.origin !== window.location.origin) return false;
    if (isFile && window.location.protocol !== "file:") return false;
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return false;
    return true;
  }

  function initHardNavigationFallback() {
    if (window.__preloaderHardNavBound) return;
    window.__preloaderHardNavBound = true;
    document.addEventListener("click", function (ev) {
      if (!shouldUseHardNavigationFallback()) return;
      var link = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
      if (!shouldInterceptLinkClick(link, ev)) return;
      ev.preventDefault();
      var nextUrl;
      try {
        nextUrl = new URL(link.getAttribute("href"), window.location.href).href;
      } catch (e) {
        window.location.href = link.getAttribute("href");
        return;
      }
      showPreloaderForTransition().then(function () {
        window.location.href = nextUrl;
      });
    }, true);
  }

  window.__preloaderShowForTransition = showPreloaderForTransition;
  window.__preloaderHideAfterTransition = hidePreloaderAfterTransition;

  document.addEventListener("DOMContentLoaded", initPreloader);
  document.addEventListener("DOMContentLoaded", initHardNavigationFallback);
  window.addEventListener("scroll", function () {
    if (!preloaderActive || lockedScrollLogged) return;
    lockedScrollLogged = true;
    debugLog("pre-fix", "H4", "preloader.js:scrollWhileLocked", "scroll happened while preloaderActive", {
      currentScrollY: window.pageYOffset || document.documentElement.scrollTop,
      bodyNoScroll: document.body.classList.contains("no-scroll"),
      htmlClassName: document.documentElement.className
    });
  }, { passive: true });
  window.addEventListener("load", initPreloader);
  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted) {
      resetPreloaderState();
      initPreloader();
    }
  });
})();
