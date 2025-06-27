import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import ChatbotTypes "../types/Chatbot";
import ChatbotState "../storage/ChatbotState";
import AuthService "./AuthService";
import AuthState "../storage/AuthState";
import Char "mo:base/Char";
// import LLM "mo:llm";

module {
  public func startConversation(
    chatbotState: ChatbotState.ChatbotState,
    authState: AuthState.AuthState,
    caller: Principal
  ): async ChatbotTypes.ChatResult<ChatbotTypes.ChatResponse> {
    
    // Check if user is logged in
    switch (AuthService.getCurrentUser(authState, caller)) {
      case null { return #err("Please login first.") };
      case (?_user) {
        
        let conversationId = ChatbotState.generateConversationId(caller);
        
        // AI-generated welcome message using LLM
        let aiWelcome = await generateWelcomeMessage();

        let welcomeMessage: ChatbotTypes.Message = {
          id = conversationId # "_msg_1";
          role = #Assistant;
          content = aiWelcome;
          timestamp = Time.now();
        };

        let newConversation: ChatbotTypes.Conversation = {
          id = conversationId;
          userId = caller;
          messages = [welcomeMessage];
          status = #Active;
          createdAt = Time.now();
          lastUpdated = Time.now();
        };

        // Save conversation
        let (newConversations, _) = Trie.put(
          chatbotState.conversations,
          ChatbotState.textKey(conversationId),
          Text.equal,
          newConversation
        );
        chatbotState.conversations := newConversations;

        #ok({
          conversationId = conversationId;
          message = welcomeMessage;
          analysis = null;
          isComplete = false;
        })
      };
    };
  };

  // Send message to AI chatbot using LLM
  public func sendMessage(
    chatbotState: ChatbotState.ChatbotState,
    authState: AuthState.AuthState,
    caller: Principal,
    request: ChatbotTypes.ChatRequest
  ): async ChatbotTypes.ChatResult<ChatbotTypes.ChatResponse> {
    
    // Check if user is logged in
    switch (AuthService.getCurrentUser(authState, caller)) {
      case null { return #err("Please login first.") };
      case (?_user) {
        
        let conversationId = switch (request.conversationId) {
          case null { 
            // Start new conversation if none provided
            switch (await startConversation(chatbotState, authState, caller)) {
              case (#err(msg)) { return #err(msg) };
              case (#ok(response)) { response.conversationId };
            };
          };
          case (?id) { id };
        };

        // Get existing conversation
        switch (Trie.get(chatbotState.conversations, ChatbotState.textKey(conversationId), Text.equal)) {
          case null { return #err("Conversation not found.") };
          case (?conversation) {
            
            // Create user message
            let userMessage: ChatbotTypes.Message = {
              id = conversationId # "_msg_" # Int.toText(conversation.messages.size() + 1);
              role = #User;
              content = request.message;
              timestamp = Time.now();
            };

            // Generate AI response with full conversation context using LLM
            let conversationContext = buildConversationContext(conversation.messages);
            let aiResponse = await generateAIResponse(conversationContext, request.message);

            let botMessage: ChatbotTypes.Message = {
              id = conversationId # "_msg_" # Int.toText(conversation.messages.size() + 2);
              role = #Assistant;
              content = aiResponse;
              timestamp = Time.now();
            };

            // Update conversation with new messages
            let updatedMessages = Array.append(conversation.messages, [userMessage, botMessage]);
            
            let updatedConversation: ChatbotTypes.Conversation = {
              id = conversation.id;
              userId = conversation.userId;
              messages = updatedMessages;
              status = #Active;
              createdAt = conversation.createdAt;
              lastUpdated = Time.now();
            };

            // Save updated conversation
            let (newConversations, _) = Trie.put(
              chatbotState.conversations,
              ChatbotState.textKey(conversationId),
              Text.equal,
              updatedConversation
            );
            chatbotState.conversations := newConversations;

            #ok({
              conversationId = conversationId;
              message = botMessage;
              analysis = null;
              isComplete = false;
            })
          };
        };
      };
    };
  };

  // Generate career analysis using LLM
  public func generateAnalysis(
    chatbotState: ChatbotState.ChatbotState,
    authState: AuthState.AuthState,
    caller: Principal,
    conversationId: Text
  ): async ChatbotTypes.ChatResult<ChatbotTypes.CareerAnalysis> {
    
    // Check if user is logged in
    switch (AuthService.getCurrentUser(authState, caller)) {
      case null { return #err("Please login first.") };
      case (?_user) {
        
        // Get conversation
        switch (Trie.get(chatbotState.conversations, ChatbotState.textKey(conversationId), Text.equal)) {
          case null { return #err("Conversation not found.") };
          case (?conversation) {
            
            // Check if conversation belongs to user
            if (conversation.userId != caller) {
              return #err("Unauthorized access to conversation.");
            };

            // Update status to analyzing
            let analyzingConversation = {
              conversation with status = #Analyzing
            };
            
            let (tempConversations, _) = Trie.put(
              chatbotState.conversations,
              ChatbotState.textKey(conversationId),
              Text.equal,
              analyzingConversation
            );
            chatbotState.conversations := tempConversations;

            // Build comprehensive analysis prompt
            let conversationSummary = buildConversationSummary(conversation.messages);
            
            // Generate AI analysis using LLM
            let analysisResult = await generateCareerAnalysis(conversationSummary);
            
            switch (analysisResult) {
              case (#err(error)) { 
                // Reset status on error
                let (resetConversations, _) = Trie.put(
                  chatbotState.conversations,
                  ChatbotState.textKey(conversationId),
                  Text.equal,
                  conversation
                );
                chatbotState.conversations := resetConversations;
                return #err("AI analysis failed: " # error) 
              };
              case (#ok(analysis)) {
                
                // Update conversation to completed
                let completedConversation = {
                  conversation with status = #Completed
                };
                
                let (finalConversations, _) = Trie.put(
                  chatbotState.conversations,
                  ChatbotState.textKey(conversationId),
                  Text.equal,
                  completedConversation
                );
                chatbotState.conversations := finalConversations;

                #ok(analysis)
              };
            };
          };
        };
      };
    };
  };

  // Get conversation history
  public func getConversation(
    chatbotState: ChatbotState.ChatbotState,
    authState: AuthState.AuthState,
    caller: Principal,
    conversationId: Text
  ): ?ChatbotTypes.Conversation {
    
    // Check if user is logged in
    switch (AuthService.getCurrentUser(authState, caller)) {
      case null { null };
      case (?_user) {
        
        // Get conversation
        switch (Trie.get(chatbotState.conversations, ChatbotState.textKey(conversationId), Text.equal)) {
          case null { null };
          case (?conversation) {
            // Check if conversation belongs to user
            if (conversation.userId == caller) {
              ?conversation
            } else { null }
          };
        };
      };
    };
  };

  // Get user's conversation list
  public func getUserConversations(
    chatbotState: ChatbotState.ChatbotState,
    authState: AuthState.AuthState,
    caller: Principal
  ): [ChatbotTypes.Conversation] {
    
    switch (AuthService.getCurrentUser(authState, caller)) {
      case null { [] };
      case (?_user) {
        
        var userConversations: [ChatbotTypes.Conversation] = [];
        
        // Iterate through all conversations to find user's conversations
        for ((_, conversation) in Trie.iter(chatbotState.conversations)) {
          if (conversation.userId == caller) {
            userConversations := Array.append(userConversations, [conversation]);
          };
        };
        
        userConversations
      };
    };
  };

  // PRIVATE HELPER FUNCTIONS

  // Generate AI welcome message using mockup
  private func generateWelcomeMessage(): async Text {
    getDefaultWelcomeMessage()
  };

  // Generate AI response using mockup
  private func generateAIResponse(context: Text, userMessage: Text): async Text {
    getDefaultResponse(userMessage)
  };

  // Generate comprehensive career analysis using mockup
   private func generateCareerAnalysis(conversationSummary: Text): async ChatbotTypes.ChatResult<ChatbotTypes.CareerAnalysis> {
    #ok(generateSmartAnalysis(conversationSummary))
  };

    // Parse LLM response into structured analysis
  private func parseAIAnalysis(response: Text): Result.Result<ChatbotTypes.CareerAnalysis, Text> {
    let lines = Text.split(response, #char '\n');
    var suggestedPath = "";
    var confidence = 0.85;
    var keySkills: [Text] = [];
    var reasoning = "";
    var quests: [Text] = [];
    var skillTreeName = "";
    var skillTreeDesc = "";
    var skillNodes: [ChatbotTypes.SkillNode] = [];

    for (line in lines) {
      let trimmedLine = Text.trim(line, #char ' ');
      
      if (Text.startsWith(trimmedLine, #text "SUGGESTED_PATH:")) {
        suggestedPath := switch (Text.stripStart(trimmedLine, #text "SUGGESTED_PATH:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
      } else if (Text.startsWith(trimmedLine, #text "CONFIDENCE:")) {
        let confStr = switch (Text.stripStart(trimmedLine, #text "CONFIDENCE:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
        // Simple confidence parsing (would need proper float parsing in production)
        confidence := 0.85; // Default fallback
      } else if (Text.startsWith(trimmedLine, #text "KEY_SKILLS:")) {
        let skillsStr = switch (Text.stripStart(trimmedLine, #text "KEY_SKILLS:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
        keySkills := Iter.toArray(Text.split(skillsStr, #char '|'));
      } else if (Text.startsWith(trimmedLine, #text "REASONING:")) {
        reasoning := switch (Text.stripStart(trimmedLine, #text "REASONING:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
      } else if (Text.startsWith(trimmedLine, #text "QUESTS:")) {
        let questsStr = switch (Text.stripStart(trimmedLine, #text "QUESTS:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
        quests := Iter.toArray(Text.split(questsStr, #char '|'));
      } else if (Text.startsWith(trimmedLine, #text "SKILL_TREE_NAME:")) {
        skillTreeName := switch (Text.stripStart(trimmedLine, #text "SKILL_TREE_NAME:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
      } else if (Text.startsWith(trimmedLine, #text "SKILL_TREE_DESC:")) {
        skillTreeDesc := switch (Text.stripStart(trimmedLine, #text "SKILL_TREE_DESC:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
      } else if (Text.startsWith(trimmedLine, #text "SKILL_NODES:")) {
        let nodesStr = switch (Text.stripStart(trimmedLine, #text "SKILL_NODES:")) {
          case (?stripped) { Text.trim(stripped, #char ' ') };
          case null { "" };
        };
        skillNodes := parseSkillNodes(nodesStr);
      };
    };

    // Validation
    if (suggestedPath == "" or keySkills.size() == 0) {
      return #err("Invalid LLM response format");
    };

    #ok({
      suggestedPath = suggestedPath;
      confidence = confidence;
      keySkills = keySkills;
      reasoning = reasoning;
      questSuggestions = quests;
      skillTree = {
        pathName = skillTreeName;
        description = skillTreeDesc;
        nodes = skillNodes;
      };
    })
  };

  // Parse skill nodes from LLM response
  private func parseSkillNodes(nodesStr: Text): [ChatbotTypes.SkillNode] {
    let nodeStrings = Iter.toArray(Text.split(nodesStr, #char '|'));
    var nodes: [ChatbotTypes.SkillNode] = [];
    
    for (nodeStr in nodeStrings.vals()) {
      let parts = Iter.toArray(Text.split(nodeStr, #char ','));
      if (parts.size() >= 7) {
        let node: ChatbotTypes.SkillNode = {
          id = parts[0];
          name = parts[1];
          description = parts[2];
          level = 1; // Would need proper int parsing
          prerequisites = if (parts[4] == "none") { [] } else { [parts[4]] };
          xpRequired = 100; // Would need proper int parsing  
          category = #Core; // Would need proper category parsing
        };
        nodes := Array.append(nodes, [node]);
      };
    };
    
    if (nodes.size() == 0) {
      generateDefaultSkillTree("fullstack") // Fallback
    } else {
      nodes
    }
  };

  // Build conversation context for AI
  private func buildConversationContext(messages: [ChatbotTypes.Message]): Text {
    var context = "";
    for (message in messages.vals()) {
      let role = switch (message.role) {
        case (#User) { "User" };
        case (#Assistant) { "SkillForge AI" };
        case (#System) { "System" };
      };
      context #= role # ": " # message.content # "\n";
    };
    context
  };

  // Build conversation summary for analysis
  private func buildConversationSummary(messages: [ChatbotTypes.Message]): Text {
    var summary = "User's responses and interests:\n";
    for (message in messages.vals()) {
      if (message.role == #User) {
        summary #= "- " # message.content # "\n";
      };
    };
    summary
  };

private func generateSmartAnalysis(conversationSummary: Text): ChatbotTypes.CareerAnalysis {
    let lowerSummary = Text.map(conversationSummary, func(c: Char): Char {
      if (c >= 'A' and c <= 'Z') {
        Char.fromNat32(Char.toNat32(c) + 32)
      } else { c }
    });
    
    // Analyze conversation content to determine career path
    if (Text.contains(lowerSummary, #text "data") or 
        Text.contains(lowerSummary, #text "analytics") or
        Text.contains(lowerSummary, #text "science") or
        Text.contains(lowerSummary, #text "machine learning") or
        Text.contains(lowerSummary, #text "statistics")) {
      generateDataScienceAnalysis()
    } else if (Text.contains(lowerSummary, #text "mobile") or 
               Text.contains(lowerSummary, #text "app") or
               Text.contains(lowerSummary, #text "android") or
               Text.contains(lowerSummary, #text "ios")) {
      generateMobileAnalysis()
    } else if (Text.contains(lowerSummary, #text "security") or 
               Text.contains(lowerSummary, #text "cyber") or
               Text.contains(lowerSummary, #text "hack")) {
      generateCyberSecurityAnalysis()
    } else if (Text.contains(lowerSummary, #text "devops") or 
               Text.contains(lowerSummary, #text "cloud") or
               Text.contains(lowerSummary, #text "infrastructure")) {
      generateDevOpsAnalysis()
    } else if (Text.contains(lowerSummary, #text "ui") or 
               Text.contains(lowerSummary, #text "ux") or
               Text.contains(lowerSummary, #text "design") or
               Text.contains(lowerSummary, #text "frontend")) {
      generateFrontendAnalysis()
    } else {
      generateDefaultAnalysis(conversationSummary)
    }
  };

  private func generateDataScienceAnalysis(): ChatbotTypes.CareerAnalysis {
    {
      suggestedPath = "data_science";
      confidence = 0.85;
      keySkills = ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization", "Pandas", "NumPy", "Jupyter"];
      reasoning = "Based on your interest in data science, you'll work with large datasets to extract insights and build predictive models. This field combines statistics, programming, and domain expertise.";
      questSuggestions = ["Build a data analysis project", "Learn Python for data science", "Create data visualizations", "Implement machine learning algorithms", "Work with real datasets"];
      skillTree = {
        pathName = "Data Science Journey";
        description = "A comprehensive path to mastering data science and analytics";
        nodes = generateDataScienceSkillTree();
      };
    }
  };

  private func generateMobileAnalysis(): ChatbotTypes.CareerAnalysis {
    {
      suggestedPath = "mobile_development";
      confidence = 0.80;
      keySkills = ["React Native", "Flutter", "Swift", "Kotlin", "Mobile UI/UX", "API Integration", "App Store Deployment"];
      reasoning = "Mobile development is perfect for creating apps that millions use daily. You'll work on user interfaces and mobile-specific features.";
      questSuggestions = ["Build your first mobile app", "Learn cross-platform development", "Implement push notifications", "Publish to app stores", "Add offline functionality"];
      skillTree = {
        pathName = "Mobile Developer Journey";
        description = "Path to becoming a skilled mobile app developer";
        nodes = generateMobileSkillTree();
      };
    }
  };

  private func generateCyberSecurityAnalysis(): ChatbotTypes.CareerAnalysis {
    {
      suggestedPath = "cybersecurity";
      confidence = 0.82;
      keySkills = ["Network Security", "Ethical Hacking", "Risk Assessment", "Incident Response", "Cryptography", "Security Tools"];
      reasoning = "Cybersecurity is crucial in today's digital world. You'll protect systems and data from threats while ensuring compliance.";
      questSuggestions = ["Learn ethical hacking basics", "Practice on security labs", "Study network protocols", "Get security certifications", "Analyze security incidents"];
      skillTree = {
        pathName = "Cybersecurity Specialist Journey";
        description = "Path to becoming a cybersecurity expert";
        nodes = generateCyberSecuritySkillTree();
      };
    }
  };

  private func generateDevOpsAnalysis(): ChatbotTypes.CareerAnalysis {
    {
      suggestedPath = "devops";
      confidence = 0.78;
      keySkills = ["Docker", "Kubernetes", "AWS/Azure", "CI/CD", "Infrastructure as Code", "Monitoring", "Linux"];
      reasoning = "DevOps bridges development and operations, focusing on automation, reliability, and efficient deployment processes.";
      questSuggestions = ["Set up CI/CD pipeline", "Learn containerization", "Deploy to cloud platforms", "Implement monitoring", "Practice infrastructure automation"];
      skillTree = {
        pathName = "DevOps Engineer Journey";
        description = "Path to mastering DevOps practices and tools";
        nodes = generateDevOpsSkillTree();
      };
    }
  };

  private func generateFrontendAnalysis(): ChatbotTypes.CareerAnalysis {
    {
      suggestedPath = "frontend";
      confidence = 0.80;
      keySkills = ["HTML/CSS", "JavaScript", "React/Vue", "UI/UX Design", "Responsive Design", "Performance Optimization"];
      reasoning = "Frontend development focuses on creating beautiful, interactive user interfaces that provide excellent user experiences.";
      questSuggestions = ["Build responsive websites", "Master modern JavaScript", "Learn design principles", "Optimize web performance", "Create interactive animations"];
      skillTree = {
        pathName = "Frontend Developer Journey";
        description = "Path to becoming a skilled frontend developer";
        nodes = generateFrontendSkillTree();
      };
    }
  };

  // Skill tree generators for different paths
 private func generateDataScienceSkillTree(): [ChatbotTypes.SkillNode] {
    [
      {
        id = "python_basics";
        name = "Python Programming";
        description = "Learn Python syntax and core concepts";
        level = 1;
        prerequisites = [];
        xpRequired = 100;
        category = #Core;
      },
      {
        id = "statistics";
        name = "Statistics & Math";
        description = "Statistical concepts for data analysis";
        level = 2;
        prerequisites = ["python_basics"];
        xpRequired = 150;
        category = #Core;
      },
      {
        id = "data_manipulation";
        name = "Data Manipulation";
        description = "Pandas, NumPy for data processing";
        level = 3;
        prerequisites = ["statistics"];
        xpRequired = 200;
        category = #Technical;
      },
      {
        id = "visualization";
        name = "Data Visualization";
        description = "Matplotlib, Seaborn, Plotly";
        level = 3;
        prerequisites = ["data_manipulation"];
        xpRequired = 180;
        category = #Technical;
      },
      {
        id = "machine_learning";
        name = "Machine Learning";
        description = "ML algorithms and model building";
        level = 4;
        prerequisites = ["data_manipulation", "visualization"];
        xpRequired = 300;
        category = #Technical;  // Change from #Advanced to #Technical
      }
    ]
  };

  private func generateCyberSecuritySkillTree(): [ChatbotTypes.SkillNode] {
    [
      {
        id = "security_basics";
        name = "Security Fundamentals";
        description = "Basic security concepts and principles";
        level = 1;
        prerequisites = [];
        xpRequired = 100;
        category = #Core;
      },
      {
        id = "network_security";
        name = "Network Security";
        description = "Firewalls, VPNs, network protocols";
        level = 2;
        prerequisites = ["security_basics"];
        xpRequired = 200;
        category = #Technical;
      },
      {
        id = "ethical_hacking";
        name = "Ethical Hacking";
        description = "Penetration testing and vulnerability assessment";
        level = 3;
        prerequisites = ["network_security"];
        xpRequired = 300;
        category = #Technical;  // Change from #Advanced to #Technical
      }
    ]
  };

  private func generateMobileSkillTree(): [ChatbotTypes.SkillNode] {
    [
      {
        id = "mobile_basics";
        name = "Mobile Development Basics";
        description = "Mobile app concepts and UI principles";
        level = 1;
        prerequisites = [];
        xpRequired = 100;
        category = #Core;
      },
      {
        id = "cross_platform";
        name = "Cross-Platform Framework";
        description = "React Native or Flutter";
        level = 2;
        prerequisites = ["mobile_basics"];
        xpRequired = 200;
        category = #Technical;
      },
      {
        id = "native_features";
        name = "Native Features";
        description = "Camera, GPS, notifications";
        level = 3;
        prerequisites = ["cross_platform"];
        xpRequired = 250;
        category = #Technical;
      }
    ]
  };

  private func generateDevOpsSkillTree(): [ChatbotTypes.SkillNode] {
    [
      {
        id = "linux_basics";
        name = "Linux Administration";
        description = "Command line and system administration";
        level = 1;
        prerequisites = [];
        xpRequired = 100;
        category = #Core;
      },
      {
        id = "containerization";
        name = "Containerization";
        description = "Docker and container orchestration";
        level = 2;
        prerequisites = ["linux_basics"];
        xpRequired = 200;
        category = #Technical;
      },
      {
        id = "cicd";
        name = "CI/CD Pipelines";
        description = "Automated testing and deployment";
        level = 3;
        prerequisites = ["containerization"];
        xpRequired = 250;
        category = #Technical;
      }
    ]
  };

  private func generateFrontendSkillTree(): [ChatbotTypes.SkillNode] {
    [
      {
        id = "html_css";
        name = "HTML & CSS";
        description = "Web markup and styling fundamentals";
        level = 1;
        prerequisites = [];
        xpRequired = 100;
        category = #Core;
      },
      {
        id = "javascript";
        name = "JavaScript";
        description = "Dynamic web programming";
        level = 2;
        prerequisites = ["html_css"];
        xpRequired = 200;
        category = #Core;
      },
      {
        id = "frontend_framework";
        name = "Frontend Framework";
        description = "React, Vue, or Angular";
        level = 3;
        prerequisites = ["javascript"];
        xpRequired = 250;
        category = #Technical;
      }
    ]
  };

  // FALLBACK FUNCTIONS (backup for LLM failures)

  private func getDefaultWelcomeMessage(): Text {
    "Hello! I'm SkillForge AI, your personal tech career guide. I'm here to help you discover the perfect technology career path that matches your interests, skills, and goals.\n\n" #
    "Let's start by getting to know you better:\n" #
    "• What aspects of technology excite you most?\n" #
    "• What's your current experience with programming or tech?\n" #
    "• What kind of problems do you enjoy solving?\n\n" #
    "Share your thoughts, and I'll help guide you toward your ideal tech career!"
  };

  private func getDefaultResponse(userMessage: Text): Text {
    "That's interesting! I'd love to learn more about your technical interests and experience. Can you tell me more about what specifically draws you to technology, and what kind of projects or problems you'd like to work on?"
  };

  private func generateDefaultAnalysis(conversationSummary: Text): ChatbotTypes.CareerAnalysis {
    {
      suggestedPath = "fullstack";
      confidence = 0.75;
      keySkills = ["JavaScript", "React", "Node.js", "Databases", "API Development", "DevOps"];
      reasoning = "Based on your interests in both user-facing and system-level development, full-stack development offers the perfect balance of frontend and backend skills.";
      questSuggestions = ["Build a full-stack web application", "Learn modern JavaScript frameworks", "Implement user authentication", "Deploy to cloud platforms", "Add real-time features"];
      skillTree = {
        pathName = "Full-Stack Developer Journey";
        description = "A comprehensive path to mastering both frontend and backend development";
        nodes = generateDefaultSkillTree("fullstack");
      };
    }
  };

  private func generateDefaultSkillTree(path: Text): [ChatbotTypes.SkillNode] {
    [
      {
        id = "programming_basics";
        name = "Programming Fundamentals";
        description = "Learn core programming concepts and logic";
        level = 1;
        prerequisites = [];
        xpRequired = 100;
        category = #Core;
      },
      {
        id = "web_basics";
        name = "Web Development Basics";
        description = "HTML, CSS, and JavaScript fundamentals";
        level = 2;
        prerequisites = ["programming_basics"];
        xpRequired = 200;
        category = #Core;
      },
      {
        id = "frontend_framework";
        name = "Frontend Framework";
        description = "Master React or similar modern framework";
        level = 3;
        prerequisites = ["web_basics"];
        xpRequired = 300;
        category = #Technical;
      },
      {
        id = "backend_basics";
        name = "Backend Development";
        description = "Server-side programming and APIs";
        level = 3;
        prerequisites = ["web_basics"];
        xpRequired = 300;
        category = #Technical;
      },
      {
        id = "database_skills";
        name = "Database Management";
        description = "SQL and NoSQL database design and queries";
        level = 4;
        prerequisites = ["backend_basics"];
        xpRequired = 250;
        category = #Technical;
      }
    ]
  };
}