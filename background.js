// background.js

const API_KEY = "AIzaSyBxXCLuODkM1KP0pTIUJ_mELUJdLzDuL9s";

async function getGeminiSummary(text, retries = 2) {
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

    if (!res.ok) {
      const errorData = await res.json();
      if (errorData.error?.code === 503 && retries > 0) {
        await new Promise(r => setTimeout(r, 2000));
        return getGeminiSummary(text, retries - 1);
      }
      return `⚠️ API Error: ${errorData.error?.message || "Unknown error"}`;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No summary generated.";
  } catch (err) {
    return "⚠️ Error calling Gemini API. Please try again later.";
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
