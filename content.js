(function () {
  function queryXPath(xpath) {
    return document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
  }

  // WhatsApp Web sometimes mounts under div[2] and sometimes under div[1].
  // Try both prefixes and return the first match.
  function queryWithFallback(suffix) {
    for (const idx of [2, 1]) {
      const node = queryXPath(`/html/body/div[${idx}]/div${suffix}`);
      if (node) {
        return node;
      }
    }
    return null;
  }

  function toggleSidebar() {
    const sidebar = queryWithFallback("/div/div/div/div[3]/div/div[3]");

    if (!sidebar) {
      console.log("sidebar not found.");
      return;
    }

    const lines = queryWithFallback("/div/div/div/div[3]/div/div[2]/div[2]");

    sidebar.classList.toggle("wwst-hidden");
    if (sidebar.classList.contains("wwst-hidden")) {
      sidebar.style.display = "none";
      lines.style.borderInlineStartWidth = "0";
    } else {
      sidebar.style.display = "";
      lines.style.borderInlineStartWidth = "1px";
    }
  }

  function isChatsTabActive() {
    const chatsButton = queryWithFallback(
      "/div/div/div/div[3]/div/header/div/div[1]/div/div[1]/span/div/button",
    );

    return chatsButton?.getAttribute("aria-pressed") === "true";
  }

  const DEFAULT_SHORTCUT = {
    key: "b",
    mod: true,
    alt: false,
    shift: false,
  };

  const DEFAULT_SETTINGS = {
    ignoreHotkeyWhileTyping: false,
    shortcut: DEFAULT_SHORTCUT,
  };

  const settings = {
    ...DEFAULT_SETTINGS,
    shortcut: { ...DEFAULT_SHORTCUT },
  };

  function normalizeShortcut(shortcut) {
    if (!shortcut || typeof shortcut !== "object") {
      return { ...DEFAULT_SHORTCUT };
    }

    const normalized = {
      key:
        typeof shortcut.key === "string" && shortcut.key
          ? shortcut.key
          : DEFAULT_SHORTCUT.key,
      mod: Boolean(shortcut.mod),
      alt: Boolean(shortcut.alt),
      shift: Boolean(shortcut.shift),
    };

    // A bare key would fire while typing, so ignore malformed shortcuts.
    return normalized.mod || normalized.alt
      ? normalized
      : { ...DEFAULT_SHORTCUT };
  }

  function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
      if (chrome.runtime.lastError || !stored) {
        return;
      }

      settings.ignoreHotkeyWhileTyping =
        stored.ignoreHotkeyWhileTyping === true;
      settings.shortcut = normalizeShortcut(stored.shortcut);
    });
  }

  loadSettings();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }

    if (changes.ignoreHotkeyWhileTyping) {
      settings.ignoreHotkeyWhileTyping =
        changes.ignoreHotkeyWhileTyping.newValue === true;
    }

    if (changes.shortcut) {
      settings.shortcut = normalizeShortcut(changes.shortcut.newValue);
    }
  });

  function isEditableElement(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    // isContentEditable also covers descendants of a contenteditable host.
    if (element.isContentEditable) {
      return true;
    }

    return element.matches(
      "input, textarea, select, [role='textbox'], [contenteditable='true'], [contenteditable='plaintext-only']",
    );
  }

  function isTyping(e) {
    return (
      isEditableElement(document.activeElement) || isEditableElement(e.target)
    );
  }

  function matchesShortcut(e) {
    const shortcut = settings.shortcut;

    if (
      typeof shortcut.key !== "string" ||
      !shortcut.key ||
      typeof e.key !== "string"
    ) {
      return false;
    }

    return (
      e.key.toLowerCase() === shortcut.key.toLowerCase() &&
      (e.ctrlKey || e.metaKey) === shortcut.mod &&
      e.altKey === shortcut.alt &&
      e.shiftKey === shortcut.shift
    );
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (settings.ignoreHotkeyWhileTyping && isTyping(e)) {
        return;
      }

      if (!matchesShortcut(e)) {
        return;
      }

      if (!isChatsTabActive()) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    },
    true,
  );

  const interval = setInterval(() => {
    const container = queryWithFallback(
      "/div/div/div/div[3]/div/header/div/div[1]/div/div[1]/span/div/button",
    );

    if (!container) {
      return;
    }

    clearInterval(interval);

    container.addEventListener("click", () => {
      if (container.getAttribute("aria-pressed") !== "true") {
        return;
      }

      requestAnimationFrame(toggleSidebar);
    });
  }, 1000);
})();
