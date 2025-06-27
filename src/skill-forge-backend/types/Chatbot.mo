import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

module {
  // Chat message types
  public type Message = {
    id: Text;
    role: MessageRole;
    content: Text;
    timestamp: Time.Time;
  };

  public type MessageRole = {
    #User;
    #Assistant;
    #System;
  };

  // Conversation session
  public type Conversation = {
    id: Text;
    userId: Principal;
    messages: [Message];
    status: ConversationStatus;
    createdAt: Time.Time;
    lastUpdated: Time.Time;
  };

  public type ConversationStatus = {
    #Active;
    #Completed;
    #Analyzing;      // NEW: AI sedang analyze
    #Abandoned;
  };

  // AI-generated career analysis
  public type CareerAnalysis = {
    suggestedPath: Text;           // "frontend", "backend", "data", etc
    confidence: Float;             // 0.0 - 1.0
    keySkills: [Text];            // ["React", "JavaScript", "CSS"]
    reasoning: Text;              // AI explanation
    questSuggestions: [Text];     // AI-generated quests
    skillTree: SkillTree;         // NEW: AI-generated skill tree
  };

  // NEW: AI-generated skill tree structure
  public type SkillTree = {
    pathName: Text;
    description: Text;
    nodes: [SkillNode];
  };

  public type SkillNode = {
    id: Text;
    name: Text;
    description: Text;
    level: Nat;                   // 1-5 (beginner to expert)
    prerequisites: [Text];        // IDs of required skills
    xpRequired: Nat;
    category: SkillCategory;
  };

  public type SkillCategory = {
    #Core;
    #Technical;
    #Tools;
    #Soft;
  };

  // Request/Response types
  public type ChatRequest = {
    conversationId: ?Text;
    message: Text;
  };

  public type ChatResponse = {
    conversationId: Text;
    message: Message;
    analysis: ?CareerAnalysis;
    isComplete: Bool;
  };

  // NEW: AI Analysis trigger
  public type AnalysisRequest = {
    conversationId: Text;
    prompt: Text;                 // Custom prompt for analysis
  };

  public type ChatResult<T> = Result.Result<T, Text>;
}