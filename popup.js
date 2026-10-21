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

const MODIFIER_KEYS = new Set([
  "Alt",
  "AltGraph",
  "Control",
  "Fn",
  "FnLock",
  "Hyper",
  "Meta",
  "OS",
  "Shift",
  "Super",
  "Symbol",
]);

const IGNORED_KEYS = new Set([
  "CapsLock",
  "ContextMenu",
  "Dead",
  "NumLock",
  "PrintScreen",
  "Process",
  "ScrollLock",
  "Unidentified",
]);

const KEY_LABELS = {
  " ": "Space",
  "+": "Plus",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  backspace: "⌫",
  delete: "Del",
  pageup: "PgUp",
  pagedown: "PgDn",
  insert: "Ins",
  escape: "Esc",
  enter: "Enter",
  tab: "Tab",
  home: "Home",
  end: "End",
};

const isMac = /mac|iphone|ipad|ipod/i.test(
  navigator.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent,
);

const checkbox = document.getElementById("ignore-hotkey-while-typing");
const status = document.getElementById("status");
const shortcutButton = document.getElementById("shortcut-button");
const shortcutKeys = document.getElementById("shortcut-keys");
const shortcutLabel = document.getElementById("shortcut-label");

let currentShortcut = { ...DEFAULT_SHORTCUT };
let isRecording = false;
let statusTimeout;

function showStatus(message) {
  status.textContent = message;
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    status.textContent = "";
  }, 1500);
}

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

function formatKey(key) {
  const lowerKey = key.toLowerCase();

  if (KEY_LABELS[lowerKey]) {
    return KEY_LABELS[lowerKey];
  }

  if (/^f([1-9]|1[0-2])$/.test(lowerKey)) {
    return lowerKey.toUpperCase();
  }

  return key.length === 1 ? key.toUpperCase() : key;
}

function shortcutParts(shortcut) {
  const parts = [];

  if (shortcut.mod) {
    parts.push(isMac ? "Cmd" : "Ctrl");
  }

  if (shortcut.alt) {
    parts.push("Alt");
  }

  if (shortcut.shift) {
    parts.push("Shift");
  }

  parts.push(formatKey(shortcut.key));
  return parts;
}

function renderKeycaps(labels, placeholder = false) {
  shortcutKeys.replaceChildren();
  const parts = placeholder ? [...labels, "…"] : labels;

  parts.forEach((label, index) => {
    if (index > 0) {
      const plus = document.createElement("span");
      plus.className = "shortcut__plus";
      plus.textContent = "+";
      plus.setAttribute("aria-hidden", "true");
      shortcutKeys.append(plus);
    }

    const key = document.createElement("kbd");
    key.className = "key";
    if (placeholder && index === parts.length - 1) {
      key.classList.add("key--placeholder");
    }
    key.textContent = label;
    shortcutKeys.append(key);
  });
}

function renderShortcut() {
  const parts = shortcutParts(currentShortcut);
  renderKeycaps(parts);

  shortcutLabel.textContent = "Toggle sidebar with";
  shortcutButton.classList.remove("shortcut--recording");
  shortcutButton.title = "Click to change shortcut";
  shortcutButton.setAttribute(
    "aria-label",
    `Change shortcut. Current shortcut: ${parts.join(" plus ")}.`,
  );
}

function renderRecording(e) {
  const parts = [];

  if (e?.ctrlKey || e?.metaKey) {
    parts.push(isMac ? "Cmd" : "Ctrl");
  }

  if (e?.altKey) {
    parts.push("Alt");
  }

  if (e?.shiftKey) {
    parts.push("Shift");
  }

  renderKeycaps(parts, true);
  shortcutLabel.textContent = "Press new shortcut";
  shortcutButton.classList.add("shortcut--recording");
  shortcutButton.title = "Press Esc to cancel";
  shortcutButton.setAttribute(
    "aria-label",
    "Recording new shortcut. Press Escape to cancel.",
  );
}

function onDocumentPointerDown(e) {
  if (!shortcutButton.contains(e.target)) {
    stopRecording();
  }
}

function onRecordingKeyDown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    stopRecording();
    return;
  }

  if (MODIFIER_KEYS.has(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    renderRecording(e);
    return;
  }

  if (IGNORED_KEYS.has(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  const mod = e.ctrlKey || e.metaKey;
  const alt = e.altKey;

  if (!mod && !alt) {
    renderRecording(e);
    showStatus("Add Ctrl, Cmd, or Alt.");
    return;
  }

  saveShortcut({
    key: e.key,
    mod,
    alt,
    shift: e.shiftKey,
  });
}

function onRecordingKeyUp(e) {
  if (!MODIFIER_KEYS.has(e.key)) {
    return;
  }

  renderRecording(e);
}

function startRecording() {
  if (isRecording) {
    return;
  }

  isRecording = true;
  showStatus("");
  renderRecording();
  shortcutButton.focus();

  window.addEventListener("keydown", onRecordingKeyDown, true);
  window.addEventListener("keyup", onRecordingKeyUp, true);
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
}

function stopRecording() {
  if (!isRecording) {
    return;
  }

  isRecording = false;

  window.removeEventListener("keydown", onRecordingKeyDown, true);
  window.removeEventListener("keyup", onRecordingKeyUp, true);
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);

  renderShortcut();
}

function saveShortcut(shortcut) {
  const previousShortcut = currentShortcut;
  currentShortcut = normalizeShortcut(shortcut);
  stopRecording();

  chrome.storage.sync.set({ shortcut: currentShortcut }, () => {
    if (chrome.runtime.lastError) {
      currentShortcut = previousShortcut;
      renderShortcut();
      showStatus("Couldn't save. Please try again.");
      return;
    }

    showStatus("");
  });
}

shortcutButton.addEventListener("click", () => {
  if (isRecording) {
    stopRecording();
    return;
  }

  startRecording();
});

renderShortcut();

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  if (chrome.runtime.lastError || !settings) {
    return;
  }

  checkbox.checked = settings.ignoreHotkeyWhileTyping === true;
  currentShortcut = normalizeShortcut(settings.shortcut);

  if (!isRecording) {
    renderShortcut();
  }
});

checkbox.addEventListener("change", () => {
  chrome.storage.sync.set(
    { ignoreHotkeyWhileTyping: checkbox.checked },
    () => {
      if (chrome.runtime.lastError) {
        showStatus("Couldn't save. Please try again.");
        return;
      }

      showStatus("");
    },
  );
});
