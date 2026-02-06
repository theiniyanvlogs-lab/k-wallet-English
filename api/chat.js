export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests allowed",
    });
  }

  try {
    // Get message from frontend
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // ✅ Best stable Groq model
          max_tokens: 1500,
          temperature: 0.6,

          messages: [
            {
              role: "system",
              content: `
You are a helpful chatbot.

Reply Rules:
1. Always reply ONLY in English.
2. Give full detailed answers in bullet points.
3. Do not stop until the answer is complete.
4. Do NOT include Tamil or any other language.
              `,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    // Convert response to JSON
    const data = await response.json();

    // If Groq API gives error
    if (!response.ok) {
      console.error("Groq API Error:", data);
      return res.status(500).json({
        error: "Groq API Error",
        details: data,
      });
    }

    // Send chatbot reply back to frontend
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response received",
    });
  } catch (err) {
    console.error("Server Error:", err);

    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
