  const upper1 = document.getElementById("upper-bttn");
  const upper2 = document.getElementById("upper-bttn-2");
  const rolesBtn = document.getElementById("scroll-to-roles");
  upper1?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  upper2?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  rolesBtn?.addEventListener("click", () => {
    const jobs = document.getElementById("jobs");
    jobs?.scrollIntoView({ behavior: "smooth" });
  });
