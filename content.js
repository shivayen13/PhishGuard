// Content script to analyze emails and display warnings
document.addEventListener("DOMContentLoaded", () => {
    observeEmails();
  });
  
  function observeEmails() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        analyzeEmails();
      });
    });
  
    // Observe the email list container
    const emailContainer = document.querySelector("#\\:3"); // Gmail-specific container
    if (emailContainer) {
      observer.observe(emailContainer, { childList: true, subtree: true });
    }
  }
  
  function analyzeEmails() {
    const emails = document.querySelectorAll(".zA"); // Gmail-specific selector for emails
    emails.forEach((email) => {
      const senderElement = email.querySelector(".zF");
      const subjectElement = email.querySelector(".bog");
      const bodyElement = email.querySelector(".y2");
  
      if (!senderElement || !subjectElement || !bodyElement) return;
  
      const sender = senderElement.title; // Sender's email address
      const subject = subjectElement.innerText; // Email subject
      const body = bodyElement.innerText; // Email body
  
      // Analyze sender
      if (isSuspiciousSender(sender)) {
        addWarning(email, "Suspicious sender detected.");
      }
  
      // Analyze content
      if (isPhishingContent(subject, body)) {
        addWarning(email, "Potential phishing content detected.");
      }
  
      // Analyze links
      const links = email.querySelectorAll("a");
      links.forEach((link) => {
        const href = link.href;
        chrome.runtime.sendMessage({ action: "verifyUrl", url: href }, (response) => {
          if (!response.safe) {
            addWarning(link, `Unsafe link: ${response.reason}`);
          }
        });
      });
    });
  }
  
  function isSuspiciousSender(sender) {
    // Example: Check for spoofed domains
    const suspiciousDomains = ["paypa1.com", "fakebank.com"];
    return suspiciousDomains.some((domain) => sender.includes(domain));
  }
  
  function isPhishingContent(subject, body) {
    // Example: Check for red flags
    const redFlags = ["urgent", "password", "account suspended"];
    return redFlags.some((flag) => body.toLowerCase().includes(flag));
  }
  
  function addWarning(element, message) {
    const warning = document.createElement("div");
    warning.style.color = "red";
    warning.style.fontWeight = "bold";
    warning.innerText = message;
    element.prepend(warning);
  }