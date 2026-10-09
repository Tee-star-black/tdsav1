(function () {
  function baseUrl() {
    if (window.TDSA_CMS_API_BASE)
      return window.TDSA_CMS_API_BASE.replace(/\/$/, "");
    return "/api";
  }

  function storedToken() {
    try {
      return sessionStorage.getItem("tdsaCmsAccessToken") || "";
    } catch {
      return "";
    }
  }

  function setAccessToken(token) {
    const clean = String(token || "").trim();
    try {
      if (clean) sessionStorage.setItem("tdsaCmsAccessToken", clean);
      else sessionStorage.removeItem("tdsaCmsAccessToken");
    } catch {}
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const token = storedToken();
      const response = await fetch(`${baseUrl()}${path}`, {
        credentials: "same-origin",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
        signal: options.signal || controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(
          payload.error || `Request failed (${response.status})`,
        );
        error.details = payload.details || [];
        error.status = response.status;
        if (response.status === 401 && !path.startsWith("/auth/"))
          window.dispatchEvent(new CustomEvent("cms:session-expired"));
        throw error;
      }
      return payload;
    } catch (error) {
      if (error?.name === "AbortError")
        throw new Error(
          "The content service took too long to respond. Your writing is still in this tab. Try again.",
        );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  window.TDSACmsApi = {
    health: () => request("/health"),
    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }).then((r) => r.user),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request("/auth/me").then((r) => r.user),
    changePassword: (currentPassword, newPassword) =>
      request("/auth/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    listUsers: () => request("/users").then((r) => r.users),
    createUser: (data) =>
      request("/users", { method: "POST", body: JSON.stringify(data) }),
    deleteUser: (id) =>
      request(`/users/${encodeURIComponent(id)}`, { method: "DELETE" }),
    resetUserPassword: (id) =>
      request(`/users/${encodeURIComponent(id)}/reset-password`, {
        method: "POST",
      }),
    listArticles: () => request("/articles").then((r) => r.articles),
    getArticle: (id) =>
      request(`/articles/${encodeURIComponent(id)}`).then((r) => r.article),
    createArticle: (data) =>
      request("/articles", { method: "POST", body: JSON.stringify(data) }).then(
        (r) => ({ ...r.article, delivery: r.delivery }),
      ),
    updateArticle: (id, data) =>
      request(`/articles/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((r) => ({ ...r.article, delivery: r.delivery })),
    deleteArticle: (id) =>
      request(`/articles/${encodeURIComponent(id)}`, { method: "DELETE" }),
    listCategories: () => request("/categories").then((r) => r.categories),
    createCategory: (name) =>
      request("/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      }).then((r) => r.category),
    deleteCategory: (id) =>
      request(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" }),
    listMedia: () => request("/media").then((r) => r.media),
    uploadMedia: async (file, { alt = "", tag = "Uploaded" } = {}) =>
      request("/media", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          alt,
          tag,
          dataUrl: await fileToDataUrl(file),
        }),
      }).then((r) => r.media),
    listPublicArticles: () =>
      request("/public/articles").then((r) => r.articles),
    getPublicArticle: (slug) =>
      request(`/public/articles/${encodeURIComponent(slug)}`).then(
        (r) => r.article,
      ),
    baseUrl,
    setAccessToken,
    hasAccessToken: () => Boolean(storedToken()),
  };
})();
