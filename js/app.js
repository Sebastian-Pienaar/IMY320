document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Global Updates ---
  const yearEl = document.getElementById('year');
  const year2El = document.getElementById('year2');
  const currentYear = new Date().getFullYear();
  if (yearEl) yearEl.textContent = currentYear;
  if (year2El) year2El.textContent = currentYear;

  // --- 2. Auth Page Logic (Login/Register & Password Toggle) ---
  const toggleLogin = document.getElementById('toggleLogin');
  const toggleRegister = document.getElementById('toggleRegister');
  const authForm = document.getElementById('authForm');
  const pwToggle = document.getElementById('pwToggle');
  const passwordEl = document.getElementById('password');
  const submitAuth = document.getElementById('submitAuth');
  const submitProgress = document.getElementById('submitProgress');
  const authHeading = document.getElementById('authHeading');

  // Declared at the top level of this block so the form submission can see it!
  let mode = 'login'; 
  
  if (toggleLogin && toggleRegister) {
    toggleLogin.addEventListener('click', () => { setMode('login'); });
    toggleRegister.addEventListener('click', () => { setMode('register'); });
  }

  function setMode(m) { 
    mode = m; 
    toggleLogin.classList.toggle('active', m === 'login'); 
    toggleRegister.classList.toggle('active', m === 'register'); 
    if (submitAuth) submitAuth.textContent = m === 'login' ? 'Log In' : 'Create Account'; 
    if (authHeading) authHeading.textContent = m === 'login' ? 'Welcome Back!' : 'Create your account';
  }

  if (pwToggle && passwordEl) {
    pwToggle.addEventListener('click', () => {
      const type = passwordEl.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordEl.setAttribute('type', type);
      pwToggle.textContent = type === 'password' ? 'Show' : 'Hide';
    });
  }

  // --- 3. Form Submission & Simulated Backend (Local Storage) ---
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent actual page reload

      // Get user email to use as their username
      const emailInput = document.getElementById('email').value;

      // UI Feedback: Loading state
      submitAuth.disabled = true;
      submitAuth.textContent = 'Processing...';
      submitAuth.style.opacity = '0.7';
      if (submitProgress) submitProgress.setAttribute('aria-hidden', 'false'); // Show progress bar

      // Simulate network delay (1.5 seconds)
      setTimeout(() => {
        // Save "session" to browser storage
        localStorage.setItem('strumly_user', emailInput);

        // UI Feedback: Success Toast (Can now successfully read the 'mode' variable!)
        showToast(mode === 'login' ? 'Login successful! Redirecting...' : 'Account created! Redirecting...');

        // Redirect to Home Page after 1.5 seconds
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);

      }, 1500);
    });
  }

  // Helper Function: Show Toast Notification
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      
      // Force display to override any old CSS hiding it
      toast.style.display = 'block'; 
      
      // Add the animation class
      setTimeout(() => {
        toast.classList.add('show-toast');
      }, 10); // Tiny delay ensures the browser registers the display change first

      // Automatically hide the toast after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show-toast');
        
        // Wait for the slide-down animation to finish before hiding completely
        setTimeout(() => {
          if (!toast.classList.contains('show-toast')) {
            toast.style.display = 'none';
          }
        }, 400); 
      }, 3000);
    }
  }

  // --- 4. Global Navigation State (Check if user is logged in) ---
  const activeUser = localStorage.getItem('strumly_user');
  const navLinksContainer = document.querySelector('.nav-links');

  // If a user exists in storage AND we are on a page with a navbar
  if (activeUser && navLinksContainer) {
    // Extract everything before the '@' symbol to use as a name
    const userName = activeUser.split('@')[0];

    // Remove the Log In and Sign Up buttons
    const authBtns = navLinksContainer.querySelectorAll('.btn');
    authBtns.forEach(btn => btn.remove());

    // Create a greeting element
    const greeting = document.createElement('span');
    greeting.textContent = `Hi, ${userName}`;
    greeting.style.color = 'var(--muted)';
    greeting.style.fontWeight = '600';
    greeting.style.marginRight = '12px';

    // Create a Log Out button
    const logoutBtn = document.createElement('a');
    logoutBtn.href = "#";
    logoutBtn.className = "btn outline";
    logoutBtn.textContent = "Log Out";
    
    // Handle Log Out click
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('strumly_user'); // Delete session
      window.location.reload(); // Refresh page to reset navbar
    });

    // Add them to the navbar
    navLinksContainer.appendChild(greeting);
    navLinksContainer.appendChild(logoutBtn);
  }

  // --- 5. Landing Page Dynamic Content (Course Grid) ---
  const courseGrid = document.getElementById('courseGrid');
  if (courseGrid) {
    const mockCourses = [
      { 
        title: "Acoustic Fingerpicking 101", 
        instructor: "Sarah Jenkins", 
        level: "Beginner", 
        image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80" 
      },
      { 
        title: "Electric Rock Solos", 
        instructor: "Mike Torres", 
        level: "Intermediate", 
        image: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600&q=80" 
      },
      { 
        title: "Music Theory for Guitarists", 
        instructor: "David Chen", 
        level: "All Levels", 
        image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80" 
      },
      { 
        title: "Blues Rhythm Mastery", 
        instructor: "Emma Lin", 
        level: "Advanced", 
        image: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=600&q=80" 
      }
    ];

    mockCourses.forEach(course => {
      const cardHTML = `
        <div class="course-card">
          <div class="img-wrap">
            <img src="${course.image}" alt="${course.title}">
          </div>
          <div class="course-content">
            <span class="course-badge">${course.level}</span>
            <h3>${course.title}</h3>
            <p class="muted small">Instructor: ${course.instructor}</p>
          </div>
        </div>
      `;
      courseGrid.innerHTML += cardHTML;
    });
  }

  // --- 6. About Page Dynamic Content & Animations ---
  const teamGrid = document.getElementById('teamGrid');
  if (teamGrid) {
    const mockInstructors = [
      {
        name: "Marcus Cole",
        role: "Lead Acoustic Instructor",
        bio: "Former session guitarist with 15 years of touring experience. Marcus specializes in fingerstyle and folk.",
        image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80"
      },
      {
        name: "Elena Rostova",
        role: "Music Theory Expert",
        bio: "Classically trained at Berklee, Elena breaks down complex theory into easily digestible, practical guitar lessons.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80"
      },
      {
        name: "Julian Vance",
        role: "Electric & Blues Coach",
        bio: "Julian lives and breathes the blues. He focuses on improvisation, tone building, and expressive soloing.",
        image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80"
      }
    ];

    mockInstructors.forEach(instructor => {
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
  const statValues = document.querySelectorAll('.stat-value');
  if (statValues.length > 0) {
    const animateStats = () => {
      statValues.forEach(stat => {
        const target = +stat.getAttribute('data-target');
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
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateStats();
        observer.disconnect(); // Only animate once
      }
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.stats');
    if (statsSection) observer.observe(statsSection);
  }
// --- 7. Simulated Search Functionality ---
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      // Check if the user pressed the "Enter" key
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent page reload
        
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm !== '') {
          // Trigger the toast notification using the existing showToast function
          showToast(`Searching for '${searchTerm}'... (Simulated)`);
          
          // Clear the search bar
          searchInput.value = '';
          searchInput.blur(); // Remove cursor focus
        }
      }
    });
  }

const viewAllLink = document.querySelector('.view-all');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent page top jump
      showToast('Full course catalog coming soon in Design B!');
    });
  }

});