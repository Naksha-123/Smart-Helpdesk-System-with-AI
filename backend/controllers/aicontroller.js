const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateAIResponse = async (title, description, category, history = []) => {
  const systemPrompt = `You are an expert helpdesk AI assistant.
Your job is to:
1. Provide clear, helpful responses to customer issues.
2. Offer step-by-step troubleshooting solutions when relevant.
3. Be concise but thorough.
4. If a solution needs human intervention, advise the customer to wait for an agent.
Category of this ticket: ${category}
Keep responses under 200 words. Use bullet points where helpful.`;

  const userMessage = history.length > 1
    ? `Ticket: "${title}"\nLatest message: ${description}`
    : `Ticket: "${title}"\nIssue: ${description}\nProvide a helpful response.`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    max_tokens: 400,
  });

  return response.choices[0].message.content;
};

module.exports = { generateAIResponse };