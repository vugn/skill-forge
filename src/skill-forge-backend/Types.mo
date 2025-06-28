import Principal "mo:base/Principal";
import Trie "mo:base/Trie";

module {
    // User profile type
    public type User = {
        id: Principal;
        username: Text;
        fullName: ?Text;
        profilePicture: ?Text;
        createdAt: Int;
        lastLogin: Int;
        level: Nat;
        experience: Nat;
        totalExperience: Nat;
    };

    // User update data type
    public type UserUpdateData = {
        username: ?Text;
        fullName: ?Text;
        profilePicture: ?Text;
        experience: ?Nat;
    };

    // User creation data type
    public type UserCreateData = {
        username: Text;
        fullName: ?Text;
        profilePicture: ?Text;
    };

    // Users storage type using Trie
    public type Users = Trie.Trie<Principal, User>;

    // Authentication result type
    public type AuthResult = {
        user: User;
        isNewUser: Bool;
    };

    // Error types
    public type AuthError = {
        #UserNotFound;
        #InvalidPrincipal;
        #UsernameTaken;
        #UsernameInvalid;
        #UpdateFailed;
    };

    // API response types
    public type Result<T, E> = {
        #ok: T;
        #err: E;
    };

    // Experience and level types
    public type ExperienceGain = {
        amount: Nat;
        source: Text; // e.g., "skill_completion", "quiz_passed", "daily_login"
        timestamp: Int;
    };

    public type LevelInfo = {
        level: Nat;
        currentExp: Nat;
        expToNextLevel: Nat;
        totalExp: Nat;
    };

    public type LevelUpResult = {
        newLevel: Nat;
        expGained: Nat;
        leveledUp: Bool;
        newLevelInfo: LevelInfo;
    };

    // Skill Tree System Types
    public type GridPosition = {
        x: Nat;
        y: Nat;
    };

    public type Question = {
        id: Text;
        text: Text;
        options: [Text];
        correctAnswer: Nat;
        explanation: Text;
    };

    public type Quest = {
        id: Text;
        title: Text;
        description: Text;
        questions: [Question];
        points: Nat;
        passingThreshold: Float;
    };

    public type SkillNode = {
        id: Text;
        name: Text;
        description: Text;
        iconName: Text;
        gridPosition: GridPosition;
        dependencies: [Text];
        questId: Text;
        isUnlocked: Bool;
        isCompleted: Bool;
        maxPoints: Nat;
        currentPoints: Nat;
    };

    public type SkillTreeStatus = {
        #preview;
        #accepted;
        #declined;
    };

    public type SkillTree = {
        id: Text;
        title: Text;
        description: Text;
        category: Text;
        skills: [SkillNode];
        completedPoints: Nat;
        totalPoints: Nat;
        status: SkillTreeStatus;
        createdAt: Int;
        userId: Principal;
    };

    public type SkillTreeGeneration = {
        skillTrees: [SkillTree];
        quests: [Quest];
    };

    public type SkillTreeRequest = {
        prompt: Text;
        category: ?Text;
        difficulty: ?Text;
    };

    public type UserSkillProgress = {
        userId: Principal;
        skillTreeId: Text;
        completedSkills: [Text];
        questProgress: [(Text, Nat)]; // (questId, score)
        totalPoints: Nat;
        lastUpdated: Int;
    };

    // Storage types
    public type SkillTrees = Trie.Trie<Text, SkillTree>;
    public type UserSkillProgressMap = Trie.Trie<Text, UserSkillProgress>; // key: userId#skillTreeId
    public type Quests = Trie.Trie<Text, Quest>;

}
