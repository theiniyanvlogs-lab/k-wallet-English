async function sendMessage() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (msg === "") return;

  let chatBox = document.getElementById("chatBox");

  // Show user message
  chatBox.innerHTML += `
    <div class="msg user">${msg}</div>
  `;

  input.value = "";

  // Bot placeholder
  let botDiv = document.createElement("div");
  botDiv.className = "msg bot";
  botDiv.innerHTML = `<p class="eng">Thinking...</p>`;
  chatBox.appendChild(botDiv);

  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // Call backend API
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: msg })
    });

    let data = await response.json();

    // If API error
    if (data.error) {
      botDiv.innerHTML = `<p class="eng">Error: ${data.error}</p>`;
      return;
    }

    // If reply missing
    if (!data.reply) {
      botDiv.innerHTML = `<p class="eng">No reply received</p>`;
      return;
    }

    // ✅ Show only English reply
    botDiv.innerHTML = `
      <p class="eng">${data.reply.replace(/\n/g, "<br>")}</p>
    `;

  } catch (err) {
    botDiv.innerHTML = `<p class="eng">Server not responding</p>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

/* Clear Chat Button Function */
function clearChat() {
  document.getElementById("chatBox").innerHTML = "";
}
