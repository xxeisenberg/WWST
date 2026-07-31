(function () {
  function toggleSidebar() {
    const sidebar = document.evaluate(
      "/html/body/div[1]/div/div/div/div/div[3]/div/div[3]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;

    if (!sidebar) {
      console.log("sidebar not found.");
      return;
    }

    const lines = document.evaluate(
      "/html/body/div[1]/div/div/div/div/div[3]/div/div[2]/div[2]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;

    sidebar.classList.toggle("wwst-hidden");
    if (sidebar.classList.contains("wwst-hidden")) {
      sidebar.style.display = "none";
      lines.style.borderInlineStartWidth = "0";
    } else {
      sidebar.style.display = "";
      lines.style.borderInlineStartWidth = "1px";
    }
  }

  const interval = setInterval(() => {
    const container = document.evaluate(
      "/html/body/div[1]/div/div/div/div/div[3]/div/header/div/div[1]/div/div[1]/span/div/button",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;

    if (!container) {
      console.log("Page not loaded yet.");
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
