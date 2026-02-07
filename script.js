// ===============================
// ✅ Chatbot Send Message Function
// ===============================
async function sendMessage() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();

  if (msg === "") return;

  let chatBox = document.getElementById("chatBox");

  // ✅ Disable input while sending
  input.disabled = true;

  // ===============================
  // Show User Message (Safe)
  // ===============================
  chatBox.innerHTML += `
    <div class="msg user">${escapeHTML(msg)}</div>
  `;

  input.value = "";

  // ===============================
  // Bot Placeholder
  // ===============================
  let botDiv = document.createElement("div");
  botDiv.className = "msg bot";
  botDiv.innerHTML = `<p class="eng">🤖 Thinking...</p>`;
  chatBox.appendChild(botDiv);

  scrollToBottom(chatBox);

  try {
    // ===============================
    // Call Backend API (/api/chat)
    // ===============================
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: msg })
    });

    let data = await response.json();

    // ===============================
    // Handle API Errors
    // ===============================
    if (!response.ok || data.error) {
      botDiv.innerHTML = `
        <p class="eng">⚠️ Error: ${data.error || "Something went wrong"}</p>
      `;
      input.disabled = false;
      return;
    }

    // ===============================
    // Show Bot Reply
    // ===============================
    if (!data.reply) {
      botDiv.innerHTML = `<p class="eng">⚠️ No reply received</p>`;
      input.disabled = false;
      return;
    }

    botDiv.innerHTML = `
      <p class="eng">${escapeHTML(data.reply).replace(/\n/g, "<br>")}</p>
    `;

  } catch (err) {
    botDiv.innerHTML = `
      <p class="eng">❌ Server not responding. Please try again.</p>
    `;
  }

  // ✅ Enable input again
  input.disabled = false;
  input.focus();

  scrollToBottom(chatBox);
}

// ===============================
// ✅ Voice Input Function (🎤 Added)
// ===============================
function startVoice() {

  // Check Browser Support
  if (!("webkitSpeechRecognition" in window)) {
    alert("❌ Voice recognition not supported in this browser.");
    return;
  }

  let recognition = new webkitSpeechRecognition();

  // Language Setting
  recognition.lang = "en-US";

  // Start Voice Listening
  recognition.start();

  // Show Listening Status
  document.getElementById("userInput").placeholder = "🎤 Listening... Speak now";

  // When Voice Result Comes
  recognition.onresult = function (event) {
    let voiceText = event.results[0][0].transcript;

    // Put Voice Text into Input Box
    document.getElementById("userInput").value = voiceText;

    // Restore Placeholder
    document.getElementById("userInput").placeholder = "Type your message...";
  };

  // Error Handling
  recognition.onerror = function () {
    alert("⚠️ Voice input error. Try again.");
    document.getElementById("userInput").placeholder = "Type your message...";
  };

  // When Voice Stops
  recognition.onend = function () {
    document.getElementById("userInput").placeholder = "Type your message...";
  };
}

// ===============================
// ✅ Clear Chat Button Function
// ===============================
function clearChat() {
  document.getElementById("chatBox").innerHTML = "";
}

// ===============================
// ✅ Auto Scroll Function
// ===============================
function scrollToBottom(chatBox) {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
// ✅ Escape HTML (Security Fix)
// ===============================
function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===============================
// ✅ Enter Key Support
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  let input = document.getElementById("userInput");

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
});
