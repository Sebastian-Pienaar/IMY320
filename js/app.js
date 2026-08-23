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
    const mockCourses = [
      {
        title: "Acoustic Fingerpicking 101",
        rating: 4.8,
        reviews: 1240,
        status: "progress",
        instructor: "Sarah Jenkins",
        level: "Beginner",
        blurb:
          "Build clean, independent finger patterns from scratch and play your first full fingerstyle arrangement.",
        minutes: 380,
        learners: 8420,
        likes: 612,
        image:
          "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",
        modules: [
          { title: "Hand position and thumb independence", minutes: 45 },
          { title: "Travis picking pattern", minutes: 60 },
          { title: "Adding melody notes", minutes: 75 },
          { title: "Playing your first arrangement", minutes: 90 },
        ],
      },
      {
        title: "Electric Rock Solos",
        rating: 4.6,
        reviews: 870,
        status: "new",
        instructor: "Mike Torres",
        level: "Intermediate",
        blurb:
          "Bends, vibrato and phrasing drills that turn scale shapes into solos people actually want to hear.",
        minutes: 520,
        learners: 6150,
        likes: 498,
        image:
          "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600&q=80",
        modules: [
          { title: "Pentatonic shapes across the neck", minutes: 70 },
          { title: "Bending in tune", minutes: 55 },
          { title: "Vibrato and sustain control", minutes: 65 },
          { title: "Building a solo over a backing track", minutes: 95 },
        ],
      },
      {
        title: "Music Theory for Guitarists",
        rating: 4.9,
        reviews: 2310,
        status: "complete",
        instructor: "David Chen",
        level: "Beginner",
        blurb:
          "Keys, intervals and the CAGED system explained on the fretboard, with no sheet music required.",
        minutes: 290,
        learners: 11230,
        likes: 940,
        image:
          "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80",
        modules: [
          { title: "Notes on the fretboard", minutes: 40 },
          { title: "Intervals and triads", minutes: 55 },
          { title: "The CAGED system", minutes: 80 },
          { title: "Keys and chord families", minutes: 60 },
        ],
      },
      {
        title: "Blues Rhythm Mastery",
        rating: 4.7,
        reviews: 540,
        status: "progress",
        instructor: "Emma Lin",
        level: "Advanced",
        blurb:
          "Shuffle feels, turnarounds and comping voicings for playing rhythm in a live blues band.",
        minutes: 445,
        learners: 3980,
        likes: 356,
        image:
          "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=600&q=80",
        modules: [
          { title: "The 12-bar form and shuffle feel", minutes: 60 },
          { title: "Dominant 7th voicings", minutes: 70 },
          { title: "Turnarounds and stops", minutes: 75 },
          { title: "Comping behind a soloist", minutes: 85 },
        ],
      },
      {
        title: "Songwriting on Six Strings",
        rating: 4.5,
        reviews: 690,
        status: "new",
        instructor: "Marcus Cole",
        level: "Intermediate",
        blurb:
          "Turn chord progressions into finished songs using structure, melody and lyric-writing exercises.",
        minutes: 215,
        learners: 5240,
        likes: 421,
        image:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80",
        modules: [
          { title: "Progressions that carry a song", minutes: 45 },
          { title: "Verse, chorus and bridge", minutes: 50 },
          { title: "Writing a singable melody", minutes: 55 },
          { title: "Finishing and arranging", minutes: 65 },
        ],
      },
      {
        title: "Jazz Chord Voicings",
        rating: 4.8,
        reviews: 320,
        status: "new",
        instructor: "Elena Rostova",
        level: "Advanced",
        blurb:
          "Drop-2 shapes, extensions and voice leading for comping through standards with confidence.",
        minutes: 610,
        learners: 2470,
        likes: 289,
        image:
          "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=600&q=80",
        modules: [
          { title: "Shell voicings and guide tones", minutes: 80 },
          { title: "Drop-2 shapes", minutes: 95 },
          { title: "Extensions and alterations", minutes: 110 },
          { title: "Comping through a standard", minutes: 125 },
        ],
      },
    ];

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
              <h3><a class="row-link" href="auth.html">${course.title}</a></h3>
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
            <a class="btn primary" href="auth.html">${status.cta}</a>
          </div>
          <div class="row-modules" id="${panelId}" hidden>
            <h4 class="modules-title">Modules</h4>
            <ul class="module-list">${modules}</ul>
          </div>
        </article>
      `;
    }

    function renderCourses() {
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
        const panel = row.querySelector(".row-modules");
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
    const mockInstructors = [
      {
        name: "Marcus Cole",
        role: "Lead Acoustic Instructor",
        bio: "Former session guitarist with 15 years of touring experience. Marcus specializes in fingerstyle and folk.",
        image:
          "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80",
      },
      {
        name: "Elena Rostova",
        role: "Music Theory Expert",
        bio: "Classically trained at Berklee, Elena breaks down complex theory into easily digestible, practical guitar lessons.",
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      },
      {
        name: "Julian Vance",
        role: "Electric & Blues Coach",
        bio: "Julian lives and breathes the blues. He focuses on improvisation, tone building, and expressive soloing.",
        image:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80",
      },
    ];

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
