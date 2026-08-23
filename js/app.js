document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Global Updates ---
  const yearEl = document.getElementById("year");
  const year2El = document.getElementById("year2");
  const currentYear = new Date().getFullYear();
  if (yearEl) yearEl.textContent = currentYear;
  if (year2El) year2El.textContent = currentYear;

  // --- 2. Auth Page Logic (Login/Register & Password Toggle) ---
  const toggleLogin = document.getElementById("toggleLogin");
  const toggleRegister = document.getElementById("toggleRegister");
  const authForm = document.getElementById("authForm");
  const pwToggle = document.getElementById("pwToggle");
  const passwordEl = document.getElementById("password");
  const submitAuth = document.getElementById("submitAuth");
  const submitProgress = document.getElementById("submitProgress");
  const authHeading = document.getElementById("authHeading");

  // Declared at the top level of this block so the form submission can see it!
  let mode = "login";

  if (toggleLogin && toggleRegister) {
    toggleLogin.addEventListener("click", () => {
      setMode("login");
    });
    toggleRegister.addEventListener("click", () => {
      setMode("register");
    });
  }

  function setMode(m) {
    mode = m;
    toggleLogin.classList.toggle("active", m === "login");
    toggleRegister.classList.toggle("active", m === "register");
    if (submitAuth)
      submitAuth.textContent = m === "login" ? "Log In" : "Create Account";
    if (authHeading)
      authHeading.textContent =
        m === "login" ? "Welcome Back!" : "Create your account";
  }

  if (pwToggle && passwordEl) {
    pwToggle.addEventListener("click", () => {
      const type =
        passwordEl.getAttribute("type") === "password" ? "text" : "password";
      passwordEl.setAttribute("type", type);
      pwToggle.textContent = type === "password" ? "Show" : "Hide";
    });
  }

  // --- 3. Form Submission & Simulated Backend (Local Storage) ---
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent actual page reload

      // Get user email to use as their username
      const emailInput = document.getElementById("email").value;

      // UI Feedback: Loading state
      submitAuth.disabled = true;
      submitAuth.textContent = "Processing...";
      submitAuth.style.opacity = "0.7";
      if (submitProgress) submitProgress.setAttribute("aria-hidden", "false"); // Show progress bar

      // Simulate network delay (1.5 seconds)
      setTimeout(() => {
        // Save "session" to browser storage
        localStorage.setItem("strumly_user", emailInput);

        // UI Feedback: Success Toast (Can now successfully read the 'mode' variable!)
        showToast(
          mode === "login"
            ? "Login successful! Redirecting..."
            : "Account created! Redirecting...",
        );

        // Redirect to Home Page after 1.5 seconds
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }, 1500);
    });
  }

  // Helper Function: Show Toast Notification
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;

      // Force display to override any old CSS hiding it
      toast.style.display = "block";

      // Add the animation class
      setTimeout(() => {
        toast.classList.add("show-toast");
      }, 10); // Tiny delay ensures the browser registers the display change first

      // Automatically hide the toast after 3 seconds
      setTimeout(() => {
        toast.classList.remove("show-toast");

        // Wait for the slide-down animation to finish before hiding completely
        setTimeout(() => {
          if (!toast.classList.contains("show-toast")) {
            toast.style.display = "none";
          }
        }, 400);
      }, 3000);
    }
  }

  // --- 4. Global Navigation State (Check if user is logged in) ---
  const activeUser = localStorage.getItem("strumly_user");
  const navLinksContainer = document.querySelector(".nav-links");

  // If a user exists in storage AND we are on a page with a navbar
  if (activeUser && navLinksContainer) {
    // Extract everything before the '@' symbol to use as a name
    const userName = activeUser.split("@")[0];

    // Remove the Log In and Sign Up buttons
    const authBtns = navLinksContainer.querySelectorAll(".btn");
    authBtns.forEach((btn) => btn.remove());

    // Create a greeting element
    const greeting = document.createElement("span");
    greeting.textContent = `Hi, ${userName}`;
    greeting.style.color = "var(--muted)";
    greeting.style.fontWeight = "600";
    greeting.style.marginRight = "12px";

    // Create a Log Out button
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.className = "btn outline";
    logoutBtn.textContent = "Log Out";

    // Handle Log Out click
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("strumly_user"); // Delete session
      window.location.reload(); // Refresh page to reset navbar
    });

    // Add them to the navbar
    navLinksContainer.appendChild(greeting);
    navLinksContainer.appendChild(logoutBtn);
  }

  const courseList = document.getElementById("courseList");
  if (courseList) {
    const mockCourses = strumlyCourses;

    const statusMeta = {
      new: { label: "Not started", cls: "is-new", cta: "Start Learning" },
      progress: { label: "In progress", cls: "is-progress", cta: "Continue" },
      complete: { label: "Completed", cls: "is-complete", cta: "View Course" },
    };

    const courseSearch = document.getElementById("courseSearch");
    const courseCount = document.getElementById("courseCount");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const sortSelect = document.getElementById("sortSelect");

    let activeLevel = "all";
    let activeSort = "popular";

    function formatDuration(mins) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h ? `${h}h ${m ? m + "m" : ""}`.trim() : `${m}m`;
    }

    const icons = {
      clock:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
      users:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>',
      heart:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"></path></svg>',
      star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.2 21.5 12 18.1 5.8 21.5 7 14.4 2 9.5 8.9 8.6 12 2"></polygon></svg>',
      chevron:
        '<svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    };

    function buildRow(course, index) {
      const status = statusMeta[course.status];
      const panelId = `modules-${index}`;
      const modules = course.modules
        .map(
          (m, i) => `
              <li class="module-item">
                <span class="module-name">${i + 1}. ${m.title}</span>
                <span class="module-time">${formatDuration(m.minutes)}</span>
              </li>`,
        )
        .join("");

      return `
        <article class="course-row">
          <div class="row-thumb">
            <img src="${course.image}" alt="${course.title}">
          </div>
          <div class="row-body">
            <div class="row-head">
              <h3><a class="row-link" href="course.html?id=${course.id}">${course.title}</a></h3>
              <span class="course-badge is-${course.level.toLowerCase()}">${course.level}</span>
              <span class="status-badge ${status.cls}">${status.label}</span>
            </div>
            <p class="row-desc muted small">${course.blurb}</p>
            <ul class="row-meta">
              <li class="row-rating">${icons.star}<strong>${course.rating}</strong> (${course.reviews.toLocaleString()})</li>
              <li>${icons.clock}${formatDuration(course.minutes)}</li>
              <li>${icons.users}${course.learners.toLocaleString()} learners</li>
              <li>${icons.heart}${course.likes} likes</li>
              <li>Instructor: ${course.instructor}</li>
            </ul>
            <button type="button" class="more-info" aria-expanded="false" aria-controls="${panelId}">
              <span class="more-info-label">More Info</span>${icons.chevron}
            </button>
          </div>
          <div class="row-actions">
            <a class="btn primary" href="course.html?id=${course.id}">${status.cta}</a>
          </div>
          <div class="row-modules" id="${panelId}" hidden>
            <h4 class="modules-title">Modules</h4>
            <ul class="module-list">${modules}</ul>
          </div>
        </article>
      `;
    }

    function renderCourses() {

      // Check if user is currently logged in via localStorage
      const isLoggedIn = Boolean(localStorage.getItem("strumly_user"));

      function buildRow(course, index) {
        // Default values for logged-out users
        let statusLabel = "Available";
        let statusClass = "is-new";
        let buttonLabel = "View Course";

        // Only display progress meta if the user is actively logged in
        if (isLoggedIn) {
          if (course.status === "progress") {
            statusLabel = "In progress";
            statusClass = "is-progress";
            buttonLabel = "Continue";
          } else if (course.status === "complete") {
            statusLabel = "Completed";
            statusClass = "is-complete";
            buttonLabel = "Review Course";
          } else {
            statusLabel = "Not started";
            statusClass = "is-new";
            buttonLabel = "Start Learning";
          }
        }

        const panelId = `modules-${index}`;
        const modules = course.modules
          .map(
            (m, i) => `
              <li class="module-item">
                <span class="module-name">${i + 1}. ${m.title}</span>
                <span class="module-time">${formatDuration(m.minutes)}</span>
              </li>`,
          )
          .join("");

        return `
          <article class="course-row">
            <div class="row-thumb">
              <img src="${course.image}" alt="${course.title}">
            </div>
            <div class="row-body">
              <div class="row-head">
                <h3><a class="row-link" href="course.html?id=${course.id}">${course.title}</a></h3>
                <span class="course-badge is-${course.level.toLowerCase()}">${course.level}</span>
                ${isLoggedIn ? `<span class="status-badge ${statusClass}">${statusLabel}</span>` : ""}
              </div>
              <p class="row-desc muted small">${course.blurb}</p>
              <ul class="row-meta">
                <li class="row-rating"><strong>★ ${course.rating}</strong> (${course.reviews.toLocaleString()})</li>
                <li>${course.duration || "3h 30m"}</li>
                <li>Instructor: ${course.instructor}</li>
              </ul>
              <button type="button" class="more-info" aria-expanded="false" aria-controls="${panelId}">
                <span class="more-info-label">More Info</span>
              </button>
            </div>
            <div class="row-actions">
              <a class="btn primary" href="course.html?id=${course.id}">${buttonLabel}</a>
            </div>
            <div class="row-modules" id="${panelId}" hidden>
              <h4 class="modules-title">Modules</h4>
              <ul class="module-list">${modules}</ul>
            </div>
          </article>
        `;
      }

      const term = courseSearch ? courseSearch.value.trim().toLowerCase() : "";

      let visible = mockCourses.filter((course) => {
        const matchesLevel =
          activeLevel === "all" || course.level === activeLevel;
        const matchesTerm =
          term === "" ||
          course.title.toLowerCase().includes(term) ||
          course.instructor.toLowerCase().includes(term);
        return matchesLevel && matchesTerm;
      });

      if (activeSort === "popular")
        visible.sort((a, b) => b.learners - a.learners);
      if (activeSort === "duration")
        visible.sort((a, b) => a.minutes - b.minutes);
      if (activeSort === "rating") visible.sort((a, b) => b.rating - a.rating);
      if (activeSort === "title")
        visible.sort((a, b) => a.title.localeCompare(b.title));

      courseList.innerHTML = visible.length
        ? visible.map(buildRow).join("")
        : '<p class="list-empty">No courses match that search. Try a different term or level.</p>';

      if (courseCount) {
        courseCount.textContent = `Showing ${visible.length} of ${mockCourses.length} courses`;
      }
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeLevel = btn.dataset.level;
        filterBtns.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        renderCourses();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        activeSort = sortSelect.value;
        renderCourses();
      });
    }

    if (courseSearch) courseSearch.addEventListener("input", renderCourses);

    courseList.addEventListener("click", (e) => {
      const moreInfo = e.target.closest(".more-info");
      if (moreInfo) {
        e.preventDefault();
        const row = moreInfo.closest(".course-row");
        const panel = row ? row.querySelector(".row-modules") : null;
        if (!panel) return;

        const isOpen = !panel.hidden;
        panel.hidden = isOpen;
        moreInfo.setAttribute("aria-expanded", String(!isOpen));
        moreInfo.querySelector(".more-info-label").textContent = isOpen
          ? "More Info"
          : "Hide Info";
      }
    });

    renderCourses();
  }

  // --- 6. About Page Dynamic Content & Animations ---
  const teamGrid = document.getElementById("teamGrid");
  if (teamGrid) {
    const mockInstructors = Object.entries(strumlyInstructors).map(
      ([name, info]) => ({ name, ...info }),
    );

    mockInstructors.forEach((instructor) => {
      const cardHTML = `
        <div class="team-card">
          <div class="team-img-wrap">
            <img src="${instructor.image}" alt="${instructor.name}">
          </div>
          <h3>${instructor.name}</h3>
          <span class="team-role">${instructor.role}</span>
          <p class="muted">${instructor.bio}</p>
        </div>
      `;
      teamGrid.innerHTML += cardHTML;
    });
  }

  // Stats Counter Animation for About Page
  const statValues = document.querySelectorAll(".stat-value");
  if (statValues.length > 0) {
    const animateStats = () => {
      statValues.forEach((stat) => {
        const target = +stat.getAttribute("data-target");
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            stat.innerText = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            stat.innerText = target.toLocaleString();
          }
        };
        updateCounter();
      });
    };

    // Simple intersection observer to trigger animation when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateStats();
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.5 },
    );

    const statsSection = document.querySelector(".stats");
    if (statsSection) observer.observe(statsSection);
  }

  const courseMain = document.getElementById("courseMain");
if (courseMain) {
  const params = new URLSearchParams(window.location.search);
  const course = strumlyCourses.find((c) => c.id === params.get("id"));

  if (!course) {
    courseMain.innerHTML = `
      <div class="course-missing">
        <h1>Course not found</h1>
        <p class="muted">That course link is not valid or the course has been removed.</p>
        <a class="btn primary large" href="index.html#courses">Back to the catalogue</a>
      </div>
    `;
  } else {
    document.title = `${course.title} - Strumly`;

    // 1. Check Login & Completion State
    const isLoggedIn = Boolean(localStorage.getItem("strumly_user"));
    const isCompleted = course.status === "complete";
    const isInProgress = course.status === "progress";

    // 2. Set Context-Aware Labels & Action Text
    let ctaText = "Create an account to enroll";
    let priceLabel = "Included with Strumly";
    let subText = `Full lifetime access to all ${course.modules.length} modules.`;

    if (isLoggedIn) {
      if (isCompleted) {
        ctaText = "Review Course";
        priceLabel = "Completed";
        subText = "You have finished this course. Revisit lessons anytime.";
      } else if (isInProgress) {
        ctaText = "Continue Learning";
        priceLabel = "In Progress";
        subText = "Pick up right where you left off.";
      } else {
        ctaText = "Enroll Now";
        priceLabel = "Included with Strumly";
        subText = "Start learning today with full access.";
      }
    }

    const statusLabels = {
      new: "Not started",
      progress: "In progress",
      complete: "Completed",
    };
    const statusClasses = {
      new: "is-new",
      progress: "is-progress",
      complete: "is-complete",
    };

    const fmt = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h ? `${h}h ${m ? m + "m" : ""}`.trim() : `${m}m`;
    };

    const instructor = strumlyInstructors[course.instructor];
    const totalMinutes = course.modules.reduce((sum, m) => sum + m.minutes, 0);

    const syllabus = course.modules
      .map(
        (m, i) => `
          <li class="syllabus-item">
            <span class="syllabus-num">${String(i + 1).padStart(2, "0")}</span>
            <span class="syllabus-name">${m.title}</span>
            <span class="syllabus-time muted">${fmt(m.minutes)}</span>
          </li>`,
      )
      .join("");

    const prereqs = course.prerequisites
      .map((p) => `<li class="prereq-item">${p}</li>`)
      .join("");

    courseMain.innerHTML = `
      <a class="back-link" href="index.html#courses">&larr; Back to catalogue</a>

      <header class="course-header">
        <div class="course-header-body">
          <div class="course-tags">
            <span class="course-badge is-${course.level.toLowerCase()}">${course.level}</span>
            ${isLoggedIn ? `<span class="status-badge ${statusClasses[course.status]}">${statusLabels[course.status]}</span>` : ""}
          </div>
          <h1>${course.title}</h1>
          <p class="lead muted">${course.blurb}</p>
          <ul class="course-facts">
            <li class="row-rating"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.1 8.6 22 9.5 17 14.4 18.2 21.5 12 18.1 5.8 21.5 7 14.4 2 9.5 8.9 8.6 12 2"></polygon></svg><strong>${course.rating}</strong> (${course.reviews.toLocaleString()} ratings)</li>
            <li>${course.learners.toLocaleString()} learners</li>
            <li>${fmt(course.minutes)} of lessons</li>
            <li>Taught by ${course.instructor}</li>
          </ul>
        </div>
        <img class="course-header-img" src="${course.image}" alt="${course.title}">
      </header>

      <div class="course-layout">
        <div class="course-content">
          <section class="course-section">
            <h2>About this course</h2>
            <p>${course.description}</p>
          </section>

          <section class="course-section">
            <h2>Curriculum</h2>
            <p class="muted small">${course.modules.length} modules &middot; ${fmt(totalMinutes)} total</p>
            <ol class="syllabus-list">${syllabus}</ol>
          </section>

          <section class="course-section">
            <h2>Prerequisites</h2>
            <ul class="prereq-list">${prereqs}</ul>
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

        <aside class="enroll-panel">
          <span class="enroll-price">${priceLabel}</span>
          <p class="muted small">${subText}</p>
          <button type="button" class="btn primary enroll-btn" id="enrollBtn">${ctaText}</button>
          ${!isCompleted ? `<button type="button" class="btn ghost save-btn" id="saveBtn">Save for Later</button>` : ""}
          <ul class="enroll-facts muted small">
            <li>${fmt(totalMinutes)} of video lessons</li>
            <li>Learn at your own pace</li>
            <li>Certificate on completion</li>
          </ul>
        </aside>
      </div>
    `;

    const enrollBtn = document.getElementById("enrollBtn");
    const saveBtn = document.getElementById("saveBtn");

    if (enrollBtn) {
      enrollBtn.addEventListener("click", () => {
        if (!isLoggedIn) {
          // Redirect unauthenticated user to the login/register page
          showToast("Redirecting to login...");
          setTimeout(() => {
            window.location.href = "auth.html";
          }, 1000);
        } else {
          showToast(`${ctaText} clicked for '${course.title}'! (Simulated)`);
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        if (!isLoggedIn) {
          showToast("Please log in to save courses to your list.");
        } else {
          showToast(`'${course.title}' saved to your list. (Simulated)`);
        }
      });
    }
  }
}

  // --- 7. Simulated Search Functionality ---
  const searchInput = document.getElementById("globalSearch");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      // Check if the user pressed the "Enter" key
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent page reload

        const searchTerm = searchInput.value.trim();

        if (searchTerm !== "") {
          // Trigger the toast notification using the existing showToast function
          showToast(`Searching for '${searchTerm}'... (Simulated)`);

          // Clear the search bar
          searchInput.value = "";
          searchInput.blur(); // Remove cursor focus
        }
      }
    });
  }

  const viewAllLink = document.querySelector(".view-all");
  if (viewAllLink) {
    viewAllLink.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent page top jump
      showToast("Full course catalog coming soon in Design B!");
    });
  }
});
