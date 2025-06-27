import Trie "mo:base/Trie";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";       
import Float "mo:base/Float";    
import Char "mo:base/Char";      
import ChatbotTypes "../types/Chatbot";

module {
  public type ChatbotState = {
    var conversations: Trie.Trie<Text, ChatbotTypes.Conversation>;
    var userConversations: Trie.Trie<Principal, [Text]>; // User's conversation history
  };

  public func initChatbotState(): ChatbotState {
    {
      var conversations = Trie.empty<Text, ChatbotTypes.Conversation>();
      var userConversations = Trie.empty<Principal, [Text]>();
    }
  };

  // Helper functions
  public func textKey(t: Text): Trie.Key<Text> {
    { key = t; hash = Text.hash(t) }
  };

  public func principalKey(p: Principal): Trie.Key<Principal> {
    { key = p; hash = Principal.hash(p) }
  };

  // Generate unique conversation ID
  public func generateConversationId(userId: Principal): Text {
    Principal.toText(userId) # "_" # Int.toText(Time.now())
  };

  // Predefined chatbot responses and logic
  public func getWelcomeMessage(): Text {
    "Hi! I'm here to help you discover your ideal tech career path. Let's start with some questions:\n\n" #
    "1. What interests you most about technology?\n" #
    "2. Do you prefer working with visual interfaces or behind-the-scenes logic?\n" #
    "3. Are you more interested in building apps, analyzing data, or something else?\n\n" #
    "Tell me about yourself and what you'd like to achieve!"
  };

  // Simple keyword-based analysis
  public func analyzeCareerIntent(messages: [ChatbotTypes.Message]): ChatbotTypes.CareerAnalysis {
    var frontendScore: Float = 0.0;
    var backendScore: Float = 0.0;
    var dataScore: Float = 0.0;
    var mobileScore: Float = 0.0;
    
    // Keywords untuk setiap path
    let frontendKeywords = ["ui", "design", "visual", "website", "react", "css", "html", "interface", "user experience"];
    let backendKeywords = ["api", "server", "database", "logic", "system", "backend", "algorithm", "performance"];
    let dataKeywords = ["data", "analytics", "insights", "machine learning", "ai", "statistics", "analysis"];
    let mobileKeywords = ["mobile", "app", "ios", "android", "phone", "tablet"];

    // Analyze user messages
    for (message in messages.vals()) {
      if (message.role == #User) {
        let content = message.content;
        
        // Check frontend keywords
        for (keyword in frontendKeywords.vals()) {
          if (Text.contains(content, #text keyword)) {
            frontendScore += 1.0;
          };
        };
        
        // Check backend keywords
        for (keyword in backendKeywords.vals()) {
          if (Text.contains(content, #text keyword)) {
            backendScore += 1.0;
          };
        };
        
        // Check data keywords
        for (keyword in dataKeywords.vals()) {
          if (Text.contains(content, #text keyword)) {
            dataScore += 1.0;
          };
        };
        
        // Check mobile keywords
        for (keyword in mobileKeywords.vals()) {
          if (Text.contains(content, #text keyword)) {
            mobileScore += 1.0;
          };
        };
      };
    };

    // Determine suggested path
    let maxScore = Float.max(Float.max(frontendScore, backendScore), Float.max(dataScore, mobileScore));
    let totalScore = frontendScore + backendScore + dataScore + mobileScore;
    let confidence = if (totalScore > 0.0) { maxScore / totalScore } else { 0.5 };

    if (maxScore == frontendScore) {
      {
        suggestedPath = "frontend";
        confidence = confidence;
        keySkills = ["HTML", "CSS", "JavaScript", "React", "UI/UX Design"];
        reasoning = "Based on your interest in visual interfaces and user experience, frontend development seems like a great fit!";
        questSuggestions = ["Build your first webpage", "Learn React basics", "Create a portfolio website"];
        skillTree = {
          pathName = "Frontend Developer";
          description = "A journey to master frontend development";
          nodes = [];
        };
      }
    } else if (maxScore == backendScore) {
      {
        suggestedPath = "backend";
        confidence = confidence;
        keySkills = ["API Development", "Databases", "Server Architecture", "Algorithms"];
        reasoning = "Your interest in system logic and backend processes suggests backend development is perfect for you!";
        questSuggestions = ["Build a REST API", "Learn database design", "Create a microservice"];
        skillTree = {
          pathName = "Backend Developer";
          description = "A journey to master backend development";
          nodes = [];
        };
      }
    } else if (maxScore == dataScore) {
      {
        suggestedPath = "data";
        confidence = confidence;
        keySkills = ["Python", "SQL", "Machine Learning", "Data Visualization", "Statistics"];
        reasoning = "Your passion for data and insights points towards a data science career path!";
        questSuggestions = ["Analyze a dataset", "Build a prediction model", "Create data visualizations"];
        skillTree = {
          pathName = "Data Scientist";
          description = "A journey to master data science";
          nodes = [];
        };
      }
    } else if (maxScore == mobileScore) {
      {
        suggestedPath = "mobile";
        confidence = confidence;
        keySkills = ["Swift/Kotlin", "React Native", "Mobile UI", "App Store Optimization"];
        reasoning = "Your interest in mobile apps suggests mobile development is your calling!";
        questSuggestions = ["Build your first mobile app", "Learn platform-specific development", "Publish to app store"];
        skillTree = {
          pathName = "Mobile Developer";
          description = "A journey to master mobile development";
          nodes = [];
        };
      }
    } else {
      {
        suggestedPath = "fullstack";
        confidence = 0.6;
        keySkills = ["JavaScript", "React", "Node.js", "Databases", "API Development"];
        reasoning = "You seem interested in multiple aspects of development. Full-stack might be perfect for you!";
        questSuggestions = ["Build a complete web app", "Learn both frontend and backend", "Deploy to production"];
        skillTree = {
          pathName = "Fullstack Developer";
          description = "A journey to master fullstack development";
          nodes = [];
        };
      }
    }
  };
}