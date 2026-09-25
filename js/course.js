/* Course detail page ("About the course"). */
document.addEventListener("DOMContentLoaded", () => {
  const courseMain = document.getElementById("courseMain");
  if (!courseMain) return;

  const { icons, formatDuration } = Strumly;
  const params = new URLSearchParams(window.location.search);
  const course = Strumly.findCourse(params.get("id"));

  if (!course) {
    courseMain.innerHTML = `
      <div class="course-missing">
        <h1>Course not found</h1>
        <p class="muted">That course link is not valid or the course has been removed.</p>
        <a class="btn btn-primary btn-lg" href="index.html#courses">Back to courses</a>
      </div>`;
    return;
  }

  document.title = `${course.title} | Strumly`;

  const isLoggedIn = Strumly.isLoggedIn();
  const instructor = strumlyInstructors[course.instructor];

  function panelContent() {
    const status = Strumly.courseStatus(course);
    const done = Strumly.completedModules(course).length;
    const total = course.modules.length;
    const next = Strumly.nextModuleIndex(course);

    if (!isLoggedIn) {
      return {
        title: "Free with Strumly",
        sub: `All ${total} lessons, yours for life.`,
        cta: "Sign up to enrol",
        progress: "",
      };
    }
    if (status === "complete") {
      return {
        title: "Course complete",
        sub: "You finished every lesson and earned the course badge. Revisit any lesson whenever you like.",
        cta: "Review from lesson 1",
        progress: "",
      };
    }
    if (status === "progress") {
      return {
        title: "Welcome back",
        sub: `Up next: ${course.modules[next].title}`,
        cta: `Continue lesson ${next + 1}`,
        progress: Strumly.progressBar(Strumly.progressPercent(course), `${done} of ${total} lessons`),
      };
    }
    return {
      title: "Ready when you are",
      sub: `Start with “${course.modules[0].title}”.`,
      cta: "Start course",
      progress: "",
    };
  }

  function syllabusHtml() {
    const enrolled = isLoggedIn && Strumly.courseStatus(course) !== "new";
    const done = Strumly.completedModules(course);
    const next = Strumly.nextModuleIndex(course);

    return course.modules
      .map((m, i) => {
        const isDone = enrolled && done.includes(i);
        const isNext = enrolled && !isDone && i === next;
        const state = isDone ? "is-done" : isNext ? "is-next" : "";
        const num = isDone ? icons.check : String(i + 1).padStart(2, "0");
        const note = isDone
          ? "<small>Completed</small>"
          : isNext
            ? "<small>Up next</small>"
            : "";
        const inner = `
          <span class="syllabus-num" aria-hidden="true">${num}</span>
          <span class="syllabus-name">${m.title}${note}</span>
          <span class="syllabus-time">${formatDuration(m.minutes)}</span>`;
        // Lessons are only playable once enrolled
        return `<li class="syllabus-item ${state}">${
          enrolled
            ? `<a class="syllabus-row" href="${Strumly.lessonUrl(course, i)}">${inner}</a>`
            : `<div class="syllabus-row">${inner}</div>`
        }</li>`;
      })
      .join("");
  }

  const panel = panelContent();
  const saved = Strumly.isSaved(course.id);

  courseMain.innerHTML = `
    <a class="back-link reveal" href="index.html#courses">&larr; Back to courses</a>

    <header class="course-header reveal">
      <div>
        <div class="course-tags">
          <span class="badge level-${course.level.toLowerCase()}">${course.level}</span>
        </div>
        <h1>${course.title}</h1>
        <p class="lead muted">${course.blurb}</p>
        <ul class="course-facts">
          <li class="rating">${icons.star}<strong>${course.rating}</strong>&nbsp;<span class="muted">(${course.reviews.toLocaleString()} ratings)</span></li>
          <li>${icons.users}${course.learners.toLocaleString()} learners</li>
          <li>${icons.clock}${formatDuration(course.minutes)} of lessons</li>
          <li>${icons.user}${course.instructor}</li>
        </ul>
      </div>
      <img class="course-header-img" src="${course.image}" alt="">
    </header>

    <div class="course-layout reveal">
      <div class="course-content">
        <section class="course-section">
          <h2>About this course</h2>
          <p>${course.description}</p>
        </section>

        <section class="course-section">
          <h2>Curriculum</h2>
          <p class="muted syllabus-meta">${course.modules.length} lessons &middot; ${formatDuration(course.minutes)} total</p>
          <ol class="syllabus-list">${syllabusHtml()}</ol>
        </section>

        <section class="course-section">
          <h2>Before you start</h2>
          <ul class="prereq-list">
            ${course.prerequisites.map((p) => `<li class="prereq-item">${icons.check}<span>${p}</span></li>`).join("")}
          </ul>
        </section>

        <section class="course-section">
          <h2>Your instructor</h2>
          <div class="instructor-card">
            <img class="instructor-img" src="${instructor.image}" alt="${course.instructor}">
            <div>
              <h3>${course.instructor}</h3>
              <span class="team-role">${instructor.role}</span>
              <p class="muted">${instructor.bio}</p>
            </div>
          </div>
        </section>
      </div>

      <aside class="enroll-panel" aria-label="Enrolment">
        <span class="enroll-title">${panel.title}</span>
        <p class="enroll-sub">${panel.sub}</p>
        ${panel.progress}
        <div class="enroll-actions">
          <button type="button" class="btn btn-primary btn-lg btn-block" id="enrollBtn">${panel.cta}</button>
          <button type="button" class="btn btn-secondary btn-lg btn-block save-btn" id="saveBtn" aria-pressed="${saved}">
            ${icons.heart}<span class="save-label">${saved ? "Saved" : "Save for later"}</span>
          </button>
        </div>
        <ul class="enroll-facts">
          <li>${icons.clock}${formatDuration(course.minutes)} of video lessons</li>
          <li>${icons.zap}Earn XP and keep your streak alive</li>
          <li>${icons.check}Completion badge when you finish</li>
        </ul>
      </aside>
    </div>`;

  Strumly.animateProgress(courseMain);

  const enrollBtn = document.getElementById("enrollBtn");
  enrollBtn.addEventListener("click", () => {
    if (!isLoggedIn) {
      const next = encodeURIComponent(Strumly.courseUrl(course));
      window.location.href = `auth.html?mode=register&next=${next}`;
      return;
    }

    const status = Strumly.courseStatus(course);
    const target =
      status === "complete" ? 0 : Strumly.nextModuleIndex(course);

    if (status === "new") {
      // Make enrolling feel like an event, then head into lesson 1
      Strumly.enroll(course);
      enrollBtn.disabled = true;
      Confetti.popAround(enrollBtn);
      setTimeout(() => (window.location.href = Strumly.lessonUrl(course, target)), 1100);
    } else {
      window.location.href = Strumly.lessonUrl(course, target);
    }
  });

  // Save for later: a real toggle (aria-pressed) that works with or without an account
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.addEventListener("click", () => {
    const nowSaved = Strumly.toggleSaved(course.id);
    saveBtn.setAttribute("aria-pressed", String(nowSaved));
    saveBtn.querySelector(".save-label").textContent = nowSaved ? "Saved" : "Save for later";
    saveBtn.classList.remove("pop");
    void saveBtn.offsetWidth; // restart the animation
    if (nowSaved) {
      saveBtn.classList.add("pop");
      Confetti.popAround(saveBtn, 20);
    }
  });
});

