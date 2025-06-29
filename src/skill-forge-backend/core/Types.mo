import Principal "mo:base/Principal";
import Trie "mo:base/Trie";

/// Types module defines all data structures used throughout the SkillForge backend
/// This module contains user types, skill card types, quest types, and storage types
module {
    
    // ===== USER TYPES =====
    
    /// User profile information
    public type User = {
        id: Principal;           // User's Internet Identity principal
        username: Text;          // Unique username
        fullName: ?Text;         // Optional full name
        profilePicture: ?Text;   // Optional profile picture URL
        createdAt: Int;          // Account creation timestamp
        lastLogin: Int;          // Last login timestamp
        level: Nat;              // Current user level
        experience: Nat;         // Current experience in this level
        totalExperience: Nat;    // Total lifetime experience
    };

    /// Data for updating user profile
    public type UserUpdateData = {
        username: ?Text;         // Optional new username
        fullName: ?Text;         // Optional new full name
        profilePicture: ?Text;   // Optional new profile picture URL
        experience: ?Nat;        // Optional experience update
    };

    /// Data for creating new user
    public type UserCreateData = {
        username: Text;          // Required username
        fullName: ?Text;         // Optional full name
        profilePicture: ?Text;   // Optional profile picture URL
    };

    /// Users storage type using Trie for efficient lookups
    public type Users = Trie.Trie<Principal, User>;

    /// Authentication result containing user and new user status
    public type AuthResult = {
        user: User;              // User object
        isNewUser: Bool;         // Whether this is a new user
    };

    /// Authentication error types
    public type AuthError = {
        #UserNotFound;           // User not found in system
        #InvalidPrincipal;       // Invalid or anonymous principal
        #UsernameTaken;          // Username already in use
        #UsernameInvalid;        // Username doesn't meet requirements
        #UpdateFailed;           // Profile update failed
    };

    // ===== API RESPONSE TYPES =====
    
    /// Generic result type for API responses
    public type Result<T, E> = {
        #ok: T;                  // Success case with data
        #err: E;                 // Error case with error details
    };

    // ===== EXPERIENCE AND LEVEL TYPES =====
    
    /// Experience gain record
    public type ExperienceGain = {
        amount: Nat;             // Experience amount gained
        source: Text;            // Source of experience (e.g., "skill_completion")
        timestamp: Int;          // When experience was gained
    };

    /// Current level information
    public type LevelInfo = {
        level: Nat;              // Current level
        currentExp: Nat;         // Experience in current level
        expToNextLevel: Nat;     // Experience needed for next level
        totalExp: Nat;           // Total lifetime experience
    };

    /// Level up result after gaining experience
    public type LevelUpResult = {
        newLevel: Nat;           // New level after experience gain
        expGained: Nat;          // Experience gained
        leveledUp: Bool;         // Whether user leveled up
        newLevelInfo: LevelInfo; // Updated level information
    };

    // ===== SKILL TREE SYSTEM TYPES =====
    
    /// Grid position for skill nodes
    public type GridPosition = {
        x: Nat;                  // X coordinate on skill grid
        y: Nat;                  // Y coordinate on skill grid
    };

    /// Quiz question for skill validation
    public type Question = {
        id: Text;                // Unique question ID
        text: Text;              // Question text
        options: [Text];         // Multiple choice options
        correctAnswer: Nat;      // Index of correct answer
        explanation: Text;       // Explanation of correct answer
    };

    /// Quest containing multiple questions
    public type Quest = {
        id: Text;                // Unique quest ID
        title: Text;             // Quest title
        description: Text;       // Quest description
        questions: [Question];   // Array of questions
        points: Nat;             // Experience points for completing quest
        passingThreshold: Float; // Minimum score to pass (0.0 to 1.0)
    };

    /// Individual skill node in a skill tree
    public type SkillNode = {
        id: Text;                // Unique skill ID
        name: Text;              // Skill name
        description: Text;       // Skill description
        iconName: Text;          // Icon identifier for UI
        gridPosition: GridPosition; // Position on skill grid
        dependencies: [Text];    // IDs of skills that must be completed first
        questId: Text;           // Associated quest ID
        isUnlocked: Bool;        // Whether skill is available
        isCompleted: Bool;       // Whether skill is completed
        maxPoints: Nat;          // Maximum points for this skill
        currentPoints: Nat;      // Current points earned
    };

    /// Status of a skill card
    public type SkillCardStatus = {
        #preview;                // Card is in preview mode
        #accepted;               // Card has been accepted by user
        #declined;               // Card has been declined by user
    };

    /// Complete skill card containing multiple skills
    public type SkillCard = {
        id: Text;                // Unique skill card ID
        title: Text;             // Skill card title
        description: Text;       // Skill card description
        category: Text;          // Skill category (e.g., "Frontend", "Backend")
        skills: [SkillNode];     // Array of skills in this card
        completedPoints: Nat;    // Total points completed
        totalPoints: Nat;        // Total possible points
        status: SkillCardStatus; // Current status of the card
        createdAt: Int;          // Creation timestamp
        userId: Principal;       // User who owns this card
    };

    /// Result of skill card generation
    public type SkillCardGeneration = {
        skillCards: [SkillCard]; // Generated skill cards
        quests: [Quest];         // Associated quests
    };

    /// Request for skill card generation
    public type SkillCardRequest = {
        prompt: Text;            // User's learning goal or prompt
        category: ?Text;         // Optional skill category
        difficulty: ?Text;       // Optional difficulty level
    };

    /// User's progress on a specific skill card
    public type UserSkillProgress = {
        userId: Principal;       // User principal
        skillCardId: Text;       // Skill card ID
        completedSkills: [Text]; // IDs of completed skills
        questProgress: [(Text, Nat)]; // Quest ID and score pairs
        totalPoints: Nat;        // Total points earned
        lastUpdated: Int;        // Last update timestamp
    };

    // ===== STORAGE TYPES =====
    
    /// Skill cards storage using Trie
    public type SkillCards = Trie.Trie<Text, SkillCard>;
    
    /// User skill progress storage using Trie (key: userId#skillCardId)
    public type UserSkillProgressMap = Trie.Trie<Text, UserSkillProgress>;
    
    /// Quests storage using Trie
    public type Quests = Trie.Trie<Text, Quest>;
};
