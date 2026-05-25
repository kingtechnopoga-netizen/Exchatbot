/* ============================================================
   ExChatBot v2 — vanilla JS, no dependencies
   Features: multi-conversation, streaming, voice/TTS, markdown,
   syntax highlight, regenerate/edit, export, search, PWA.
   Powered by puter.js
   ============================================================ */

(function () {
  "use strict";

  // ---- Models (grouped) ----
  const MODELS = [
    { group: "OpenAI", id: "gpt-5",                                                   name: "GPT-5" },
    { group: "OpenAI", id: "gpt-5-mini",                                              name: "GPT-5 Mini" },
    { group: "OpenAI", id: "gpt-5-nano",                                              name: "GPT-5 Nano (fast)" },
    { group: "OpenAI", id: "gpt-4.1",                                                 name: "GPT-4.1" },
    { group: "OpenAI", id: "gpt-4.1-mini",                                            name: "GPT-4.1 Mini" },
    { group: "OpenAI", id: "gpt-4.1-nano",                                            name: "GPT-4.1 Nano" },
    { group: "OpenAI", id: "gpt-4o",                                                  name: "GPT-4o" },
    { group: "OpenAI", id: "gpt-4o-mini",                                             name: "GPT-4o Mini (default)" },
    { group: "OpenAI", id: "o3",                                                      name: "o3 (reasoning)" },
    { group: "OpenAI", id: "o3-mini",                                                 name: "o3-mini" },
    { group: "OpenAI", id: "o1-mini",                                                 name: "o1-mini" },

    { group: "Anthropic", id: "claude-opus-4-5",                                      name: "Claude Opus 4.5" },
    { group: "Anthropic", id: "claude-sonnet-4-5",                                    name: "Claude Sonnet 4.5" },
    { group: "Anthropic", id: "claude-opus-4",                                        name: "Claude Opus 4" },
    { group: "Anthropic", id: "claude-sonnet-4",                                      name: "Claude Sonnet 4" },
    { group: "Anthropic", id: "claude-3-7-sonnet",                                    name: "Claude 3.7 Sonnet" },
    { group: "Anthropic", id: "claude-3-5-sonnet",                                    name: "Claude 3.5 Sonnet" },
    { group: "Anthropic", id: "claude-3-5-haiku-latest",                              name: "Claude 3.5 Haiku (fast)" },

    { group: "Google",  id: "google/gemini-2.5-pro",                                  name: "Gemini 2.5 Pro" },
    { group: "Google",  id: "google/gemini-2.5-flash",                                name: "Gemini 2.5 Flash" },
    { group: "Google",  id: "google/gemini-2.0-flash-001",                            name: "Gemini 2.0 Flash" },
    { group: "Google",  id: "google/gemini-2.0-flash-lite-001",                       name: "Gemini 2.0 Flash Lite" },

    { group: "DeepSeek", id: "deepseek-chat",                                         name: "DeepSeek V3 Chat" },
    { group: "DeepSeek", id: "deepseek-reasoner",                                     name: "DeepSeek Reasoner" },

    { group: "Meta",   id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",                 name: "Llama 3.3 70B" },
    { group: "Meta",   id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",            name: "Llama 3.1 70B" },
    { group: "Meta",   id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",             name: "Llama 3.1 8B" },

    { group: "Mistral", id: "mistral-large-latest",                                   name: "Mistral Large" },
    { group: "Mistral", id: "codestral-latest",                                       name: "Codestral (code)" },

    { group: "xAI",    id: "x-ai/grok-3-beta",                                        name: "Grok 3" },
    { group: "xAI",    id: "x-ai/grok-3-mini-beta",                                   name: "Grok 3 Mini" },
  ];

  const DEFAULT_MODEL = "gpt-4o-mini";
  const CODE_SYSTEM_PROMPT =
    "You are ExChatBot Coding Assistant. Help with clean, working, " +
    "beginner-friendly code. Explain errors clearly and provide complete " +
    "fixed code when needed. Use fenced code blocks with the correct language tag.";
  const FRIENDLY_ERROR = "Something went wrong. Please try another model or try again.";
  const NEW_CHAT_TITLE = "New chat";

  // ---- Storage keys ----
  const LS = {
    theme:      "excb.theme",
    font:       "excb.font",
    model:      "excb.model",
    code:       "excb.code",
    stream:     "excb.stream",
    autoSpeak:  "excb.autospeak",
    temp:       "excb.temp",
    convs:      "excb.conversations",
    currentId:  "excb.currentId",
  };

  // ---- DOM refs ----
  const $ = (id) => document.getElementById(id);
  const chatEl         = $("chat");
  const inputEl        = $("input");
  const formEl         = $("composer");
  const sendBtn        = $("sendBtn");
  const stopBtn        = $("stopBtn");
  const modelSelect    = $("modelSelect");
  const modelSelect2   = $("modelSelect2");
  const codeToggle     = $("codeToggle");
  const streamToggle   = $("streamToggle");
  const autoSpeakTog   = $("autoSpeakToggle");
  const settingsBtn    = $("settingsBtn");
  const settingsModal  = $("settingsModal");
  const shortcutsModal = $("shortcutsModal");
  const editModal      = $("editModal");
  const editTextarea   = $("editTextarea");
  const editCancelBtn  = $("editCancelBtn");
  const editSaveBtn    = $("editSaveBtn");
  const themeSelect    = $("themeSelect");
  const tempRange      = $("tempRange");
  const tempValue      = $("tempValue");
  const clearChatBtn   = $("clearChatBtn");
  const deleteAllBtn   = $("deleteAllBtn");
  const copyGcashBtn   = $("copyGcashBtn");
  const sidebarEl      = $("sidebar");
  const sidebarBackdrop= $("sidebarBackdrop");
  const menuBtn        = $("menuBtn");
  const newChatBtn     = $("newChatBtn");
  const convListEl     = $("convList");
  const searchInput    = $("searchInput");
  const exportBtn      = $("exportBtn");
  const shortcutsBtn   = $("shortcutsBtn");
  const voiceBtn       = $("voiceBtn");
  const charCount      = $("charCount");
  const toastEl        = $("toast");
  const segBtns        = document.querySelectorAll(".seg-btn[data-font]");
  const quickPromptBtns= document.querySelectorAll(".qp[data-prompt]");

  // ---- State ----
  const state = {
    conversations: [],         // [{id,title,model,codeMode,messages:[{role,content,id?}],createdAt,updatedAt}]
    currentId: null,
    sending: false,
    cancelStream: null,        // function to abort current stream
    editingMessageIdx: null,   // index of message being edited
    theme:     localStorage.getItem(LS.theme)     || "dark",
    font:      localStorage.getItem(LS.font)      || "medium",
    model:     localStorage.getItem(LS.model)     || DEFAULT_MODEL,
    codeMode:  localStorage.getItem(LS.code)      === "1",
    stream:    localStorage.getItem(LS.stream)    !== "0",
    autoSpeak: localStorage.getItem(LS.autoSpeak) === "1",
    temp:      parseFloat(localStorage.getItem(LS.temp) || "0.7"),
  };

  // ============================================================
  // Storage
  // ============================================================
  function loadConversations() {
    try {
      const raw = localStorage.getItem(LS.convs);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function saveConversations() {
    try { localStorage.setItem(LS.convs, JSON.stringify(state.conversations)); } catch {}
  }
  function getCurrent() {
    return state.conversations.find((c) => c.id === state.currentId) || null;
  }
  function newConversation() {
    const id = "cv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const conv = {
      id,
      title: NEW_CHAT_TITLE,
      model: state.model,
      codeMode: state.codeMode,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    state.conversations.unshift(conv);
    state.currentId = id;
    localStorage.setItem(LS.currentId, id);
    saveConversations();
    return conv;
  }
  function selectConversation(id) {
    if (state.currentId === id) return;
    state.currentId = id;
    localStorage.setItem(LS.currentId, id);
    const c = getCurrent();
    if (c) {
      // Restore per-conv settings if present
      if (c.model && MODELS.some((m) => m.id === c.model)) setModel(c.model, false, false);
      if (typeof c.codeMode === "boolean") {
        state.codeMode = c.codeMode;
        codeToggle.checked = c.codeMode;
      }
    }
    renderMessages();
    renderConvList();
    closeSidebarMobile();
  }
  function deleteConversation(id) {
    const idx = state.conversations.findIndex((c) => c.id === id);
    if (idx === -1) return;
    state.conversations.splice(idx, 1);
    saveConversations();
    if (state.currentId === id) {
      const next = state.conversations[0] || newConversation();
      state.currentId = next.id;
      localStorage.setItem(LS.currentId, state.currentId);
      renderMessages();
    }
    renderConvList();
  }
  function deleteAllConversations() {
    state.conversations = [];
    state.currentId = null;
    localStorage.removeItem(LS.convs);
    localStorage.removeItem(LS.currentId);
    newConversation();
    renderMessages();
    renderConvList();
  }
  function touchCurrent(updateTitle) {
    const c = getCurrent();
    if (!c) return;
    c.updatedAt = Date.now();
    if (updateTitle && c.title === NEW_CHAT_TITLE && c.messages.length) {
      const firstUser = c.messages.find((m) => m.role === "user");
      if (firstUser) {
        c.title = firstUser.content.replace(/\s+/g, " ").trim().slice(0, 48) ||
                  NEW_CHAT_TITLE;
      }
    }
    saveConversations();
  }

  // ============================================================
  // Markdown renderer + syntax highlighter
  // ============================================================
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Tiny syntax highlighter using sticky regexes per language.
  const HL_PATTERNS = {
    js: [
      [/\/\/[^\n]*/y, "cm"],
      [/\/\*[\s\S]*?\*\//y, "cm"],
      [/"(?:[^"\\\n]|\\.)*"/y, "st"],
      [/'(?:[^'\\\n]|\\.)*'/y, "st"],
      [/`(?:[^`\\]|\\.)*`/y, "st"],
      [/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|import|export|from|as|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|true|false|null|undefined|void)\b/y, "kw"],
      [/\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/y, "nm"],
      [/[A-Za-z_$][\w$]*(?=\s*\()/y, "fn"],
    ],
    py: [
      [/#[^\n]*/y, "cm"],
      [/"""[\s\S]*?"""/y, "st"],
      [/'''[\s\S]*?'''/y, "st"],
      [/"(?:[^"\\\n]|\\.)*"/y, "st"],
      [/'(?:[^'\\\n]|\\.)*'/y, "st"],
      [/\b(def|class|return|if|elif|else|for|while|try|except|finally|raise|with|as|import|from|in|not|and|or|is|None|True|False|lambda|yield|pass|break|continue|global|nonlocal|async|await|self)\b/y, "kw"],
      [/\b\d+(?:\.\d+)?\b/y, "nm"],
      [/[A-Za-z_][\w]*(?=\s*\()/y, "fn"],
    ],
    html: [
      [/<!--[\s\S]*?-->/y, "cm"],
      [/"(?:[^"]|\\.)*"|'(?:[^']|\\.)*'/y, "st"],
      [/<\/?[A-Za-z][\w-]*/y, "kw"],
      [/[A-Za-z_:][\w:.-]*(?==)/y, "fn"],
    ],
    css: [
      [/\/\*[\s\S]*?\*\//y, "cm"],
      [/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y, "st"],
      [/[#.][A-Za-z_-][\w-]*/y, "fn"],
      [/\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg)?\b/y, "nm"],
      [/[A-Za-z-]+(?=\s*:)/y, "kw"],
    ],
    json: [
      [/"(?:[^"\\]|\\.)*"(?=\s*:)/y, "fn"],
      [/"(?:[^"\\]|\\.)*"/y, "st"],
      [/\b(true|false|null)\b/y, "kw"],
      [/-?\b\d+(?:\.\d+)?\b/y, "nm"],
    ],
    sh: [
      [/#[^\n]*/y, "cm"],
      [/"(?:[^"\\\n]|\\.)*"/y, "st"],
      [/'[^'\n]*'/y, "st"],
      [/\$\w+/y, "nm"],
      [/\b(if|then|else|fi|for|do|done|while|case|esac|in|function|return|export|local|echo|cd|sudo|exit)\b/y, "kw"],
    ],
  };
  // Aliases
  const HL_ALIASES = {
    javascript: "js", typescript: "js", ts: "js", jsx: "js", tsx: "js", node: "js",
    python: "py", py3: "py",
    htm: "html", xml: "html", svg: "html",
    bash: "sh", zsh: "sh", shell: "sh",
  };

  function highlight(code, lang) {
    const key = HL_ALIASES[lang] || lang;
    const patterns = HL_PATTERNS[key];
    if (!patterns) return escapeHtml(code);
    let out = "";
    let i = 0;
    while (i < code.length) {
      let matched = false;
      for (const [re, cls] of patterns) {
        re.lastIndex = i;
        const m = re.exec(code);
        if (m && m.index === i) {
          out += `<span class="hl-${cls}">${escapeHtml(m[0])}</span>`;
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) { out += escapeHtml(code[i]); i++; }
    }
    return out;
  }

  // Markdown renderer (lightweight, safe)
  function renderMarkdown(text) {
    if (!text) return "";

    // 1) extract fenced code blocks first to placeholders
    const codeBlocks = [];
    let src = text.replace(/```([A-Za-z0-9_+-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const id = codeBlocks.length;
      codeBlocks.push({ lang: (lang || "").toLowerCase(), code });
      return `\u0000CODE${id}\u0000`;
    });

    // 2) extract inline code
    const inlineCodes = [];
    src = src.replace(/`([^`\n]+)`/g, (_, c) => {
      const id = inlineCodes.length;
      inlineCodes.push(c);
      return `\u0000IC${id}\u0000`;
    });

    // 3) escape HTML
    src = escapeHtml(src);

    // 4) tables (very simple): | a | b |\n|---|---|\n| 1 | 2 |
    src = src.replace(
      /(^\|.+\|\s*\n\|[\s:|-]+\|\s*\n(?:\|.*\|\s*\n?)+)/gm,
      (block) => {
        const lines = block.trim().split("\n");
        if (lines.length < 2) return block;
        const splitRow = (r) => r.replace(/^\||\|$/g, "").split("|").map((s) => s.trim());
        const head = splitRow(lines[0]);
        const rows = lines.slice(2).map(splitRow);
        let html = "<table><thead><tr>";
        head.forEach((h) => { html += `<th>${h}</th>`; });
        html += "</tr></thead><tbody>";
        rows.forEach((r) => {
          html += "<tr>";
          r.forEach((c) => { html += `<td>${c}</td>`; });
          html += "</tr>";
        });
        return html + "</tbody></table>";
      }
    );

    // 5) headings
    src = src.replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
             .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
             .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
             .replace(/^#\s+(.+)$/gm,    "<h1>$1</h1>");

    // 6) horizontal rule
    src = src.replace(/^\s*---+\s*$/gm, "<hr>");

    // 7) blockquote
    src = src.replace(/(?:^|\n)((?:&gt;[^\n]*\n?)+)/g, (_, block) => {
      const inner = block.replace(/^&gt;\s?/gm, "").trim();
      return `\n<blockquote>${inner}</blockquote>\n`;
    });

    // 8) lists - unordered
    src = src.replace(/(?:^|\n)((?:[-*+]\s+[^\n]+\n?)+)/g, (_, block) => {
      const items = block.trim().split("\n")
        .map((l) => l.replace(/^[-*+]\s+/, ""))
        .map((l) => `<li>${l}</li>`)
        .join("");
      return `\n<ul>${items}</ul>\n`;
    });
    // ordered
    src = src.replace(/(?:^|\n)((?:\d+\.\s+[^\n]+\n?)+)/g, (_, block) => {
      const items = block.trim().split("\n")
        .map((l) => l.replace(/^\d+\.\s+/, ""))
        .map((l) => `<li>${l}</li>`)
        .join("");
      return `\n<ol>${items}</ol>\n`;
    });

    // 9) bold / italic
    src = src.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
             .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
             .replace(/__([^_\n]+)__/g, "<strong>$1</strong>");

    // 10) links [text](url)
    src = src.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // bare URLs
    src = src.replace(/(^|[^"=>])(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

    // 11) paragraphs from blank lines
    const blocks = src.split(/\n{2,}/).map((b) => {
      const t = b.trim();
      if (!t) return "";
      if (/^<(h\d|ul|ol|pre|blockquote|table|hr)/.test(t)) return t;
      return "<p>" + t.replace(/\n/g, "<br>") + "</p>";
    });
    src = blocks.join("\n");

    // 12) restore inline codes
    src = src.replace(/\u0000IC(\d+)\u0000/g, (_, id) =>
      `<code class="inline">${escapeHtml(inlineCodes[+id])}</code>`);

    // 13) restore code blocks with highlighting + copy button
    src = src.replace(/\u0000CODE(\d+)\u0000/g, (_, id) => {
      const { lang, code } = codeBlocks[+id];
      const label = lang || "code";
      const safeCode = code.replace(/\n$/, "");
      const highlighted = highlight(safeCode, lang);
      return `<pre><div class="pre-head"><span>${label}</span>` +
             `<button type="button" class="pre-copy" data-code="${encodeURIComponent(safeCode)}">Copy</button></div>` +
             `<code>${highlighted}</code></pre>`;
    });

    return src;
  }

  // ============================================================
  // UI rendering
  // ============================================================
  function renderConvList() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const list = state.conversations.slice();
    list.sort((a, b) => b.updatedAt - a.updatedAt);

    convListEl.innerHTML = "";
    const filtered = q
      ? list.filter((c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q))
        )
      : list;

    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "conv-empty";
      empty.textContent = q ? "No matching chats" : "No chats yet";
      convListEl.appendChild(empty);
      return;
    }

    for (const c of filtered) {
      const item = document.createElement("div");
      item.className = "conv-item" + (c.id === state.currentId ? " active" : "");
      item.dataset.id = c.id;
      item.innerHTML =
        `<svg class="ic ic-sm" viewBox="0 0 24 24" aria-hidden="true">` +
        `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` +
        `<span class="conv-item-title"></span>` +
        `<button class="conv-item-del" type="button" aria-label="Delete chat" title="Delete">` +
        `<svg class="ic ic-sm" viewBox="0 0 24 24" aria-hidden="true">` +
        `<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>` +
        `<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>`;
      item.querySelector(".conv-item-title").textContent = c.title;
      item.addEventListener("click", () => selectConversation(c.id));
      item.querySelector(".conv-item-del").addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Delete this chat?")) deleteConversation(c.id);
      });
      convListEl.appendChild(item);
    }
  }

  function renderWelcome() {
    const html =
      `<div id="welcome" class="welcome">` +
      `<div class="welcome-card">` +
      `<div class="welcome-title">&gt; Welcome to ExChatBot</div>` +
      `<p class="welcome-text">Lightweight AI chatbot powered by puter.js. Ask anything, generate code, debug, translate, summarize — pick a model and start chatting.</p>` +
      `<div class="quick-prompts" id="quickPrompts">` +
      `<button class="qp" data-prompt="Explain this code step by step:&#10;&#10;\`\`\`&#10;[paste your code here]&#10;\`\`\`">Explain code</button>` +
      `<button class="qp" data-prompt="Debug and fix the following code. Show the corrected version with comments:&#10;&#10;\`\`\`&#10;[paste code]&#10;\`\`\`">Debug code</button>` +
      `<button class="qp" data-prompt="Generate a complete working example of: ">Generate code</button>` +
      `<button class="qp" data-prompt="Summarize the following text in 3 bullet points:&#10;&#10;">Summarize</button>` +
      `<button class="qp" data-prompt="Translate the following text to English (preserve meaning and tone):&#10;&#10;">Translate</button>` +
      `<button class="qp" data-prompt="Act as a senior interview coach. Ask me one technical interview question, wait for my answer, then give detailed feedback.">Interview prep</button>` +
      `<button class="qp" data-prompt="Write a clean, idiomatic regex for: ">Regex helper</button>` +
      `<button class="qp" data-prompt="Write a SQL query that: ">SQL helper</button>` +
      `</div></div></div>`;
    chatEl.insertAdjacentHTML("afterbegin", html);
    bindQuickPrompts();
  }

  function bindQuickPrompts() {
    document.querySelectorAll(".qp[data-prompt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        inputEl.value = btn.dataset.prompt.replace(/&#10;/g, "\n");
        inputEl.focus();
        autoGrow();
        updateCharCount();
      });
    });
  }

  function renderMessages() {
    chatEl.innerHTML = "";
    const c = getCurrent();
    if (!c || c.messages.length === 0) {
      renderWelcome();
      return;
    }
    for (let i = 0; i < c.messages.length; i++) {
      addMessageNode(c.messages[i].role, c.messages[i].content, i);
    }
    scrollToBottom();
  }

  function addMessageNode(role, text, idx) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (role === "user" ? "msg-user"
                              : role === "error" ? "msg-error" : "msg-ai");
    wrap.dataset.idx = idx;

    const roleEl = document.createElement("div");
    roleEl.className = "msg-role";
    roleEl.textContent = role === "user" ? "You" : role === "error" ? "Error" : "ExChatBot";
    wrap.appendChild(roleEl);

    const body = document.createElement("div");
    body.className = "msg-content md";
    body.innerHTML = role === "error" ? `<p>${escapeHtml(text)}</p>` : renderMarkdown(text);
    wrap.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "msg-actions";

    // Helper to get fresh content (for actions added during streaming)
    const getContent = () => {
      if (typeof idx !== "number") return text;
      const c = getCurrent();
      return (c && c.messages[idx] && c.messages[idx].content) || text;
    };

    if (role === "ai" || role === "error") {
      // Copy
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn-mini";
      const copyHtml = `<svg class="ic" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>Copy`;
      copyBtn.innerHTML = copyHtml;
      copyBtn.addEventListener("click", async () => {
        const ok = await copyText(getContent());
        copyBtn.innerHTML = ok ? "Copied" : "Failed";
        setTimeout(() => { copyBtn.innerHTML = copyHtml; }, 1300);
      });
      actions.appendChild(copyBtn);
    }

    if (role === "ai") {
      // Speak
      const speakBtn = document.createElement("button");
      speakBtn.type = "button";
      speakBtn.className = "btn-mini";
      speakBtn.innerHTML = `<svg class="ic" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>Speak`;
      speakBtn.addEventListener("click", () => toggleSpeak(getContent(), speakBtn));
      actions.appendChild(speakBtn);

      // Regenerate
      if (typeof idx === "number") {
        const regenBtn = document.createElement("button");
        regenBtn.type = "button";
        regenBtn.className = "btn-mini";
        regenBtn.innerHTML = `<svg class="ic" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>Regenerate`;
        regenBtn.addEventListener("click", () => regenerateFrom(idx));
        actions.appendChild(regenBtn);
      }
    }

    if (role === "user" && typeof idx === "number") {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-mini";
      editBtn.innerHTML = `<svg class="ic" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>Edit`;
      editBtn.addEventListener("click", () => openEditModal(idx));
      actions.appendChild(editBtn);
    }

    if (actions.children.length) wrap.appendChild(actions);
    chatEl.appendChild(wrap);
    return wrap;
  }

  function addLoaderNode() {
    const wrap = document.createElement("div");
    wrap.className = "msg msg-ai loading";
    wrap.innerHTML =
      '<div class="msg-role">ExChatBot</div>' +
      '<div class="msg-content"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    chatEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  // ============================================================
  // Chat logic (send / stream / regenerate / edit)
  // ============================================================
  async function sendMessage(textOverride) {
    if (state.sending) return;
    const text = (textOverride !== undefined ? textOverride : inputEl.value).trim();
    if (!text) return;

    if (typeof window.puter === "undefined" || !window.puter.ai || !window.puter.ai.chat) {
      addErrorMessage("puter.js failed to load. Please check your internet connection and refresh.");
      return;
    }

    let conv = getCurrent();
    if (!conv) conv = newConversation();

    // Remove welcome
    const welcome = chatEl.querySelector(".welcome");
    if (welcome) welcome.remove();

    // Persist user message
    conv.messages.push({ role: "user", content: text });
    touchCurrent(true);

    // Render user message
    addMessageNode("user", text, conv.messages.length - 1);

    if (textOverride === undefined) {
      inputEl.value = "";
      autoGrow();
      updateCharCount();
    }

    await streamReply();
    renderConvList();
  }

  async function streamReply() {
    const conv = getCurrent();
    if (!conv) return;

    setSending(true);

    // Build payload
    const payload = state.codeMode
      ? [{ role: "system", content: CODE_SYSTEM_PROMPT }, ...conv.messages]
      : conv.messages.slice();

    let cancelled = false;
    state.cancelStream = () => { cancelled = true; };

    // Reserve an AI message in storage
    const aiIdx = conv.messages.length;
    conv.messages.push({ role: "assistant", content: "" });
    const aiNode = addMessageNode("ai", "", aiIdx);
    const bodyEl = aiNode.querySelector(".msg-content");
    bodyEl.classList.add("cursor-blink");

    const opts = { model: state.model, temperature: state.temp };

    try {
      if (state.stream) {
        opts.stream = true;
        const stream = await window.puter.ai.chat(payload, opts);
        let acc = "";
        for await (const part of stream) {
          if (cancelled) break;
          const chunk = extractChunk(part);
          if (chunk) {
            acc += chunk;
            // Render incrementally — simple text first, full markdown after
            bodyEl.innerHTML = renderMarkdown(acc);
            scrollToBottom();
          }
        }
        if (!acc && !cancelled) {
          // Some providers do not stream — fall back to non-stream
          const r = await window.puter.ai.chat(payload, { model: state.model, temperature: state.temp });
          acc = extractReply(r);
          bodyEl.innerHTML = renderMarkdown(acc);
        }
        finalizeAi(conv, aiIdx, aiNode, bodyEl, acc);
      } else {
        const r = await window.puter.ai.chat(payload, opts);
        const reply = extractReply(r);
        if (!reply) throw new Error("Empty response");
        bodyEl.innerHTML = renderMarkdown(reply);
        finalizeAi(conv, aiIdx, aiNode, bodyEl, reply);
      }
    } catch (err) {
      console.error("ExChatBot stream error:", err);
      // Replace placeholder with error message
      conv.messages.splice(aiIdx, 1);
      aiNode.remove();
      const detail = (err && (err.message || err.error || String(err))) || "";
      addErrorMessage(FRIENDLY_ERROR + (detail ? "\n\n[" + String(detail).slice(0, 200) + "]" : ""));
    } finally {
      state.cancelStream = null;
      setSending(false);
      touchCurrent(true);
      saveConversations();
      inputEl.focus();
    }
  }

  function finalizeAi(conv, idx, node, bodyEl, finalText) {
    bodyEl.classList.remove("cursor-blink");
    conv.messages[idx].content = finalText || "";
    if (!finalText) {
      bodyEl.innerHTML = "<p>(empty response — try another model)</p>";
    } else {
      bodyEl.innerHTML = renderMarkdown(finalText);
      if (state.autoSpeak) speakText(finalText);
    }
    scrollToBottom();
  }

  function addErrorMessage(text) {
    addMessageNode("error", text);
    scrollToBottom();
  }

  function extractChunk(part) {
    if (part == null) return "";
    if (typeof part === "string") return part;
    if (typeof part.text === "string") return part.text;
    if (typeof part.delta === "string") return part.delta;
    if (part.choices && part.choices[0]) {
      const c = part.choices[0];
      if (c.delta && typeof c.delta.content === "string") return c.delta.content;
      if (c.message && typeof c.message.content === "string") return c.message.content;
      if (typeof c.text === "string") return c.text;
    }
    if (part.message) {
      if (typeof part.message.content === "string") return part.message.content;
      if (Array.isArray(part.message.content)) {
        return part.message.content.map((p) => (typeof p === "string" ? p : p.text || "")).join("");
      }
    }
    return "";
  }

  function extractReply(response) {
    if (response == null) return "";
    if (typeof response === "string") return response.trim();
    if (response.message) {
      if (typeof response.message.content === "string") return response.message.content.trim();
      if (Array.isArray(response.message.content)) {
        return response.message.content
          .map((c) => (typeof c === "string" ? c : c.text || ""))
          .join("").trim();
      }
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
    } catch {}
    return "";
  }

  function regenerateFrom(idx) {
    if (state.sending) return;
    const conv = getCurrent();
    if (!conv) return;
    // Remove the AI message at idx and any subsequent ones
    conv.messages.splice(idx);
    saveConversations();
    renderMessages();
    streamReply();
    renderConvList();
  }

  function openEditModal(idx) {
    const conv = getCurrent();
    if (!conv) return;
    const msg = conv.messages[idx];
    if (!msg || msg.role !== "user") return;
    state.editingMessageIdx = idx;
    editTextarea.value = msg.content;
    openModal(editModal, true);
    setTimeout(() => editTextarea.focus(), 50);
  }

  function commitEdit() {
    const conv = getCurrent();
    const idx = state.editingMessageIdx;
    if (idx == null || !conv) { openModal(editModal, false); return; }
    const newText = editTextarea.value.trim();
    if (!newText) { openModal(editModal, false); return; }
    // Truncate after this message and replace its content
    conv.messages.splice(idx);
    saveConversations();
    renderMessages();
    openModal(editModal, false);
    state.editingMessageIdx = null;
    sendMessage(newText);
  }

  function setSending(isSending) {
    state.sending = isSending;
    sendBtn.disabled = isSending;
    inputEl.disabled = isSending;
    sendBtn.hidden = isSending;
    stopBtn.hidden = !isSending;
  }

  function stopGeneration() {
    if (state.cancelStream) state.cancelStream();
    setSending(false);
  }

  // ============================================================
  // Voice input + TTS
  // ============================================================
  let recognition = null;
  let recognitionActive = false;

  function initVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    let interim = "";
    recognition.onstart = () => {
      recognitionActive = true;
      voiceBtn.classList.add("voice-active");
      showToast("Listening...");
    };
    recognition.onresult = (e) => {
      interim = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (finalText) {
        const sep = inputEl.value && !inputEl.value.endsWith(" ") ? " " : "";
        inputEl.value += sep + finalText.trim();
        autoGrow(); updateCharCount();
      }
    };
    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      showToast("Voice error: " + (e.error || "unknown"));
    };
    recognition.onend = () => {
      recognitionActive = false;
      voiceBtn.classList.remove("voice-active");
    };
  }

  function toggleVoice() {
    if (!recognition) {
      showToast("Voice input not supported on this browser");
      return;
    }
    if (recognitionActive) {
      try { recognition.stop(); } catch {}
    } else {
      try { recognition.start(); } catch (e) { showToast("Could not start voice input"); }
    }
  }

  let currentSpeakBtn = null;
  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    try { window.speechSynthesis.cancel(); } catch {}
    const plain = text.replace(/```[\s\S]*?```/g, " (code block) ").replace(/[*_`#>]/g, "");
    const utter = new SpeechSynthesisUtterance(plain.slice(0, 4000));
    utter.rate = 1; utter.pitch = 1;
    utter.onend = () => {
      if (currentSpeakBtn) { currentSpeakBtn.classList.remove("speaking"); currentSpeakBtn = null; }
    };
    window.speechSynthesis.speak(utter);
  }
  function toggleSpeak(text, btn) {
    if (!("speechSynthesis" in window)) {
      showToast("Speech not supported on this browser");
      return;
    }
    if (window.speechSynthesis.speaking && currentSpeakBtn === btn) {
      window.speechSynthesis.cancel();
      btn.classList.remove("speaking");
      currentSpeakBtn = null;
      return;
    }
    try { window.speechSynthesis.cancel(); } catch {}
    if (currentSpeakBtn) currentSpeakBtn.classList.remove("speaking");
    currentSpeakBtn = btn;
    btn.classList.add("speaking");
    speakText(text);
  }

  // ============================================================
  // Settings
  // ============================================================
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
    segBtns.forEach((b) =>
      b.setAttribute("aria-checked", b.dataset.font === font ? "true" : "false")
    );
    localStorage.setItem(LS.font, font);
  }
  function applyTemp(v) {
    state.temp = parseFloat(v);
    if (isNaN(state.temp)) state.temp = 0.7;
    tempValue.textContent = state.temp.toFixed(1);
    tempRange.value = state.temp;
    localStorage.setItem(LS.temp, String(state.temp));
  }
  function setModel(id, persist, syncToConv) {
    if (!MODELS.some((m) => m.id === id)) id = DEFAULT_MODEL;
    state.model = id;
    if (modelSelect.value !== id) modelSelect.value = id;
    if (modelSelect2.value !== id) modelSelect2.value = id;
    if (persist !== false) localStorage.setItem(LS.model, id);
    if (syncToConv !== false) {
      const c = getCurrent();
      if (c) { c.model = id; saveConversations(); }
    }
  }
  function populateModels(selectEl) {
    selectEl.innerHTML = "";
    const groups = {};
    for (const m of MODELS) {
      (groups[m.group] = groups[m.group] || []).push(m);
    }
    for (const [g, list] of Object.entries(groups)) {
      const og = document.createElement("optgroup");
      og.label = g;
      for (const m of list) {
        const opt = document.createElement("option");
        opt.value = m.id; opt.textContent = m.name;
        og.appendChild(opt);
      }
      selectEl.appendChild(og);
    }
  }

  // ============================================================
  // Helpers
  // ============================================================
  function scrollToBottom() {
    requestAnimationFrame(() => { chatEl.scrollTop = chatEl.scrollHeight; });
  }
  function autoGrow() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + "px";
  }
  function updateCharCount() {
    const n = inputEl.value.length;
    charCount.textContent = `${n} / 16000`;
  }
  function isTouchDevice() {
    return ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  }
  function openModal(modal, open) {
    if (open) {
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } else {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      // only restore overflow if no other modals are open
      const anyOpen = document.querySelector(".modal:not([hidden])");
      if (!anyOpen) document.body.style.overflow = "";
    }
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  }
  function openSidebarMobile() {
    sidebarEl.classList.add("open");
    sidebarBackdrop.hidden = false;
  }
  function closeSidebarMobile() {
    sidebarEl.classList.remove("open");
    sidebarBackdrop.hidden = true;
  }
  function toggleSidebar() {
    if (sidebarEl.classList.contains("open")) closeSidebarMobile();
    else openSidebarMobile();
  }

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1800);
  }

  function exportCurrentChat() {
    const c = getCurrent();
    if (!c || !c.messages.length) {
      showToast("Nothing to export"); return;
    }
    const lines = [];
    lines.push(`# ${c.title}`);
    lines.push(`Model: ${c.model} | Exported: ${new Date().toISOString()}`);
    lines.push("");
    for (const m of c.messages) {
      lines.push(m.role === "user" ? "## You" : "## ExChatBot");
      lines.push("");
      lines.push(m.content);
      lines.push("");
    }
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(c.title) + ".md";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Chat exported");
  }
  function sanitizeFilename(s) {
    return (s || "chat").replace(/[^\w\s.-]/g, "").trim().slice(0, 60).replace(/\s+/g, "_") || "chat";
  }

  // ============================================================
  // Event bindings
  // ============================================================
  function bindEvents() {
    formEl.addEventListener("submit", (e) => { e.preventDefault(); sendMessage(); });
    stopBtn.addEventListener("click", stopGeneration);

    inputEl.addEventListener("input", () => { autoGrow(); updateCharCount(); });
    inputEl.addEventListener("keydown", (e) => {
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
      const c = getCurrent();
      if (c) { c.codeMode = state.codeMode; saveConversations(); }
    });

    streamToggle.addEventListener("change", () => {
      state.stream = streamToggle.checked;
      localStorage.setItem(LS.stream, state.stream ? "1" : "0");
    });

    autoSpeakTog.addEventListener("change", () => {
      state.autoSpeak = autoSpeakTog.checked;
      localStorage.setItem(LS.autoSpeak, state.autoSpeak ? "1" : "0");
    });

    settingsBtn.addEventListener("click", () => openModal(settingsModal, true));
    shortcutsBtn.addEventListener("click", () => openModal(shortcutsModal, true));

    document.addEventListener("click", (e) => {
      if (e.target.matches(".modal [data-close], .modal .modal-backdrop[data-close]")) {
        const modal = e.target.closest(".modal");
        if (modal) openModal(modal, false);
      }
    });

    // Pre block copy buttons (delegated)
    chatEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".pre-copy");
      if (!btn) return;
      const code = decodeURIComponent(btn.dataset.code || "");
      const ok = await copyText(code);
      btn.textContent = ok ? "Copied" : "Failed";
      setTimeout(() => (btn.textContent = "Copy"), 1300);
    });

    // Edit modal
    editCancelBtn.addEventListener("click", () => openModal(editModal, false));
    editSaveBtn.addEventListener("click", commitEdit);

    // Theme + font + temp
    themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
    segBtns.forEach((b) => b.addEventListener("click", () => applyFont(b.dataset.font)));
    tempRange.addEventListener("input", () => applyTemp(tempRange.value));

    // Clear chats
    clearChatBtn.addEventListener("click", () => {
      const c = getCurrent();
      if (!c) return;
      c.messages = [];
      c.title = NEW_CHAT_TITLE;
      saveConversations();
      renderMessages(); renderConvList();
      openModal(settingsModal, false);
      showToast("Chat cleared");
    });
    deleteAllBtn.addEventListener("click", () => {
      if (!confirm("Delete ALL chats? This cannot be undone.")) return;
      deleteAllConversations();
      openModal(settingsModal, false);
      showToast("All chats deleted");
    });

    // GCash copy
    copyGcashBtn.addEventListener("click", async () => {
      const ok = await copyText(document.getElementById("gcashNumber").textContent.trim());
      showToast(ok ? "GCash number copied" : "Copy failed");
    });

    // Sidebar
    menuBtn.addEventListener("click", toggleSidebar);
    sidebarBackdrop.addEventListener("click", closeSidebarMobile);
    newChatBtn.addEventListener("click", () => {
      newConversation();
      renderMessages(); renderConvList();
      closeSidebarMobile();
      inputEl.focus();
    });
    searchInput.addEventListener("input", renderConvList);

    // Export
    exportBtn.addEventListener("click", exportCurrentChat);

    // Voice
    voiceBtn.addEventListener("click", toggleVoice);

    // Quick prompts (initial set)
    bindQuickPrompts();

    // Global shortcuts
    document.addEventListener("keydown", (e) => {
      const cmd = e.metaKey || e.ctrlKey;

      // Esc — close any modal or stop generation
      if (e.key === "Escape") {
        const openModalEl = document.querySelector(".modal:not([hidden])");
        if (openModalEl) { openModal(openModalEl, false); return; }
        if (state.sending) { stopGeneration(); return; }
        if (sidebarEl.classList.contains("open")) closeSidebarMobile();
      }

      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        newConversation();
        renderMessages(); renderConvList();
        inputEl.focus();
      }
      if (cmd && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      if (cmd && e.key === "/") {
        e.preventDefault();
        openModal(shortcutsModal, true);
      }
      if (cmd && e.key.toLowerCase() === "l") {
        e.preventDefault();
        const c = getCurrent();
        if (c) {
          c.messages = []; c.title = NEW_CHAT_TITLE;
          saveConversations(); renderMessages(); renderConvList();
          showToast("Chat cleared");
        }
      }
    });
  }

  // ============================================================
  // PWA service worker
  // ============================================================
  function registerSW() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch((e) => {
          console.warn("SW registration failed:", e);
        });
      });
    }
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    // Apply prefs
    applyTheme(state.theme);
    applyFont(state.font);
    applyTemp(state.temp);
    themeSelect.value = state.theme;
    codeToggle.checked = state.codeMode;
    streamToggle.checked = state.stream;
    autoSpeakTog.checked = state.autoSpeak;

    // Models
    populateModels(modelSelect);
    populateModels(modelSelect2);
    setModel(state.model, false, false);

    // Conversations
    state.conversations = loadConversations();
    state.currentId = localStorage.getItem(LS.currentId);
    if (!state.currentId || !state.conversations.find((c) => c.id === state.currentId)) {
      if (state.conversations.length) {
        state.currentId = state.conversations[0].id;
        localStorage.setItem(LS.currentId, state.currentId);
      } else {
        newConversation();
      }
    }

    // Bind events, render
    bindEvents();
    initVoice();
    renderConvList();
    renderMessages();
    autoGrow();
    updateCharCount();
    registerSW();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
