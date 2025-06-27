import AuthService "./services/AuthService";
import AuthState "./storage/AuthState";
import AuthTypes "./types/Auth";
import ChatbotService "./services/ChatbotService";
import ChatbotState "./storage/ChatbotState";
import ChatbotTypes "./types/Chatbot";

actor SkillForge {
  private stable var authState = AuthState.initAuthState();
 private stable var chatbotState = ChatbotState.initChatbotState();

  // ===== INTERNET IDENTITY AUTH =====
  public shared(msg) func loginWithII(): async AuthTypes.AuthResult<AuthTypes.User> {
    // msg.caller sudah authenticated via Internet Identity
    let caller = msg.caller;
    
    // Check if user already exists
    switch (AuthService.getCurrentUser(authState, caller)) {
      case (?user) { 
        // User exists, update session
        let _ = AuthService.createSession(authState, caller); // FIX: assign to wildcard
        #ok(user) 
      };
      case null {
        // New user, create profile
        #err("Please complete your profile first.")
      };
    };
  };

  public shared(msg) func completeProfile(username: Text, email: Text): async AuthTypes.AuthResult<AuthTypes.User> {
    // Create user profile after II authentication
    AuthService.createUserFromII(authState, msg.caller, username, email)
  };

  // ===== TRADITIONAL AUTH =====
  public shared(msg) func register(username: Text, email: Text, password: Text): async AuthTypes.AuthResult<AuthTypes.User> {
    let request: AuthTypes.RegisterRequest = {
      username = username;
      email = email;
      password = password;
    };
    AuthService.register(authState, msg.caller, request)
  };

  public shared(_msg) func login(email: Text, password: Text): async AuthTypes.AuthResult<AuthTypes.User> {
    let request: AuthTypes.LoginRequest = {
      email = email;
      password = password;
    };
    AuthService.login(authState, request)
  };

  // ===== COMMON AUTH =====
  public shared(msg) func logout(): async Bool {
    AuthService.logout(authState, msg.caller)
  };

  public shared(msg) func getCurrentUser(): async ?AuthTypes.User {
    AuthService.getCurrentUser(authState, msg.caller)
  };

  // ===== USER SETTINGS =====
  public query(msg) func getSettings(): async ?AuthTypes.Settings {
    AuthService.getSettings(authState, msg.caller)
  };

  public shared(msg) func updateSettings(newSettings: AuthTypes.Settings): async Bool {
    AuthService.updateSettings(authState, msg.caller, newSettings)
  };

 // ===== AI CHATBOT FUNCTIONS =====
  public shared(msg) func startConversation(): async ChatbotTypes.ChatResult<ChatbotTypes.ChatResponse> {
    await ChatbotService.startConversation(chatbotState, authState, msg.caller)
  };

  public shared(msg) func sendMessage(conversationId: ?Text, message: Text): async ChatbotTypes.ChatResult<ChatbotTypes.ChatResponse> {
    let request: ChatbotTypes.ChatRequest = {
      conversationId = conversationId;
      message = message;
    };
    await ChatbotService.sendMessage(chatbotState, authState, msg.caller, request)
  };

  public shared(msg) func generateAnalysis(conversationId: Text): async ChatbotTypes.ChatResult<ChatbotTypes.CareerAnalysis> {
    await ChatbotService.generateAnalysis(chatbotState, authState, msg.caller, conversationId)
  };

  public query(msg) func getConversation(conversationId: Text): async ?ChatbotTypes.Conversation {
    ChatbotService.getConversation(chatbotState, authState, msg.caller, conversationId)
  };
}