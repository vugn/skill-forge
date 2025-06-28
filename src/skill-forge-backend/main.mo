import Types "./Types";
import Auth "./Auth";
import Level "./Level";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Trie "mo:base/Trie";

actor SkillForge {
    // Stable storage for users
    private stable var usersEntries : [(Principal, Types.User)] = [];
    
    // Runtime storage using Trie
    private var users : Types.Users = Trie.empty();

    // System functions for upgrade persistence
    system func preupgrade() {
        usersEntries := Trie.toArray<Principal, Types.User, (Principal, Types.User)>(users, func(k: Principal, v: Types.User): (Principal, Types.User) { (k, v) });
    };

    system func postupgrade() {
        for ((principal, user) in usersEntries.vals()) {
            users := Trie.put(users, principalKey(principal), Principal.equal, user).0;
        };
        usersEntries := [];
    };

    // Helper function to get principal key for Trie operations
    private func principalKey(p: Principal) : Trie.Key<Principal> {
        { key = p; hash = Principal.hash(p) }
    };

    // Authenticate user with Internet Identity
    public shared(msg) func authenticateUser(userData : Types.UserCreateData) : async Result.Result<Types.AuthResult, Text> {
        let userId = msg.caller;
        
        switch (Auth.authenticateUser(users, userId, userData)) {
            case (#ok(authResult)) {
                // Update users storage
                users := Trie.put(users, principalKey(userId), Principal.equal, authResult.user).0;
                #ok(authResult);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#InvalidPrincipal) { "Invalid principal" };
                    case (#UsernameTaken) { "Username is already taken" };
                    case (#UsernameInvalid) { "Username must be at least 3 characters long" };
                    case (#UserNotFound) { "User not found" };
                    case (#UpdateFailed) { "Failed to update user" };
                };
                #err(errorMessage);
            };
        };
    };

    // Get current user profile
    public shared(msg) func getCurrentUser() : async Result.Result<Types.User, Text> {
        let userId = msg.caller;
        
        switch (Auth.getUserByPrincipal(users, userId)) {
            case (?user) { #ok(user) };
            case (null) { #err("User not found") };
        };
    };

    // Update user profile
    public shared(msg) func updateUserProfile(updateData : Types.UserUpdateData) : async Result.Result<Types.User, Text> {
        let userId = msg.caller;
        
        switch (Auth.updateUserProfile(users, userId, updateData)) {
            case (#ok(updatedUser)) {
                // Update users storage
                users := Trie.put(users, principalKey(userId), Principal.equal, updatedUser).0;
                #ok(updatedUser);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#InvalidPrincipal) { "Invalid principal" };
                    case (#UsernameTaken) { "Username is already taken" };
                    case (#UsernameInvalid) { "Username must be at least 3 characters long" };
                    case (#UserNotFound) { "User not found" };
                    case (#UpdateFailed) { "Failed to update user" };
                };
                #err(errorMessage);
            };
        };
    };

    // Get user by username (public query)
    public query func getUserByUsername(username : Text) : async ?Types.User {
        Auth.getUserByUsername(users, username);
    };

    // Check if user exists
    public shared(msg) func userExists() : async Bool {
        let userId = msg.caller;
        Auth.userExists(users, userId);
    };

    // Get all users (for admin purposes, you might want to restrict this)
    public query func getAllUsers() : async [Types.User] {
        Trie.toArray<Principal, Types.User, Types.User>(users, func(k: Principal, v: Types.User): Types.User { v });
    };

    // Get total user count
    public query func getUserCount() : async Nat {
        Trie.size(users);
    };

    // Add experience to user
    public shared(msg) func addExperience(amount : Nat, _source : Text) : async Result.Result<Types.LevelUpResult, Text> {
        let userId = msg.caller;
        
        switch (Auth.getUserByPrincipal(users, userId)) {
            case (?user) {
                let levelUpResult = Level.addExperience(user.totalExperience, amount);
                
                // Update user with new experience and level
                let updatedUser : Types.User = {
                    id = user.id;
                    username = user.username;
                    fullName = user.fullName;
                    profilePicture = user.profilePicture;
                    createdAt = user.createdAt;
                    lastLogin = user.lastLogin;
                    level = levelUpResult.newLevel;
                    experience = levelUpResult.newLevelInfo.currentExp;
                    totalExperience = levelUpResult.newLevelInfo.totalExp;
                };
                
                // Save updated user
                users := Trie.put(users, principalKey(userId), Principal.equal, updatedUser).0;
                
                #ok(levelUpResult);
            };
            case (null) { #err("User not found") };
        };
    };

    // Get user level info
    public shared(msg) func getLevelInfo() : async Result.Result<Types.LevelInfo, Text> {
        let userId = msg.caller;
        
        switch (Auth.getUserByPrincipal(users, userId)) {
            case (?user) {
                let levelInfo = Level.getLevelInfo(user.totalExperience);
                #ok(levelInfo);
            };
            case (null) { #err("User not found") };
        };
    };

    // Add experience for specific activities
    public shared(_msg) func completeActivity(activityType : Text) : async Result.Result<Types.LevelUpResult, Text> {
        let expReward = Level.getExpReward(activityType);
        await addExperience(expReward, activityType);
    };

    // Get experience required for next level
    public query func getExpRequiredForLevel(level : Nat) : async Nat {
        Level.getExpRequiredForLevel(level);
    };

    // Health check
    public query func healthCheck() : async Bool {
        true;
    };
}