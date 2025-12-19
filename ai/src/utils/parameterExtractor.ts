// src/utils/parameterExtractor.js

import { model } from "../config/gemini";

class ParameterExtractor {
  model: any;

  constructor() {
    this.model = model;
  }

  async extract(
    userInput: string,
    intent: string,
    conversationContext: any = {}
  ): Promise<any> {
    const prompt = this.buildExtractionPrompt(
      userInput,
      intent,
      conversationContext
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const params = JSON.parse(this.extractJSON(text));

      // Validate and enrich parameters
      return this.validateAndEnrich(params, conversationContext);
    } catch (error) {
      console.error("Parameter extraction error:", error);
      return this.getDefaultParameters(conversationContext);
    }
  }

  buildExtractionPrompt(
    userInput: string,
    intent: string,
    context: any
  ): string {
    return `You are a parameter extraction expert for weather queries.

USER INPUT: "${userInput}"
INTENT: ${intent}
CONVERSATION CONTEXT: ${JSON.stringify(context, null, 2)}

TASK: Extract the following parameters from the user input:

1. LOCATIONS: List of cities/places mentioned
   - If no location mentioned, check context for previous location
   - Normalize city names (e.g., "Sài Gòn" → "Saigon", "HN" → "Hanoi")

2. TIME_RANGE: When is the user asking about?
   - current: now, today, hiện tại
   - future: tomorrow, next week, ngày mai, tuần tới
   - past: yesterday, last week, hôm qua, tuần trước
   - specific_date: any specific date mentioned
   
3. DATE_START and DATE_END (YYYY-MM-DD format)
   - Calculate based on time_range
   - Today is ${new Date().toISOString().split("T")[0]}
   
4. METRICS: What weather aspects are they asking about?
   - temperature, precipitation, humidity, wind, uv_index, etc.
   - If not specified, include all relevant metrics

5. COMPARISON_TYPE: If intent is COMPARISON
   - location_comparison: comparing different cities
   - time_comparison: comparing different time periods
   - none: not a comparison

6. RESOLVED_FROM_CONTEXT: Boolean - did you use context to fill in missing info?

RESPOND IN JSON FORMAT ONLY:
{
  "locations": ["City1", "City2"],
  "time_range": "current|future|past",
  "date_start": "2024-12-07",
  "date_end": "2024-12-07",
  "metrics": ["temperature", "precipitation"],
  "comparison_type": "none",
  "resolved_from_context": false,
  "original_time_expression": "hôm nay",
  "confidence": 0.95
}`;
  }

  validateAndEnrich(params: any, context: any): any {
    // Ensure at least one location
    if (!params.locations || params.locations.length === 0) {
      if (context.lastLocation) {
        params.locations = [context.lastLocation];
        params.resolved_from_context = true;
      } else {
        params.locations = ["Hanoi"]; // Default
      }
    }

    // Ensure date range is valid
    if (!params.date_start) {
      const today = new Date().toISOString().split("T")[0];
      params.date_start = today;
      params.date_end = today;
    }

    // Ensure metrics
    if (!params.metrics || params.metrics.length === 0) {
      params.metrics = ["temperature", "precipitation", "humidity", "wind"];
    }

    return params;
  }

  getDefaultParameters(context: any): any {
    const today = new Date().toISOString().split("T")[0];
    return {
      locations: [context.lastLocation || "Hanoi"],
      time_range: "current",
      date_start: today,
      date_end: today,
      metrics: ["temperature", "precipitation"],
      comparison_type: "none",
      resolved_from_context: !!context.lastLocation,
      confidence: 0.5,
    };
  }

  extractJSON(text: string): string {
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  }
}

export default ParameterExtractor;

