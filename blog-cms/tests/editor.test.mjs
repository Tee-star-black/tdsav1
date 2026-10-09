import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { JSDOM } from "jsdom";
const directory = await mkdtemp(path.join(tmpdir(), "cms-editor-"));
const origin = "http://127.0.0.1:8801";
const child = spawn(process.execPath, ["server/server.mjs"], {
  env: {
    ...process.env,
    PORT: "8801",
    CMS_BACKEND: "local",
    CMS_ACCESS_TOKEN: "",
    CMS_LOCAL_STORE: path.join(directory, "store.json"),
    CMS_DEPLOY_WEBHOOK_URL: "",
  },
  stdio: "pipe",
});
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(predicate) {
  for (let n = 0; n < 100; n++) {
    if (await predicate()) return;
    await pause(30);
  }
  throw new Error("Expected editor state did not arrive");
}
await until(async () => {
  try {
    return (await fetch(origin + "/api/health")).ok;
  } catch {
    return false;
  }
});
const html = await readFile("prototype/index.html", "utf8"),
  api = await readFile("client/cms-api.js", "utf8"),
  studio = await readFile("prototype/studio.js", "utf8");
const windows = [];
async function open(storage = {}) {
  try {
    const dom = new JSDOM(html, {
        url: origin + "/prototype/",
        runScripts: "outside-only",
      }),
      w = dom.window;
    windows.push(w);
    w.fetch = (url, options) => fetch(new URL(url, origin), options);
    w.AbortController = AbortController;
    w.confirm = () => true;
    w.prompt = () => null;
    w.HTMLDialogElement.prototype.showModal = function () {
      this.open = true;
    };
    w.HTMLDialogElement.prototype.close = function () {
      this.open = false;
    };
    for (const [k, v] of Object.entries(storage))
      w.sessionStorage.setItem(k, v);
    try {
      w.eval(api);
      w.eval(studio);
    } catch (error) {
      console.error(error.name, error.message, error.stack);
      throw error;
    }
    await until(() =>
      w.document.querySelector("#backendStatus").classList.contains("online"),
    );
    return {
      w,
      $: (s) => w.document.querySelector(s),
      fill(s, value) {
        const el = w.document.querySelector(s);
        el.value = value;
        el.dispatchEvent(
          new w.Event(el.tagName === "SELECT" ? "change" : "input", {
            bubbles: true,
          }),
        );
      },
    };
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}
test.after(async () => {
  for (const w of windows) w.close();
  child.kill();
  await rm(directory, { recursive: true, force: true });
});
test("editor saves a minimal draft and reveals it despite active filters", async () => {
  const { $, fill } = await open();
  $('[data-filter="Published"]').click();
  fill("#articleSearch", "does not exist");
  $('[data-action="new"]').click();
  fill("#articleTitle", "Editor draft test");
  $("#saveArticle").click();
  await until(() => !$("#editorDialog").open);
  assert.ok($("#articleList").textContent.includes("Editor draft test"));
  assert.equal($(".tabs button.active").dataset.filter, "Draft");
  assert.equal($("#articleSearch").value, "");
  const fresh = await open();
  assert.ok(fresh.$("#articleList").textContent.includes("Editor draft test"));
  const publicRows = await (
    await fetch(origin + "/api/public/articles")
  ).json();
  assert.ok(!publicRows.articles.some((a) => a.title === "Editor draft test"));
});
test("inline validation, review submission, stable slug and return to draft", async () => {
  const { $, fill } = await open();
  $('[data-action="new"]').click();
  $("#saveArticle").click();
  assert.equal($("#editorFeedback").hidden, false);
  assert.ok($("#editorDialog").open);
  fill("#articleTitle", "Editor review test");
  fill("#articleCategory", "Health Education");
  fill("#articleStatus", "Review");
  assert.equal($("#saveArticle").textContent, "Send for review");
  $("#saveArticle").click();
  await until(() => !$("#editorDialog").open);
  assert.equal($(".tabs button.active").dataset.filter, "Review");
  [...$("#articleList").querySelectorAll("[data-edit]")]
    .find((el) => el.textContent.includes("Editor review test"))
    .click();
  const slug = $("#articleSlug").value;
  fill("#articleTitle", "Renamed review article");
  assert.equal($("#articleSlug").value, slug);
  $("#saveDraft").click();
  await until(() => !$("#editorDialog").open);
  assert.equal($(".tabs button.active").dataset.filter, "Draft");
});
test("unsaved close protection, recovery and form submission without reload", async () => {
  const { w, $, fill } = await open();
  $('[data-action="new"]').click();
  fill("#articleTitle", "Recover this writing");
  fill("#articleBody", "Precious unsaved content");
  w.confirm = () => false;
  $("#closeEditor").click();
  assert.ok($("#editorDialog").open);
  const recovery = w.sessionStorage.getItem("tdsaCmsEditorRecovery");
  assert.ok(recovery.includes("Precious unsaved content"));
  const recovered = await open({ tdsaCmsEditorRecovery: recovery });
  await until(() => recovered.$("#editorDialog").open);
  assert.equal(recovered.$("#articleBody").value, "Precious unsaved content");
  const event = new recovered.w.Event("submit", {
    bubbles: true,
    cancelable: true,
  });
  recovered.$("#editorForm").dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  await until(() => !recovered.$("#editorDialog").open);
  assert.equal(
    recovered.w.sessionStorage.getItem("tdsaCmsEditorRecovery"),
    null,
  );
});
test("pagination changes rows and restores the last page", async () => {
  for (let i = 0; i < 12; i++)
    await fetch(origin + "/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `Pagination story ${i}`, status: "Draft" }),
    });
  const { w, $ } = await open();
  assert.equal($("#articleList").children.length, 10);
  assert.equal($("#previousPage").disabled, true);
  $("#nextPage").click();
  assert.ok($("#pageLabel").textContent.includes("Page 2"));
  assert.equal($("#previousPage").disabled, false);
  const restored = await open({
    tdsaCmsList: w.sessionStorage.getItem("tdsaCmsList"),
  });
  await until(() => restored.$("#pageLabel").textContent.includes("Page 2"));
  assert.equal(
    restored.$("#articleList").textContent,
    $("#articleList").textContent,
  );
});
test("editor publishes content, previews the cover and withdraws to draft", async () => {
  const { $, fill } = await open();
  $('[data-action="new"]').click();
  fill("#articleTitle", "Editor publication test");
  fill(
    "#articleExcerpt",
    "A useful introduction for this complete editorial test.",
  );
  fill(
    "#articleBody",
    "This article contains enough text to verify the full editorial publication flow, including cover selection, preview, public visibility and withdrawal.",
  );
  fill("#articleCategory", "Health Education");
  fill("#articleCoverImage", $("#articleCoverImage").options[1].value);
  fill("#articleCoverAlt", "A test cover image");
  $("#previewBtn").click();
  assert.ok($("#previewDialog").open);
  assert.equal($("#previewCover").hidden, false);
  $("#closePreview").click();
  fill("#articleStatus", "Published");
  $("#saveArticle").click();
  await until(() => !$("#editorDialog").open);
  await until(() => $("#saveArticle").disabled === false);
  let rows = (await (await fetch(origin + "/api/public/articles")).json())
    .articles;
  assert.ok(rows.some((a) => a.title === "Editor publication test"));
  [...$("#articleList").querySelectorAll("[data-edit]")]
    .find((el) => el.textContent.includes("Editor publication test"))
    .click();
  $("#saveDraft").click();
  await until(() => !$("#editorDialog").open);
  rows = (await (await fetch(origin + "/api/public/articles")).json()).articles;
  assert.ok(!rows.some((a) => a.title === "Editor publication test"));
});
test("stale-save errors preserve the open editor and its recovery copy", async () => {
  const { $, fill, w } = await open();
  $('[data-action="new"]').click();
  fill("#articleTitle", "Concurrent editor test");
  $("#saveArticle").click();
  await until(() => !$("#editorDialog").open);
  const edit = [...$("#articleList").querySelectorAll("[data-edit]")].find(
    (el) => el.textContent.includes("Concurrent editor test"),
  );
  edit.click();
  const id = edit.dataset.edit;
  const current = (await (await fetch(origin + "/api/articles/" + id)).json())
    .article;
  await fetch(origin + "/api/articles/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...current, title: "Newer remote title" }),
  });
  fill("#articleTitle", "My unsaved title");
  $("#saveArticle").click();
  await until(() => !$("#editorFeedback").hidden);
  assert.ok($("#editorDialog").open);
  assert.equal($("#articleTitle").value, "My unsaved title");
  assert.ok($("#editorFeedback").textContent.includes("changed since"));
  assert.ok(
    w.sessionStorage
      .getItem("tdsaCmsEditorRecovery")
      .includes("My unsaved title"),
  );
});
test("category creation within the editor retains writing and assigns the new category", async () => {
  const { $, fill, w } = await open();
  $('[data-action="new"]').click();
  fill("#articleTitle", "In editor category test");
  fill("#articleBody", "Keep this text while adding a category.");
  $("#editorAddCategory").click();
  assert.ok($("#categoryDialog").open);
  fill("#categoryName", "Editorial test category");
  $("#categoryForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await until(() => $("#articleCategory").value === "Editorial test category");
  assert.equal(
    $("#articleBody").value,
    "Keep this text while adding a category.",
  );
  $("#saveArticle").click();
  await until(() => !$("#editorDialog").open);
  assert.ok($("#articleList").textContent.includes("Editorial test category"));
});

test("staff creation, password copy and password change complete after asynchronous requests", async () => {
  const { w, $, fill } = await open();
  w.TDSACmsApi.me = async () => ({
    id: "admin-test",
    name: "Studio administrator",
    email: "admin@teledoctorsa.co.za",
    role: "admin",
  });
  w.TDSACmsApi.listUsers = async () => [];
  $("#refreshBtn").click();
  await until(() => $("#currentUser").textContent === "Studio administrator");
  $('[data-view="settings"]').click();
  await until(() => !$("#staffAdminPanel").hidden);
  let releaseCreate;
  w.TDSACmsApi.createUser = () =>
    new Promise((resolve) => (releaseCreate = resolve));
  fill("#staffName", "New colleague");
  fill("#staffEmail", "colleague@teledoctorsa.co.za");
  $("#staffForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  releaseCreate({
    user: {
      id: "new-colleague",
      name: "New colleague",
      email: "colleague@teledoctorsa.co.za",
      role: "editor",
    },
    temporaryPassword: "Temporary123!",
  });
  await until(() => !$("#temporaryPasswordBox").hidden);
  assert.equal($("#staffName").value, "");
  assert.ok($("#staffList").textContent.includes("New colleague"));
  let copied = "";
  Object.defineProperty(w.navigator, "clipboard", {
    value: {
      writeText: async (value) => {
        await pause(5);
        copied = value;
      },
    },
  });
  $("#copyTemporaryPassword").click();
  await until(() => $("#copyTemporaryPassword").textContent === "Copied");
  assert.equal(copied, "Temporary123!");
  w.TDSACmsApi.changePassword = async () => {
    await pause(5);
    return { ok: true };
  };
  fill("#currentPassword", "Current123!");
  fill("#newPassword", "Replacement123!");
  fill("#confirmPassword", "Replacement123!");
  $("#passwordForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await until(() => !$("#loginGate").hidden);
  assert.ok($("#loginFeedback").textContent.includes("Password changed"));
  assert.equal($("#currentPassword").value, "");
  assert.equal($("#temporaryPassword").textContent, "");
  assert.equal($("#passwordFeedback").hidden, true);
});

test("sign-out protects unsaved writing, reports service failure and clears the workspace only after success", async () => {
  const { w, $, fill } = await open();
  $('[data-action="new"]').click();
  fill("#articleTitle", "Keep this draft during failed logout");
  w.confirm = () => false;
  $("#signOutBtn").click();
  await pause(10);
  assert.ok($("#editorDialog").open);
  assert.equal($("#loginGate").hidden, true);
  w.confirm = () => true;
  w.TDSACmsApi.logout = async () => {
    throw new Error("Connection interrupted");
  };
  $("#signOutBtn").click();
  await until(() => $("#toastTitle").textContent === "Could not sign out");
  assert.ok($("#editorDialog").open);
  assert.equal($("#loginGate").hidden, true);
  w.TDSACmsApi.logout = async () => ({ ok: true });
  $("#sidebarSignOutBtn").click();
  await until(() => !$("#loginGate").hidden);
  assert.equal($("#editorDialog").open, false);
  assert.equal(w.sessionStorage.getItem("tdsaCmsEditorRecovery"), null);
  assert.equal($("#articleList").textContent, "");
  assert.equal($(".app-shell").inert, true);
});

test("session expiry closes the editor and restores its unsaved writing after sign-in", async () => {
  const { w, $, fill } = await open();
  $('[data-action="new"]').click();
  fill("#articleTitle", "Restore after expired session");
  fill("#articleBody", "Writing that should survive a session expiry.");
  const originalFetch = w.fetch;
  w.fetch = async (url, options) =>
    String(url).includes("/articles")
      ? new Response(JSON.stringify({ error: "CMS sign-in is required." }), {
          status: 401,
        })
      : originalFetch(url, options);
  $("#saveArticle").click();
  await until(() => !$("#loginGate").hidden);
  assert.equal($("#editorDialog").open, false);
  assert.ok(
    w.sessionStorage
      .getItem("tdsaCmsEditorRecovery")
      .includes("Writing that should survive"),
  );
  w.fetch = originalFetch;
  w.TDSACmsApi.login = async () => ({
    id: "development",
    name: "Local Development",
    development: true,
  });
  fill("#loginEmail", "editor@teledoctorsa.co.za");
  fill("#loginPassword", "Testing123!");
  $("#loginForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  await until(() => $("#editorDialog").open);
  assert.equal(
    $("#articleBody").value,
    "Writing that should survive a session expiry.",
  );
  assert.equal($("#loginGate").hidden, true);
});

test("partial refresh gives actionable feedback and navigation keeps filters and history consistent", async () => {
  const { w, $ } = await open();
  const original = w.TDSACmsApi.listMedia;
  w.TDSACmsApi.listMedia = async () => {
    throw new Error("Media unavailable");
  };
  $("#refreshBtn").click();
  await until(() => !$("#workspaceFeedback").hidden);
  assert.ok($("#workspaceFeedback").textContent.includes("media"));
  assert.equal($("#loginGate").hidden, true);
  w.TDSACmsApi.listMedia = original;
  $("#refreshBtn").click();
  await until(() => $("#workspaceFeedback").hidden);
  $('[data-status-view="Review"]').click();
  assert.equal($(".tabs button.active").dataset.filter, "Review");
  assert.equal(
    $('[data-status-view="Review"]').getAttribute("aria-current"),
    "page",
  );
  $('[data-view="media"]').click();
  assert.equal(w.location.hash, "#media");
  assert.ok($("#mediaView").classList.contains("active"));
  $('[data-view="articles"]').click();
  assert.equal($(".tabs button.active").dataset.filter, "all");
  assert.equal(
    $('[data-view="articles"]').getAttribute("aria-current"),
    "page",
  );
});
