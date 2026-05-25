/* ============================================================
   ExChatBot — chat logic (vanilla JS, no dependencies)
   Uses puter.js for free AI model access.
   ============================================================ */

(function () {
  "use strict";

  // ---- Available models (via puter.js) ----
  const MODELS = [
    { id: "gpt-4o-mini",         name: "GPT-4o Mini  (fast)" },
    { id: "gpt-4o",              name: "GPT-4o" },
    { id: "gpt-4.1-nano",        name: "GPT-4.1 Nano" },
    { id: "gpt-4.1-mini",        name: "GPT-4.1 Mini" },
    { id: "gpt-4.1",             name: "GPT-4.1" },
    { id: "o3-mini",             name: "o3-mini  (reasoning)" },
    { id: "o1-mini",             name: "o1-mini  (reasoning)" },
    { id: "claude-sonnet-4",     name: "Claude Sonnet 4" },
    { id: "claude-3-7-sonnet",   name: "Claude 3.7 Sonnet" },
    { id: "claude-3-5-sonnet",   name: "Claude 3.5 Sonnet" },
    { id: "deepseek-chat",       name: "DeepSeek Chat" },
    { id: "deepseek-reasoner",   name: "DeepSeek Reasoner" },
    { id: "google/gemini-2.0-flash-lite-001", name: "Gemini 2.0 Flash Lite" },
    { id: "google/gemini-2.0-flash-001",      name: "Gemini 2.0 Flash" },
    { id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",  name: "Llama 3.1 8B" },
    { id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", name: "Llama 3.1 70B" },
    { id: "mistral-large-latest", name: "Mistral Large" },
  ];

  const DEFAULT_MODEL = "gpt-4o-mini";

  const CODE_SYSTEM_PROMPT =
    "You are ExChatBot Coding Assistant. Help with clean, working, " +
    "beginner-friendly code. Explain errors clearly and provide complete " +
    "fixed code when needed. Use fenced code blocks with the correct language tag.";

  const FRIENDLY_ERROR =
    "Something went wrong. Please try another model or try again.";

  // ---- LocalStorage keys ----
  const LS = {
    theme: "excb.theme",
    font:  "excb.font",
    model: "excb.model",
    code:  "excb.code",
  };

  // ---- DOM refs ----
  const $ = (id) => document.getElementById(id);
  const chatEl       = $("chat");
  const inputEl      = $("input");
  const formEl       = $("composer");
  const sendBtn      = $("sendBtn");
  const modelSelect  = $("modelSelect");
  const modelSelect2 = $("modelSelect2");
  const codeToggle   = $("codeToggle");
  const settingsBtn  = $("settingsBtn");
  const settingsModal= $("settingsModal");
  const themeSelect  = $("themeSelect");
  const clearChatBtn = $("clearChatBtn");
  const copyGcashBtn = $("copyGcashBtn");
  const toastEl      = $("toast");
  const segBtns      = document.querySelectorAll(".seg-btn[data-font]");

  // ---- State ----
  const state = {
    messages: [],          // {role: "user"|"assistant", content: string}
    sending: false,
    model: localStorage.getItem(LS.model) || DEFAULT_MODEL,
    codeMode: localStorage.getItem(LS.code) === "1",
    theme: localStorage.getItem(LS.theme) || "dark",
    font:  localStorage.getItem(LS.font)  || "medium",
  };

  // ---- Init ----
  function init() {
    applyTheme(state.theme);
    applyFont(state.font);

    populateModels(modelSelect);
    populateModels(modelSelect2);
    setModel(state.model, false);

    codeToggle.checked = state.codeMode;
    themeSelect.value  = state.theme;

    bindEvents();
    autoGrow();
  }

  // ---- Models ----
  function populateModels(selectEl) {
    selectEl.innerHTML = "";
    for (const m of MODELS) {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.name;
      selectEl.appendChild(opt);
    }
  }

  function setModel(id, persist) {
    if (!MODELS.some((m) => m.id === id)) id = DEFAULT_MODEL;
    state.model = id;
    if (modelSelect.value !== id) modelSelect.value = id;
    if (modelSelect2.value !== id) modelSelect2.value = id;
    if (persist !== false) localStorage.setItem(LS.model, id);
  }

  // ---- Theme & Font ----
  function applyTheme(theme) {
    state.theme = theme === "light" ? "light" : "dark";
    document.body.setAttribute("data-theme", state.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", state.theme === "dark" ? "#050d08" : "#f4fff8");
    localStorage.setItem(LS.theme, state.theme);
  }

  function applyFont(font) {
    if (!["small", "medium", "large"].includes(font)) font = "medium";
    state.font = font;
    document.body.setAttribute("data-font", font);
    segBtns.forEach((btn) => {
      btn.setAttribute("aria-checked", btn.dataset.font === font ? "true" : "false");
    });
    localStorage.setItem(LS.font, font);
  }

  // ---- Events ----
  function bindEvents() {
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      sendMessage();
    });

    inputEl.addEventListener("input", autoGrow);
    inputEl.addEventListener("keydown", (e) => {
      // Send on Enter (desktop), allow newline with Shift+Enter or on touch devices
      if (e.key === "Enter" && !e.shiftKey && !isTouchDevice()) {
        e.preventDefault();
        sendMessage();
      }
    });

    modelSelect.addEventListener("change", () => setModel(modelSelect.value));
    modelSelect2.addEventListener("change", () => setModel(modelSelect2.value));

    codeToggle.addEventListener("change", () => {
      state.codeMode = codeToggle.checked;
      localStorage.setItem(LS.code, state.codeMode ? "1" : "0");
    });

    settingsBtn.addEventListener("click", () => openModal(true));
    settingsModal.addEventListener("click", (e) => {
      if (e.target.matches("[data-close]")) openModal(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !settingsModal.hidden) openModal(false);
    });

    themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));

    segBtns.forEach((btn) => {
      btn.addEventListener("click", () => applyFont(btn.dataset.font));
    });

    clearChatBtn.addEventListener("click", () => {
      clearChat();
      openModal(false);
      showToast("Chat cleared");
    });

    copyGcashBtn.addEventListener("click", async () => {
      const ok = await copyText(document.getElementById("gcashNumber").textContent.trim());
      showToast(ok ? "GCash number copied" : "Copy failed");
    });

    // Delegate copy buttons inside chat
    chatEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".btn-copy");
      if (!btn) return;
      const text = btn.dataset.text || "";
      const ok = await copyText(text);
      btn.textContent = ok ? "Copied" : "Copy";
      setTimeout(() => (btn.textContent = "Copy"), 1400);
    });
  }

  // ---- Chat ----
  async function sendMessage() {
    if (state.sending) return;
    const text = inputEl.value.trim();
    if (!text) return;

    if (typeof window.puter === "undefined" || !window.puter.ai || !window.puter.ai.chat) {
      addMessage("error", "puter.js failed to load. Please check your internet connection and refresh.");
      return;
    }

    // Hide welcome card on first message
    const welcome = chatEl.querySelector(".welcome");
    if (welcome) welcome.remove();

    addMessage("user", text);
    state.messages.push({ role: "user", content: text });

    inputEl.value = "";
    autoGrow();
    setSending(true);

    const loaderEl = addLoader();

    try {
      const conversation = state.codeMode
        ? [{ role: "system", content: CODE_SYSTEM_PROMPT }, ...state.messages]
        : state.messages.slice();

      const response = await window.puter.ai.chat(conversation, { model: state.model });
      const reply = extractReply(response);

      loaderEl.remove();

      if (!reply) {
        addMessage("error", FRIENDLY_ERROR);
      } else {
        state.messages.push({ role: "assistant", content: reply });
        addMessage("ai", reply);
      }
    } catch (err) {
      loaderEl.remove();
      console.error("ExChatBot error:", err);
      const detail = (err && (err.message || err.error || err.toString())) || "";
      addMessage(
        "error",
        FRIENDLY_ERROR + (detail ? "\n\n[" + String(detail).slice(0, 200) + "]" : "")
      );
    } finally {
      setSending(false);
      inputEl.focus();
    }
  }

  function extractReply(response) {
    if (response == null) return "";
    if (typeof response === "string") return response.trim();

    // Common puter.js shapes
    if (response.message && typeof response.message.content === "string") {
      return response.message.content.trim();
    }
    if (Array.isArray(response.message?.content)) {
      // Some models return content as array of {type, text}
      return response.message.content
        .map((c) => (typeof c === "string" ? c : c.text || ""))
        .join("")
        .trim();
    }
    if (typeof response.text === "string") return response.text.trim();
    if (typeof response.content === "string") return response.content.trim();
    if (response.choices && response.choices[0]) {
      const c = response.choices[0];
      if (c.message && typeof c.message.content === "string") return c.message.content.trim();
      if (typeof c.text === "string") return c.text.trim();
    }
    try {
      const s = response.toString();
      if (s && s !== "[object Object]") return s.trim();
    } catch (_) {}
    return "";
  }

  function setSending(isSending) {
    state.sending = isSending;
    sendBtn.disabled = isSending;
    inputEl.disabled = isSending;
    sendBtn.style.opacity = isSending ? "0.5" : "";
  }

  // ---- Rendering ----
  function addMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (role === "user" ? "msg-user" : role === "error" ? "msg-error" : "msg-ai");

    const roleEl = document.createElement("div");
    roleEl.className = "msg-role";
    roleEl.textContent = role === "user" ? "You" : role === "error" ? "Error" : "ExChatBot";
    wrap.appendChild(roleEl);

    const body = document.createElement("div");
    body.className = "msg-content";
    body.innerHTML = formatContent(text);
    wrap.appendChild(body);

    if (role === "ai") {
      const actions = document.createElement("div");
      actions.className = "msg-actions";
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn-mini btn-copy";
      copyBtn.textContent = "Copy";
      copyBtn.dataset.text = text;
      actions.appendChild(copyBtn);
      wrap.appendChild(actions);
    }

    chatEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function addLoader() {
    const wrap = document.createElement("div");
    wrap.className = "msg msg-ai loading";
    wrap.innerHTML =
      '<div class="msg-role">ExChatBot</div>' +
      '<div class="msg-content"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    chatEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function clearChat() {
    state.messages = [];
    chatEl.innerHTML = "";
    // Re-add a fresh welcome card
    const welcome = document.createElement("div");
    welcome.className = "welcome";
    welcome.innerHTML =
      '<div class="welcome-card">' +
      '<div class="welcome-title">Welcome to ExChatBot</div>' +
      '<p class="welcome-text">A lightweight AI assistant powered by puter.js. Pick a model below, toggle <strong>Code Assistant</strong> for programming help, and start chatting.</p>' +
      '<div class="welcome-tips">' +
      '<span class="tip">// Ask anything</span>' +
      '<span class="tip">// Generate code</span>' +
      '<span class="tip">// Debug errors</span>' +
      '<span class="tip">// Explain concepts</span>' +
      "</div></div>";
    chatEl.appendChild(welcome);
  }

  // ---- Content formatter (lightweight markdown-ish) ----
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatContent(text) {
    // Split text into segments: code blocks vs regular text.
    const result = [];
    const re = /```(\w*)\n?([\s\S]*?)```/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) {
        result.push({ type: "text", value: text.slice(last, m.index) });
      }
      result.push({ type: "code", lang: m[1] || "", value: m[2] });
      last = re.lastIndex;
    }
    if (last < text.length) result.push({ type: "text", value: text.slice(last) });

    return result
      .map((seg) => {
        if (seg.type === "code") {
          return `<pre><code>${escapeHtml(seg.value)}</code></pre>`;
        }
        // inline code: `...`
        return escapeHtml(seg.value).replace(
          /`([^`\n]+)`/g,
          (_, c) => `<code class="inline">${c}</code>`
        );
      })
      .join("");
  }

  // ---- Helpers ----
  function scrollToBottom() {
    // requestAnimationFrame ensures layout is updated first
    requestAnimationFrame(() => {
      chatEl.scrollTop = chatEl.scrollHeight;
    });
  }

  function autoGrow() {
    inputEl.style.height = "auto";
    const next = Math.min(inputEl.scrollHeight, 140);
    inputEl.style.height = next + "px";
  }

  function isTouchDevice() {
    return ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  }

  function openModal(open) {
    if (open) {
      settingsModal.hidden = false;
      settingsModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } else {
      settingsModal.hidden = true;
      settingsModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) { /* fall through */ }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  let toastTimer = null;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1800);
  }

  // ---- Boot ----
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
