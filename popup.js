document.getElementById("analyzeButton").addEventListener("click", () => {
    // Show the progress bar
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const finalResult = document.getElementById("finalResult");
    progressContainer.style.display = "block";
    progressBar.value = 0;
    finalResult.style.display = "none"; // Hide the final result initially
  
    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressBar.value = progress;
  
      if (progress >= 100) {
        clearInterval(interval);
        analyzeEmailContent();
      }
    }, 300); // Update every 300ms
  });
  
  // Listen for messages from the content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "analysisResult") {
      displayResults(message.data);
    }
  });
  
  function displayResults(data) {
    const resultsDiv = document.getElementById("results");
    const finalResult = document.getElementById("finalResult");
  
    // Hide the progress bar after analysis is complete
    document.getElementById("progressContainer").style.display = "none";
  
    // Display the final result
    finalResult.style.display = "block";
    if (data.isSuspicious) {
      finalResult.innerText = "Unsafe";
      finalResult.style.color = "red";
      resultsDiv.innerHTML = `
        <p style="color: red; font-weight: bold;">Phishing Risk Detected!</p>
        <ul>
          ${data.reasons.map((reason) => `<li>${reason}</li>`).join("")}
        </ul>
      `;
      document.getElementById("reportButton").style.display = "block";
    } else {
      finalResult.innerText = "Safe";
      finalResult.style.color = "green";
      resultsDiv.innerHTML = "<p>No phishing risks detected.</p>";
      document.getElementById("reportButton").style.display = "none";
    }
  
    // Add event listener to the report button
    document.getElementById("reportButton").onclick = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: getEmailDataForReporting,
        });
      });
    };
  }
  
  function analyzeEmailContent() {
    const email = {
      sender: document.querySelector(".zF")?.title || "Unknown Sender",
      subject: document.querySelector(".bog")?.innerText || "No Subject",
      body: document.querySelector(".y2")?.innerText || "No Body",
      links: Array.from(document.querySelectorAll("a")).map((link) => link.href),
    };
  
    const reasons = [];
    if (isSuspiciousSender(email.sender)) {
      reasons.push("Suspicious sender detected.");
    }
    if (isPhishingContent(email.subject, email.body)) {
      reasons.push("Potential phishing content detected.");
    }
    if (email.links.some((link) => isSuspiciousLink(link))) {
      reasons.push("Suspicious links detected.");
    }
  
    const isSuspicious = reasons.length > 0;
  
    // Send the analysis result back to the popup
    chrome.runtime.sendMessage({
      action: "analysisResult",
      data: { isSuspicious, reasons },
    });
  }
  
  function getEmailDataForReporting() {
    const email = {
      sender: document.querySelector(".zF")?.title || "Unknown Sender",
      subject: document.querySelector(".bog")?.innerText || "No Subject",
      body: document.querySelector(".y2")?.innerText || "No Body",
    };
  
    // Send the email data to the background script for reporting
    chrome.runtime.sendMessage({ action: "reportPhishing", emailData: email });
  }
  
  function isSuspiciousSender(sender) {
    const suspiciousDomains = ["paypa1.com", "fakebank.com"];
    return suspiciousDomains.some((domain) => sender.includes(domain));
  }
  
  function isPhishingContent(subject, body) {
    const redFlags = ["urgent", "password", "account suspended"];
    return redFlags.some((flag) => body.toLowerCase().includes(flag));
  }
  
  function isSuspiciousLink(link) {
    const suspiciousDomains = ["fakebank.com", "phishingsite.com"];
    return suspiciousDomains.some((domain) => link.includes(domain));
  }