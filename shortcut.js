// Shared by content.js and popup.js.

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

// Non-Latin layouts (e.g. Cyrillic) and macOS Option produce characters like
// "и" or "∫", or a dead key. Fall back to the physical key in those cases so
// Ctrl+B / Option+B still mean "B". Latin layouts keep e.key, so AZERTY etc.
// match the label printed on the key.
function eventKey(e) {
  if (typeof e.key !== "string") {
    return "";
  }

  const isPrintableAscii = /^[\x20-\x7e]$/.test(e.key);
  const isNonAsciiChar = e.key.length === 1 && !isPrintableAscii;

  if (isNonAsciiChar || e.key === "Dead") {
    const match = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(e.code || "");
    if (match) {
      return (match[1] || match[2]).toLowerCase();
    }
  }

  return e.key;
}
