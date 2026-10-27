/* Home page course catalogue: search, filters (level, genre, instructor,
   saved), sort and saving straight from a course card. */
document.addEventListener("DOMContentLoaded", () => {
  const courseList = document.getElementById("courseList");
  if (!courseList) return;

  const { icons, formatDuration, escapeHtml } = Strumly;
  const courseSearch = document.getElementById("courseSearch");
  const courseCount = document.getElementById("courseCount");
  const levelBtns = document.querySelectorAll(".filter-btn[data-level]");
  const genreSelect = document.getElementById("genreSelect");
  const instructorSelect = document.getElementById("instructorSelect");
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
    savedOnly: params.get("saved") === "1",
  };
  let activeSort = "popular";
  if (params.get("q")) courseSearch.value = params.get("q");

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
    courseSearch.value.trim() !== "";

  function renderCourses() {
    const term = courseSearch.value.trim();
    const saved = Strumly.savedIds();

    const visible = strumlyCourses.filter(
      (course) =>
        (filters.level === "all" || course.level === filters.level) &&
        (filters.genre === "all" || course.genre === filters.genre) &&
        (filters.instructor === "all" || course.instructor === filters.instructor) &&
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
      : `<div class="list-empty"><p>${empty}</p>${filters.savedOnly && !saved.length ? `<button type="button" class="btn btn-secondary" data-browse>Browse all courses</button>` : hasFilters() ? `<button type="button" class="btn btn-secondary" data-clear>Clear filters</button>` : ""}</div>`;

    // Stagger the entrance of each row
    courseList
      .querySelectorAll(".course-row")
      .forEach((row, i) => (row.style.animationDelay = `${i * 60}ms`));
    Strumly.animateProgress(courseList);

    courseCount.textContent =
      (filters.savedOnly
        ? saved.length ? `Showing ${visible.length} of your ${saved.length} saved courses` : "No saved courses yet"
        : `Showing ${visible.length} of ${strumlyCourses.length} courses`) +
      (term ? ` for “${term}”` : "");
    clearBtn.hidden = !hasFilters();
  }

  const coursesTitle = document.getElementById("coursesTitle");
  const coursesSub = document.getElementById("coursesSub");
  const defaultSub = coursesSub.textContent;

  function syncControls() {
    coursesTitle.textContent = filters.savedOnly ? "Saved courses" : "Courses";
    coursesSub.textContent = filters.savedOnly
      ? "Courses you've saved for later. Press “Saved” on a course to remove it."
      : defaultSub;
    levelBtns.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.level === filters.level)),
    );
    genreSelect.value = filters.genre;
    instructorSelect.value = filters.instructor;
    genreSelect.classList.toggle("is-active", filters.genre !== "all");
    instructorSelect.classList.toggle("is-active", filters.instructor !== "all");
    updateNavCurrent();
  }

  function update() {
    syncControls();
    renderCourses();
  }

  function clearFilters() {
    Object.assign(filters, { level: "all", genre: "all", instructor: "all" });
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

  sortSelect.addEventListener("change", () => {
    activeSort = sortSelect.value;
    renderCourses();
  });

  clearBtn.addEventListener("click", clearFilters);
  courseSearch.addEventListener("input", renderCourses);

  // Save / unsave straight from the card, plus the empty-state reset
  courseList.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear]")) return clearFilters();
    if (e.target.closest("[data-browse]")) {
      filters.savedOnly = false;
      return update();
    }

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
    }
  });

  // Courses and Home in the nav go back to the full list
  ["courses", "home"].forEach((name) =>
    navLink(name)?.addEventListener("click", () => {
      if (!filters.savedOnly) return;
      filters.savedOnly = false;
      update();
    }),
  );

  // The "Saved" nav link shows every saved course, in place instead of reloading
  document.querySelectorAll("[data-saved-link]").forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      Object.assign(filters, { level: "all", genre: "all", instructor: "all", savedOnly: true });
      courseSearch.value = "";
      update();
      catalogue.scrollIntoView();
    }),
  );

  syncControls();
  renderCourses();
  personaliseHero();

  // Logged-in learners get a "Continue learning" card instead of a sign-up prompt
  function personaliseHero() {
    const primary = document.getElementById("heroPrimary");
    const proof = document.getElementById("heroProof");
    if (!primary || !Strumly.isLoggedIn()) return;

    const target = Strumly.resumeTarget();

    if (target) {
      const { course, index } = target;
      const percent = Strumly.progressPercent(course);
      const ctas = primary.parentElement;
      // The whole card is the link, so the button inside is only visual.
      // Progress is shown once, as a plain bar (the label is for screen readers).
      ctas.innerHTML = `
        <a class="resume-card" href="${Strumly.lessonUrl(course, index)}" aria-label="Continue ${course.modules[index].title}, ${course.title}, ${percent}% complete">
          <img class="resume-thumb" src="${course.image}" alt="">
          <div class="resume-body">
            <strong class="resume-title">${course.modules[index].title}</strong>
            <span class="resume-meta">${course.title}</span>
            <div class="progress-track" aria-hidden="true"><div class="progress-fill" data-width="${percent}"></div></div>
          </div>
          <span class="btn btn-primary resume-go" aria-hidden="true">Continue learning</span>
        </a>
        <a href="#courses" class="link resume-browse">Browse courses &rarr;</a>`;
      ctas.classList.add("is-resume");
      proof.remove();
      Strumly.animateProgress(ctas);
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
