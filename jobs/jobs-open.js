(function () {
  function initJobs() {
    const items = document.querySelectorAll('[jobs="item"]');
    if (!items.length) return;

    const map = new Map(); // item → { closed, full }
    let activeItem = null;

    // Анимация изменения высоты
    function animateHeight(el, targetHeight, duration = 800) {
      return new Promise((resolve) => {
        const startHeight = parseFloat(el.style.height) || 0;
        const startTime = performance.now();

        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentHeight = startHeight + (targetHeight - startHeight) * progress;

          el.style.height = currentHeight + "px";

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.style.height = targetHeight + "px";
            resolve();
          }
        }

        requestAnimationFrame(step);
      });
    }

    // Развернуть блок
    async function openItem(item) {
      const moreText = item.querySelector('[jobs="more-text"]');
      if (!moreText) return;

      const data = map.get(item);
      if (!data) return;

      item.classList.add("active");
      await animateHeight(moreText, data.full);
    }

    // Свернуть блок
    async function closeItem(item) {
      const moreText = item.querySelector('[jobs="more-text"]');
      if (!moreText) return;

      const data = map.get(item);
      if (!data) return;

      item.classList.remove("active");
      await animateHeight(moreText, data.closed);
    }

    // Инициализация высоты more-text
    items.forEach((item) => {
      const moreText = item.querySelector('[jobs="more-text"]');
      if (!moreText) return;

      moreText.style.overflow = "hidden";
      moreText.style.height = "0px";

      map.set(item, {
        closed: 0,
        full: moreText.scrollHeight, // элемент должен быть видим, чтобы scrollHeight корректно считался
      });
    });

    // Обработчики кнопок
    items.forEach((item) => {
      const btn = item.querySelector('[jobs="open-bttn"]');
      if (!btn) return;

      btn.addEventListener("click", async (event) => {
        event.preventDefault();

        if (activeItem === item) {
          // Сворачиваем текущий
          await closeItem(item);
          btn.textContent = "Развернуть вакансию";
          activeItem = null;
        } else {
          // Если уже есть активный — сворачиваем его
          if (activeItem) {
            const activeBtn = activeItem.querySelector('[jobs="open-bttn"]');
            await closeItem(activeItem);
            if (activeBtn) {
              activeBtn.textContent = "Развернуть вакансию";
            }
          }

          // Разворачиваем текущий
          await openItem(item);
          btn.textContent = "Свернуть вакансию";
          activeItem = item;
        }
      });
    });
  }

  // Запускаем при DOM или сразу
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJobs, { once: true });
  } else {
    initJobs();
  }
})();
