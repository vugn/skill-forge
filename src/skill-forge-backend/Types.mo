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

}
