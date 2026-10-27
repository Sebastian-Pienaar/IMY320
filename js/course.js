/* Course detail page ("About the course"), materials and reviews. */
document.addEventListener("DOMContentLoaded", () => {
  const courseMain = document.getElementById("courseMain");
  if (!courseMain) return;

  const { icons, formatDuration, escapeHtml } = Strumly;
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
  const instructorCourses = strumlyCourses.filter((c) => c.instructor === course.instructor);
  const instructorUrl = `index.html?instructor=${encodeURIComponent(course.instructor)}#courses`;

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

  const materials = [
    [icons.file, "Tab and chord sheets", "A printable exercise for every lesson"],
    [icons.music, "Click tracks", "Metronome tracks at slow and full tempo"],
    [icons.text, "Full transcripts", "Read along or search what was said"],
    [icons.calendar, "Practice plans", "A 7-day plan for each lesson"],
  ];

  const panel = panelContent();
  const saved = Strumly.isSaved(course.id);

  courseMain.innerHTML = `
    <a class="back-link reveal" href="index.html#courses">&larr; Back to courses</a>

    <header class="course-header reveal">
      <div>
        <div class="course-tags">
          <span class="badge level-${course.level.toLowerCase()}">${course.level}</span>
          <ul class="tag-list" aria-label="Topics">
            ${course.tags.map((t) => `<li class="tag">${t}</li>`).join("")}
          </ul>
        </div>
        <h1>${course.title}</h1>
        <p class="lead muted">${course.blurb}</p>
        <ul class="course-facts">
          <li class="rating" id="ratingFact"></li>
          <li>${icons.users}${course.learners.toLocaleString()} learners</li>
          <li>${icons.clock}${formatDuration(course.minutes)} of lessons</li>
          <li>${icons.user}<a class="fact-link" href="#instructor">${course.instructor}</a></li>
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
          <h2>Course materials</h2>
          <p class="muted syllabus-meta">Every lesson comes with extras you can download and keep.</p>
          <ul class="material-grid">
            ${materials.map(([icon, title, text]) => `<li class="material-card">${icon}<strong>${title}</strong><span class="muted small">${text}</span></li>`).join("")}
          </ul>
          ${isLoggedIn ? "" : `
          <div class="sample-row">
            <button type="button" class="btn btn-secondary" id="sampleBtn">${icons.download}Download a free sample tab</button>
            <span class="muted small">Lesson 1 tab sheet, no account needed</span>
          </div>`}
        </section>

        <section class="course-section">
          <h2>Before you start</h2>
          <ul class="prereq-list">
            ${course.prerequisites.map((p) => `<li class="prereq-item">${icons.check}<span>${p}</span></li>`).join("")}
          </ul>
        </section>

        <section class="course-section" id="instructor">
          <h2>Your instructor</h2>
          <div class="instructor-card">
            <img class="instructor-img" src="${instructor.image}" alt="${course.instructor}">
            <div>
              <h3>${course.instructor}</h3>
              <span class="team-role">${instructor.role}</span>
              <p class="muted">${instructor.bio}</p>
              <a class="link small instructor-link" href="${instructorUrl}">See all ${instructorCourses.length} courses by ${course.instructor} &rarr;</a>
            </div>
          </div>
        </section>

        <section class="course-section" id="reviews" aria-labelledby="reviewsTitle">
          <h2 id="reviewsTitle">Reviews</h2>
          <div id="reviewsBody"></div>
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
          <li>${icons.download}Tabs, click tracks and transcripts</li>
          <li>${icons.zap}Earn XP and keep your streak alive</li>
          <li>${icons.check}Completion badge when you finish</li>
        </ul>
      </aside>
    </div>`;

  Strumly.animateProgress(courseMain);

  // --- Reviews ---
  const reviewsBody = document.getElementById("reviewsBody");
  const ratingWords = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  let editing = false;

  const formatDate = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  function renderRatingFact() {
    const { rating, count } = Strumly.courseRating(course);
    document.getElementById("ratingFact").innerHTML =
      `${icons.star}<strong>${rating}</strong>&nbsp;<a class="fact-link muted" href="#reviews">(${count.toLocaleString()} ratings)</a>`;
  }

  function summaryHtml() {
    const { rating, count } = Strumly.courseRating(course);
    const counts = Strumly.ratingBreakdown(course);
    const total = counts.reduce((a, b) => a + b, 0);
    const bars = counts
      .map((n, i) => {
        const pct = Math.round((n / total) * 100);
        return `
          <li class="review-bar">
            <span>${5 - i} star</span>
            <div class="progress-track" aria-hidden="true"><div class="progress-fill" data-width="${pct}"></div></div>
            <span class="muted">${pct}%</span>
          </li>`;
      })
      .join("");
    return `
      <div class="review-summary">
        <div class="review-score">
          <strong>${rating}</strong>
          ${Strumly.stars(rating)}
          <span class="muted small">${count.toLocaleString()} ratings</span>
        </div>
        <ul class="review-bars" aria-label="Rating breakdown">${bars}</ul>
      </div>`;
  }

  function formHtml(existing) {
    const options = [1, 2, 3, 4, 5]
      .map(
        (n) => `
          <input type="radio" class="sr-only" name="rating" id="rate${n}" value="${n}"${existing?.rating === n ? " checked" : ""}>
          <label for="rate${n}" class="star-pick" data-value="${n}">${icons.star}<span class="sr-only">${n} star${n > 1 ? "s" : ""}, ${ratingWords[n]}</span></label>`,
      )
      .join("");
    return `
      <form class="review-form" id="reviewForm" novalidate>
        <h3>${existing ? "Edit your review" : "Rate this course"}</h3>
        <fieldset class="star-input" aria-describedby="ratingError">
          <legend class="filter-label">Your rating</legend>
          <div class="star-options" id="starOptions">${options}<span class="star-word" id="starWord" aria-hidden="true">${existing ? ratingWords[existing.rating] : "Choose a rating"}</span></div>
        </fieldset>
        <p class="field-error" id="ratingError" hidden>Choose a star rating before posting.</p>
        <div class="field">
          <label for="reviewText">Your review <span class="muted">(optional)</span></label>
          <textarea id="reviewText" class="input textarea" rows="4" maxlength="500" placeholder="What did you learn? Who would you recommend it to?">${existing ? escapeHtml(existing.text) : ""}</textarea>
          <p class="hint muted small"><span id="reviewChars">${existing ? existing.text.length : 0}</span>/500</p>
        </div>
        <div class="review-form-actions">
          <button type="submit" class="btn btn-primary" id="postReview">${existing ? "Update review" : "Post review"}</button>
          ${existing ? '<button type="button" class="btn btn-ghost" id="cancelEdit">Cancel</button>' : ""}
        </div>
      </form>`;
  }

  function composerHtml() {
    if (!isLoggedIn) {
      const next = encodeURIComponent(`${Strumly.courseUrl(course)}#reviews`);
      return `<p class="review-gate">Taken this course? <a class="link" href="auth.html?next=${next}">Log in</a> to leave a rating.</p>`;
    }
    if (Strumly.courseStatus(course) === "new") {
      return `<p class="review-gate">Start the course to rate it. Reviews come from enrolled learners only, so you can trust them.</p>`;
    }
    const mine = Strumly.myReview(course);
    if (mine && !editing) return "";
    return formHtml(mine);
  }

  function reviewItem(r, own) {
    const name = escapeHtml(r.name);
    return `
      <li class="review-item${own ? " is-own" : ""}">
        <div class="review-head">
          <span class="account-avatar" aria-hidden="true">${name.charAt(0)}</span>
          <div>
            <strong>${name}${own ? ' <span class="pill">Your review</span>' : ""}</strong>
            <span class="muted small">${formatDate(r.date)}</span>
          </div>
          <span class="review-stars" aria-label="${r.rating} out of 5 stars">${Strumly.stars(r.rating)}</span>
        </div>
        ${r.text ? `<p>${escapeHtml(r.text)}</p>` : ""}
        ${own ? `<div class="review-own-actions"><button type="button" class="link" data-review="edit">Edit</button><button type="button" class="link link-danger" data-review="delete">Delete</button></div>` : ""}
      </li>`;
  }

  function renderReviews() {
    const mineEmail = Strumly.user();
    const learner = Strumly.learnerReviews(course);
    const list = [
      ...learner.map((r) => reviewItem(r, r.email === mineEmail)),
      ...(strumlyReviews[course.id] || []).map((r) => reviewItem(r, false)),
    ];
    reviewsBody.innerHTML = `
      ${summaryHtml()}
      ${composerHtml()}
      <ul class="review-list">${list.join("")}</ul>`;
    Strumly.animateProgress(reviewsBody);
    renderRatingFact();
    bindReviewForm();
  }

  function bindReviewForm() {
    const form = document.getElementById("reviewForm");
    if (!form) return;
    const options = document.getElementById("starOptions");
    const word = document.getElementById("starWord");
    const error = document.getElementById("ratingError");
    const text = document.getElementById("reviewText");
    const chars = document.getElementById("reviewChars");
    const picks = options.querySelectorAll(".star-pick");

    const checked = () => Number(form.querySelector('input[name="rating"]:checked')?.value || 0);
    const paint = (n) =>
      picks.forEach((p) => p.classList.toggle("is-lit", Number(p.dataset.value) <= n));

    paint(checked());
    picks.forEach((p) =>
      p.addEventListener("mouseenter", () => {
        paint(Number(p.dataset.value));
        word.textContent = ratingWords[p.dataset.value];
      }),
    );
    options.addEventListener("mouseleave", () => {
      paint(checked());
      word.textContent = checked() ? ratingWords[checked()] : "Choose a rating";
    });
    form.addEventListener("change", (e) => {
      if (e.target.name !== "rating") return;
      paint(checked());
      word.textContent = ratingWords[checked()];
      error.hidden = true;
    });
    text.addEventListener("input", () => (chars.textContent = text.value.length));

    document.getElementById("cancelEdit")?.addEventListener("click", () => {
      editing = false;
      renderReviews();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const rating = checked();
      if (!rating) {
        error.hidden = false;
        form.querySelector('input[name="rating"]').focus();
        return;
      }
      const btn = document.getElementById("postReview");
      const updating = Boolean(Strumly.myReview(course));
      btn.disabled = true;
      btn.textContent = updating ? "Updating…" : "Posting…";

      // Simulated network delay
      setTimeout(() => {
        Strumly.saveReview(course, rating, text.value.trim());
        editing = false;
        renderReviews();
        Strumly.toast(updating ? "Your review was updated." : "Thanks! Your review is live.", "success");
        reviewsBody.querySelector(".review-item.is-own")?.scrollIntoView({ block: "nearest" });
      }, 700);
    });
  }

  reviewsBody.addEventListener("click", (e) => {
    const action = e.target.closest("[data-review]")?.dataset.review;
    if (action === "edit") {
      editing = true;
      renderReviews();
      document.getElementById("reviewText").focus();
    } else if (action === "delete") {
      if (!window.confirm("Delete your review? This can't be undone.")) return;
      Strumly.deleteReview(course);
      renderReviews();
      Strumly.toast("Your review was deleted.");
    }
  });

  renderReviews();
  // Arriving from a "Rate this course" link: jump to the reviews once drawn
  if (window.location.hash === "#reviews") reviewsBody.scrollIntoView();

  // --- Free sample download (visitors without an account only) ---
  document.getElementById("sampleBtn")?.addEventListener("click", () => {
    Strumly.download(`strumly-${course.id}-lesson-1-tab-sheet.txt`, Materials.tabSheet(course, 0));
    Strumly.toast("Sample tab sheet downloaded.", "success");
  });

  // --- Enrol ---
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

  // Save for later: a real toggle that works with or without an account
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
