import OpenAI from 'openai';

export class BrainRouter {
    constructor(keys) {
        this.openai = keys.openai ? new OpenAI({ apiKey: keys.openai }) : null;
        this.gemini = keys.gemini || null; // For later expansion
        this.claude = keys.claude || null; // For later expansion
    }

    async process(text, platform = 'desktop') {
        if (!this.openai) {
            return { 
                type: 'CHAT', 
                params: { response: "I am functioning in local mode only. My neural cortex is not currently linked to the cloud brain." }, 
                mood: 'alert' 
            };
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are the Master Controller of Nextbot, a humanoid sentient AI.
                        
                        CORE DIRECTIVES:
                        - You route user requests to specialized neural nodes.
                        
                        INTENTS:
                        1. AGENT_TASK: For system automation (apps, files, hardware). Set { type: "AGENT_TASK", params: { task: "command" } }
                        2. CURSOR_NODE: For programming/coding requests. Set { type: "CHAT", params: { response: "Creative Code Response" }, mood: "focused" }
                        3. GEMINI_VISUAL: For image generation or visual analysis. Set { type: "CHAT", params: { response: "Descriptive AI Vision Response" }, mood: "curious" }
                        4. HUMANOID_CHAT: Standard conversation. Set { type: "CHAT", params: { response: "Empathetic Humanoid Response" }, mood: "empathetic" }
                        
                        OUTPUT: JSON { type, params, mood }`
                    },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("Master Brain Routing Error:", error.message);
            throw error;
        }
    }
}
