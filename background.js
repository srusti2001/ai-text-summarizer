// background.js

const API_KEY = "AIzaSyBxXCLuODkM1KP0pTIUJ_mELUJdLzDuL9s";

async function getGeminiSummary(text) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
        }),
      }
    );

    const data = await res.json();
    console.log("Gemini raw response:", data);
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No summary generated."
    );
  } catch (err) {
    console.error("Gemini API error:", err);
    return "⚠️ Error calling Gemini API.";
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "summarize") {
    getGeminiSummary(message.text).then((summary) => {
      sendResponse({ summary });
    });
    return true;
  }
});
