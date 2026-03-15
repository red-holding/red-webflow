const svgUrls = [
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52171587f265f0cdd13_Logo%3DBreig.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff521b725f1ab5bc8c624_Logo%3DBogach%20Capital.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff521b44b54700cd82811_Logo%3DBD.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff521c97ec991fba484af_Logo%3DBali%20Capital.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52122fef04ce6e61a2d_Logo%3DBali%20investments.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff521f4c15c547b6f9130_Logo%3DDDA.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff522d4973f2fa0801cc9_Logo%3DDeCosta%20Group%20(Turkey).svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff522567da7d7b0d1d626_Logo%3DAfik%20Group%20(N%20Cyprus).svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff522e1783917bda5521c_Logo%3DHayat%20estate.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52223bbbf499033e2ad_Logo%3DFazWaz.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff522ed0c50cc2340649a_Logo%3DEtagi.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff522925ef0b82e397e45_Logo%3DEvoSystems.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5220d95e9e2bea5783d_Logo%3DGP%20Real%20Estate%20(Cyprus).svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5234e324f785582d826_Logo%3DIberia.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5231cc881a568c277f8_Logo%3DLegion.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52343860d1c89827a63_Logo%3DKalinka.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff524806007d1ac42ba57_Logo%3DLike%20house.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5241f63da943b87b23a_Logo%3DLayan%20verde.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52495d2e8f27ebe8b8a_Logo%3DMayalanya.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5242530b87d13caa5ab_Logo%3DMagnum.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5255fadf1d3047dfe38_Logo%3DMirah.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff525925ef0b82e397f3b_Logo%3DNBA%20Dubai.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff525e00aad53a402a12f_Logo%3DMetropol.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff526618686a9615ec65f_Logo%3DOrbi%20Group.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff526edf9ea9ebefe0d30_Logo%3DRealtika.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5267a1902d2ff9eca25_Logo%3DNeginsky%20(Dubai).svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff526ebdf4daf1b284356_Logo%3DNext.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5265f19d0e4ea6e3fa9_Logo%3DRMC%20Deluxe.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5272ea66e06e2a8bea5_Logo%3DStay%20Property.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5277b81e975a1d09f08_Logo%3DX2%20Group.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff527f2500fef8eb7d1b6_Logo%3DYenisey.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5286e1f270f58bb4788_Logo%3DIntermark%20Global.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5285306ab9068964d88_Logo%3DDGS.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff528618686a9615ec67c_Logo%3DZima%20Dubai.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff528d3da982b2c1a5844_Logo%3DFor%20You%20Real%20Estate.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5281f63da943b87b2bc_Logo%3DLiga.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5293360c7d9f3aecdd0_Logo%3DMira%20Real%20Estate.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff529aa022f8bba1743b3_Logo%3DEva%20Real%20Estate.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff5293c64119eb2aefca2_Logo%3DThe%20capital%20of%20dubai.svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52a806007d1ac42be76_Logo%3DNuanu%20City%20(Bali).svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52aaa022f8bba1743d4_Logo%3DTheWechsel%20(Cyprus).svg",
  "https://cdn.prod.website-files.com/68c29ced9f49825cfe3be778/68eff52aa1ab0b2b752d7105_Logo%3DVeles.svg"
];

const CONFIG = {
  CYCLE_INTERVAL: 2000,
  MAX_REPLACEMENTS: 5,
  FADE_DURATION: 500,
  IMAGE_LOAD_TIMEOUT: 4000
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffleArray(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeUrl(url) {
  if (!url) return "";
  try {
    return new URL(url, window.location.href).href;
  } catch (error) {
    return String(url).trim();
  }
}

function pickUniqueIndexes(max, count) {
  const set = new Set();
  while (set.size < Math.min(count, max)) {
    set.add(Math.floor(Math.random() * max));
  }
  return [...set];
}

function createLogoRotationState() {
  const logosGrid = document.getElementById("logosGrid");
  if (!logosGrid) return null;

  const slots = Array.from(logosGrid.querySelectorAll(".logo-item:not(.ogo-middle)"))
    .map((item) => ({ item, img: item.querySelector("img.img:not(.img-no-swap), img:not(.img-no-swap)") }))
    .filter((slot) => Boolean(slot.img));

  if (!slots.length) return null;

  const urlPool = [...new Set(svgUrls.map(normalizeUrl).filter(Boolean))];
  if (!urlPool.length) return null;

  const poolSet = new Set(urlPool);
  const originalVisibleSet = new Set();
  const currentBySlot = new Map();

  slots.forEach((slot, index) => {
    const url = normalizeUrl(slot.img.getAttribute("src") || slot.img.src);
    if (poolSet.has(url)) {
      originalVisibleSet.add(url);
      currentBySlot.set(index, url);
    }
  });

  return { slots, urlPool, originalVisibleSet, currentBySlot };
}

function getNextUrls(state, count) {
  const currentVisible = new Set(state.currentBySlot.values());
  const unseenInOriginal = [];
  const availableNow = [];

  for (const url of state.urlPool) {
    if (currentVisible.has(url)) continue;
    availableNow.push(url);
    if (!state.originalVisibleSet.has(url)) unseenInOriginal.push(url);
  }

  const prioritized = shuffleArray(unseenInOriginal);
  const unseenSet = new Set(unseenInOriginal);
  const rest = shuffleArray(availableNow.filter((url) => !unseenSet.has(url)));
  const merged = prioritized.concat(rest);

  if (merged.length >= count) return merged.slice(0, count);
  if (merged.length > 0) return merged;

  return shuffleArray(state.urlPool).slice(0, count);
}

function swapImageSrc(img, url) {
  return new Promise((resolve) => {
    let done = false;
    let timeoutId = null;

    const finish = () => {
      if (done) return;
      done = true;
      img.removeEventListener("load", finish);
      img.removeEventListener("error", finish);
      if (timeoutId !== null) clearTimeout(timeoutId);
      resolve();
    };

    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
    timeoutId = setTimeout(finish, CONFIG.IMAGE_LOAD_TIMEOUT);
    img.src = url;

    if (img.complete) {
      requestAnimationFrame(finish);
    }
  });
}

async function replaceSlotLogo(state, slotIndex, nextUrl) {
  const slot = state.slots[slotIndex];
  if (!slot || !slot.img || !nextUrl) return;

  const currentUrl = normalizeUrl(slot.img.getAttribute("src") || slot.img.src);
  if (currentUrl === nextUrl) return;

  slot.item.style.transition = `opacity ${CONFIG.FADE_DURATION}ms ease-in-out`;
  slot.item.style.opacity = "0";
  await wait(CONFIG.FADE_DURATION);

  await swapImageSrc(slot.img, nextUrl);
  state.currentBySlot.set(slotIndex, nextUrl);

  slot.item.style.opacity = "1";
}

async function logoCycle(state) {
  while (true) {
    await wait(CONFIG.CYCLE_INTERVAL);

    const replacementsCount = Math.min(CONFIG.MAX_REPLACEMENTS, state.slots.length);
    const targetIndexes = pickUniqueIndexes(state.slots.length, replacementsCount);
    const nextUrls = getNextUrls(state, targetIndexes.length);
    if (!nextUrls.length) continue;

    const tasks = targetIndexes.map((slotIndex, i) => replaceSlotLogo(state, slotIndex, nextUrls[i]));
    await Promise.all(tasks);
  }
}

function initLogoAnimations() {
  const state = createLogoRotationState();
  if (!state) return;
  logoCycle(state).catch((error) => console.error("logoCycle failed:", error));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLogoAnimations);
} else {
  initLogoAnimations();
}
