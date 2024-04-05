document.addEventListener("DOMContentLoaded", function () {
  const jiraDomainInput = document.getElementById("jiraDomain");
  const saveButton = document.getElementById("saveButton");

  chrome.storage.sync.get(["jiraDomain"], function (data) {
    if (data.jiraDomain) {
      jiraDomainInput.value = data.jiraDomain;
    }
  });

  saveButton.addEventListener("click", function () {
    const jiraDomain = jiraDomainInput.value;
    chrome.storage.sync.set({ jiraDomain: jiraDomain }, function () {
      console.log("Settings saved:", {
        jiraDomain: jiraDomain,
      });
      // chrome.runtime.sendMessage('updateContextMenu');
    });
  });
});
