import express from "express";
import OpenAI from "openai";
import auth from "../middleware/auth.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/chat", auth, async (req,res) => {
  try {
    const { message, summary } = req.body;

    const systemPrompt = `
You are a personal finance assistant.
Answer clearly and practically.
Use user's real finance data when provided.
Give short actionable advice.
Avoid hype and speculation.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
User finance summary:
${JSON.stringify(summary)}

Question:
${message}
`
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch(e) {
    console.error(e);
    res.status(500).json({ msg:"AI error" });
  }
});

export default router;