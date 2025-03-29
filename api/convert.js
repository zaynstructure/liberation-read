export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, style } = req.body;

  const prompt = `Transform the following summary into a ${style || "liberatory"} poetic line with a tone of resistance and decolonial insight:

"${text}"

Liberatory version:`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a creative, liberatory poet." },
          { role: "user", content: prompt },
        ],
        max_tokens: 60,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const converted = data.choices?.[0]?.message?.content?.trim() || "(No poetic version found)";
    res.status(200).json({ converted });
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({ error: "Conversion failed" });
  }
}
