import Types "../core/Types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Trie "mo:base/Trie";

/// Auth module handles all authentication and user management operations
/// This module provides functions for user authentication, profile management, and user validation
module {
    
    /// Helper function to create a principal key for Trie operations
    /// @param p - The principal to create a key for
    /// @return Trie key for the principal
    private func principalKey(p: Principal) : Trie.Key<Principal> {
        { key = p; hash = Principal.hash(p) }
    };

    /// Authenticate or create user with Internet Identity
    /// @param users - Current users Trie
    /// @param userId - User principal from Internet Identity
    /// @param userData - User creation data
    /// @return Result containing authentication result or error
    public func authenticateUser(users : Trie.Trie<Principal, Types.User>, userId : Principal, userData : Types.UserCreateData) : Result.Result<Types.AuthResult, Types.AuthError> {
        // Validate principal is not anonymous
        if (Principal.isAnonymous(userId)) { 
            return #err(#InvalidPrincipal); 
        };

        // Validate username length
        if (Text.size(userData.username) < 3) {
            return #err(#UsernameInvalid);
        };

        // Check if username is taken by another user
        for ((id, user) in Trie.iter(users)) {
            if (Text.equal(user.username, userData.username)) {
                if (id != userId) {
                    return #err(#UsernameTaken);
                };
            };
        };

        // Check if user already exists
        switch (Trie.find(users, principalKey(userId), Principal.equal)) {
            case (?existingUser) { 
                // Update last login for existing user
                let updatedUser : Types.User = {
                    id = existingUser.id;
                    username = existingUser.username;
                    fullName = existingUser.fullName;
                    profilePicture = existingUser.profilePicture;
                    createdAt = existingUser.createdAt;
                    lastLogin = Time.now();
                    level = existingUser.level;
                    experience = existingUser.experience;
                    totalExperience = existingUser.totalExperience;
                };
                
                #ok({
                    user = updatedUser;
                    isNewUser = false;
                });
            };
            case (null) {
                // Create new user with default values
                let newUser : Types.User = {
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

                #ok({
                    user = newUser;
                    isNewUser = true;
                });
            };
        };
    };

    /// Update user profile information
    /// @param users - Current users Trie
    /// @param userId - User principal
    /// @param updateData - User update data
    /// @return Result containing updated user or error
    public func updateUserProfile(users : Trie.Trie<Principal, Types.User>, userId : Principal, updateData : Types.UserUpdateData) : Result.Result<Types.User, Types.AuthError> {
        // Validate principal is not anonymous
        if (Principal.isAnonymous(userId)) {
            return #err(#InvalidPrincipal);
        };

        switch (Trie.find(users, principalKey(userId), Principal.equal)) {
            case (null) { return #err(#UserNotFound) };
            case (?user) {
                // Handle username update with validation
                let username = switch (updateData.username) {
                    case (null) { user.username };
                    case (?newUsername) {
                        if (Text.size(newUsername) < 3) {
                            return #err(#UsernameInvalid);
                        };

                        // Check if new username is different and not taken
                        if (newUsername != user.username) {
                            for ((id, existingUser) in Trie.iter(users)) {
                                if (id != userId and Text.equal(existingUser.username, newUsername)) {
                                    return #err(#UsernameTaken);
                                };
                            };
                        };
                        newUsername;
                    };
                };

                // Handle optional field updates
                let fullName = switch (updateData.fullName) {
                    case (null) { user.fullName };
                    case (?newFullName) { ?newFullName };
                };

                let profilePicture = switch (updateData.profilePicture) {
                    case (null) { user.profilePicture };
                    case (?newProfilePicture) { ?newProfilePicture };
                };

                let experience = switch (updateData.experience) {
                    case (null) { user.experience };
                    case (?newExp) { newExp };
                };

                // Create updated user object
                let updatedUser : Types.User = {
                    id = user.id;
                    username = username;
                    fullName = fullName;
                    profilePicture = profilePicture;
                    createdAt = user.createdAt;
                    lastLogin = Time.now();
                    level = user.level;
                    experience = experience;
                    totalExperience = user.totalExperience;
                };

                #ok(updatedUser);
            };
        };
    };

    /// Get user by username (public query function)
    /// @param users - Current users Trie
    /// @param username - Username to search for
    /// @return Optional user if found
    public func getUserByUsername(users : Trie.Trie<Principal, Types.User>, username : Text) : ?Types.User {
        for ((principal, user) in Trie.iter(users)) {
            if (user.username == username) {
                return ?user;
            };
        };
        return null;
    };

    /// Get user by principal ID
    /// @param users - Current users Trie
    /// @param userId - User principal to search for
    /// @return Optional user if found
    public func getUserByPrincipal(users : Trie.Trie<Principal, Types.User>, userId : Principal) : ?Types.User {
        Trie.find(users, principalKey(userId), Principal.equal);
    };

    /// Check if user exists in the system
    /// @param users - Current users Trie
    /// @param userId - User principal to check
    /// @return True if user exists, false otherwise
    public func userExists(users : Trie.Trie<Principal, Types.User>, userId : Principal) : Bool {
        switch (Trie.find(users, principalKey(userId), Principal.equal)) {
            case (?user) { true };
            case (null) { false };
        };
    };
};
