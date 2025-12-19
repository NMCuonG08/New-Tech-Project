// src/utils/responseGenerator.js

import { model } from "../config/gemini";

class ResponseGenerator {
  model: any;

  constructor() {
    this.model = model;
  }

  async generate(
    userInput: string,
    intent: string,
    parameters: any,
    analysis: any,
    language: string = "vi"
  ): Promise<string> {
    const prompt = this.buildGenerationPrompt(
      userInput,
      intent,
      parameters,
      analysis,
      language
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Response generation error:", error);
      return this.getFallbackResponse(analysis, language);
    }
  }

  buildGenerationPrompt(
    userInput: string,
    intent: string,
    parameters: any,
    analysis: any,
    language: string
  ): string {
    return `You are a friendly and helpful weather assistant.

USER QUESTION: "${userInput}"
INTENT: ${intent}
PARAMETERS: ${JSON.stringify(parameters, null, 2)}
WEATHER ANALYSIS: ${JSON.stringify(analysis, null, 2)}
LANGUAGE: ${language}

TASK: Generate a natural, conversational response in ${
      language === "vi" ? "Vietnamese" : "English"
    }.

GUIDELINES:
1. Be concise but informative
2. Use appropriate emojis (☀️🌧️❄️🌤️☁️🌡️💨💧)
3. Format numbers nicely (e.g., 28.5°C, not 28.483°C)
4. Add practical advice when relevant
5. Use friendly, conversational tone
6. If comparing data, highlight key differences
7. If showing trends, explain what it means
8. Round numbers to 1 decimal place maximum

RESPONSE STRUCTURE based on intent:

CURRENT_WEATHER:
- State current conditions clearly
- Mention "feels like" temperature if different
- Add comfort assessment
- Brief advice (e.g., "Nên mang ô" if raining)

FORECAST:
- Summarize forecast period
- Highlight notable days (hottest, rainiest, etc.)
- Give planning advice

COMPARISON:
- Clear comparison with numbers
- State which is better/worse for what
- Use "vs" or comparison language

TREND_ANALYSIS:
- Describe the pattern (increasing/decreasing/stable)
- Quantify the change
- Explain what it means

EXTREME_EVENTS:
- Highlight the extreme day/value
- Compare with normal
- Add context

STATISTICAL_INFO:
- Present stats clearly with labels
- Use bullet points if multiple stats
- Add interpretation

RECOMMENDATION:
- Give clear yes/no answer first
- Explain reasoning based on weather
- Suggest alternatives if weather is bad

FORMAT:
- Use line breaks for readability
- Use bullet points (•) for lists
- Use emojis sparingly but effectively
- Keep total response under 300 words

Generate the response now:`;
  }

  getFallbackResponse(analysis: any, language: string): string {
    // Simple fallback if AI generation fails
    if (language === "vi") {
      return `Dữ liệu thời tiết:\n${JSON.stringify(analysis, null, 2)}`;
    } else {
      return `Weather data:\n${JSON.stringify(analysis, null, 2)}`;
    }
  }
}

export default ResponseGenerator;

