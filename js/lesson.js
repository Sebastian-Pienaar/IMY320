/* Lesson player + the completion celebration (the peak-end moment).
   All completion feedback lives in one dialog: celebration, stats, skill
   learned and a clear "next lesson" call to action. */
document.addEventListener("DOMContentLoaded", () => {
  const lessonMain = document.getElementById("lessonMain");
  if (!lessonMain) return;

  const { icons, formatDuration } = Strumly;
  const params = new URLSearchParams(window.location.search);
  const course = Strumly.findCourse(params.get("course"));
  const index = Number(params.get("lesson")) - 1;
  const module = course && course.modules[index];

  if (!module) {
    lessonMain.innerHTML = `
      <div class="gate">
        <h1>Lesson not found</h1>
        <p class="muted">That lesson link is not valid.</p>
        <a class="btn btn-primary btn-lg" href="index.html#courses">Back to courses</a>
      </div>`;
    return;
  }

  document.title = `${module.title} | ${course.title} | Strumly`;

  if (!Strumly.isLoggedIn()) {
    const next = encodeURIComponent(Strumly.lessonUrl(course, index));
    lessonMain.innerHTML = `
      <div class="gate">
        <p class="kicker">${course.title}</p>
        <h1>Log in to start this lesson</h1>
        <p class="muted">Create a free account to track your progress, earn XP and keep your streak going.</p>
        <a class="btn btn-primary btn-lg" href="auth.html?next=${next}">Log in or sign up</a>
      </div>`;
    return;
  }

  // Opening a lesson enrols the learner if they were not already
  Strumly.enroll(course);
  Strumly.setLastCourse(course.id);

  const total = course.modules.length;
  const isLast = index === total - 1;

  // Break the lesson into chapters so the notes feel specific to it
  function chapters() {
    const parts = [
      ["Warm-up and tuning", 0.1],
      [`Walkthrough: ${module.title.toLowerCase()}`, 0.35],
      ["Slow practice with the metronome", 0.3],
      ["Play-along at full tempo", 0.25],
    ];
    let t = 0;
    return parts.map(([name, share]) => {
      const start = t;
      t += Math.round(module.minutes * share);
      return { name, start };
    });
  }

  function render() {
    const done = Strumly.completedModules(course);
    const isDone = done.includes(index);
    const percent = Strumly.progressPercent(course);

    const actions = isDone
      ? `<p>${icons.check} You've completed this lesson.</p>
         <div class="btn-group">
           ${isLast
             ? `<a class="btn btn-primary" href="${Strumly.courseUrl(course)}">Back to course</a>`
             : `<a class="btn btn-primary" href="${Strumly.lessonUrl(course, index + 1)}">Next lesson${icons.arrow}</a>`}
         </div>`
      : `<p>Finished practising? Mark it complete to earn <strong>${Strumly.moduleXp(module)} XP</strong></p>
         <div class="btn-group">
           <button type="button" class="btn btn-primary complete-btn" id="completeBtn">${icons.check}Complete lesson</button>
         </div>`;

    const sideList = course.modules
      .map((m, i) => {
        const state = [
          done.includes(i) ? "is-done" : "",
          i === index ? "is-current" : "",
        ].join(" ");
        const num = done.includes(i) ? icons.check : i + 1;
        return `
          <li class="syllabus-item ${state}">
            <a class="syllabus-row" href="${Strumly.lessonUrl(course, i)}"${i === index ? ' aria-current="page"' : ""}>
              <span class="syllabus-num" aria-hidden="true">${num}</span>
              <span class="syllabus-name">${m.title}</span>
            </a>
          </li>`;
      })
      .join("");

    lessonMain.innerHTML = `
      <a class="back-link" href="${Strumly.courseUrl(course)}">&larr; ${course.title}</a>
      <div class="lesson-layout">
        <div class="lesson-main">
          <div class="lesson-kicker">
            <span class="badge level-${course.level.toLowerCase()}">${course.level}</span>
            <span>Lesson ${index + 1} of ${total}</span>
            <span aria-hidden="true">&middot;</span>
            <span>${formatDuration(module.minutes)}</span>
          </div>
          <h1>${module.title}</h1>

          <div class="player">
            <img src="${course.image}" alt="">
            <button type="button" class="player-play" id="playBtn" aria-label="Play lesson video">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"></polygon></svg>
            </button>
            <div class="player-bar">
              <span id="playTime">0:00</span>
              <div class="progress-track"><div class="progress-fill" id="playFill"></div></div>
              <span>${formatDuration(module.minutes)}</span>
            </div>
          </div>

          <div class="lesson-actions">${actions}</div>

          <section class="lesson-notes">
            <h2>In this lesson</h2>
            <ol class="chapter-list">
              ${chapters().map((c) => `<li><span class="chapter-time">${c.start}:00</span><span>${c.name}</span></li>`).join("")}
            </ol>
          </section>
        </div>

        <aside class="lesson-side" aria-label="Course lessons">
          <h2>${course.title}</h2>
          ${Strumly.progressBar(percent, `${done.length} of ${total} lessons`)}
          <ol class="syllabus-list">${sideList}</ol>
        </aside>
      </div>`;

    Strumly.animateProgress(lessonMain);
    bindPlayer();

    const completeBtn = document.getElementById("completeBtn");
    if (completeBtn) completeBtn.addEventListener("click", () => complete(completeBtn));
  }

  // Simulated video playback (no media backend)
  function bindPlayer() {
    const playBtn = document.getElementById("playBtn");
    const fill = document.getElementById("playFill");
    const time = document.getElementById("playTime");
    const playIcon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"></polygon></svg>`;
    const pauseIcon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    let progress = 0;
    let timer = null;

    function stop() {
      clearInterval(timer);
      timer = null;
      playBtn.setAttribute("aria-label", "Play lesson video");
      playBtn.innerHTML = playIcon;
    }

    function tick() {
      progress = Math.min(progress + 1, 100);
      fill.style.width = `${progress}%`;
      const secs = Math.round((module.minutes * 60 * progress) / 100);
      time.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
      if (progress < 100) return;

      stop();
      const completeBtn = document.getElementById("completeBtn");
      if (completeBtn) {
        completeBtn.classList.add("nudge");
        Strumly.toast("Lesson finished. Mark it complete to collect your XP!");
      }
    }

    playBtn.addEventListener("click", () => {
      if (timer) return stop();
      if (progress === 100) progress = 0;
      playBtn.setAttribute("aria-label", "Pause lesson video");
      playBtn.innerHTML = pauseIcon;
      timer = setInterval(tick, 80);
    });
  }

  function complete(btn) {
    btn.disabled = true;
    const result = Strumly.completeModule(course, index);
    render();
    celebrate(result);
  }

  // Any course the learner has not finished yet, preferring ones already started
  function recommendedCourse() {
    const others = strumlyCourses.filter(
      (c) => c.id !== course.id && Strumly.courseStatus(c) !== "complete",
    );
    return (
      others.find((c) => Strumly.courseStatus(c) === "progress") ||
      others.find((c) => c.level === course.level) ||
      others[0]
    );
  }

  function celebrate(result) {
    const finale = result.courseComplete;
    const stats = result.stats;

    const title = finale ? "Course Complete!" : "Lesson Complete!";
    const sub = finale
      ? `Incredible work! You've finished every lesson of <strong>${course.title}</strong>.`
      : `Way to go! You've learned <strong>${module.title}</strong>.`;

    const rec = finale ? recommendedCourse() : null;
    const primary = finale
      ? rec
        ? { href: Strumly.courseUrl(rec), label: "Start Next Course" }
        : { href: "index.html#courses", label: "Browse Courses" }
      : { href: Strumly.lessonUrl(course, index + 1), label: "Next Lesson" };

    const flame =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-4.5 2.5-5.5 0 2 1 3.2 2.2 3.2C10.7 8.5 10 5.5 12 2z"></path></svg>';
    const bolt =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
    const clock =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>';

    const dialog = document.createElement("dialog");
    dialog.className = "celebrate";
    dialog.setAttribute("aria-labelledby", "celebrateTitle");
    dialog.setAttribute("aria-describedby", "celebrateSub");
    dialog.innerHTML = `
      <div class="celebrate-inner">
        <button type="button" class="celebrate-close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div class="celebrate-art" aria-hidden="true">
          ${confettiBits()}
          ${finale ? trophySvg() : pickSvg()}
        </div>

        <h2 id="celebrateTitle">${title}</h2>
        <p class="celebrate-sub" id="celebrateSub">${sub}</p>

        <ul class="celebrate-stats">
          <li class="stat-chip xp">${bolt}<strong data-count="${result.xp}">+0</strong><span>XP earned</span></li>
          <li class="stat-chip streak">${flame}<strong>${stats.streak}</strong><span>Day streak</span></li>
          <li class="stat-chip time">${clock}<strong>${formatDuration(finale ? course.minutes : module.minutes)}</strong><span>Practised</span></li>
        </ul>

        <div class="celebrate-progress">
          ${Strumly.progressBar(result.percent, `${result.completedCount} of ${total} lessons complete`)}
        </div>

        <div class="celebrate-actions">
          <a class="btn btn-primary btn-next" href="${primary.href}">${primary.label}</a>
          <a class="celebrate-back" href="${Strumly.courseUrl(course)}">Back to course</a>
        </div>
      </div>`;

    document.body.appendChild(dialog);
    dialog.showModal();
    // Focus the next step without scrolling the illustration out of view
    dialog.querySelector(".btn-next").focus({ preventScroll: true });
    dialog.scrollTop = 0;

    // Pick confetti bursts from the illustration as it lands
    setTimeout(() => {
      Confetti.burstFrom(dialog.querySelector(".celebrate-art"), finale ? 80 : 50);
      if (finale) Confetti.celebrate();
    }, 350);
    Strumly.animateProgress(dialog);

    // Count the XP up once its chip has popped in
    const xpEl = dialog.querySelector("[data-count]");
    const target = Number(xpEl.dataset.count);
    const startAt = performance.now() + 650;
    const step = (now) => {
      const t = Math.min(Math.max((now - startAt) / 800, 0), 1);
      xpEl.textContent = `+${Math.round(target * (1 - Math.pow(1 - t, 3)))}`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    const close = () => dialog.close();
    dialog.querySelector(".celebrate-close").addEventListener("click", close);
    // Clicking the dimmed backdrop also closes it
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) close();
    });
    dialog.addEventListener("close", () => {
      dialog.remove();
      const next = lessonMain.querySelector(".lesson-actions .btn-primary");
      if (next) next.focus();
    });
  }

  // A fixed ring of confetti pieces around the illustration (like a party popper)
  function confettiBits() {
    const colors = ["#f26b1d", "#f5b82e", "#4cc9f0", "#f15bb5", "#9b5de5", "#e8eaed", "#3fb87f"];
    const count = 30;
    let html = "";
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ((i * 37) % 10) / 20;
      const spread = 0.62 + ((i * 53) % 38) / 100;
      const x = Math.round(Math.cos(angle) * 175 * spread);
      const y = Math.round(Math.sin(angle) * 92 * spread);
      const dot = i % 3 === 0;
      const size = dot ? 5 + (i % 3) : 0;
      html += `<span class="bit${dot ? " dot" : ""}" style="--x:${x}px;--y:${y}px;--r:${(i * 47) % 180}deg;--c:${colors[i % colors.length]};--d:${0.2 + (i % 6) * 0.03}s;${dot ? `--w:${size}px;--h:${size}px;` : `--w:${7 + (i % 3) * 2}px;--h:4px;`}"></span>`;
    }
    return html;
  }

  // Glossy guitar pick with a music note, in a flat two-tone style
  function pickSvg() {
    return `
      <svg class="hero-art" viewBox="0 0 120 120">
        <path d="M60 8C30 8 12 20 12 40c0 26 26 58 48 72 22-14 48-46 48-72C108 20 90 8 60 8z" fill="#d9540c"/>
        <path d="M60 8C30 8 12 20 12 40c0 26 26 58 48 72z" fill="#ff7a2f"/>
        <path d="M60 14c-24 0-40 10-40 26 0 20 20 46 40 60 20-14 40-40 40-60 0-16-16-26-40-26z" fill="none" stroke="#ffb07a" stroke-width="2.5" opacity="0.55"/>
        <ellipse cx="38" cy="28" rx="11" ry="5" fill="#fff" opacity="0.35" transform="rotate(-24 38 28)"/>
        <circle cx="52" cy="66" r="10" fill="#fff"/>
        <rect x="58" y="32" width="5" height="35" rx="2" fill="#fff"/>
        <path d="M63 32c7 2 16 7 16 18-4-6-9-8-16-8z" fill="#fff"/>
      </svg>`;
  }

  // Gold trophy for finishing a whole course
  function trophySvg() {
    return `
      <svg class="hero-art" viewBox="0 0 120 120">
        <path d="M34 30H22c0 16 7 24 16 26M86 30h12c0 16-7 24-16 26" fill="none" stroke="#e0a01e" stroke-width="6" stroke-linecap="round"/>
        <path d="M32 18h56v24c0 19-13 32-28 32S32 61 32 42z" fill="#e0a01e"/>
        <path d="M32 18h28v56c-15 0-28-13-28-32z" fill="#f7c948"/>
        <ellipse cx="44" cy="30" rx="6" ry="10" fill="#fff" opacity="0.3"/>
        <polygon points="60 32 64.4 41 74 42.2 67 49 68.8 58.6 60 54 51.2 58.6 53 49 46 42.2 55.6 41" fill="#fff"/>
        <rect x="53" y="73" width="14" height="14" fill="#c98a12"/>
        <rect x="40" y="86" width="40" height="11" rx="3" fill="#e0a01e"/>
        <rect x="40" y="86" width="20" height="11" rx="3" fill="#f7c948"/>
        <rect x="32" y="97" width="56" height="10" rx="3" fill="#3a3f46"/>
      </svg>`;
  }

  render();
});
