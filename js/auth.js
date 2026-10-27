/* Log in / register page. The "backend" is simulated with localStorage. */
document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("authForm");
  if (!authForm) return;

  const params = new URLSearchParams(window.location.search);
  const $ = (id) => document.getElementById(id);
  const toggleLogin = $("toggleLogin");
  const toggleRegister = $("toggleRegister");
  const heading = $("authHeading");
  const subheading = $("authSub");
  const submitBtn = $("submitAuth");
  const submitProgress = $("submitProgress");
  const emailEl = $("email");
  const passwordEl = $("password");
  const confirmEl = $("confirm");
  const pwToggle = $("pwToggle");
  const forgot = $("forgot");
  const formError = $("formError");
  const navLogin = document.querySelector('.nav-auth [data-auth="login"]');
  const navRegister = document.querySelector('.nav-auth [data-auth="register"]');

  // Only allow redirects back to pages on this site
  const nextParam = params.get("next") || "";
  const next = /^[a-z]+\.html(\?[\w=&%.-]*)?(#[\w-]+)?$/i.test(nextParam) ? nextParam : "index.html";

  let mode = params.get("mode") === "register" ? "register" : "login";
  // Errors only show live once the learner has tried to submit
  let attempted = false;

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
    document.querySelectorAll("[data-register]").forEach((el) => (el.hidden = login));
    attempted = false;
    clearErrors();
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

  // One toggle shows or hides both password fields
  pwToggle.addEventListener("click", () => {
    const show = passwordEl.type === "password";
    [passwordEl, confirmEl].forEach((el) => (el.type = show ? "text" : "password"));
    pwToggle.textContent = show ? "Hide" : "Show";
    pwToggle.setAttribute("aria-pressed", String(show));
  });

  forgot.addEventListener("click", () => {
    const email = emailEl.value.trim();
    if (!EMAIL.test(email)) {
      attempted = true;
      setError(emailEl, "Enter your email first and we'll send a reset link to it.");
      emailEl.focus();
      return;
    }
    Strumly.toast(`Password reset link sent to ${email}. Check your inbox. (Simulated)`, "success");
  });

  document.querySelectorAll(".sso-box").forEach((btn) =>
    btn.addEventListener("click", () =>
      Strumly.toast(`${btn.dataset.provider} sign-in isn't connected in this prototype.`),
    ),
  );

  // --- Validation ---
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    const error = $(`${input.id}Error`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.classList.toggle("is-invalid", Boolean(message));
    error.textContent = message || "";
    error.hidden = !message;
    return !message;
  }

  function clearErrors() {
    [emailEl, passwordEl, confirmEl].forEach((el) => setError(el, ""));
    $("confirmOk").hidden = true;
    formError.hidden = true;
  }

  const checks = {
    email: () => {
      const v = emailEl.value.trim();
      return setError(
        emailEl,
        !v ? "Enter your email address." : EMAIL.test(v) ? "" : "That doesn't look like an email address. Check for a missing @ or dot.",
      );
    },
    password: () => {
      const v = passwordEl.value;
      return setError(
        passwordEl,
        !v ? "Enter a password." : v.length < 6 ? `Use at least 6 characters (${6 - v.length} more).` : "",
      );
    },
    confirm: () => {
      const v = confirmEl.value;
      const ok = setError(
        confirmEl,
        !v ? "Type your password again." : v !== passwordEl.value ? "Passwords don't match yet." : "",
      );
      $("confirmOk").hidden = !ok;
      return ok;
    }
  };

  const fieldsFor = () =>
    mode === "login" ? ["email", "password"] : ["email", "password", "confirm"];

  // Run every check (not just the first failure) and focus the first bad field
  function validate() {
    const results = fieldsFor().map((f) => [f, checks[f]()]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) $(firstBad[0]).focus();
    return !firstBad;
  }

  // Live re-check after the first submit attempt
  [emailEl, passwordEl, confirmEl].forEach((el) =>
    el.addEventListener("input", () => {
      formError.hidden = true;
      if (attempted && fieldsFor().includes(el.id)) checks[el.id]();
      // Re-check the confirm field as soon as it has text, so "match" shows live
      if (mode === "register" && confirmEl.value && (el === confirmEl || el === passwordEl)) checks.confirm();
    }),
  );

  // --- Account-level errors with a one-click fix ---
  function showFormError(message, actionLabel, action) {
    formError.innerHTML = `<p>${message}</p><button type="button" class="link">${actionLabel}</button>`;
    formError.hidden = false;
    formError.querySelector("button").addEventListener("click", action);
  }

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    attempted = true;
    formError.hidden = true;
    if (!validate()) return;

    const email = emailEl.value.trim().toLowerCase();
    const safeEmail = Strumly.escapeHtml(email);

    if (mode === "login" && !Strumly.accountExists(email)) {
      showFormError(
        `We couldn't find an account for <strong>${safeEmail}</strong>. Check the spelling, or create a free account.`,
        "Create an account with this email",
        () => {
          setMode("register");
          emailEl.value = email;
          passwordEl.focus();
        },
      );
      return;
    }
    if (mode === "register" && Strumly.accountExists(email)) {
      showFormError(
        `There's already an account for <strong>${safeEmail}</strong>.`,
        "Log in instead",
        () => {
          setMode("login");
          emailEl.value = email;
          passwordEl.focus();
        },
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = mode === "login" ? "Logging in…" : "Creating account…";
    submitProgress.hidden = false;
    Strumly.animateProgress(submitProgress);

    // Simulated network delay
    setTimeout(() => {
      if (mode === "register") {
        Strumly.register(email);
        Strumly.saveSettings({
          displayName: $("displayName").value.trim(),
          experience: $("experience").value,
        });
        Strumly.flash("Welcome to Strumly! Your account is ready.");
      } else {
        Strumly.login(email);
        Strumly.flash(`Welcome back, ${Strumly.userName()}!`);
      }
      window.location.href = next;
    }, 1200);
  });

  setMode(mode);
});
