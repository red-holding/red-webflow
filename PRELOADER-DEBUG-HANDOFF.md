# Preloader Debug Handoff (Webflow + local repo)

## 1) Scope and goal

- Task: investigate broken preloader animation behavior on Webflow site using local repo code from `preloader`.
- Symptoms reported by user:
  - no dark overlay on page load and on page leave;
  - scroll unlocks too early and jumps;
  - if user scrolls during loading, viewport snaps back after loading.
- Constraint followed: analysis-first workflow, no direct Webflow write actions.

## 2) Environment snapshot

- Repo: `C:/Users/ruxlo/OneDrive/Desktop/red-webflow`
- Relevant local files:
  - `preloader/preloader.js`
  - `preloader/barba-init.js`
  - `preloader/preloader.css`
- Connected Webflow site (via MCP): `68c29ced9f49825cfe3be778` (`real-estate-dealers-201fa2`).
- Production HTML confirms assets are loaded from GitHub Pages:
  - `https://red-holding.github.io/red-webflow/preloader/preloader.css`
  - `https://red-holding.github.io/red-webflow/preloader/preloader.js`
  - `https://red-holding.github.io/red-webflow/preloader/barba-init.js`

## 3) What was changed during investigation

Instrumentation was added (not removed yet) in:

- `preloader/preloader.js`
  - `debugLog(...)` helper posting to debug endpoint.
  - logs in:
    - `lockScroll()`
    - `unlockScroll()` (before and after)
    - `startPreloaderAnimation()`
    - first-load phase class switch
    - `initPreloader()`
    - `showPreloaderForTransition()`
    - `hidePreloaderAfterTransition()`
    - `scroll` while preloader is active
  - bootstrap log at script load.
- `preloader/barba-init.js`
  - `debugLog(...)` helper
  - logs in:
    - bootstrap
    - `preventTransition(...)` decisions
    - `initBarbaTransitions()` init path and skip reasons
    - `leave()` and `enter()` hooks

## 4) Runtime evidence collected

### 4.1 Confirmed by runtime

- Production page contains:
  - `#preloader`
  - `data-barba="wrapper"`
  - `data-barba="container"`
- Production page contains Lenis runtime inline code near page end.
- Deployed `preloader.js` on GitHub Pages includes debug markers (`sessionId 4f333f`, `function debugLog`, and `window.scrollTo(0, scrollPosition)`), so deployed file is the instrumented variant.

### 4.2 Missing/blocked evidence

- Debug log file `debug-4f333f.log` was never created locally during reproductions.
- Because page runs on `https://www.red-property.com` and debug endpoint is `http://127.0.0.1:7548/...`, browser likely blocks requests as mixed content.
- Result: detailed hypothesis logs are unavailable in local debug file for this run.

## 5) Hypotheses and status

## H1: Double preloader init causes timing race
- Signal in code: `initPreloader` is bound to both `DOMContentLoaded` and `load`.
- Status: **likely**, but not proven by debug log lines due to missing log file.

## H2: No dark overlay because first-load class sequence hides preloader
- Signal in code: first-load flow sets `icon-hide + load` quickly and removes visible states.
- Status: **high confidence (code-path based)**.

## H3: Barba transition chain not always used
- Signal in code: `preventTransition` has multiple early exits; fallback path exists.
- Status: **inconclusive** without runtime logs for actual navigation path.

## H4: Scroll lock conflicts with Lenis
- Signal in code: lock affects `body` only, while Lenis controls scroll behavior independently.
- Status: **high confidence (architecture conflict)**.

## H5: Snap-back after loading is caused by explicit scroll restore
- Signal in code: `unlockScroll()` always runs `window.scrollTo(0, scrollPosition)`.
- Status: **high confidence (direct deterministic behavior)**.

## H6: Debug instrumentation does not reach collector
- Signal in runtime: no `debug-4f333f.log` despite deployed instrumented script.
- Status: **confirmed**.

## 6) Root-cause picture (current best model)

Most probable combined failure chain:

1. First-load preloader classes move too early to hidden state (`load/icon-hide`), so black overlay is not visible as intended.
2. Scroll lock is body-only and not integrated with Lenis stop/start lifecycle.
3. User can still effectively scroll during transition window.
4. On unlock, forced `scrollTo(savedPosition)` snaps viewport back, perceived as jump/rebound.

This explains all user-visible symptoms together.

## 7) Recommended manual implementation steps in Webflow (for next agent/user)

1. Ensure first-load preloader starts from visible overlay state (`active` or `end`) before entering fade-out/load phase.
2. Integrate preloader lock/unlock with Lenis:
   - expose Lenis instance globally (`window.__lenis`);
   - call `window.__lenis.stop()` in `lockScroll()`;
   - call `window.__lenis.start()` in `unlockScroll()`.
3. Remove or conditionally gate unconditional `window.scrollTo(0, scrollPosition)` in `unlockScroll()`.
4. Guard against duplicate first-load init (`DOMContentLoaded` + `load`) with a strict single-run flag.
5. Keep Barba + fallback behavior but verify `preventTransition` rules do not accidentally bypass intended transitions.

## 8) QA checklist for manual validation

- First page load:
  - black overlay appears;
  - icon animation is visible and smooth;
  - scroll is fully blocked until animation end.
- Internal page transition:
  - blur phase then black phase are visible;
  - no early scroll movement;
  - no viewport snap-back after transition completion.
- Stress test:
  - aggressively scroll during first load and during leave/enter;
  - verify no jump/rebound.
- Cross-page:
  - Home, About, Jobs, Blog, Cases.

## 9) Open items for next agent

- Re-run instrumentation in an `http://localhost` environment where collector endpoint is reachable from page context.
- Confirm/reject H1 and H3 with actual log lines.
- If fix is applied, keep logs during post-fix run, then remove instrumentation only after verified success.

## 10) Important current state

- Investigation is **not finalized as fixed**.
- Instrumentation remains in source files intentionally for verification.
