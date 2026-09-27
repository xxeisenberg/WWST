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

  document.addEventListener("keydown", (e) => {
    if (
      document.activeElement?.matches(
        "input, textarea, [contenteditable='true']",
      )
    ) {
      return;
    }

    if (!isChatsTabActive()) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      toggleSidebar();
    }
  });

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
