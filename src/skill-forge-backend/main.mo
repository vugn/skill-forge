import Types "./Types";
import Auth "./Auth";
import Level "./Level";
import SkillTree "./SkillTree";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Trie "mo:base/Trie";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Float "mo:base/Float";

actor SkillForge {
    // Stable storage for users
    private stable var usersEntries : [(Principal, Types.User)] = [];

    // Stable storage for skill trees
    private stable var skillTreesEntries : [(Text, Types.SkillTree)] = [];
    private stable var questsEntries : [(Text, Types.Quest)] = [];
    private stable var userProgressEntries : [(Text, Types.UserSkillProgress)] = [];

    // Runtime storage using Trie
    private var users : Types.Users = Trie.empty();
    private var skillTrees : Types.SkillTrees = Trie.empty();
    private var quests : Types.Quests = Trie.empty();
    private var userProgress : Types.UserSkillProgressMap = Trie.empty();

    // System functions for upgrade persistence
    system func preupgrade() {
        usersEntries := Trie.toArray<Principal, Types.User, (Principal, Types.User)>(users, func(k : Principal, v : Types.User) : (Principal, Types.User) { (k, v) });
        skillTreesEntries := Trie.toArray<Text, Types.SkillTree, (Text, Types.SkillTree)>(skillTrees, func(k : Text, v : Types.SkillTree) : (Text, Types.SkillTree) { (k, v) });
        questsEntries := Trie.toArray<Text, Types.Quest, (Text, Types.Quest)>(quests, func(k : Text, v : Types.Quest) : (Text, Types.Quest) { (k, v) });
        userProgressEntries := Trie.toArray<Text, Types.UserSkillProgress, (Text, Types.UserSkillProgress)>(userProgress, func(k : Text, v : Types.UserSkillProgress) : (Text, Types.UserSkillProgress) { (k, v) });
    };

    system func postupgrade() {
        for ((principal, user) in usersEntries.vals()) {
            users := Trie.put(users, principalKey(principal), Principal.equal, user).0;
        };
        for ((key, skillTree) in skillTreesEntries.vals()) {
            skillTrees := Trie.put(skillTrees, textKey(key), Text.equal, skillTree).0;
        };
        for ((key, quest) in questsEntries.vals()) {
            quests := Trie.put(quests, textKey(key), Text.equal, quest).0;
        };
        for ((key, progress) in userProgressEntries.vals()) {
            userProgress := Trie.put(userProgress, textKey(key), Text.equal, progress).0;
        };
        usersEntries := [];
        skillTreesEntries := [];
        questsEntries := [];
        userProgressEntries := [];
    };

    // Helper function to get principal key for Trie operations
    private func principalKey(p : Principal) : Trie.Key<Principal> {
        { key = p; hash = Principal.hash(p) };
    };

    // Helper function to get text key for Trie operations
    private func textKey(t : Text) : Trie.Key<Text> {
        { key = t; hash = Text.hash(t) };
    };

    // Authenticate user with Internet Identity
    public shared (msg) func authenticateUser(userData : Types.UserCreateData) : async Result.Result<Types.AuthResult, Text> {
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

    // Get current user profile
    public shared (msg) func getCurrentUser() : async Result.Result<Types.User, Text> {
        let userId = msg.caller;

        switch (Auth.getUserByPrincipal(users, userId)) {
            case (?user) { #ok(user) };
            case (null) { #err("User not found") };
        };
    };

    // Update user profile
    public shared (msg) func updateUserProfile(updateData : Types.UserUpdateData) : async Result.Result<Types.User, Text> {
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

    // Get user by username (public query)
    public query func getUserByUsername(username : Text) : async ?Types.User {
        Auth.getUserByUsername(users, username);
    };

    // Check if user exists
    public shared (msg) func userExists() : async Bool {
        let userId = msg.caller;
        Auth.userExists(users, userId);
    };

    // Get all users (for admin purposes, you might want to restrict this)
    public query func getAllUsers() : async [Types.User] {
        Trie.toArray<Principal, Types.User, Types.User>(users, func(k : Principal, v : Types.User) : Types.User { v });
    };

    // Get total user count
    public query func getUserCount() : async Nat {
        Trie.size(users);
    };

    // Add experience to user
    public shared (msg) func addExperience(amount : Nat, _source : Text) : async Result.Result<Types.LevelUpResult, Text> {
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
    public shared (msg) func getLevelInfo() : async Result.Result<Types.LevelInfo, Text> {
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
    public shared (_msg) func completeActivity(activityType : Text) : async Result.Result<Types.LevelUpResult, Text> {
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

    // ===== SKILL TREE SYSTEM =====

    // Commented out test functions since they don't exist in SkillTree module
    // public func testingLLM(prompt : Text) : async Result.Result<Text, Text> {
    //     await SkillTree.testingLLM(prompt);
    // };

    // public func testingSkillTreeLLM( prompt : Text) : async Result.Result<Text, Text> {
    //     await SkillTree.testingSkillTreeLLM(prompt);
    // };

    // Generate skill tree based on user input
    public shared (msg) func generateSkillTree(request : Types.SkillTreeRequest) : async Result.Result<Types.SkillTreeGeneration, Text> {
        let userId = msg.caller;

        // Check if user exists
        switch (Auth.getUserByPrincipal(users, userId)) {
            case (?_user) {
                switch (await SkillTree.generateSkillTree(request, userId)) {
                    case (#ok(generation)) {
                        // Store the generated skill trees and quests
                        for (skillTree in generation.skillTrees.vals()) {
                            skillTrees := Trie.put(skillTrees, textKey(skillTree.id), Text.equal, skillTree).0;
                        };

                        for (quest in generation.quests.vals()) {
                            quests := Trie.put(quests, textKey(quest.id), Text.equal, quest).0;
                        };

                        #ok(generation);
                    };
                    case (#err(error)) {
                        let errorMessage = switch (error) {
                            case (#GenerationFailed(message)) { message };
                            case (_) { "Unknown error occurred" };
                        };
                        #err(errorMessage);
                    };
                };
            };
            case (null) { #err("User not found") };
        };
    };

    // Accept a skill tree
    public shared (msg) func acceptSkillTree(skillTreeId : Text) : async Result.Result<Types.SkillTree, Text> {
        let userId = msg.caller;

        switch (SkillTree.acceptSkillTree(skillTrees, skillTreeId, userId)) {
            case (#ok(acceptedTree)) {
                // Update skill tree in storage
                skillTrees := Trie.put(skillTrees, textKey(skillTreeId), Text.equal, acceptedTree).0;

                // Create initial user progress
                let progressKey = SkillTree.createProgressKey(userId, skillTreeId);
                let initialProgress : Types.UserSkillProgress = {
                    userId = userId;
                    skillTreeId = skillTreeId;
                    completedSkills = [];
                    questProgress = [];
                    totalPoints = 0;
                    lastUpdated = Time.now();
                };

                userProgress := Trie.put(userProgress, textKey(progressKey), Text.equal, initialProgress).0;

                #ok(acceptedTree);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#SkillTreeNotFound) { "Skill tree not found" };
                    case (#UserNotAuthorized) {
                        "Not authorized to access this skill tree";
                    };
                    case (#SkillTreeAlreadyAccepted) {
                        "Skill tree already accepted";
                    };
                    case (_) { "Unknown error occurred" };
                };
                #err(errorMessage);
            };
        };
    };

    // Decline a skill tree
    public shared (msg) func declineSkillTree(skillTreeId : Text) : async Result.Result<Bool, Text> {
        let userId = msg.caller;

        switch (SkillTree.declineSkillTree(skillTrees, skillTreeId, userId)) {
            case (#ok(declinedTree)) {
                // Update skill tree in storage
                skillTrees := Trie.put(skillTrees, textKey(skillTreeId), Text.equal, declinedTree).0;
                #ok(true);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#SkillTreeNotFound) { "Skill tree not found" };
                    case (#UserNotAuthorized) {
                        "Not authorized to access this skill tree";
                    };
                    case (_) { "Unknown error occurred" };
                };
                #err(errorMessage);
            };
        };
    };

    // Get user's skill trees
    public shared (msg) func getUserSkillTrees() : async [Types.SkillTree] {
        let userId = msg.caller;
        SkillTree.getUserSkillTrees(skillTrees, userId);
    };

    // Get skill tree by ID
    public query func getSkillTreeById(skillTreeId : Text) : async ?Types.SkillTree {
        SkillTree.getSkillTreeById(skillTrees, skillTreeId);
    };

    // Get quest by ID
    public query func getQuestById(questId : Text) : async ?Types.Quest {
        Trie.find(quests, textKey(questId), Text.equal);
    };

    // Get user progress for a skill tree
    public shared (msg) func getUserSkillProgress(skillTreeId : Text) : async ?Types.UserSkillProgress {
        let userId = msg.caller;
        let progressKey = SkillTree.createProgressKey(userId, skillTreeId);
        Trie.find(userProgress, textKey(progressKey), Text.equal);
    };

    // Complete a skill and unlock dependencies
    public shared (msg) func completeSkill(skillTreeId : Text, skillId : Text) : async Result.Result<Types.SkillTree, Text> {
        let userId = msg.caller;
        let progressKey = SkillTree.createProgressKey(userId, skillTreeId);

        switch (Trie.find(skillTrees, textKey(skillTreeId), Text.equal)) {
            case (?skillTree) {
                if (skillTree.userId != userId or skillTree.status != #accepted) {
                    return #err("Not authorized or skill tree not accepted");
                };

                let currentProgress = Trie.find(userProgress, textKey(progressKey), Text.equal);

                switch (SkillTree.unlockSkill(skillTree, skillId, currentProgress)) {
                    case (#ok(updatedTree)) {
                        // Update skill tree
                        skillTrees := Trie.put(skillTrees, textKey(skillTreeId), Text.equal, updatedTree).0;

                        // Update user progress
                        let updatedProgress = switch (currentProgress) {
                            case (?progress) {
                                {
                                    progress with
                                    completedSkills = Array.append([skillId], progress.completedSkills);
                                    lastUpdated = Time.now();
                                };
                            };
                            case (null) {
                                {
                                    userId = userId;
                                    skillTreeId = skillTreeId;
                                    completedSkills = [skillId];
                                    questProgress = [];
                                    totalPoints = 0;
                                    lastUpdated = Time.now();
                                };
                            };
                        };

                        userProgress := Trie.put(userProgress, textKey(progressKey), Text.equal, updatedProgress).0;

                        #ok(updatedTree);
                    };
                    case (#err(error)) {
                        let errorMessage = switch (error) {
                            case (#SkillNotUnlocked) {
                                "Skill dependencies not met";
                            };
                            case (#SkillTreeNotFound) {
                                "Skill not found in tree";
                            };
                            case (_) { "Unknown error occurred" };
                        };
                        #err(errorMessage);
                    };
                };
            };
            case (null) { #err("Skill tree not found") };
        };
    };

    // Submit quest answers and get score
    public shared (msg) func submitQuestAnswers(questId : Text, answers : [Nat]) : async Result.Result<{ score : Nat; passed : Bool; totalQuestions : Nat }, Text> {
        let _userId = msg.caller;

        switch (Trie.find(quests, textKey(questId), Text.equal)) {
            case (?quest) {
                if (answers.size() != quest.questions.size()) {
                    return #err("Invalid number of answers");
                };

                var correctAnswers : Nat = 0;
                let totalQuestions = quest.questions.size();

                for (i in quest.questions.keys()) {
                    if (i < answers.size() and quest.questions[i].correctAnswer == answers[i]) {
                        correctAnswers += 1;
                    };
                };

                let score = correctAnswers * 100 / totalQuestions;
                let passed = Float.fromInt(score) >= (quest.passingThreshold * 100.0);

                #ok({
                    score = score;
                    passed = passed;
                    totalQuestions = totalQuestions;
                });
            };
            case (null) { #err("Quest not found") };
        };
    };

    // Get all quests (for testing)
    public query func getAllQuests() : async [Types.Quest] {
        Trie.toArray<Text, Types.Quest, Types.Quest>(quests, func(k : Text, v : Types.Quest) : Types.Quest { v });
    };

    // Get all skill trees (for testing)
    public query func getAllSkillTrees() : async [Types.SkillTree] {
        Trie.toArray<Text, Types.SkillTree, Types.SkillTree>(skillTrees, func(k : Text, v : Types.SkillTree) : Types.SkillTree { v });
    };

};
