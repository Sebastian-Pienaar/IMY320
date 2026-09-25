/* Settings page: display name and resetting progress. */
document.addEventListener("DOMContentLoaded", () => {
  const settingsMain = document.getElementById("settingsMain");
  if (!settingsMain) return;

  if (!Strumly.isLoggedIn()) {
    settingsMain.innerHTML = `
      <div class="gate">
        <h1>Log in to change your settings</h1>
        <p class="muted">Your settings are saved to your account.</p>
        <a class="btn btn-primary btn-lg" href="auth.html?next=settings.html">Log in</a>
      </div>`;
    return;
  }

  const settings = Strumly.getSettings();
  const esc = Strumly.escapeHtml;

  settingsMain.innerHTML = `
    <h1>Settings</h1>

    <form id="settingsForm" class="settings-form" novalidate>
      <section class="settings-group" aria-labelledby="profileTitle">
        <h2 id="profileTitle">Profile</h2>
        <div class="field">
          <label for="displayName">Display name</label>
          <input id="displayName" class="input" type="text" maxlength="30" autocomplete="nickname"
            value="${esc(settings.displayName)}" placeholder="${esc(Strumly.user().split("@")[0])}" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" class="input" type="email" value="${esc(Strumly.user())}" readonly />
        </div>
      </section>


      <div class="settings-actions">
        <button type="submit" class="btn btn-primary">Save changes</button>
        <p id="saveStatus" class="save-status" role="status" aria-live="polite"></p>
      </div>
    </form>

    <section class="settings-group danger-zone" aria-labelledby="resetTitle">
      <h2 id="resetTitle">Reset progress</h2>
      <div class="setting-row">
        <p class="muted small">Clears your completed lessons, XP and streak. Saved courses and settings are kept.</p>
        <button type="button" class="btn btn-danger" id="resetBtn">Reset progress</button>
      </div>
      <p id="resetStatus" class="save-status" role="status" aria-live="polite"></p>
    </section>

    <dialog class="confirm-dialog" id="resetDialog" aria-labelledby="resetDialogTitle" aria-describedby="resetDialogText">
      <h2 id="resetDialogTitle">Reset all progress?</h2>
      <p id="resetDialogText" class="muted">This clears every completed lesson, your XP and your streak. It can't be undone.</p>
      <div class="confirm-actions">
        <button type="button" class="btn btn-secondary" id="resetCancel">Cancel</button>
        <button type="button" class="btn btn-danger" id="resetConfirm">Reset progress</button>
      </div>
    </dialog>`;

  // --- Save profile + learning settings ---
  const form = document.getElementById("settingsForm");
  // Short confirmation next to the action, announced to screen readers
  function showStatus(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    clearTimeout(el.timer);
    el.timer = setTimeout(() => (el.textContent = ""), 3000);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Strumly.saveSettings({
      displayName: document.getElementById("displayName").value.trim(),
    });

    // Update the name in the nav straight away
    const name = Strumly.userName();
    const accountName = document.querySelector(".account-btn > span:not(.account-avatar)");
    if (accountName) accountName.textContent = name;
    const avatar = document.querySelector(".account-avatar");
    if (avatar) avatar.textContent = name.charAt(0);
    const menuName = document.querySelector(".menu-head strong");
    if (menuName) menuName.textContent = name;

    showStatus("saveStatus", "Changes saved");
  });

  // --- Reset progress (with confirmation) ---
  const dialog = document.getElementById("resetDialog");
  document.getElementById("resetBtn").addEventListener("click", () => dialog.showModal());
  document.getElementById("resetCancel").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  document.getElementById("resetConfirm").addEventListener("click", () => {
    Strumly.resetProgress();
    dialog.close();
    const menuStats = document.querySelector(".menu-head span");
    if (menuStats) menuStats.innerHTML = `${Strumly.icons.zap}0 XP &middot; 0-day streak`;
    showStatus("resetStatus", "Progress reset");
  });
});
