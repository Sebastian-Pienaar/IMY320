/* Log in / register page. The "backend" is simulated with localStorage. */
document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("authForm");
  if (!authForm) return;

  const params = new URLSearchParams(window.location.search);
  const toggleLogin = document.getElementById("toggleLogin");
  const toggleRegister = document.getElementById("toggleRegister");
  const heading = document.getElementById("authHeading");
  const subheading = document.getElementById("authSub");
  const submitBtn = document.getElementById("submitAuth");
  const submitProgress = document.getElementById("submitProgress");
  const passwordEl = document.getElementById("password");
  const pwToggle = document.getElementById("pwToggle");
  const forgot = document.getElementById("forgot");
  const navLogin = document.querySelector('.nav-auth [data-auth="login"]');
  const navRegister = document.querySelector('.nav-auth [data-auth="register"]');

  // Only allow redirects back to pages on this site
  const nextParam = params.get("next") || "";
  const next = /^[a-z]+\.html(\?[\w=&%.-]*)?$/i.test(nextParam) ? nextParam : "index.html";

  let mode = params.get("mode") === "register" ? "register" : "login";

  function setMode(m) {
    mode = m;
    const login = m === "login";
    toggleLogin.setAttribute("aria-pressed", String(login));
    toggleRegister.setAttribute("aria-pressed", String(!login));
    heading.textContent = login ? "Welcome back!" : "Start playing today";
    subheading.textContent = login
      ? "Pick up right where you left off."
      : "Create a free account to track progress, earn XP and save courses.";
    submitBtn.textContent = login ? "Log in" : "Create account";
    passwordEl.autocomplete = login ? "current-password" : "new-password";
    forgot.hidden = !login;
  }

  toggleLogin.addEventListener("click", () => setMode("login"));
  toggleRegister.addEventListener("click", () => setMode("register"));

  // Nav buttons switch mode in place instead of reloading the same page
  [navLogin, navRegister].forEach((link) =>
    link?.addEventListener("click", (e) => {
      e.preventDefault();
      setMode(link.dataset.auth);
    }),
  );

  pwToggle.addEventListener("click", () => {
    const show = passwordEl.type === "password";
    passwordEl.type = show ? "text" : "password";
    pwToggle.textContent = show ? "Hide" : "Show";
    pwToggle.setAttribute("aria-pressed", String(show));
  });

  forgot.addEventListener("click", () =>
    Strumly.toast("Password reset link sent. Check your inbox. (Simulated)"),
  );

  document.querySelectorAll(".sso-box").forEach((btn) =>
    btn.addEventListener("click", () =>
      Strumly.toast(`${btn.dataset.provider} sign-in isn't connected in this prototype.`),
    ),
  );

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = mode === "login" ? "Logging in…" : "Creating account…";
    submitProgress.hidden = false;
    Strumly.animateProgress(submitProgress);

    // Simulated network delay
    setTimeout(() => {
      if (mode === "register") Strumly.register(email);
      else Strumly.login(email);
      window.location.href = next;
    }, 1200);
  });

  setMode(mode);
});
