document.addEventListener("DOMContentLoaded", () => {
  const MAX_CHARS = 1000;

  const outputEl = document.getElementById("output");
  const summarizeBtn = document.getElementById("summarizeBtn");
  const copyBtn = document.getElementById("copyBtn");
  const modeSelect = document.getElementById("modeSelect");
  const loadingEl = document.getElementById("loading");
  const charCountEl = document.getElementById("charCount");

  if (!outputEl || !summarizeBtn || !copyBtn || !modeSelect || !loadingEl || !charCountEl) {
    console.error("One or more popup elements are missing.");
    return;
  }

  summarizeBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => window.getSelection().toString(),
        },
        (selectionResults) => {
          let selectedText = selectionResults[0]?.result?.trim() || "";
          const charLength = selectedText.length;

          // Update character counter
          charCountEl.innerText = `Selected text: ${Math.min(charLength, MAX_CHARS)} / ${MAX_CHARS}`;

          if (!selectedText) {
            outputEl.innerText = "⚠️ Please select some text first.";
            outputEl.classList.add("show");
            return;
          }

          // Truncate text if too long
          if (charLength > MAX_CHARS) {
            selectedText = selectedText.substring(0, MAX_CHARS);
            outputEl.innerText = `⚠️ Text truncated to ${MAX_CHARS} characters.`;
            outputEl.classList.add("show");
          } else {
            outputEl.innerText = "";
            outputEl.classList.remove("show");
          }

          loadingEl.style.display = "block";

          // Send to background.js or API
          chrome.runtime.sendMessage(
            { action: "summarize", text: buildPrompt(selectedText, modeSelect.value) },
            (response) => {
              loadingEl.style.display = "none";
              if (response && response.summary) {
                outputEl.innerText = response.summary;
                outputEl.classList.add("show");
              } else {
                outputEl.innerText = "⚠️ Failed to get summary.";
                outputEl.classList.add("show");
              }
            }
          );
        }
      );
    });
  });

  copyBtn.addEventListener("click", () => {
    const text = outputEl.innerText;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerText = "✅ Copied!";
        setTimeout(() => (copyBtn.innerText = "Copy Result"), 1500);
      });
    }
  });

  function buildPrompt(text, mode) {
    switch (mode) {
      case "simplify":
        return `Rewrite this in simple English:\n\n${text}`;
      case "bullets":
        return `Summarize this text into clear bullet points:\n\n${text}`;
      case "translate":
        return `Translate this text into Hindi:\n\n${text}`;
      default:
        return `Summarize this text clearly:\n\n${text}`;
    }
  }
});
