/* Home page course catalogue: search, filters (level, genre, instructor,
   length, saved), sort and saving straight from a course card. */
document.addEventListener("DOMContentLoaded", () => {
  const courseList = document.getElementById("courseList");
  if (!courseList) return;

  const { icons, formatDuration, escapeHtml } = Strumly;
  const courseSearch = document.getElementById("courseSearch");
  const courseCount = document.getElementById("courseCount");
  const levelBtns = document.querySelectorAll(".filter-btn[data-level]");
  const genreSelect = document.getElementById("genreSelect");
  const instructorSelect = document.getElementById("instructorSelect");
  const lengthSelect = document.getElementById("lengthSelect");
  const savedToggle = document.getElementById("savedToggle");
  const savedCount = document.getElementById("savedCount");
  const sortSelect = document.getElementById("sortSelect");
  const clearBtn = document.getElementById("clearFilters");
  const catalogue = document.getElementById("courses");
  const navLink = (name) => document.querySelector(`.nav-links [data-nav="${name}"]`);
  let inCatalogue = window.location.hash === "#courses";

  // Fill the genre and instructor dropdowns from the course data
  const option = (value) =>
    `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
  const genres = [...new Set(strumlyCourses.map((c) => c.genre))].sort();
  genreSelect.insertAdjacentHTML("beforeend", genres.map(option).join(""));
  instructorSelect.insertAdjacentHTML(
    "beforeend",
    Object.keys(strumlyInstructors).map(option).join(""),
  );

  // Filters can be preset from the URL (nav search, saved link, instructor links)
  const params = new URLSearchParams(window.location.search);
  const filters = {
    level: params.get("level") || "all",
    genre: genres.includes(params.get("genre")) ? params.get("genre") : "all",
    instructor: params.get("instructor") in strumlyInstructors ? params.get("instructor") : "all",
    length: "all",
    savedOnly: params.get("saved") === "1",
  };

  // Course length buckets, in minutes
  const lengths = {
    short: (m) => m < 300,
    medium: (m) => m >= 300 && m <= 480,
    long: (m) => m > 480,
  };
  let activeSort = "popular";
  if (params.get("q")) courseSearch.value = params.get("q");

  // Course ids to badge as recommended (refreshed on every render)
  let recommended = [];

  const ctaLabels = {
    new: "Start course",
    progress: "Continue",
    complete: "Review",
  };

  function saveButton(course) {
    const saved = Strumly.isSaved(course.id);
    return `
      <button type="button" class="btn save-chip" data-save="${course.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove from saved" : "Save for later"}: ${course.title}">
        ${icons.heart}<span>${saved ? "Saved" : "Save"}</span>
      </button>`;
  }

  function buildRow(course) {
    const loggedIn = Strumly.isLoggedIn();
    const status = Strumly.courseStatus(course);
    const enrolled = loggedIn && status !== "new";
    const { rating, count } = Strumly.courseRating(course);

    // Enrolled learners jump straight back into their next lesson
    const ctaHref = enrolled
      ? Strumly.lessonUrl(course, Strumly.nextModuleIndex(course))
      : Strumly.courseUrl(course);
    const ctaLabel = loggedIn ? ctaLabels[status] : "View course";

    return `
      <article class="course-row">
        <div class="row-thumb">
          <img src="${course.image}" alt="" loading="lazy">
        </div>
        <div class="row-body">
          <div class="row-head">
            <span class="badge level-${course.level.toLowerCase()}">${course.level}</span>
            ${recommended.includes(course.id) ? `<span class="pill pill-rec">${icons.star}${Strumly.hasPersonalLevel() ? "Recommended for you" : "Recommended"}</span>` : ""}
          </div>
          <h3><a class="row-link" href="${Strumly.courseUrl(course)}">${course.title}</a></h3>
          <p class="row-desc muted">${course.blurb}</p>
          <ul class="tag-list" aria-label="Topics">
            ${course.tags.map((t) => `<li class="tag">${t}</li>`).join("")}
          </ul>
          <ul class="row-meta">
            <li class="rating">${icons.star}<strong>${rating}</strong>&nbsp;<span class="muted">(${count.toLocaleString()})</span></li>
            <li>${icons.clock}${formatDuration(course.minutes)}</li>
            <li>${icons.user}${course.instructor}</li>
          </ul>
          ${enrolled ? `<div class="row-progress">${Strumly.progressBar(Strumly.progressPercent(course), `${Strumly.completedModules(course).length} of ${course.modules.length} lessons`)}</div>` : ""}
        </div>
        <div class="row-actions">
          <a class="btn btn-secondary" href="${ctaHref}" aria-label="${ctaLabel}: ${course.title}">${ctaLabel}${icons.arrow}</a>
          ${saveButton(course)}
        </div>
      </article>`;
  }

  const hasFilters = () =>
    filters.level !== "all" ||
    filters.genre !== "all" ||
    filters.instructor !== "all" ||
    filters.length !== "all" ||
    filters.savedOnly ||
    courseSearch.value.trim() !== "";

  function renderCourses() {
    const term = courseSearch.value.trim();
    const saved = Strumly.savedIds();
    recommended = Strumly.recommendedIds();

    const visible = strumlyCourses.filter(
      (course) =>
        (filters.level === "all" || course.level === filters.level) &&
        (filters.genre === "all" || course.genre === filters.genre) &&
        (filters.instructor === "all" || course.instructor === filters.instructor) &&
        (filters.length === "all" || lengths[filters.length](course.minutes)) &&
        (!filters.savedOnly || saved.includes(course.id)) &&
        (!term || Strumly.matchesSearch(course, term)),
    );

    const sorters = {
      popular: (a, b) => b.learners - a.learners,
      rating: (a, b) => Strumly.courseRating(b).rating - Strumly.courseRating(a).rating,
      duration: (a, b) => a.minutes - b.minutes,
      title: (a, b) => a.title.localeCompare(b.title),
    };
    visible.sort(sorters[activeSort]);

    let empty = term
      ? `No courses match “${escapeHtml(term)}”. Try a genre like “blues”, a technique like “fingerstyle”, or clear your filters.`
      : "No courses match these filters.";
    if (filters.savedOnly && !saved.length)
      empty =
        "You haven't saved any courses yet. Press “Save” on any course to keep it here.";

    courseList.innerHTML = visible.length
      ? visible.map(buildRow).join("")
      : `<div class="list-empty"><p>${empty}</p>${hasFilters() ? '<button type="button" class="btn btn-secondary" data-clear>Clear filters</button>' : ""}</div>`;

    // Stagger the entrance of each row
    courseList
      .querySelectorAll(".course-row")
      .forEach((row, i) => (row.style.animationDelay = `${i * 60}ms`));
    Strumly.animateProgress(courseList);

    courseCount.textContent =
      `Showing ${visible.length} of ${strumlyCourses.length} courses` +
      (term ? ` for “${term}”` : "");
    savedCount.textContent = saved.length;
    clearBtn.hidden = !hasFilters();
  }

  function syncControls() {
    levelBtns.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.level === filters.level)),
    );
    genreSelect.value = filters.genre;
    instructorSelect.value = filters.instructor;
    lengthSelect.value = filters.length;
    savedToggle.setAttribute("aria-pressed", String(filters.savedOnly));
    genreSelect.classList.toggle("is-active", filters.genre !== "all");
    instructorSelect.classList.toggle("is-active", filters.instructor !== "all");
    lengthSelect.classList.toggle("is-active", filters.length !== "all");
    updateNavCurrent();
  }

  function update() {
    syncControls();
    renderCourses();
  }

  function clearFilters() {
    Object.assign(filters, { level: "all", genre: "all", instructor: "all", length: "all", savedOnly: false });
    courseSearch.value = "";
    update();
    courseSearch.focus();
  }

  levelBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.level = btn.dataset.level;
      update();
    }),
  );

  genreSelect.addEventListener("change", () => {
    filters.genre = genreSelect.value;
    update();
  });

  instructorSelect.addEventListener("change", () => {
    filters.instructor = instructorSelect.value;
    update();
  });

  lengthSelect.addEventListener("change", () => {
    filters.length = lengthSelect.value;
    update();
  });

  savedToggle.addEventListener("click", () => {
    filters.savedOnly = !filters.savedOnly;
    update();
  });

  sortSelect.addEventListener("change", () => {
    activeSort = sortSelect.value;
    renderCourses();
  });

  clearBtn.addEventListener("click", clearFilters);
  courseSearch.addEventListener("input", renderCourses);

  // Save / unsave straight from the card, plus the empty-state reset
  courseList.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear]")) return clearFilters();

    const btn = e.target.closest("[data-save]");
    if (!btn) return;
    const course = Strumly.findCourse(btn.dataset.save);
    const nowSaved = Strumly.toggleSaved(course.id);

    if (filters.savedOnly && !nowSaved) {
      renderCourses();
    } else {
      btn.outerHTML = saveButton(course);
      const fresh = courseList.querySelector(`[data-save="${course.id}"]`);
      if (nowSaved) fresh.classList.add("pop");
      fresh.focus();
      savedCount.textContent = Strumly.savedIds().length;
    }
    Strumly.toast(
      nowSaved
        ? `Saved “${course.title}”. Find it any time under Saved in the menu.`
        : `Removed “${course.title}” from saved.`,
      nowSaved ? "success" : "info",
    );
  });

  // "Saved" links (nav and account menu) filter in place instead of reloading
  document.querySelectorAll("[data-saved-link]").forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      filters.savedOnly = true;
      update();
      catalogue.scrollIntoView();
    }),
  );

  syncControls();
  renderCourses();
  personaliseHero();

  // Logged-in learners get "Continue learning" instead of a sign-up prompt
  function personaliseHero() {
    const primary = document.getElementById("heroPrimary");
    const proof = document.getElementById("heroProof");
    if (!primary || !Strumly.isLoggedIn()) return;

    const target = Strumly.resumeTarget();
    proof.classList.add("is-personal");

    if (target) {
      const { course, index } = target;
      primary.href = Strumly.lessonUrl(course, index);
      primary.querySelector("span").textContent = "Continue learning";
      proof.innerHTML = `${icons.play}<span>Up next: <strong>${course.modules[index].title}</strong> in ${course.title}</span>`;
    } else {
      primary.href = "#courses";
      primary.querySelector("span").textContent = "Find your next course";
      // Both buttons would go to the course list, so keep just one
      document.getElementById("heroSecondary").remove();
      proof.remove();
    }
  }

  // Nav highlight follows the section in view (Home vs Courses vs Saved)
  function updateNavCurrent() {
    const current = !inCatalogue ? "home" : filters.savedOnly ? "saved" : "courses";
    ["home", "courses", "saved"].forEach((name) => {
      const link = navLink(name);
      if (!link) return;
      if (name === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      inCatalogue = entry.isIntersecting;
      updateNavCurrent();
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );
  observer.observe(catalogue);
});
