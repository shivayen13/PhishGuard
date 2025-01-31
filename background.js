chrome.runtime.onInstalled.addListener(() => {
  console.log("PhishGuard installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "reportPhishing") {
    reportPhishing(message.emailData);
    sendResponse({ success: true });
  }
});

function reportPhishing(emailData) {
  console.log("Phishing reported:", emailData);
  // Send data to a central server for analysis
  fetch("https://your-backend-server.com/report", {
    method: "POST",
    body: JSON.stringify(emailData),
    headers: { "Content-Type": "application/json" },
  });
}