require('dotenv').config();
const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
    try {
        console.log("Testing Groq...");
        const response = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 100,
            messages: [
                {
                    role: 'system',
                    content: 'You are a test bot.'
                },
                {
                    role: 'user',
                    content: 'Say hello.'
                }
            ]
        });
        console.log("Response:", response.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
