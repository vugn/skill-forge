import Types "../../core/Types";
import Auth "../../auth/Auth";
import Level "../../core/Level";
import Storage "../storage/Storage";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";

/// UserService module handles all user-related business logic and operations
/// This module provides a clean interface for user management, authentication, and profile operations
module {
    
    /// Ensure user exists in the system, return error if not found
    /// @param users - Current users Trie
    /// @param userId - User principal to check
    /// @return Result containing user if found, error if not
    public func ensureUserExists(users : Types.Users, userId : Principal) : Result.Result<Types.User, Text> {
        switch (Auth.getUserByPrincipal(users, userId)) {
            case (?existingUser) { #ok(existingUser) };
            case (null) {
                #err("User not found. Please complete account setup first.");
            };
        };
    };

    /// Authenticate user with Internet Identity
    /// @param users - Current users Trie
    /// @param userId - User principal
    /// @param userData - User creation data
    /// @return Result containing authentication result or error
    public func authenticateUser(users : Types.Users, userId : Principal, userData : Types.UserCreateData) : Result.Result<Types.AuthResult, Text> {
        switch (Auth.authenticateUser(users, userId, userData)) {
            case (#ok(authResult)) {
                #ok(authResult);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#InvalidPrincipal) { "Invalid principal" };
                    case (#UsernameTaken) { "Username is already taken" };
                    case (#UsernameInvalid) {
                        "Username must be at least 3 characters long";
                    };
                    case (#UserNotFound) { "User not found" };
                    case (#UpdateFailed) { "Failed to update user" };
                };
                #err(errorMessage);
            };
        };
    };

    /// Update user profile information
    /// @param users - Current users Trie
    /// @param userId - User principal
    /// @param updateData - User update data
    /// @return Result containing updated user or error
    public func updateUserProfile(users : Types.Users, userId : Principal, updateData : Types.UserUpdateData) : Result.Result<Types.User, Text> {
        switch (Auth.updateUserProfile(users, userId, updateData)) {
            case (#ok(updatedUser)) {
                #ok(updatedUser);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#InvalidPrincipal) { "Invalid principal" };
                    case (#UsernameTaken) { "Username is already taken" };
                    case (#UsernameInvalid) {
                        "Username must be at least 3 characters long";
                    };
                    case (#UserNotFound) { "User not found" };
                    case (#UpdateFailed) { "Failed to update user" };
                };
                #err(errorMessage);
            };
        };
    };

    /// Add experience to user and handle level up logic
    /// @param users - Current users Trie
    /// @param userId - User principal
    /// @param amount - Experience amount to add
    /// @param source - Source of experience (e.g., "skill_completion")
    /// @return Result containing level up result or error
    public func addExperience(users : Types.Users, userId : Principal, amount : Nat, _source : Text) : Result.Result<Types.LevelUpResult, Text> {
        let user = switch (ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        let levelUpResult = Level.addExperience(user.totalExperience, amount);

        // Update user with new experience and level
        let _updatedUser : Types.User = {
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

        #ok(levelUpResult);
    };

    /// Get user level information
    /// @param users - Current users Trie
    /// @param userId - User principal
    /// @return Result containing level info or error
    public func getLevelInfo(users : Types.Users, userId : Principal) : Result.Result<Types.LevelInfo, Text> {
        let user = switch (ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        let userLevelInfo = Level.getLevelInfo(user.totalExperience);
        #ok(userLevelInfo);
    };

    /// Complete an activity and award experience
    /// @param users - Current users Trie
    /// @param userId - User principal
    /// @param activityType - Type of activity completed
    /// @return Result containing level up result or error
    public func completeActivity(users : Types.Users, userId : Principal, activityType : Text) : Result.Result<Types.LevelUpResult, Text> {
        let _user = switch (ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };
        
        let expReward = Level.getExpReward(activityType);
        addExperience(users, userId, expReward, activityType);
    };

    /// Check if user exists in the system
    /// @param users - Current users Trie
    /// @param userId - User principal to check
    /// @return True if user exists, false otherwise
    public func userExists(users : Types.Users, userId : Principal) : Bool {
        switch (ensureUserExists(users, userId)) {
            case (#ok(_)) { true };
            case (#err(_)) { false };
        };
    };

    /// Get user by username (public query)
    /// @param users - Current users Trie
    /// @param username - Username to search for
    /// @return Optional user if found
    public func getUserByUsername(users : Types.Users, username : Text) : ?Types.User {
        Auth.getUserByUsername(users, username);
    };

    /// Get all users in the system
    /// @param users - Current users Trie
    /// @return Array of all users
    public func getAllUsers(users : Types.Users) : [Types.User] {
        Storage.getAllUsers(users);
    };

    /// Get total user count
    /// @param users - Current users Trie
    /// @return Number of users
    public func getUserCount(users : Types.Users) : Nat {
        Storage.getUserCount(users);
    };

    /// Update user's last login timestamp
    /// @param user - Current user
    /// @return Updated user with new last login time
    public func updateLastLogin(user : Types.User) : Types.User {
        {
            user with
            lastLogin = Time.now();
        };
    };

    /// Create a new user with default values
    /// @param userId - User principal
    /// @param userData - User creation data
    /// @return New user object
    public func createNewUser(userId : Principal, userData : Types.UserCreateData) : Types.User {
        {
            id = userId;
            username = userData.username;
            fullName = userData.fullName;
            profilePicture = userData.profilePicture;
            createdAt = Time.now();
            lastLogin = Time.now();
            level = 1;
            experience = 0;
            totalExperience = 0;
        };
    };

    /// Validate user data for creation
    /// @param userData - User creation data to validate
    /// @return Result indicating if data is valid
    public func validateUserData(userData : Types.UserCreateData) : Result.Result<Bool, Text> {
        if (Text.size(userData.username) < 3) {
            return #err("Username must be at least 3 characters long");
        };
        #ok(true);
    };
};
