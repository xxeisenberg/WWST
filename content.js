(function () {
  const interval = setInterval(() => {
    const tabs = document.evaluate(
      "/html/body/div[1]/div/div/div/div/div[3]/div/header/div/div[1]/div",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );

    let activeTab;

    if (tabs.snapshotLength > 0) {
      clearInterval(interval);

      for (let i = 0; i < tabs.snapshotLength; i++) {
        const tab = tabs
          .snapshotItem(i)
          .querySelector('button[aria-pressed="true"]');

        if (tab) {
          console.log(tab);
          activeTab = tab;
          break;
        }
      }
    } else {
      console.log("Page not loaded yet");
    }
  }, 1000);
})();
