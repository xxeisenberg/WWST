(function () {
  const interval = setInterval(() => {
    const container = document.evaluate(
      "/html/body/div[1]/div/div/div/div/div[3]/div/header/div/div[1]/div",
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
      requestAnimationFrame(() => {
        const activeTab = container.querySelector(
          'button[aria-pressed="true"]',
        );

        if (activeTab) {
          console.log(activeTab);
        }
      });
    });
  }, 1000);
})();
