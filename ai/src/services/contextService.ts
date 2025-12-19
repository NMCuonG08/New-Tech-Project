// src/services/contextService.ts

interface ConversationEntry {
  timestamp: string;
  userInput: string;
  intent: string | null;
  parameters: any;
  aiResponse: string;
}

interface Context {
  conversationHistory: ConversationEntry[];
  lastLocation: string | null;
  lastTimeRange: string | null;
  lastIntent: string | null;
  mentionedLocations: string[];
  preferences: {
    language: string;
    units: string;
  };
  sessionStartTime: string;
}

class ContextService {
  private contexts: Map<string, Context>;
  private maxHistoryLength: number;

  constructor() {
    // Store contexts by session ID
    this.contexts = new Map();
    this.maxHistoryLength = 10;
  }

  // Get context for a session
  getContext(sessionId: string): Context {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, this.createNewContext());
    }
    const context = this.contexts.get(sessionId);
    // This should never be undefined because we just set it above
    if (!context) {
      throw new Error("Failed to get or create context");
    }
    return context;
  }

  // Create new empty context
  createNewContext(): Context {
    return {
      conversationHistory: [],
      lastLocation: null,
      lastTimeRange: null,
      lastIntent: null,
      mentionedLocations: [],
      preferences: {
        language: "vi", // vi or en
        units: "metric",
      },
      sessionStartTime: new Date().toISOString(),
    };
  }

  // Update context after each interaction
  updateContext(
    sessionId: string,
    userInput: string,
    intent: string | null,
    parameters: any,
    aiResponse: string
  ): void {
    const context = this.getContext(sessionId);

    // Add to conversation history
    context.conversationHistory.push({
      timestamp: new Date().toISOString(),
      userInput,
      intent,
      parameters,
      aiResponse: aiResponse.substring(0, 200), // Store truncated response
    });

    // Trim history if too long
    if (context.conversationHistory.length > this.maxHistoryLength) {
      context.conversationHistory = context.conversationHistory.slice(
        -this.maxHistoryLength
      );
    }

    // Update last location
    if (parameters.locations && parameters.locations.length > 0) {
      context.lastLocation = parameters.locations[0];

      // Track all mentioned locations
      parameters.locations.forEach((loc: string) => {
        if (!context.mentionedLocations.includes(loc)) {
          context.mentionedLocations.push(loc);
        }
      });
    }

    // Update last time range and intent
    context.lastTimeRange = parameters.time_range;
    context.lastIntent = intent;

    this.contexts.set(sessionId, context);
  }

  // Get conversation summary for AI context
  getConversationSummary(sessionId: string) {
    const context = this.getContext(sessionId);

    return {
      recentQueries: context.conversationHistory
        .slice(-3)
        .map((h: ConversationEntry) => ({
          input: h.userInput,
          intent: h.intent,
        })),
      lastLocation: context.lastLocation,
      mentionedLocations: context.mentionedLocations,
      language: context.preferences.language,
    };
  }

  // Clear context (logout or reset)
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  // Get all active sessions (for debugging)
  getActiveSessions(): string[] {
    return Array.from(this.contexts.keys());
  }
}

export default ContextService;

