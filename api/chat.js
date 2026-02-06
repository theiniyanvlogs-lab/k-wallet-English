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
          model: "llama3-8b-8192",
          max_tokens: 1500,
          temperature: 0.6,

          messages: [
            {
              role: "system",
              content: `
You are a helpful chatbot.

STRICT Reply Rules:
- Reply ONLY in bullet points.
- Every line must start with "- ".
- Do NOT write paragraphs.
- Do NOT use numbering (1,2,3).
- Do NOT add headings or titles.
- Reply ONLY in English.
- Give detailed but structured answers.
- Never include Tamil or any other language.
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
      reply: data.choices?.[0]?.message?.content || "- No response received",
    });
  } catch (err) {
    console.error("Server Error:", err);

    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
