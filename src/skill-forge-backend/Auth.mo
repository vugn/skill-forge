import Types "./Types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Trie "mo:base/Trie";

module {
    // Helper function to get principal key for Trie
    private func principalKey(p: Principal) : Trie.Key<Principal> {
        { key = p; hash = Principal.hash(p) }
    };

    // Authenticate or create user
    public func authenticateUser(users : Trie.Trie<Principal, Types.User>, userId : Principal, userData : Types.UserCreateData) : Result.Result<Types.AuthResult, Types.AuthError> {
        // Validate principal
        if (Principal.isAnonymous(userId)) { 
            return #err(#InvalidPrincipal); 
        };

        // Validate username
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
                // Update last login
                let updatedUser : Types.User = {
                    id = existingUser.id;
                    username = existingUser.username;
                    fullName = existingUser.fullName;
                    profilePicture = existingUser.profilePicture;
                    createdAt = existingUser.createdAt;
                    lastLogin = Time.now();
                };
                
                #ok({
                    user = updatedUser;
                    isNewUser = false;
                });
            };
            case (null) {
                // Create new user
                let newUser : Types.User = {
                    id = userId;
                    username = userData.username;
                    fullName = userData.fullName;
                    profilePicture = userData.profilePicture;
                    createdAt = Time.now();
                    lastLogin = Time.now();
                };

                #ok({
                    user = newUser;
                    isNewUser = true;
                });
            };
        };
    };

    // Update user profile
    public func updateUserProfile(users : Trie.Trie<Principal, Types.User>, userId : Principal, updateData : Types.UserUpdateData) : Result.Result<Types.User, Types.AuthError> {
        if (Principal.isAnonymous(userId)) {
            return #err(#InvalidPrincipal);
        };

        switch (Trie.find(users, principalKey(userId), Principal.equal)) {
            case (null) { return #err(#UserNotFound) };
            case (?user) {
                let username = switch (updateData.username) {
                    case (null) { user.username };
                    case (?newUsername) {
                        if (Text.size(newUsername) < 3) {
                            return #err(#UsernameInvalid);
                        };

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

                let fullName = switch (updateData.fullName) {
                    case (null) { user.fullName };
                    case (?newFullName) { ?newFullName };
                };

                let profilePicture = switch (updateData.profilePicture) {
                    case (null) { user.profilePicture };
                    case (?newProfilePicture) { ?newProfilePicture };
                };

                let updatedUser : Types.User = {
                    id = user.id;
                    username = username;
                    fullName = fullName;
                    profilePicture = profilePicture;
                    createdAt = user.createdAt;
                    lastLogin = Time.now();
                };

                #ok(updatedUser);
            };
        };
    };

    // Get user by username
    public func getUserByUsername(users : Trie.Trie<Principal, Types.User>, username : Text) : ?Types.User {
        for ((principal, user) in Trie.iter(users)) {
            if (user.username == username) {
                return ?user;
            };
        };
        return null;
    };

    // Get user by principal
    public func getUserByPrincipal(users : Trie.Trie<Principal, Types.User>, userId : Principal) : ?Types.User {
        Trie.find(users, principalKey(userId), Principal.equal);
    };

    // Check if user exists
    public func userExists(users : Trie.Trie<Principal, Types.User>, userId : Principal) : Bool {
        switch (Trie.find(users, principalKey(userId), Principal.equal)) {
            case (?user) { true };
            case (null) { false };
        };
    };
};
