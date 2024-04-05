chrome.runtime.onInstalled.addListener(() => {
  updateContextMenu();
});

function updateContextMenu() {
  chrome.storage.sync.get(["jiraDomain"], function (data) {
    console.log("jira domain:", data.jiraDomain);
    if (data.jiraDomain) {
      const jiraDomain = data.jiraDomain.trim();
      if (jiraDomain) {
        const domainUrl = `${jiraDomain}.atlassian.net`;
        console.log("domainUrl", domainUrl);
        chrome.contextMenus.removeAll();
        chrome.contextMenus.create({
          id: "JIRA Kickoff Meeting",
          title: "Schedule Kickoff",
          contexts: ["link"],
          targetUrlPatterns: [`*://${domainUrl}/*`],
        });
      }
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "JIRA Kickoff Meeting") {
    console.log("clicked with", info);
    const urlSplit = info.linkUrl.split("//")[1].split("/");
    const storyNumber = urlSplit.pop();
    const domainUrl = urlSplit.shift();
    const jiraApiUrl = `https://${domainUrl}/rest/api/2/issue/${storyNumber}`;
    console.log(jiraApiUrl);
    fetch(jiraApiUrl)
      .then((response) => response.json())
      .then((data) => {
        const storyTitle = data.fields.summary;
        const storyLink = encodeURIComponent(info.linkUrl);
        const subject = `Kickoff ${storyNumber}: ${storyTitle}`;
        const content = storyLink + encodeURIComponent(`\n\n\n\n\n ${storyTitle}`);
        const teamsURI = `msteams://teams.microsoft.com/l/meeting/new?subject=${subject}&content=${content}`;
        console.log(teamsURI);
        chrome.tabs.create({ url: teamsURI });
      })
      .catch((error) => {
        console.error("Error fetching JIRA ticket:", error);
      });
  } else {
    console.log("menu id not match", info);
  }
});

// Listen for changes to settings and update context menu accordingly
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.jiraDomain) {
    updateContextMenu();
  }
});
