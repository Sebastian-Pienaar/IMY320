/* Shared across every page: simulated storage (localStorage stands in for a
   backend), navigation, account menu and toast. */
const Strumly = (() => {
  const USER_KEY = "strumly_user";

  // Learner data is stored per account (keyed by email), so every account
  // has its own progress. Visitors who are not logged in use "guest".
  const key = (name) => `strumly_${name}:${user() || "guest"}`;
  const KEYS = {
    get progress() {
      return key("progress");
    },
    get saved() {
      return key("saved");
    },
    get stats() {
      return key("stats");
    },
    get lastCourse() {
      return key("last_course");
    },
    get settings() {
      return key("settings");
    },
  };

  // --- Storage helpers (wrapped so private browsing never breaks the page) ---
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: changes last for this page view only */
    }
  }

  // --- Session ---
  function user() {
    try {
      return localStorage.getItem(USER_KEY);
    } catch {
      return null;
    }
  }

  const isLoggedIn = () => Boolean(user());
  // The name shown in the nav: the learner's display name, or their email prefix
  const userName = () =>
    getSettings().displayName || (user() || "").split("@")[0];

  // --- Settings (per account) ---
  const DEFAULT_SETTINGS = { displayName: "" };

  function getSettings() {
    return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
  }

  function saveSettings(changes) {
    write(KEYS.settings, { ...getSettings(), ...changes });
  }

  // Clears lesson progress, XP and streak but keeps saved courses and settings
  function resetProgress() {
    ["progress", "stats", "last_course"].forEach((name) => {
      try {
        localStorage.removeItem(key(name));
      } catch {}
    });
  }

  // Escape user-entered text before putting it into HTML
  const escapeHtml = (text) =>
    String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  function login(email) {
    try {
      localStorage.setItem(USER_KEY, email);
    } catch {}
  }

  // A brand-new account starts on a blank slate: no progress, saves or stats
  function register(email) {
    login(email);
    ["progress", "saved", "stats", "last_course", "settings"].forEach((name) => {
      try {
        localStorage.removeItem(key(name));
      } catch {}
    });
  }

  function logout() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
  }

  // --- Formatting ---
  function formatDuration(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
  }

  const moduleXp = (module) => Math.round((module.minutes * 1.5) / 5) * 5;
  const findCourse = (id) => strumlyCourses.find((c) => c.id === id);
  const courseUrl = (course) => `course.html?id=${course.id}`;
  const lessonUrl = (course, index) =>
    `lesson.html?course=${course.id}&lesson=${index + 1}`;

  // --- Course progress ---
  // Stored as { courseId: [completed module indexes] }. A course is enrolled
  // once it has an entry.
  function completedModules(course) {
    return read(KEYS.progress, {})[course.id] || [];
  }

  function isEnrolled(course) {
    return course.id in read(KEYS.progress, {});
  }

  function courseStatus(course) {
    if (!isLoggedIn() || !isEnrolled(course)) return "new";
    return completedModules(course).length >= course.modules.length
      ? "complete"
      : "progress";
  }

  function progressPercent(course) {
    return Math.round(
      (completedModules(course).length / course.modules.length) * 100,
    );
  }

  function nextModuleIndex(course) {
    const done = completedModules(course);
    const next = course.modules.findIndex((_, i) => !done.includes(i));
    return next === -1 ? 0 : next;
  }

  function enroll(course) {
    const all = read(KEYS.progress, {});
    if (!(course.id in all)) {
      all[course.id] = completedModules(course);
      write(KEYS.progress, all);
    }
  }

  const setLastCourse = (id) => write(KEYS.lastCourse, id);

  // Where a returning learner should pick up: their most recent unfinished
  // course, otherwise any course they have in progress
  function resumeTarget() {
    if (!isLoggedIn()) return null;
    const last = findCourse(read(KEYS.lastCourse, null));
    const unfinished = (c) => c && courseStatus(c) === "progress";
    const course = unfinished(last) ? last : strumlyCourses.find(unfinished);
    return course ? { course, index: nextModuleIndex(course) } : null;
  }

  // --- Learner stats (XP, streak, practice time) ---
  function dayKey(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  function getStats() {
    const stats = read(KEYS.stats, null) || {
      xp: 0,
      streak: 0,
      lastDay: null,
      minutes: 0,
    };
    // A streak only survives if the learner practised today or yesterday
    const alive = stats.lastDay === dayKey(0) || stats.lastDay === dayKey(-1);
    return { ...stats, streak: alive ? stats.streak : 0 };
  }

  function completeModule(course, index) {
    const all = read(KEYS.progress, {});
    const done = completedModules(course).slice();
    const alreadyDone = done.includes(index);
    if (!alreadyDone) done.push(index);
    all[course.id] = done.sort((a, b) => a - b);
    write(KEYS.progress, all);

    const stats = getStats();
    const module = course.modules[index];
    const xp = alreadyDone ? 0 : moduleXp(module);
    if (stats.lastDay !== dayKey(0)) {
      stats.streak += 1;
      stats.lastDay = dayKey(0);
    }
    stats.xp += xp;
    if (!alreadyDone) stats.minutes += module.minutes;
    write(KEYS.stats, stats);

    return {
      xp,
      stats,
      alreadyDone,
      completedCount: done.length,
      percent: Math.round((done.length / course.modules.length) * 100),
      courseComplete: done.length >= course.modules.length,
    };
  }

  // --- Saved courses ---
  const savedIds = () => read(KEYS.saved, []);
  const isSaved = (id) => savedIds().includes(id);

  function toggleSaved(id) {
    const ids = savedIds();
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    write(KEYS.saved, next);
    return next.includes(id);
  }

  // --- Toast (announced to screen readers via role="status") ---
  let toastTimer;
  function toast(message, tone = "info") {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("is-success", tone === "success");
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  // --- Shared SVG icons ---
  const icons = {
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.2 21.5 12 18.1 5.8 21.5 7 14.4 2 9.5 8.9 8.6 12 2"></polygon></svg>',
    clock:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    users:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    heart:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"></path></svg>',
    check:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>',
    arrow:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
    chevron:
      '<svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    zap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    settings:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    logout:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
  };

  function progressBar(percent, label) {
    const done = percent >= 100;
    return `
      <div class="progress-block">
        <div class="progress-label"><span>${label}</span><span>${percent}%</span></div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="${label}">
          <div class="progress-fill${done ? " is-complete" : ""}" data-width="${percent}"></div>
        </div>
      </div>`;
  }

  // Animate any freshly rendered progress bars from 0 to their value
  function animateProgress(root = document) {
    const fills = root.querySelectorAll(".progress-fill[data-width]");
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        fills.forEach((f) => (f.style.width = `${f.dataset.width}%`)),
      ),
    );
  }

  return {
    user,
    userName,
    isLoggedIn,
    login,
    register,
    getSettings,
    saveSettings,
    resetProgress,
    escapeHtml,
    logout,
    formatDuration,
    moduleXp,
    findCourse,
    courseUrl,
    lessonUrl,
    completedModules,
    isEnrolled,
    courseStatus,
    progressPercent,
    nextModuleIndex,
    enroll,
    setLastCourse,
    resumeTarget,
    completeModule,
    getStats,
    savedIds,
    isSaved,
    toggleSaved,
    toast,
    icons,
    progressBar,
    animateProgress,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  const { icons } = Strumly;

  // --- Footer year ---
  document
    .querySelectorAll("[data-year]")
    .forEach((el) => (el.textContent = new Date().getFullYear()));

  // --- Mobile menu ---
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close the mobile menu after following an in-page link
    nav.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }),
    );
  }

  // --- Global search: sends the query to the catalogue instead of a fake toast ---
  const searchForm = document.querySelector(".nav .search-wrap");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const term = searchForm.q.value.trim();
      const courseSearch = document.getElementById("courseSearch");
      if (courseSearch) {
        courseSearch.value = term;
        courseSearch.dispatchEvent(new Event("input"));
        document.getElementById("courses").scrollIntoView();
        searchForm.q.blur();
      } else {
        window.location.href = `index.html?q=${encodeURIComponent(term)}#courses`;
      }
    });
  }

  // --- Account menu for logged-in learners ---
  const navAuth = document.querySelector(".nav-auth");
  if (navAuth && Strumly.isLoggedIn()) {
    const name = Strumly.escapeHtml(Strumly.userName());
    const stats = Strumly.getStats();
    const savedCount = Strumly.savedIds().length;

    navAuth.innerHTML = `
      <div class="account">
        <button type="button" class="account-btn" aria-expanded="false" aria-controls="accountMenu">
          <span class="account-avatar" aria-hidden="true">${name.charAt(0)}</span>
          <span>${name}</span>${icons.chevron}
        </button>
        <ul class="account-menu" id="accountMenu">
          <li class="menu-head">
            <strong>${name}</strong>
            <span>${icons.zap}${stats.xp.toLocaleString()} XP &middot; ${stats.streak}-day streak</span>
          </li>
          <li><a href="index.html?saved=1#courses">${icons.heart}Saved for later<span class="menu-count">${savedCount}</span></a></li>
          <li><a href="settings.html">${icons.settings}Settings</a></li>
          <li><button type="button" id="logoutBtn">${icons.logout}Log out</button></li>
        </ul>
      </div>`;

    const account = navAuth.querySelector(".account");
    const accountBtn = account.querySelector(".account-btn");
    let closeTimer;

    const setOpen = (open) => {
      clearTimeout(closeTimer);
      account.classList.toggle("is-open", open);
      accountBtn.setAttribute("aria-expanded", String(open));
    };

    // Hover intent: open immediately, close after a short grace period
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) {
      account.addEventListener("mouseenter", () => setOpen(true));
      account.addEventListener("mouseleave", () => {
        closeTimer = setTimeout(() => setOpen(false), 250);
      });
    }

    accountBtn.addEventListener("click", () =>
      setOpen(!account.classList.contains("is-open")),
    );

    account.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        accountBtn.focus();
      }
    });

    account.addEventListener("focusout", (e) => {
      if (!account.contains(e.relatedTarget)) setOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (!account.contains(e.target)) setOpen(false);
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      Strumly.logout();
      window.location.href = "index.html";
    });
  }
});
