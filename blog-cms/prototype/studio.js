const api = window.TDSACmsApi;
let state = {
  articles: [],
  categories: [],
  media: [],
  health: null,
  currentUser: null,
  users: [],
};
let activeFilter = "all";
let editingId = null;
let editingRevision = "",
  editorBaseline = "",
  saving = false,
  page = 1;
let workspaceEpoch = 0,
  loadingWorkspace = false;
const pageSize = 10;
const recoveryKey = "tdsaCmsEditorRecovery";
function storedJson(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function storeJson(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function clearRecovery() {
  try {
    sessionStorage.removeItem(recoveryKey);
  } catch {}
}
function feedback(message = "") {
  const el = $("#editorFeedback");
  el.textContent = message;
  el.hidden = !message;
  if (message) el.scrollIntoView?.({ block: "nearest" });
}
function isDirty() {
  return editor.open && JSON.stringify(editorData()) !== editorBaseline;
}
function rememberEditor() {
  if (isDirty()) {
    const stored = storeJson(recoveryKey, {
      id: editingId,
      revision: editingRevision,
      userId: state.currentUser?.id,
      data: editorData(),
    });
    $("#saveState").textContent = stored
      ? "Unsaved changes · recovery copy in this tab"
      : "Unsaved changes";
  } else if (editor.open) {
    $("#saveState").textContent = editingId ? "All changes saved" : "Not saved";
  }
}
function closeEditor() {
  if (saving) return;
  if (isDirty() && !confirm("Discard these unsaved changes?")) return;
  clearRecovery();
  editor.close();
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const list = $("#articleList"),
  empty = $("#emptyState"),
  count = $("#resultCount"),
  search = $("#articleSearch"),
  globalSearch = $("#globalSearch"),
  categoryFilter = $("#categoryFilter"),
  sortFilter = $("#sortFilter");
const editor = $("#editorDialog"),
  preview = $("#previewDialog");
const loginGate = $("#loginGate"),
  loginForm = $("#loginForm"),
  loginEmail = $("#loginEmail"),
  loginPassword = $("#loginPassword"),
  loginFeedback = $("#loginFeedback"),
  loginSubmit = $("#loginSubmit"),
  signOutBtn = $("#signOutBtn"),
  sidebarSignOutBtn = $("#sidebarSignOutBtn"),
  currentUserEl = $("#currentUser"),
  sidebarCurrentUserEl = $("#sidebarCurrentUser");

function finishBoot() {
  document.body.classList.remove("studio-loading");
  $("#bootStatus").hidden = true;
}
function showLogin(message = "Sign in to continue.") {
  finishBoot();
  $(".app-shell").inert = true;
  loginGate.hidden = false;
  document.body.classList.add("studio-locked");
  loginFeedback.textContent = message;
  loginFeedback.hidden = !message;
  signOutBtn.hidden = true;
  loginPassword.type = "password";
  $("#togglePassword").textContent = "Show";
  $("#togglePassword").setAttribute("aria-label", "Show password");
  $("#togglePassword").setAttribute("aria-pressed", "false");
  setTimeout(() => loginEmail.focus(), 0);
}
function hideLogin() {
  finishBoot();
  $(".app-shell").inert = false;
  loginGate.hidden = true;
  document.body.classList.remove("studio-locked");
  loginFeedback.hidden = true;
  signOutBtn.hidden = false;
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
}
function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
function prettyDate(value) {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
function notify(title, message, action = null) {
  $("#toastTitle").textContent = title;
  $("#toastMessage").textContent = message;
  const link = $("#toastAction");
  if (action?.href) {
    link.href = action.href;
    link.textContent = action.label || "View on blog ↗";
    link.hidden = false;
  } else {
    link.hidden = true;
    link.removeAttribute("href");
  }
  const toast = $("#toast");
  toast.classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(
    () => toast.classList.remove("show"),
    action?.href ? 9000 : 4200,
  );
}
function deliveryMessage(delivery) {
  if (!delivery) return "";
  if (!delivery.configured)
    return " The live website still needs a build and deployment.";
  return delivery.ok
    ? " A website rebuild was requested; live deployment is not yet verified."
    : " The website rebuild request failed. Retry deployment before expecting the live site to change.";
}
function errorMessage(error) {
  return error?.details?.length
    ? error.details.join(" ")
    : error?.message || "Something went wrong.";
}

function setBackendStatus(mode, message) {
  const el = $("#backendStatus");
  el.classList.remove("online", "offline");
  if (mode) el.classList.add(mode);
  el.querySelector("b").textContent = message;
  $("#backendMetric").textContent = mode === "online" ? "Online" : "Offline";
  $("#backendMetricNote").textContent =
    mode === "online"
      ? state.health?.backend === "sanity"
        ? `${state.health.projectId}/${state.health.dataset} · ${state.health.categoryCount ?? 0} categories`
        : "Connected content service"
      : "Backend unavailable";
}

async function loadWorkspace({ quiet = false } = {}) {
  if (loadingWorkspace) return false;
  loadingWorkspace = true;
  const epoch = workspaceEpoch,
    refresh = $("#refreshBtn");
  refresh.disabled = true;
  refresh.textContent = "Refreshing…";
  if (!quiet) setBackendStatus("", "Connecting…");
  try {
    const requests = [
      ["health", api.health()],
      ["articles", api.listArticles()],
      ["categories", api.listCategories()],
      ["media", api.listMedia()],
    ];
    const results = await Promise.allSettled(
      requests.map(([, promise]) => promise),
    );
    if (epoch !== workspaceEpoch) return false;
    if (
      results.some((r) => r.status === "rejected" && r.reason?.status === 401)
    ) {
      expireSession();
      return false;
    }
    const values = {},
      failures = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") values[requests[i][0]] = r.value;
      else failures.push(requests[i][0]);
    });
    const user = await api.me();
    if (epoch !== workspaceEpoch) return false;
    state = {
      ...state,
      health: values.health || state.health,
      currentUser: user,
      articles: Array.isArray(values.articles)
        ? values.articles
        : state.articles,
      categories: Array.isArray(values.categories)
        ? values.categories
        : state.categories,
      media: Array.isArray(values.media) ? values.media : state.media,
    };
    currentUserEl.textContent = user?.name || user?.email || "Staff";
    currentUserEl.hidden = false;
    if (sidebarCurrentUserEl)
      sidebarCurrentUserEl.textContent =
        user?.name || user?.email || "TeleDoctorSA staff";
    const ok = Boolean(values.health);
    setBackendStatus(
      ok ? "online" : "offline",
      ok
        ? failures.length
          ? "Connected · some data unavailable"
          : "Content service connected"
        : "Connection unavailable",
    );
    const box = $("#workspaceFeedback");
    box.hidden = !failures.length;
    box.textContent = failures.length
      ? `Could not refresh ${failures.join(", ")}. Previously loaded content is shown. Select Refresh to try again.`
      : "";
    render();
    hideLogin();
    if ($("#settingsView").classList.contains("active")) void loadSettings();
    return true;
  } catch (error) {
    if (epoch !== workspaceEpoch) return false;
    if (error.status === 401) expireSession();
    else {
      setBackendStatus("offline", "Connection unavailable");
      showLogin("The service is unavailable. Try signing in again shortly.");
    }
    return false;
  } finally {
    loadingWorkspace = false;
    refresh.disabled = false;
    refresh.textContent = "Refresh";
  }
}
function expireSession() {
  if (document.body.classList.contains("studio-locked")) return;
  const wasSignedIn = Boolean(state.currentUser);
  rememberEditor();
  workspaceEpoch++;
  $$("dialog[open]").forEach((d) => d.close());
  state = {
    articles: [],
    categories: [],
    media: [],
    health: null,
    currentUser: null,
    users: [],
  };
  $("#temporaryPassword").textContent = "";
  $("#temporaryPasswordBox").hidden = true;
  $("#passwordForm").reset();
  $("#staffForm").reset();
  render();
  showLogin(
    wasSignedIn
      ? "Your session expired. Sign in again to continue. Unsaved writing can be restored in this tab."
      : "",
  );
}
window.addEventListener("cms:session-expired", expireSession);

function updateCounts() {
  const counts = (status) =>
    state.articles.filter((a) => a.status === status).length;
  $("#publishedMetric").textContent = counts("Published");
  $("#reviewMetric").textContent = counts("Review");
  $("#draftMetric").textContent = counts("Draft");
  $("#allCount").textContent = state.articles.length;
  $("#publishedCount").textContent = counts("Published");
  $("#draftCount").textContent = counts("Draft");
  $("#reviewCount").textContent = counts("Review");
  $("#articleNavCount").textContent = state.articles.length;
  $("#reviewNavCount").textContent = counts("Review");
  $("#scheduledCount").textContent = counts("Scheduled");
}

function hydrateCategories() {
  const current = categoryFilter.value || "all";
  categoryFilter.innerHTML =
    '<option value="all">All categories</option>' +
    state.categories
      .map(
        (c) =>
          `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`,
      )
      .join("");
  categoryFilter.value = state.categories.some((c) => c.name === current)
    ? current
    : "all";

  const editorSelect = $("#articleCategory");
  const editorCurrent = editorSelect.value;
  if (!state.categories.length) {
    editorSelect.innerHTML =
      '<option value="">No categories available</option>';
    editorSelect.value = "";
    editorSelect.disabled = true;
    return;
  }

  editorSelect.disabled = false;
  editorSelect.innerHTML =
    '<option value="">Choose a category (optional for drafts)</option>' +
    state.categories
      .map(
        (c) =>
          `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`,
      )
      .join("");
  editorSelect.value = state.categories.some((c) => c.name === editorCurrent)
    ? editorCurrent
    : "";
}

function hydrateMediaSelect(selectedUrl = "") {
  const select = $("#articleCoverImage");
  select.innerHTML =
    '<option value="">Select from media library</option>' +
    state.media
      .map(
        (m) =>
          `<option value="${escapeHtml(m.url)}" data-id="${escapeHtml(m.id)}" data-alt="${escapeHtml(m.alt || "")}">${escapeHtml(m.name)}</option>`,
      )
      .join("");
  if (selectedUrl && !state.media.some((m) => m.url === selectedUrl))
    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHtml(selectedUrl)}">Current image</option>`,
    );
  select.value = selectedUrl || "";
}

function filteredArticles() {
  const query = search.value.trim().toLowerCase(),
    selected = categoryFilter.value;
  const rows = state.articles.filter(
    (a) =>
      (!query ||
        `${a.title} ${a.excerpt} ${a.author} ${a.category}`
          .toLowerCase()
          .includes(query)) &&
      (activeFilter === "all" || a.status === activeFilter) &&
      (selected === "all" || a.category === selected),
  );
  return rows.sort((a, b) =>
    sortFilter.value === "az"
      ? a.title.localeCompare(b.title)
      : sortFilter.value === "oldest"
        ? new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0)
        : new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
  );
}

function renderArticles() {
  const allRows = filteredArticles();
  const pages = Math.max(1, Math.ceil(allRows.length / pageSize));
  page = Math.min(Math.max(1, page), pages);
  const rows = allRows.slice((page - 1) * pageSize, page * pageSize);
  $("#previousPage").disabled = page === 1;
  $("#nextPage").disabled = page === pages;
  $("#pageLabel").textContent = `Page ${page} of ${pages}`;
  storeJson("tdsaCmsList", {
    page,
    activeFilter,
    query: search.value,
    category: categoryFilter.value,
    sort: sortFilter.value,
  });
  list.innerHTML = rows
    .map(
      (a) =>
        `<article class="article-row" data-id="${escapeHtml(a.id)}"><button class="story story-button" data-edit="${escapeHtml(a.id)}"><div class="thumb" aria-hidden="true">${a.coverImage?.url ? `<img src="${escapeHtml(a.coverImage.url)}" alt="">` : `<span>${a.featured ? "★" : "+"}</span>`}</div><div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt || "No introduction yet.")}</p></div></button><span class="badge ${escapeHtml(a.status)}">${a.status === "Review" ? "In review" : escapeHtml(a.status)}</span><span class="category">${escapeHtml(a.category)}</span><span class="date"><span class="author">${escapeHtml(a.author)}</span><br>${prettyDate(a.updatedAt)}</span><button class="row-menu" data-edit="${escapeHtml(a.id)}" aria-label="Edit ${escapeHtml(a.title)}">•••</button></article>`,
    )
    .join("");
  empty.hidden = allRows.length !== 0;
  count.textContent = allRows.length
    ? `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + rows.length} of ${allRows.length} stories`
    : "No stories found";
  updateCounts();
  $$("[data-edit]").forEach((button) =>
    button.addEventListener("click", () => openEditor(button.dataset.edit)),
  );
}

function renderMedia() {
  const q = $("#mediaSearch").value.trim().toLowerCase();
  const rows = state.media.filter(
    (m) => !q || `${m.name} ${m.tag} ${m.alt}`.toLowerCase().includes(q),
  );
  $("#mediaGrid").innerHTML = rows
    .map(
      (m) =>
        `<article class="media-item"><div class="media-visual real-media"><img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.alt || "")}"></div><div><span>${escapeHtml(m.tag || "Image")}</span><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.mimeType || "image")} · ${escapeHtml(m.alt || "Alt text not set")}</p></div></article>`,
    )
    .join("");
  if (!rows.length)
    $("#mediaGrid").innerHTML =
      '<div class="media-empty">No media found.</div>';
  hydrateMediaSelect($("#articleCoverImage")?.value || "");
}

function renderCategories() {
  $("#categoryGrid").innerHTML = state.categories
    .map((c) => {
      const total = state.articles.filter((a) => a.category === c.name).length,
        published = state.articles.filter(
          (a) => a.category === c.name && a.status === "Published",
        ).length;
      return `<article class="category-card"><div class="category-symbol">${escapeHtml(
        String(c.name || "")
          .slice(0, 2)
          .toUpperCase(),
      )}</div><div><h3>${escapeHtml(c.name)}</h3><p>${total} ${total === 1 ? "story" : "stories"} · ${published} published</p></div><button aria-label="Remove ${escapeHtml(c.name)} category" data-category-remove="${escapeHtml(c.id)}" ${total ? 'disabled title="Move articles before deleting this category"' : ""}>×</button></article>`;
    })
    .join("");
  if (!state.categories.length)
    $("#categoryGrid").innerHTML =
      '<div class="media-empty">No categories yet. Add one to organise your stories.</div>';
  $$("[data-category-remove]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (!confirm("Remove this category?")) return;
      b.disabled = true;
      try {
        await api.deleteCategory(b.dataset.categoryRemove);
        state.categories = state.categories.filter(
          (c) => c.id !== b.dataset.categoryRemove,
        );
        render();
        notify(
          "Category removed",
          "The category was removed from the content service.",
        );
      } catch (error) {
        b.disabled = false;
        notify("Category not removed", errorMessage(error));
      }
    }),
  );
}

function render() {
  hydrateCategories();
  renderArticles();
  renderMedia();
  renderCategories();
  renderSettings();
}

function renderSettings() {
  const user = state.currentUser;
  const accountName = $("#accountName"),
    accountMeta = $("#accountMeta"),
    passwordForm = $("#passwordForm"),
    adminPanel = $("#staffAdminPanel");
  if (!accountName || !accountMeta) return;
  accountName.textContent = user?.name || "Publishing Studio account";
  accountMeta.textContent = user
    ? user.email
      ? `${user.email} · ${user.role || "staff"}`
      : user.development
        ? "Local development mode"
        : "Authenticated staff account"
    : "Not signed in";
  passwordForm.hidden =
    !user || Boolean(user.development) || Boolean(user.legacy);
  adminPanel.hidden =
    !user ||
    user.role !== "admin" ||
    Boolean(user.development) ||
    Boolean(user.legacy);
  if (!adminPanel.hidden) renderStaffList();
}

function renderStaffList() {
  const target = $("#staffList");
  if (!target) return;
  if (!state.users.length) {
    target.innerHTML =
      '<div class="media-empty">No staff accounts loaded.</div>';
    return;
  }
  target.innerHTML = state.users
    .map(
      (user) =>
        `<article class="staff-row"><div><h3>${escapeHtml(user.name)}</h3><p>${escapeHtml(user.email)}</p></div><span>${escapeHtml(user.role)}</span><div class="staff-actions"><button type="button" data-user-reset="${escapeHtml(user.id)}" aria-label="Reset password for ${escapeHtml(user.name)}">Reset</button><button class="remove" type="button" data-user-remove="${escapeHtml(user.id)}" ${user.id === state.currentUser?.id ? 'disabled title="This is your signed-in account"' : ""} aria-label="Remove ${escapeHtml(user.name)}">×</button></div></article>`,
    )
    .join("");
  $$("[data-user-reset]").forEach((button) =>
    button.addEventListener("click", async () => {
      const user = state.users.find(
        (item) => item.id === button.dataset.userReset,
      );
      if (!user) return;
      if (
        !confirm(
          `Reset the password for ${user.name}? Their current sessions will be signed out.`,
        )
      )
        return;
      button.disabled = true;
      try {
        const result = await api.resetUserPassword(user.id);
        $("#temporaryPassword").textContent = result.temporaryPassword;
        $("#temporaryPasswordBox").hidden = false;
        notify(
          "Password reset",
          `A new temporary password was generated for ${user.name}.`,
        );
      } catch (error) {
        notify("Password not reset", errorMessage(error));
      } finally {
        button.disabled = false;
      }
    }),
  );
  $$("[data-user-remove]").forEach((button) =>
    button.addEventListener("click", async () => {
      const user = state.users.find(
        (item) => item.id === button.dataset.userRemove,
      );
      if (!user) return;
      if (!confirm(`Remove Publishing Studio access for ${user.name}?`)) return;
      button.disabled = true;
      try {
        await api.deleteUser(user.id);
        state.users = state.users.filter((item) => item.id !== user.id);
        renderStaffList();
        notify("Access removed", `${user.name} can no longer sign in.`);
      } catch (error) {
        button.disabled = false;
        notify("Account not removed", errorMessage(error));
      }
    }),
  );
}

async function loadSettings() {
  renderSettings();
  if (
    state.currentUser?.role !== "admin" ||
    state.currentUser?.development ||
    state.currentUser?.legacy
  )
    return;
  const epoch = workspaceEpoch;
  try {
    const users = await api.listUsers();
    if (epoch !== workspaceEpoch) return;
    state.users = users;
    renderStaffList();
  } catch (error) {
    notify("Staff accounts unavailable", errorMessage(error));
  }
}

function setSidebar(open) {
  $("#sidebar").classList.toggle("open", open);
  $("#sidebar").inert = innerWidth <= 760 && !open;
  $("#menuBtn").setAttribute("aria-expanded", String(open));
  $("#menuBtn").setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
function syncNavigation(name) {
  $$("[data-view]").forEach((n) => {
    const active =
      n.dataset.view === name &&
      (name !== "articles" || activeFilter === "all");
    n.classList.toggle("active", active);
    if (active) n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  });
  $$("[data-status-view]").forEach((n) => {
    const active = name === "articles" && n.dataset.statusView === activeFilter;
    n.classList.toggle("active", active);
    if (active) n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  });
  $$(".tabs button").forEach((t) => {
    const active = t.dataset.filter === activeFilter;
    t.classList.toggle("active", active);
    t.setAttribute("aria-pressed", String(active));
  });
}
function showView(name, { history = true } = {}) {
  if (!["articles", "media", "categories", "settings"].includes(name))
    name = "articles";
  $$(".view").forEach((v) =>
    v.classList.toggle("active", v.id === `${name}View`),
  );
  syncNavigation(name);
  if (history && location.hash !== `#${name}`)
    window.history.pushState(null, "", `#${name}`);
  if (name === "settings") void loadSettings();
  if (innerWidth <= 760) setSidebar(false);
}
window.addEventListener("popstate", () =>
  showView(location.hash.slice(1) || "articles", { history: false }),
);
$$("[data-view]").forEach((el) =>
  el.addEventListener("click", (e) => {
    if (el.tagName === "A" && el.getAttribute("href") !== "#") return;
    e.preventDefault();
    if (el.dataset.view === "articles") {
      activeFilter = "all";
      page = 1;
      renderArticles();
    }
    showView(el.dataset.view);
  }),
);
$$("[data-status-view]").forEach((el) =>
  el.addEventListener("click", () => {
    activeFilter = el.dataset.statusView;
    page = 1;
    showView("articles");
    renderArticles();
  }),
);

function syncConditionalFields() {
  $("#scheduleField").hidden = $("#articleStatus").value !== "Scheduled";
  $("#clinicalStatusField").hidden = !$("#articleClinicalRequired").checked;
  if (!$("#articleClinicalRequired").checked)
    $("#articleClinicalStatus").value = "pending";
  const status = $("#articleStatus").value;
  $("#saveDraft").hidden = status === "Draft";
  $("#scheduleTimezone").textContent =
    "Times use your timezone: " +
    (Intl.DateTimeFormat().resolvedOptions().timeZone || "local time");
  $("#saveDraft").textContent =
    state.articles.find((a) => a.id === editingId)?.status === "Published"
      ? "Unpublish to draft"
      : "Save as draft";
  $("#saveArticle").textContent = {
    Draft: "Save draft",
    Review: "Send for review",
    Scheduled: "Schedule article",
    Published: "Publish article",
  }[status];
}

function resetEditor() {
  editingId = null;
  editingRevision = "";
  feedback();
  $("#editorForm").reset();
  $("#articleAuthor").value = "TeleDoctorSA Editorial";
  $("#articleStatus").value = "Draft";
  $("#editorEyebrow").textContent = "NEW STORY";
  $("#editorHeading").textContent = "Start with the idea.";
  $("#saveState").textContent = "Not saved";
  $("#articleSlug").value = "";
  $("#articleSlug").dataset.touched = "";
  $("#excerptCount").textContent = "0";
  $("#deleteArticle").hidden = true;
  hydrateCategories();
  hydrateMediaSelect();
  syncConditionalFields();
}

function toLocalDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function openEditor(id) {
  if (saving || document.body.classList.contains("studio-locked")) return;
  resetEditor();
  if (id) {
    const a = state.articles.find((item) => item.id === id);
    if (!a) return;
    editingId = id;
    editingRevision = a.revision || "";
    $("#editorEyebrow").textContent = a.status.toUpperCase();
    $("#editorHeading").textContent = "Shape the story.";
    $("#articleTitle").value = a.title;
    $("#articleExcerpt").value = a.excerpt || "";
    $("#articleBody").value = a.bodyText || "";
    $("#articleStatus").value = a.status;
    $("#articleCategory").value = a.category;
    $("#articleAuthor").value = a.author;
    $("#articleSlug").value = a.slug;
    $("#articleSlug").dataset.touched = "true";
    $("#articleFeatured").checked = Boolean(a.featured);
    $("#articleClinicalRequired").checked = Boolean(a.clinicalReviewRequired);
    $("#articleClinicalStatus").value =
      a.clinicalReviewStatus === "not_required"
        ? "pending"
        : a.clinicalReviewStatus;
    $("#articleScheduledAt").value = toLocalDateTime(a.scheduledAt);
    $("#articleSeoTitle").value = a.seoTitle || "";
    $("#articleSeoDescription").value = a.seoDescription || "";
    $("#excerptCount").textContent = (a.excerpt || "").length;
    $("#saveState").textContent = `Last updated ${prettyDate(a.updatedAt)}`;
    hydrateMediaSelect(a.coverImage?.url || "");
    $("#articleCoverAlt").value = a.coverImage?.alt || "";
    $("#deleteArticle").hidden = false;
    syncConditionalFields();
  }
  updateWritingSummary();
  updateCoverPreview();
  editorBaseline = JSON.stringify(editorData());
  editor.showModal();
}

$$('[data-action="new"]').forEach((button) =>
  button.addEventListener("click", () => openEditor()),
);
$("#closeEditor").addEventListener("click", closeEditor);
editor.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeEditor();
});
$("#editorForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveStory();
});
$("#editorForm").addEventListener("input", rememberEditor);
$("#editorForm").addEventListener("change", rememberEditor);
window.addEventListener("beforeunload", (event) => {
  if (isDirty()) {
    rememberEditor();
    event.preventDefault();
    event.returnValue = "";
  }
});
$("#articleTitle").addEventListener("input", (e) => {
  if (!$("#articleSlug").dataset.touched)
    $("#articleSlug").value = slugify(e.target.value);
  rememberEditor();
});
$("#articleSlug").addEventListener("input", (e) => {
  e.target.dataset.touched = "true";
  e.target.value = slugify(e.target.value);
});
$("#articleExcerpt").addEventListener(
  "input",
  (e) => ($("#excerptCount").textContent = e.target.value.length),
);
$("#articleStatus").addEventListener("change", syncConditionalFields);
$("#articleClinicalRequired").addEventListener("change", syncConditionalFields);
function updateWritingSummary() {
  const text = $("#articleBody").value.trim(),
    words = text ? text.split(/\s+/).length : 0;
  $("#wordCount").textContent =
    `${words} words · ${Math.max(1, Math.ceil(words / 200))} min read`;
}
function updateCoverPreview() {
  const img = $("#editorCoverPreview"),
    url = $("#articleCoverImage").value;
  img.hidden = !url;
  if (url) img.src = url;
  else img.removeAttribute("src");
  img.alt = $("#articleCoverAlt").value || "Selected cover image";
}
$("#articleBody").addEventListener("input", updateWritingSummary);
$("#articleCoverAlt").addEventListener("input", updateCoverPreview);
$("#articleCoverImage").addEventListener("change", (e) => {
  const option = e.target.selectedOptions[0];
  if (option?.dataset.alt && !$("#articleCoverAlt").value.trim())
    $("#articleCoverAlt").value = option.dataset.alt;
  updateCoverPreview();
  rememberEditor();
});

function editorData() {
  const media = state.media.find(
    (m) => m.url === $("#articleCoverImage").value,
  );
  return {
    revision: editingRevision,
    title: $("#articleTitle").value.trim(),
    excerpt: $("#articleExcerpt").value.trim(),
    bodyText: $("#articleBody").value.trim(),
    status: $("#articleStatus").value,
    category: $("#articleCategory").value,
    author: $("#articleAuthor").value.trim() || "TeleDoctorSA Editorial",
    slug: slugify($("#articleSlug").value || $("#articleTitle").value),
    featured: $("#articleFeatured").checked,
    clinicalReviewRequired: $("#articleClinicalRequired").checked,
    clinicalReviewStatus: $("#articleClinicalRequired").checked
      ? $("#articleClinicalStatus").value
      : "not_required",
    scheduledAt:
      $("#articleStatus").value === "Scheduled" &&
      $("#articleScheduledAt").value
        ? new Date($("#articleScheduledAt").value).toISOString()
        : "",
    coverImage: {
      assetId:
        media?.id ||
        ($("#articleCoverImage").value
          ? state.articles.find((a) => a.id === editingId)?.coverImage
              ?.assetId || ""
          : ""),
      url: $("#articleCoverImage").value,
      alt: $("#articleCoverAlt").value.trim(),
    },
    seoTitle: $("#articleSeoTitle").value.trim(),
    seoDescription: $("#articleSeoDescription").value.trim(),
  };
}

async function verifyPublishedArticle(article) {
  if (!article?.slug) return null;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const publicArticle = await api.getPublicArticle(article.slug);
      if (
        publicArticle?.id === article.id ||
        publicArticle?.slug === article.slug
      )
        return publicArticle;
    } catch (error) {
      if (error?.status !== 404) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return null;
}

function validateArticleClient(data) {
  const errors = [];
  if (data.title.length < 5)
    errors.push("Title must be at least 5 characters.");
  if (!data.slug) errors.push("Add a valid URL slug.");
  if (data.status !== "Draft" && !data.category)
    errors.push("Choose a category.");
  if (!data.author) errors.push("Choose or enter an author.");
  if (data.excerpt.length > 220)
    errors.push("Short introduction must be 220 characters or fewer.");
  if (data.seoTitle.length > 60)
    errors.push("SEO title must be 60 characters or fewer.");
  if (data.seoDescription.length > 160)
    errors.push("SEO description must be 160 characters or fewer.");
  if (
    data.status === "Scheduled" &&
    (!data.scheduledAt ||
      !Number.isFinite(Date.parse(data.scheduledAt)) ||
      Date.parse(data.scheduledAt) <= Date.now())
  )
    errors.push("Choose a valid future publication date and time.");

  if (data.status === "Published" || data.status === "Scheduled") {
    if (data.excerpt.length < 20)
      errors.push(
        "Published stories need a short introduction of at least 20 characters.",
      );
    if (data.bodyText.length < 80)
      errors.push(
        "Published stories need a complete article body of at least 80 characters.",
      );
    if (!data.coverImage.url && !data.coverImage.assetId)
      errors.push("Published stories require a cover image.");
    if (!data.coverImage.alt)
      errors.push("Published cover images require alternative text.");
    if (data.clinicalReviewRequired && data.clinicalReviewStatus !== "approved")
      errors.push("Clinical content must be approved before publication.");
  }

  return errors.join(" ");
}

async function saveStory(forcedStatus) {
  if (saving) return;
  const data = editorData();
  if (forcedStatus) data.status = forcedStatus;
  const error = validateArticleClient(data);
  if (error) {
    feedback(error);
    return;
  }
  const previous = state.articles.find((a) => a.id === editingId);
  if (
    previous?.status === "Published" &&
    data.status !== "Published" &&
    !confirm(
      "Remove this article from the public blog and save it as " +
        data.status.toLowerCase() +
        "?",
    )
  )
    return;
  if (
    data.status === "Published" &&
    !confirm(
      previous?.status === "Published"
        ? "Apply these changes to the published article?"
        : "Publish this article for readers now?",
    )
  )
    return;
  const epoch = workspaceEpoch;
  saving = true;
  feedback();
  const controls = $$(
    "#editorForm input, #editorForm textarea, #editorForm select, #editorForm button",
  );
  const disabled = controls.map((el) => el.disabled);
  controls.forEach((el) => (el.disabled = true));
  $("#saveState").textContent = "Saving…";
  try {
    const saved = editingId
      ? await api.updateArticle(editingId, data)
      : await api.createArticle(data);
    if (epoch !== workspaceEpoch) return;
    if (!saved?.id)
      throw new Error(
        "The service did not confirm the saved article. Refresh the list before retrying.",
      );
    editingId = saved.id;
    editingRevision = saved.revision || "";
    const index = state.articles.findIndex((a) => a.id === saved.id);
    if (index >= 0) state.articles[index] = saved;
    else state.articles.unshift(saved);
    clearRecovery();
    editor.close();
    // Always reveal the acknowledged save, even when the old list was filtered.
    activeFilter = saved.status;
    showView("articles");
    page = 1;
    search.value = "";
    globalSearch.value = "";
    categoryFilter.value = "all";
    sortFilter.value = "newest";
    syncNavigation("articles");
    render();
    if (saved.status === "Published") {
      notify(
        "Article published",
        "Your article is available in the published preview." +
          deliveryMessage(saved.delivery),
        {
          href: `/blog/${encodeURIComponent(saved.slug)}/`,
          label: "View published preview ↗",
        },
      );
      try {
        if (!(await verifyPublishedArticle(saved)))
          notify(
            "Article saved",
            "The public preview has not refreshed yet. Your article is saved; refresh the preview shortly.",
          );
      } catch {
        notify(
          "Article saved",
          "Public preview verification failed. Your saved article is available in Published.",
        );
      }
    } else
      notify(
        saved.status === "Draft"
          ? "Draft saved"
          : saved.status === "Review"
            ? "Sent for review"
            : "Article scheduled",
        saved.status === "Scheduled"
          ? "Publication requires the CMS service to remain running."
          : "Your article is visible in the selected list." +
              deliveryMessage(saved.delivery),
      );
  } catch (err) {
    if (epoch === workspaceEpoch) {
      feedback(errorMessage(err));
      rememberEditor();
    }
  } finally {
    saving = false;
    controls.forEach((el, i) => (el.disabled = disabled[i]));
    syncConditionalFields();
  }
}
$("#saveArticle").addEventListener("click", () => saveStory());
$("#saveDraft").addEventListener("click", () => saveStory("Draft"));

$("#deleteArticle").addEventListener("click", async () => {
  if (saving || !editingId) return;
  const article = state.articles.find((item) => item.id === editingId);
  if (!article) return;
  if (
    !confirm(
      `Delete “${article.title}”? This removes it from the content backend and, if published, from the public feed.`,
    )
  )
    return;
  saving = true;
  const button = $("#deleteArticle");
  button.disabled = true;
  button.textContent = "Deleting…";
  try {
    const result = await api.deleteArticle(editingId);
    state.articles = state.articles.filter((item) => item.id !== editingId);
    editingId = null;
    clearRecovery();
    editor.close();
    render();
    notify(
      "Article deleted",
      "The article was removed from the content service." +
        deliveryMessage(result.delivery),
    );
  } catch (error) {
    notify("Article not deleted", errorMessage(error));
  } finally {
    saving = false;
    button.disabled = false;
    button.textContent = "Delete article";
  }
});

function openPreview() {
  const data = editorData();
  $("#previewCover").hidden = !data.coverImage.url;
  $("#previewCover").src = data.coverImage.url || "";
  $("#previewCover").alt = data.coverImage.alt;
  $("#previewTitle").textContent = data.title || "Untitled story";
  $("#previewExcerpt").textContent = data.excerpt || "No introduction yet.";
  $("#previewCategory").textContent = data.category || "Uncategorised";
  $("#previewMeta").textContent = `${data.author} · ${data.status} preview`;
  $("#previewBody").innerHTML = (
    data.bodyText || "Start writing to see the article preview."
  )
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  preview.showModal();
}
$("#previewBtn").addEventListener("click", openPreview);
$("#closePreview").addEventListener("click", () => preview.close());

const resetPage = () => {
  page = 1;
  syncNavigation("articles");
  renderArticles();
};
search.addEventListener("input", () => {
  globalSearch.value = search.value;
  resetPage();
});
categoryFilter.addEventListener("change", resetPage);
sortFilter.addEventListener("change", resetPage);
globalSearch.addEventListener("input", () => {
  showView("articles");
  search.value = globalSearch.value;
  resetPage();
});
$$(".tabs button").forEach((tab) =>
  tab.addEventListener("click", () => {
    $$(".tabs button").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeFilter = tab.dataset.filter;
    resetPage();
  }),
);
$("#mediaSearch").addEventListener("input", renderMedia);
$("#refreshBtn").addEventListener("click", () => loadWorkspace());

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password) {
    showLogin("Enter your email address and password.");
    return;
  }
  loginSubmit.disabled = true;
  loginSubmit.textContent = "Signing in…";
  loginFeedback.hidden = true;
  try {
    const user = await api.login(email, password);
    state.currentUser = user;
    currentUserEl.textContent = user?.name || user?.email || "Staff";
    currentUserEl.hidden = false;
    loginPassword.value = "";
    const ok = await loadWorkspace({ quiet: true, authRetry: false });
    if (ok) restoreWorkspace();
  } catch (error) {
    showLogin(errorMessage(error));
    loginPassword.select();
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = "Open Publishing Studio";
  }
});
async function signOut() {
  if (saving || loadingWorkspace) return;
  if (isDirty() && !confirm("Discard your unsaved writing and sign out?"))
    return;
  signOutBtn.disabled = true;
  sidebarSignOutBtn.disabled = true;
  try {
    await api.logout();
    workspaceEpoch++;
    $$("dialog[open]").forEach((d) => d.close());
    clearRecovery();
    try {
      sessionStorage.removeItem("tdsaCmsList");
    } catch {}
    api.setAccessToken("");
    currentUserEl.hidden = true;
    sidebarCurrentUserEl.textContent = "TeleDoctorSA staff";
    state = {
      articles: [],
      categories: [],
      media: [],
      health: null,
      currentUser: null,
      users: [],
    };
    $("#passwordForm").reset();
    $("#staffForm").reset();
    $("#temporaryPassword").textContent = "";
    $("#temporaryPasswordBox").hidden = true;
    activeFilter = "all";
    page = 1;
    search.value = "";
    globalSearch.value = "";
    render();
    showView("articles");
    setSidebar(false);
    showLogin("You have signed out.");
  } catch (error) {
    notify(
      "Could not sign out",
      errorMessage(error) + " Try again to end your session.",
    );
  } finally {
    signOutBtn.disabled = false;
    sidebarSignOutBtn.disabled = false;
  }
}
signOutBtn.addEventListener("click", signOut);
sidebarSignOutBtn?.addEventListener("click", signOut);

$("#previousPage").addEventListener("click", () => {
  page--;
  renderArticles();
});
$("#nextPage").addEventListener("click", () => {
  page++;
  renderArticles();
});
$("#clearFilters").addEventListener("click", () => {
  search.value = "";
  globalSearch.value = "";
  categoryFilter.value = "all";
  activeFilter = "all";
  $$(".tabs button").forEach((t) =>
    t.classList.toggle("active", t.dataset.filter === "all"),
  );
  resetPage();
});
$("#togglePassword").addEventListener("click", (event) => {
  const show = loginPassword.type === "password";
  loginPassword.type = show ? "text" : "password";
  event.currentTarget.textContent = show ? "Hide" : "Show";
  event.currentTarget.setAttribute(
    "aria-label",
    show ? "Hide password" : "Show password",
  );
  event.currentTarget.setAttribute("aria-pressed", String(show));
});
$("#uploadMediaBtn").addEventListener("click", () =>
  $("#mediaFileInput").click(),
);
$("#editorUpload").addEventListener("click", () =>
  $("#editorFileInput").click(),
);
let pendingUpload = null,
  uploading = false,
  categoryInEditor = false,
  addingCategory = false;
const uploadDialog = $("#uploadDialog"),
  categoryDialog = $("#categoryDialog");
function clearUpload() {
  if (pendingUpload?.url) URL.revokeObjectURL(pendingUpload.url);
  pendingUpload = null;
  $("#uploadPreview").removeAttribute("src");
}
function selectUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const inEditor = event.target.id === "editorFileInput";
  event.target.value = "";
  const report = (message) =>
    inEditor ? feedback(message) : notify("Media upload", message);
  if (
    !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)
  ) {
    report("Choose a PNG, JPEG, WebP or GIF image.");
    return;
  }
  if (file.size > 6 * 1024 * 1024) {
    report("Use an image smaller than 6 MB.");
    return;
  }
  clearUpload();
  pendingUpload = { file, inEditor, url: URL.createObjectURL(file) };
  $("#uploadForm").reset();
  $("#uploadFeedback").hidden = true;
  $("#uploadPreview").src = pendingUpload.url;
  $("#uploadFileName").textContent =
    `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  uploadDialog.showModal();
}
$("#mediaFileInput").addEventListener("change", selectUpload);
$("#editorFileInput").addEventListener("change", selectUpload);
$("#cancelUpload").addEventListener("click", () => {
  if (!uploading) uploadDialog.close();
});
uploadDialog.addEventListener("cancel", (e) => {
  if (uploading) e.preventDefault();
});
uploadDialog.addEventListener("close", clearUpload);
$("#uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (uploading || !pendingUpload) return;
  const alt = $("#uploadAlt").value.trim();
  if (alt.length < 3) return;
  const form = event.currentTarget,
    button = form.querySelector('[type="submit"]'),
    pending = pendingUpload,
    epoch = workspaceEpoch;
  uploading = true;
  button.disabled = true;
  button.textContent = "Uploading…";
  $("#cancelUpload").disabled = true;
  $("#uploadFeedback").hidden = true;
  try {
    const media = await api.uploadMedia(pending.file, { alt, tag: "Uploaded" });
    if (epoch !== workspaceEpoch) return;
    state.media.unshift(media);
    renderMedia();
    if (pending.inEditor) {
      hydrateMediaSelect(media.url);
      $("#articleCoverAlt").value = media.alt;
      updateCoverPreview();
      feedback();
      rememberEditor();
    }
    uploadDialog.close();
    notify("Image uploaded", "Your image is available in the media library.");
  } catch (error) {
    if (epoch === workspaceEpoch) {
      $("#uploadFeedback").textContent = errorMessage(error);
      $("#uploadFeedback").hidden = false;
    }
  } finally {
    uploading = false;
    button.disabled = false;
    button.textContent = "Upload image";
    $("#cancelUpload").disabled = false;
  }
});
function addCategory(inEditor = false) {
  categoryInEditor = inEditor;
  $("#categoryForm").reset();
  $("#categoryFeedback").hidden = true;
  categoryDialog.showModal();
}
$("#cancelCategory").addEventListener("click", () => {
  if (!addingCategory) categoryDialog.close();
});
categoryDialog.addEventListener("cancel", (e) => {
  if (addingCategory) e.preventDefault();
});
$("#categoryForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (addingCategory) return;
  const name = $("#categoryName").value.trim();
  if (!name) return;
  const button = event.currentTarget.querySelector('[type="submit"]'),
    epoch = workspaceEpoch;
  addingCategory = true;
  button.disabled = true;
  button.textContent = "Adding…";
  $("#cancelCategory").disabled = true;
  $("#categoryFeedback").hidden = true;
  try {
    const category = await api.createCategory(name);
    if (epoch !== workspaceEpoch) return;
    if (!state.categories.some((c) => c.id === category.id))
      state.categories.push(category);
    state.categories.sort((a, b) => a.name.localeCompare(b.name));
    render();
    if (categoryInEditor) {
      $("#articleCategory").value = category.name;
      feedback();
      rememberEditor();
    }
    categoryDialog.close();
    notify("Category added", `${category.name} is ready to use.`);
  } catch (error) {
    if (epoch === workspaceEpoch) {
      $("#categoryFeedback").textContent = errorMessage(error);
      $("#categoryFeedback").hidden = false;
    }
  } finally {
    addingCategory = false;
    button.disabled = false;
    button.textContent = "Add category";
    $("#cancelCategory").disabled = false;
  }
});
$("#addCategory").addEventListener("click", () => addCategory());
$("#editorAddCategory").addEventListener("click", () => addCategory(true));

$("#passwordForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const current = $("#currentPassword").value,
    newPassword = $("#newPassword").value,
    confirmPassword = $("#confirmPassword").value,
    box = $("#passwordFeedback");
  box.hidden = true;
  if (newPassword !== confirmPassword) {
    box.textContent = "The new passwords do not match.";
    box.hidden = false;
    return;
  }
  if (newPassword.length < 10) {
    box.textContent = "Use a password of at least 10 characters.";
    box.hidden = false;
    return;
  }
  const form = event.currentTarget,
    button = form.querySelector('button[type="submit"]'),
    epoch = workspaceEpoch;
  if (button.disabled) return;
  button.disabled = true;
  button.textContent = "Changing…";
  try {
    await api.changePassword(current, newPassword);
    if (epoch !== workspaceEpoch) return;
    form.reset();
    workspaceEpoch++;
    state = {
      articles: [],
      categories: [],
      media: [],
      health: null,
      currentUser: null,
      users: [],
    };
    currentUserEl.hidden = true;
    $("#temporaryPassword").textContent = "";
    $("#temporaryPasswordBox").hidden = true;
    render();
    showLogin("Password changed. Sign in again with your new password.");
  } catch (error) {
    if (epoch === workspaceEpoch) {
      box.textContent = errorMessage(error);
      box.hidden = false;
    }
  } finally {
    button.disabled = false;
    button.textContent = "Change password";
  }
});

$("#staffForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget,
    button = form.querySelector('button[type="submit"]'),
    epoch = workspaceEpoch;
  if (button.disabled) return;
  button.disabled = true;
  button.textContent = "Creating…";
  try {
    const result = await api.createUser({
      name: $("#staffName").value.trim(),
      email: $("#staffEmail").value.trim(),
      role: $("#staffRole").value,
    });
    if (epoch !== workspaceEpoch) return;
    form.reset();
    const box = $("#temporaryPasswordBox");
    $("#temporaryPassword").textContent =
      result.temporaryPassword || "Password supplied separately";
    box.hidden = false;
    state.users.push(result.user);
    renderStaffList();
    notify(
      "Staff account created",
      `${result.user.name} can now use the Publishing Studio.`,
    );
  } catch (error) {
    notify("Account not created", errorMessage(error));
  } finally {
    button.disabled = false;
    button.textContent = "Create account";
  }
});

$("#copyTemporaryPassword").addEventListener("click", async (event) => {
  const value = $("#temporaryPassword").textContent,
    button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(value);
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = "Copy password"), 1600);
  } catch {
    notify(
      "Could not copy",
      "Select the temporary password and copy it manually.",
    );
  }
});

const sidebar = $("#sidebar");
$("#menuBtn").addEventListener("click", () =>
  setSidebar(!sidebar.classList.contains("open")),
);
document.addEventListener("click", (event) => {
  if (
    innerWidth <= 760 &&
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !event.target.closest("#menuBtn")
  )
    setSidebar(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("open")) {
    setSidebar(false);
    $("#menuBtn").focus();
  }
});
window.addEventListener("resize", () => {
  if (innerWidth > 760) setSidebar(false);
});

let initialList = storedJson("tdsaCmsList");
async function startWorkspace() {
  const loaded = await loadWorkspace();
  if (loaded) restoreWorkspace();
}
function restoreWorkspace() {
  const savedList = initialList;
  initialList = null;
  if (savedList) {
    page = savedList.page || 1;
    activeFilter = [
      "all",
      "Draft",
      "Review",
      "Published",
      "Scheduled",
    ].includes(savedList.activeFilter)
      ? savedList.activeFilter
      : "all";
    search.value = savedList.query || "";
    globalSearch.value = search.value;
    categoryFilter.value = state.categories.some(
      (c) => c.name === savedList.category,
    )
      ? savedList.category
      : "all";
    sortFilter.value = ["newest", "oldest", "az"].includes(savedList.sort)
      ? savedList.sort
      : "newest";
    renderArticles();
  }
  showView(location.hash.slice(1) || "articles", { history: false });
  const recovery = storedJson(recoveryKey);
  if (!recovery?.data) return;
  if (recovery.userId && recovery.userId !== state.currentUser?.id) {
    clearRecovery();
    return;
  }
  if (!confirm("Restore the unsaved article from this tab?")) {
    clearRecovery();
    return;
  }
  const data = recovery.data;
  openEditor(
    recovery.id && state.articles.some((a) => a.id === recovery.id)
      ? recovery.id
      : undefined,
  );
  editingRevision = editingId ? recovery.revision || "" : "";
  const fields = {
    Title: "title",
    Excerpt: "excerpt",
    Body: "bodyText",
    Status: "status",
    Category: "category",
    Author: "author",
    Slug: "slug",
    SeoTitle: "seoTitle",
    SeoDescription: "seoDescription",
    ClinicalStatus: "clinicalReviewStatus",
  };
  for (const [suffix, key] of Object.entries(fields))
    $("#article" + suffix).value = data[key] || "";
  $("#articleFeatured").checked = data.featured;
  $("#articleClinicalRequired").checked = data.clinicalReviewRequired;
  $("#articleScheduledAt").value = toLocalDateTime(data.scheduledAt);
  hydrateMediaSelect(data.coverImage?.url);
  $("#articleCoverAlt").value = data.coverImage?.alt || "";
  $("#articleSlug").dataset.touched = "true";
  $("#excerptCount").textContent = (data.excerpt || "").length;
  syncConditionalFields();
  updateWritingSummary();
  updateCoverPreview();
  rememberEditor();
}
startWorkspace();
