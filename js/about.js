/* About page: instructor cards and animated stat counters. */
document.addEventListener("DOMContentLoaded", () => {
  const teamGrid = document.getElementById("teamGrid");
  if (teamGrid) {
    teamGrid.innerHTML = Object.entries(strumlyInstructors)
      .map(
        ([name, info]) => `
          <article class="team-card">
            <img src="${info.image}" alt="${name}">
            <h3>${name}</h3>
            <span class="team-role">${info.role}</span>
            <p class="muted">${info.bio}</p>
          </article>`,
      )
      .join("");
  }

  const statValues = document.querySelectorAll(".stat-value");
  const statsSection = document.querySelector(".stats");
  if (!statValues.length || !statsSection) return;

  const animateStats = () =>
    statValues.forEach((stat) => {
      const target = Number(stat.dataset.target);
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        stat.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        animateStats();
        observer.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(statsSection);
});
