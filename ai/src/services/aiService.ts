import IntentClassifier from "../utils/intentClassifier";
import ParameterExtractor from "../utils/parameterExtractor";
import WeatherService from "./weatherService";
import ContextService from "./contextService";
import ResponseGenerator from "../utils/responseGenerator";

// Type definitions
interface WeatherData {
  [key: string]: any;
  current?: any;
  forecast?: { [key: string]: any };
  daily?: {
    time: string[];
    temperature_2m_mean?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    rain_sum?: number[];
    wind_speed_10m_max?: number[];
    precipitation_probability_max?: number[];
    uv_index_max?: number[];
  };
  error?: string;
}

interface WeatherAnalysis {
  [key: string]: any;
  current?: any;
  forecast?: { [key: string]: any };
}

class AIService {
  intentClassifier: IntentClassifier;
  parameterExtractor: ParameterExtractor;
  weatherService: WeatherService;
  contextService: ContextService;
  responseGenerator: ResponseGenerator;

  constructor() {
    this.intentClassifier = new IntentClassifier();
    this.parameterExtractor = new ParameterExtractor();
    this.weatherService = new WeatherService();
    this.contextService = new ContextService();
    this.responseGenerator = new ResponseGenerator();
  }

  async processQuery(userInput: string, sessionId: string = "default") {
    try {
      console.log(`\n🔍 Processing query: "${userInput}"`);

      // Step 1: Get conversation context
      const context = this.contextService.getContext(sessionId);
      const contextSummary =
        this.contextService.getConversationSummary(sessionId);

      // Step 2: Classify intent
      console.log("📊 Classifying intent...");
      const intentResult = await this.intentClassifier.classify(
        userInput,
        contextSummary
      );


      if (intentResult.intent === "GENERAL_CHAT") {
        const result = this.handleGeneralChat(userInput);
        // ✅ FIX: Update context before returning
        this.contextService.updateContext(
          sessionId,
          userInput,
          intentResult.intent,
          {}, // No parameters for general chat
          result.response
        );
        return result;
      }

      if (
        intentResult.intent === "CLARIFICATION" &&
        intentResult.confidence < 0.5
      ) {
        const result = this.handleClarification(userInput, contextSummary);
        // ✅ FIX: Update context before returning
        this.contextService.updateContext(
          sessionId,
          userInput,
          intentResult.intent,
          {}, // No parameters for clarification
          result.response
        );
        return result;
      }

      // Step 4: Extract parameters
      console.log("🔧 Extracting parameters...");
      const parameters = await this.parameterExtractor.extract(
        userInput,
        intentResult.intent,
        contextSummary
      );
      console.log("✅ Parameters:", JSON.stringify(parameters, null, 2));

      // Step 5: Fetch weather data based on intent
      console.log("🌤️ Fetching weather data...");
      const weatherData = await this.fetchWeatherData(
        intentResult.intent,
        parameters
      );
      console.log("✅ Weather data fetched");

      // Step 6: Analyze data based on intent
      console.log("🧠 Analyzing data...");
      const analysis = await this.analyzeWeatherData(
        intentResult.intent,
        weatherData,
        parameters
      );

      // Step 7: Generate natural language response
      console.log("💬 Generating response...");
      const response = await this.responseGenerator.generate(
        userInput,
        intentResult.intent,
        parameters,
        analysis,
        context.preferences.language
      );

      // Step 8: Update context
      this.contextService.updateContext(
        sessionId,
        userInput,
        intentResult.intent,
        parameters,
        response
      );

      console.log("✅ Query processed successfully\n");

      return {
        success: true,
        response,
        metadata: {
          intent: intentResult.intent,
          confidence: intentResult.confidence,
          parameters,
          usedContext: parameters.resolved_from_context,
        },
      };
    } catch (error) {
      console.error("❌ Error processing query:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        response: `Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }

  async fetchWeatherData(
    intent: string,
    parameters: any
  ): Promise<WeatherData> {
    const { locations, time_range, date_start, date_end } = parameters;

    switch (intent) {
      case "CURRENT_WEATHER":
        return await this.fetchCurrentWeather(locations);

      case "FORECAST":
        return await this.fetchForecast(locations, date_start, date_end);

      case "HISTORICAL_QUERY":
        return await this.fetchHistorical(locations, date_start, date_end);

      case "COMPARISON":
        if (parameters.comparison_type === "location_comparison") {
          return await this.fetchMultipleLocations(
            locations,
            time_range,
            date_start,
            date_end
          );
        } else {
          return await this.fetchTimeComparison(
            locations[0],
            date_start,
            date_end
          );
        }

      case "TREND_ANALYSIS":
      case "EXTREME_EVENTS":
      case "STATISTICAL_INFO":
        return await this.fetchHistorical(locations, date_start, date_end);

      case "RECOMMENDATION":
      case "HEALTH_SAFETY":
      case "PLANNING":
        // Fetch both current and forecast
        const current = await this.fetchCurrentWeather(locations);
        const forecast = await this.fetchForecast(
          locations,
          date_start,
          date_end
        );
        return { current, forecast };

      default:
        return await this.fetchCurrentWeather(locations);
    }
  }

  async fetchCurrentWeather(locations: string[]): Promise<WeatherData> {
    const results: WeatherData = {};
    for (const location of locations) {
      try {
        results[location] = await this.weatherService.getCurrentWeather(
          location
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results[location] = { error: errorMessage };
      }
    }
    return results;
  }

  async fetchForecast(
    locations: string[],
    startDate: string,
    endDate: string
  ): Promise<WeatherData> {
    const results: WeatherData = {};
    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (const location of locations) {
      try {
        results[location] = await this.weatherService.getForecast(
          location,
          days
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results[location] = { error: errorMessage };
      }
    }
    return results;
  }

  async fetchHistorical(
    locations: string[],
    startDate: string,
    endDate: string
  ): Promise<WeatherData> {
    const results: WeatherData = {};
    for (const location of locations) {
      try {
        results[location] = await this.weatherService.getHistoricalWeather(
          location,
          startDate,
          endDate
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results[location] = { error: errorMessage };
      }
    }
    return results;
  }

  async fetchMultipleLocations(
    locations: string[],
    timeRange: string,
    startDate: string,
    endDate: string
  ): Promise<WeatherData> {
    if (timeRange === "current") {
      return await this.fetchCurrentWeather(locations);
    } else if (timeRange === "future") {
      return await this.fetchForecast(locations, startDate, endDate);
    } else {
      return await this.fetchHistorical(locations, startDate, endDate);
    }
  }

  async fetchTimeComparison(
    location: string,
    startDate: string,
    endDate: string
  ): Promise<WeatherData> {
    // Fetch historical data for comparison
    return await this.weatherService.getHistoricalWeather(
      location,
      startDate,
      endDate
    );
  }

  async analyzeWeatherData(
    intent: string,
    weatherData: WeatherData,
    parameters: any
  ): Promise<any> {
    switch (intent) {
      case "CURRENT_WEATHER":
        return this.analyzeCurrentWeather(weatherData);

      case "COMPARISON":
        return this.analyzeComparison(weatherData, parameters);

      case "TREND_ANALYSIS":
        return this.analyzeTrend(weatherData);

      case "EXTREME_EVENTS":
        return this.analyzeExtremes(weatherData);

      case "STATISTICAL_INFO":
        return this.analyzeStatistics(weatherData);

      case "RECOMMENDATION":
        return this.analyzeForRecommendation(weatherData);

      default:
        return weatherData;
    }
  }

  analyzeCurrentWeather(weatherData: WeatherData): any {
    const analysis: any = {};

    for (const [city, data] of Object.entries(weatherData)) {
      if (data.error) {
        analysis[city] = { error: data.error };
        continue;
      }

      const current = data.current;
      const condition = this.weatherService.getWeatherCondition(
        current.weather_code
      );

      analysis[city] = {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        condition: condition,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        isRaining: current.precipitation > 0,
        cloudCover: current.cloud_cover,
        // Add comfort analysis
        comfort: this.getComfortLevel(
          current.temperature_2m,
          current.relative_humidity_2m
        ),
        weatherCode: current.weather_code,
      };
    }

    return analysis;
  }

  analyzeComparison(weatherData: WeatherData, parameters: any): any {
    if (parameters.comparison_type === "location_comparison") {
      return this.compareLocations(weatherData);
    } else {
      return this.compareTimePeriodsAnalysis(weatherData);
    }
  }

  compareLocations(weatherData: WeatherData): any {
    const comparison: {
      cities: {
        [key: string]: { temp: number; humidity: number; wind: number };
      };
      hottest: { city: string; temp: number } | null;
      coldest: { city: string; temp: number } | null;
      mostHumid: { city: string; humidity: number } | null;
      windiest: { city: string; wind: number } | null;
    } = {
      cities: {},
      hottest: null,
      coldest: null,
      mostHumid: null,
      windiest: null,
    };

    let maxTemp = -Infinity;
    let minTemp = Infinity;
    let maxHumidity = -Infinity;
    let maxWind = -Infinity;

    for (const [city, data] of Object.entries(weatherData)) {
      if (data.error) continue;

      let temp, humidity, wind;

      if (data.current) {
        // Current weather comparison
        temp = data.current.temperature_2m;
        humidity = data.current.relative_humidity_2m;
        wind = data.current.wind_speed_10m;
      } else if (data.daily) {
        // Historical/forecast comparison - use average
        const temps =
          data.daily.temperature_2m_mean || data.daily.temperature_2m_max || [];
        temp =
          temps.length > 0
            ? temps.reduce((a: number, b: number) => a + b, 0) / temps.length
            : 0;
        humidity = 0; // Not always available in historical
        wind =
          data.daily.wind_speed_10m_max &&
          data.daily.wind_speed_10m_max.length > 0
            ? data.daily.wind_speed_10m_max.reduce(
                (a: number, b: number) => a + b,
                0
              ) / data.daily.wind_speed_10m_max.length
            : 0;
      }

      comparison.cities[city] = { temp, humidity, wind };

      // Track extremes
      if (temp > maxTemp) {
        maxTemp = temp;
        comparison.hottest = { city, temp };
      }
      if (temp < minTemp) {
        minTemp = temp;
        comparison.coldest = { city, temp };
      }
      if (humidity > maxHumidity) {
        maxHumidity = humidity;
        comparison.mostHumid = { city, humidity };
      }
      if (wind > maxWind) {
        maxWind = wind;
        comparison.windiest = { city, wind };
      }
    }

    return comparison;
  }

  compareTimePeriodsAnalysis(weatherData: WeatherData): any {
    // Analyze temporal changes
    const city = Object.keys(weatherData)[0];
    if (!city) return { error: "No city data available" };
    const data = weatherData[city];

    if (!data.daily) return { error: "No daily data available" };

    const temps =
      data.daily.temperature_2m_mean || data.daily.temperature_2m_max || [];
    const precip = data.daily.precipitation_sum || data.daily.rain_sum || [];

    return {
      temperature: {
        average:
          temps.reduce((a: number, b: number) => a + b, 0) / temps.length,
        max: Math.max(...temps),
        min: Math.min(...temps),
        trend: this.calculateTrend(temps),
      },
      precipitation: {
        total: precip.reduce((a: number, b: number) => a + b, 0),
        average:
          precip.reduce((a: number, b: number) => a + b, 0) / precip.length,
        rainyDays: precip.filter((p: number) => p > 1).length,
      },
      dates: data.daily.time,
    };
  }

  analyzeTrend(weatherData: WeatherData): any {
    const city = Object.keys(weatherData)[0];
    if (!city) return { error: "No city data available" };
    const data = weatherData[city];

    if (!data.daily) return { error: "No daily data available" };

    const temps =
      data.daily.temperature_2m_mean || data.daily.temperature_2m_max || [];
    const dates = data.daily.time || [];

    const trend = this.calculateTrend(temps);
    const change = temps.length > 0 ? temps[temps.length - 1] - temps[0] : 0;

    return {
      trend: trend, // 'increasing', 'decreasing', 'stable'
      totalChange: change,
      averageTemp:
        temps.length > 0
          ? temps.reduce((a: number, b: number) => a + b, 0) / temps.length
          : 0,
      dataPoints: temps.map((temp: number, i: number) => ({
        date: dates[i],
        temperature: temp,
      })),
      interpretation: this.interpretTrend(trend, change),
    };
  }

  analyzeExtremes(weatherData: WeatherData): any {
    const city = Object.keys(weatherData)[0];
    if (!city) return { error: "No city data available" };
    const data = weatherData[city];

    if (!data.daily) return { error: "No daily data available" };

    const temps =
      data.daily.temperature_2m_max || data.daily.temperature_2m_mean || [];
    const precip = data.daily.precipitation_sum || data.daily.rain_sum || [];
    const dates = data.daily.time || [];

    // Find extremes
    const maxTempIdx = temps.indexOf(Math.max(...temps));
    const minTempIdx = temps.indexOf(Math.min(...temps));
    const maxPrecipIdx =
      precip.length > 0 ? precip.indexOf(Math.max(...precip)) : -1;

    return {
      hottestDay: {
        date: dates[maxTempIdx],
        temperature: temps[maxTempIdx],
      },
      coldestDay: {
        date: dates[minTempIdx],
        temperature: temps[minTempIdx],
      },
      rainiestDay:
        maxPrecipIdx >= 0
          ? {
              date: dates[maxPrecipIdx],
              precipitation: precip[maxPrecipIdx],
            }
          : null,
      temperatureRange: Math.max(...temps) - Math.min(...temps),
    };
  }

  analyzeStatistics(weatherData: WeatherData): any {
    const city = Object.keys(weatherData)[0];
    if (!city) return { error: "No city data available" };
    const data = weatherData[city];

    if (!data.daily) return { error: "No daily data available" };

    const temps =
      data.daily.temperature_2m_mean || data.daily.temperature_2m_max || [];
    const precip = data.daily.precipitation_sum || data.daily.rain_sum || [];

    return {
      temperature: {
        mean:
          temps.length > 0
            ? temps.reduce((a: number, b: number) => a + b, 0) / temps.length
            : 0,
        median: this.calculateMedian(temps),
        max: temps.length > 0 ? Math.max(...temps) : 0,
        min: temps.length > 0 ? Math.min(...temps) : 0,
        stdDev: this.calculateStdDev(temps),
      },
      precipitation:
        precip.length > 0
          ? {
              total: precip.reduce((a: number, b: number) => a + b, 0),
              mean:
                precip.reduce((a: number, b: number) => a + b, 0) /
                precip.length,
              rainyDays: precip.filter((p: number) => p > 1).length,
              rainyDaysPercent:
                (precip.filter((p: number) => p > 1).length / precip.length) *
                100,
            }
          : null,
      dataPoints: temps.length,
    };
  }

  analyzeForRecommendation(weatherData: WeatherData): WeatherAnalysis {
    // Analyze both current and forecast for recommendations
    const analysis: WeatherAnalysis = {};

    if (weatherData.current) {
      const currentAnalysis = this.analyzeCurrentWeather(weatherData.current);
      analysis.current = currentAnalysis;
    }

    if (weatherData.forecast) {
      const forecastAnalysis: { [key: string]: any } = {};
      for (const [city, data] of Object.entries(weatherData.forecast)) {
        if ((data as any).error) continue;

        // Analyze next few days for planning
        const daily = (data as any).daily;
        const nextDays = [];

        for (let i = 0; i < Math.min(7, daily.time.length); i++) {
          nextDays.push({
            date: daily.time[i],
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            precipitation: daily.precipitation_probability_max[i],
            uvIndex: daily.uv_index_max[i],
            suitable: this.calculateSuitability(
              daily.temperature_2m_max[i],
              daily.precipitation_probability_max[i],
              daily.uv_index_max[i]
            ),
          });
        }

        forecastAnalysis[city] = {
          nextDays,
          bestDay: nextDays.reduce((best, day) =>
            day.suitable > best.suitable ? day : best
          ),
        };
      }
      analysis.forecast = forecastAnalysis;
    }

    return analysis;
  }

  // Helper functions
  getComfortLevel(temp: number, humidity: number): string {
    // Simple comfort index
    if (temp < 10) return "rất lạnh";
    if (temp < 18) return "lạnh";
    if (temp < 24) return "mát mẻ";
    if (temp < 28) return "dễ chịu";
    if (temp < 32) return "hơi nóng";
    if (temp < 35) return "nóng";
    return "rất nóng";
  }

  calculateTrend(values: number[]): string {
    // Simple linear trend
    const n = values.length;
    if (n === 0) return "stable";
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const val = values[i];
      if (val === undefined) continue;
      sumX += i;
      sumY += val;
      sumXY += i * val;
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (slope > 0.5) return "increasing";
    if (slope < -0.5) return "decreasing";
    return "stable";
  }

  interpretTrend(trend: string, change: number): string {
    if (trend === "increasing") {
      return `Xu hướng tăng (+${change.toFixed(1)}°C)`;
    } else if (trend === "decreasing") {
      return `Xu hướng giảm (${change.toFixed(1)}°C)`;
    } else {
      return "Xu hướng ổn định";
    }
  }

  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      const val1 = sorted[mid - 1];
      const val2 = sorted[mid];
      if (val1 === undefined || val2 === undefined) return 0;
      return (val1 + val2) / 2;
    }
    const val = sorted[mid];
    return val !== undefined ? val : 0;
  }

  calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean =
      values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance =
      squaredDiffs.reduce((a: number, b: number) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateSuitability(
    temp: number,
    precipProb: number,
    uvIndex: number
  ): number {
    // Score from 0-100 for outdoor activities
    let score = 100;

    // Temperature penalty
    if (temp < 15 || temp > 35) score -= 30;
    else if (temp < 20 || temp > 32) score -= 15;

    // Rain penalty
    score -= precipProb * 0.8;

    // UV penalty (too high is bad)
    if (uvIndex > 8) score -= 20;
    else if (uvIndex > 6) score -= 10;

    return Math.max(0, score);
  }

  handleGeneralChat(userInput: string): any {
    const greetings = ["xin chào", "hello", "hi", "chào bạn"];
    const thanks = ["cảm ơn", "thanks", "thank you", "cám ơn"];

    const lowerInput = userInput.toLowerCase();

    if (greetings.some((g) => lowerInput.includes(g))) {
      return {
        success: true,
        response:
          "Xin chào! 👋 Tôi là trợ lý thời tiết AI. Bạn có thể hỏi tôi về thời tiết ở bất kỳ đâu nhé!\n\nVí dụ:\n• Hôm nay Hà Nội thế nào?\n• Tuần tới có mưa không?\n• So sánh thời tiết Sài Gòn và Đà Nẵng",
        metadata: { intent: "GENERAL_CHAT" },
      };
    }

    if (thanks.some((t) => lowerInput.includes(t))) {
      return {
        success: true,
        response: "Không có gì! 😊 Còn câu hỏi gì về thời tiết không?",
        metadata: { intent: "GENERAL_CHAT" },
      };
    }

    return {
      success: true,
      response:
        "Tôi là trợ lý thời tiết AI, tôi có thể giúp bạn tra cứu thông tin thời tiết. Bạn muốn biết thời tiết ở đâu? 🌤️",
      metadata: { intent: "GENERAL_CHAT" },
    };
  }

  handleClarification(userInput: string, context: any): any {
    let suggestion = "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. ";

    if (context.lastLocation) {
      suggestion += `Bạn muốn hỏi về thời tiết ở ${context.lastLocation} phải không?`;
    } else {
      suggestion +=
        "Bạn có thể hỏi cụ thể hơn được không?\n\nVí dụ:\n• Hôm nay Hà Nội thế nào?\n• Ngày mai có mưa không?\n• So sánh Sài Gòn và Đà Nẵng";
    }

    return {
      success: true,
      response: suggestion,
      metadata: { intent: "CLARIFICATION" },
    };
  }
}

export default AIService;

