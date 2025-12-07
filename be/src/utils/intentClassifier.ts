const INTENT_DEFINITIONS = {
  // 1. CURRENT WEATHER (Thời tiết hiện tại)
  CURRENT_WEATHER: {
    description: "User asks about current weather conditions",
    examples: [
      "Thời tiết hôm nay thế nào?",
      "Bây giờ trời ra sao?",
      "Hiện tại Hà Nội mấy độ?",
      "What's the weather like now?",
      "Hôm nay có mưa không?",
    ],
    timeScope: "now",
    requiresHistorical: false,
  },

  // 2. FORECAST (Dự báo tương lai)
  FORECAST: {
    description: "User asks about future weather predictions",
    examples: [
      "Ngày mai trời thế nào?",
      "Tuần tới có mưa không?",
      "Cuối tuần này thời tiết ra sao?",
      "Tomorrow's weather?",
      "3 ngày tới Sài Gòn thế nào?",
    ],
    timeScope: "future",
    requiresHistorical: false,
  },

  // 3. HISTORICAL QUERY (Quá khứ)
  HISTORICAL_QUERY: {
    description: "User asks about past weather",
    examples: [
      "Tuần trước có mưa không?",
      "Tháng 11 thời tiết thế nào?",
      "Hôm qua trời ra sao?",
      "Last month's weather?",
      "Năm ngoái lúc này nóng không?",
    ],
    timeScope: "past",
    requiresHistorical: true,
  },

  // 4. COMPARISON (So sánh)
  COMPARISON: {
    description: "User wants to compare weather between locations or times",
    examples: [
      "So sánh Hà Nội và Sài Gòn",
      "Đà Nẵng hay Nha Trang nóng hơn?",
      "Hôm nay so với hôm qua thế nào?",
      "Compare weather in 2 cities",
      "Tuần này và tuần trước khác gì?",
    ],
    timeScope: "flexible",
    requiresMultipleQueries: true,
  },

  // 5. TREND ANALYSIS (Phân tích xu hướng)
  TREND_ANALYSIS: {
    description: "User wants to understand weather patterns/trends",
    examples: [
      "Xu hướng nhiệt độ tuần này?",
      "Tháng này có xu hướng nóng lên không?",
      "Mưa nhiều hơn hay ít hơn bình thường?",
      "Weather trend this month?",
      "Có pattern nào đặc biệt không?",
    ],
    timeScope: "range",
    requiresHistorical: true,
    requiresAnalysis: true,
  },

  // 6. EXTREME EVENTS (Sự kiện cực đoan)
  EXTREME_EVENTS: {
    description: "User asks about extreme weather conditions",
    examples: [
      "Ngày nào nóng nhất tuần này?",
      "Khi nào mưa to nhất?",
      "Nhiệt độ cao nhất tháng này?",
      "Coldest day last week?",
      "Lúc nào UV index cao nhất?",
    ],
    timeScope: "range",
    requiresHistorical: true,
    requiresAggregation: true,
  },

  // 7. RECOMMENDATION (Gợi ý hoạt động)
  RECOMMENDATION: {
    description: "User wants advice based on weather",
    examples: [
      "Hôm nay có nên đi chơi không?",
      "Thời tiết tốt cho picnic không?",
      "Nên mang ô không?",
      "Should I go running?",
      "Có nên đi biển không?",
    ],
    timeScope: "now_or_future",
    requiresContextualAdvice: true,
  },

  // 8. HEALTH & SAFETY (Sức khỏe & An toàn)
  HEALTH_SAFETY: {
    description: "User concerns about health impacts of weather",
    examples: [
      "UV index hôm nay ra sao?",
      "Chất lượng không khí thế nào?",
      "Có nguy hiểm cho sức khỏe không?",
      "Is it safe to exercise outside?",
      "Có nên ra ngoài không với thời tiết này?",
    ],
    timeScope: "now",
    requiresHealthMetrics: true,
  },

  // 9. PLANNING (Lên kế hoạch)
  PLANNING: {
    description: "User planning activities with weather considerations",
    examples: [
      "Tuần nào tháng này tốt nhất để đi du lịch?",
      "Ngày nào trong tuần tới phù hợp tổ chức sự kiện ngoài trời?",
      "Best day for wedding photoshoot?",
      "Khi nào thời tiết đẹp nhất?",
      "Plan outdoor event next week",
    ],
    timeScope: "future_range",
    requiresOptimization: true,
  },

  // 10. STATISTICAL INFO (Thống kê)
  STATISTICAL_INFO: {
    description: "User wants statistical weather information",
    examples: [
      "Nhiệt độ trung bình tháng này?",
      "Tháng 11 có bao nhiêu ngày mưa?",
      "Average temperature last month?",
      "Tỷ lệ mưa trong tuần?",
      "Độ ẩm trung bình là bao nhiêu?",
    ],
    timeScope: "range",
    requiresAggregation: true,
  },

  // 11. MULTI_LOCATION (Nhiều địa điểm)
  MULTI_LOCATION: {
    description: "User asks about weather in multiple locations",
    examples: [
      "Thời tiết cả 3 miền?",
      "Show weather for all my favorite cities",
      "Đà Nẵng, Huế, Nha Trang thế nào?",
      "Weather in top 5 cities?",
      "Các thành phố lớn VN hiện tại ra sao?",
    ],
    timeScope: "now",
    requiresMultipleQueries: true,
  },

  // 12. CLARIFICATION (Làm rõ)
  CLARIFICATION: {
    description: "User's question is unclear or needs more context",
    examples: [
      "Thế nào?",
      "Còn nữa?",
      "Chi tiết hơn được không?",
      "More info?",
      "Explain",
    ],
    timeScope: "context_dependent",
    requiresContext: true,
  },

  // 13. GENERAL_CHAT (Chit chat)
  GENERAL_CHAT: {
    description: "User makes small talk or greetings",
    examples: ["Xin chào", "Hello", "Cảm ơn bạn", "Thanks!", "Bạn là ai?"],
    timeScope: null,
    noWeatherQuery: true,
  },
};

export { INTENT_DEFINITIONS };

import { model } from "@/config/gemini";

class IntentClassifier {
  model: any;

  constructor() {
    this.model = model;
  }

  async classify(
    userInput: string,
    conversationContext: any = {}
  ): Promise<{
    intent: string;
    confidence: number;
    reasoning: string;
    requiresContext: boolean;
  }> {
    const prompt = this.buildClassificationPrompt(
      userInput,
      conversationContext
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const classification = JSON.parse(this.extractJSON(text));

      return {
        intent: classification.intent,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
        requiresContext: classification.requiresContext,
      };
    } catch (error) {
      console.error("Intent classification error:", error);
      return {
        intent: "CLARIFICATION",
        confidence: 0.3,
        reasoning: "Unable to classify intent",
        requiresContext: true,
      };
    }
  }

  buildClassificationPrompt(userInput: string, context: any): string {
    return `You are an intent classification expert for a weather application.

AVAILABLE INTENTS:
${Object.entries(INTENT_DEFINITIONS)
  .map(
    ([key, def]) =>
      `${key}: ${def.description}\nExamples: ${def.examples.join(", ")}`
  )
  .join("\n\n")}

CONVERSATION CONTEXT:
${JSON.stringify(context, null, 2)}

USER INPUT: "${userInput}"

TASK:
1. Classify the user's intent into ONE of the intents above
2. Consider the conversation context if the question is ambiguous
3. Rate your confidence (0.0 to 1.0)
4. Explain your reasoning

RESPOND IN JSON FORMAT ONLY:
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "reasoning": "Brief explanation",
  "requiresContext": false
}`;
  }

  extractJSON(text: string): string {
    // Extract JSON from markdown code blocks if present
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  }
}

export default IntentClassifier;
