/* Home page course catalogue: search, level filter, saved filter and sort. */
document.addEventListener("DOMContentLoaded", () => {
  const courseList = document.getElementById("courseList");
  if (!courseList) return;

  const { icons, formatDuration } = Strumly;
  const courseSearch = document.getElementById("courseSearch");
  const courseCount = document.getElementById("courseCount");
  const levelBtns = document.querySelectorAll(".filter-btn[data-level]");
  const savedToggle = document.getElementById("savedToggle");
  const savedCount = document.getElementById("savedCount");
  const sortSelect = document.getElementById("sortSelect");

  // Filters can be preset from the URL (nav search, footer and account links)
  const params = new URLSearchParams(window.location.search);
  let activeLevel = params.get("level") || "all";
  let savedOnly = params.get("saved") === "1";
  let mineOnly = params.get("mine") === "1" && Strumly.isLoggedIn();
  let activeSort = "popular";
  if (params.get("q")) courseSearch.value = params.get("q");

  const ctaLabels = {
    new: "Start course",
    progress: "Continue",
    complete: "Review",
  };

  function buildRow(course) {
    const loggedIn = Strumly.isLoggedIn();
    const status = Strumly.courseStatus(course);
    const enrolled = loggedIn && status !== "new";

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
            ${Strumly.isSaved(course.id) ? `<span class="saved-flag">${icons.heart}Saved</span>` : ""}
          </div>
          <h3><a class="row-link" href="${Strumly.courseUrl(course)}">${course.title}</a></h3>
          <p class="row-desc muted">${course.blurb}</p>
          <ul class="row-meta">
            <li class="rating">${icons.star}<strong>${course.rating}</strong>&nbsp;<span class="muted">(${course.reviews.toLocaleString()})</span></li>
            <li>${icons.clock}${formatDuration(course.minutes)}</li>
            <li>${icons.user}${course.instructor}</li>
          </ul>
          ${enrolled ? `<div class="row-progress">${Strumly.progressBar(Strumly.progressPercent(course), `${Strumly.completedModules(course).length} of ${course.modules.length} lessons`)}</div>` : ""}
        </div>
        <div class="row-actions">
          <a class="btn btn-secondary" href="${ctaHref}" aria-label="${ctaLabel}: ${course.title}">${ctaLabel}${icons.arrow}</a>
        </div>
      </article>`;
  }

  function renderCourses() {
    const term = courseSearch.value.trim().toLowerCase();
    const saved = Strumly.savedIds();

    const visible = strumlyCourses.filter((course) => {
      const matchesLevel = activeLevel === "all" || course.level === activeLevel;
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.instructor.toLowerCase().includes(term);
      const matchesSaved = !savedOnly || saved.includes(course.id);
      const matchesMine = !mineOnly || Strumly.courseStatus(course) !== "new";
      return matchesLevel && matchesTerm && matchesSaved && matchesMine;
    });

    const sorters = {
      popular: (a, b) => b.learners - a.learners,
      rating: (a, b) => b.rating - a.rating,
      duration: (a, b) => a.minutes - b.minutes,
      title: (a, b) => a.title.localeCompare(b.title),
    };
    visible.sort(sorters[activeSort]);

    let empty = "No courses found.";
    if (savedOnly && !saved.length)
      empty =
        "You haven't saved any courses yet. Open a course and choose “Save for later” to keep it here.";

    courseList.innerHTML = visible.length
      ? visible.map(buildRow).join("")
      : `<p class="list-empty">${empty}</p>`;

    // Stagger the entrance of each row
    courseList
      .querySelectorAll(".course-row")
      .forEach((row, i) => (row.style.animationDelay = `${i * 60}ms`));
    Strumly.animateProgress(courseList);

    courseCount.textContent = `Showing ${visible.length} of ${strumlyCourses.length} courses`;
    savedCount.textContent = saved.length;
  }

  function syncControls() {
    levelBtns.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.level === activeLevel)),
    );
    savedToggle.setAttribute("aria-pressed", String(savedOnly));
  }

  levelBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      activeLevel = btn.dataset.level;
      syncControls();
      renderCourses();
    }),
  );

  savedToggle.addEventListener("click", () => {
    savedOnly = !savedOnly;
    mineOnly = false;
    syncControls();
    renderCourses();
  });

  sortSelect.addEventListener("change", () => {
    activeSort = sortSelect.value;
    renderCourses();
  });

  courseSearch.addEventListener("input", () => {
    mineOnly = false;
    renderCourses();
  });

  syncControls();
  renderCourses();
  personaliseHero();

  // Logged-in learners get "Continue learning" instead of a sign-up prompt
  function personaliseHero() {
    const primary = document.getElementById("heroPrimary");
    const secondary = document.getElementById("heroSecondary");
    const proof = document.getElementById("heroProof");
    if (!primary || !Strumly.isLoggedIn()) return;

    const target = Strumly.resumeTarget();
    proof.classList.add("is-personal");
    secondary.textContent = "My courses";
    secondary.href = "index.html?mine=1#courses";

    if (target) {
      const { course, index } = target;
      primary.href = Strumly.lessonUrl(course, index);
      primary.querySelector("span").textContent = "Continue learning";
      proof.innerHTML = `${icons.play}<span>Up next: <strong>${course.modules[index].title}</strong> in ${course.title}</span>`;
    } else {
      primary.href = "#courses";
      primary.querySelector("span").textContent = "Find your next course";
      proof.remove();
    }
  }

  // Nav highlight follows the section in view (Home vs Courses)
  const homeLink = document.querySelector('.nav-links [data-nav="home"]');
  const coursesLink = document.querySelector('.nav-links [data-nav="courses"]');
  const catalogue = document.getElementById("courses");
  if (homeLink && coursesLink && catalogue) {
    const setCurrent = (link, on) =>
      on
        ? link.setAttribute("aria-current", "page")
        : link.removeAttribute("aria-current");

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCurrent(coursesLink, entry.isIntersecting);
        setCurrent(homeLink, !entry.isIntersecting);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    observer.observe(catalogue);
  }
});
