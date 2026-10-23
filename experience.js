document.addEventListener("DOMContentLoaded", () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scenes = [...document.querySelectorAll(".nova-hero [data-scene]")];
  if (scenes.length) {
    let index = 0, paused = reduced.matches, timer;
    const labels = ["THE SPACE", "PRIVATE PARTY", "A MOMENT TO SAY YES", "SPACE FOR IDEAS"];
    const pause = document.getElementById("scenePause");
    const hero = document.querySelector(".nova-hero");
    function show(next) {
      index = (next + scenes.length) % scenes.length;
      scenes.forEach((scene, n) => {
        scene.classList.toggle("is-active", n === index);
        scene.setAttribute("aria-hidden", String(n !== index));
      });
      document.getElementById("sceneCount").textContent = `${String(index + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
      document.getElementById("sceneName").textContent = labels[index];
      hero.style.setProperty("--scene-progress", `${(index + 1) / scenes.length * 100}%`);
    }
    function schedule() {
      clearInterval(timer);
      if (!paused && !document.hidden) timer = setInterval(() => show(index + 1), 5500);
      pause.textContent = paused ? "▶" : "Ⅱ";
      pause.setAttribute("aria-label", paused ? "장면 자동 전환 재생" : "장면 자동 전환 일시정지");
      pause.setAttribute("aria-pressed", String(paused));
      hero.classList.toggle("motion-paused", paused);
    }
    document.getElementById("scenePrev").addEventListener("click", () => { show(index - 1); schedule(); });
    document.getElementById("sceneNext").addEventListener("click", () => { show(index + 1); schedule(); });
    pause.addEventListener("click", () => { paused = !paused; schedule(); });
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", () => { paused = reduced.matches; schedule(); });
    show(0); schedule();
  }

  // A gentle entrance for editorial blocks; content remains visible without JS.
  const blocks = document.querySelectorAll(".story-card, .occasion-shortcuts > a, .feature-split, .service-card, .catering-card, .dol-editorial, .pricing-card, .contact-card");
  if (!reduced.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) { target.classList.add("in-view"); observer.unobserve(target); }
      });
    }, { threshold: .08 });
    blocks.forEach((block, i) => { block.classList.add("motion-card"); block.style.setProperty("--card-delay", `${i % 3 * 70}ms`); observer.observe(block); });
  }
  const topButton = document.createElement("button");
  topButton.className = "back-to-top"; topButton.type = "button"; topButton.textContent = "↑"; topButton.setAttribute("aria-label", "페이지 맨 위로");
  topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced.matches ? "instant" : "smooth" }));
  document.body.append(topButton);
  let scheduled = false;
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty("--page-progress", `${max > 0 ? scrollY / max * 100 : 0}%`);
    topButton.classList.toggle("shown", scrollY > 550); scheduled = false;
  };
  window.addEventListener("scroll", () => { if (!scheduled) { scheduled = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();
});
