import Types "./Types";
import Auth "./Auth";
import Level "./Level";
import SkillCard "./SkillCard";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Trie "mo:base/Trie";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor SkillForge {
    // Stable storage for users
    private stable var usersEntries : [(Principal, Types.User)] = [];

    // Stable storage for skill cards
    private stable var skillCardsEntries : [(Text, Types.SkillCard)] = [];
    private stable var questsEntries : [(Text, Types.Quest)] = [];
    private stable var userProgressEntries : [(Text, Types.UserSkillProgress)] = [];

    // Runtime storage using Trie
    private var users : Types.Users = Trie.empty();
    private var skillCards : Types.SkillCards = Trie.empty();
    private var quests : Types.Quests = Trie.empty();
    private var userProgress : Types.UserSkillProgressMap = Trie.empty();

    // System functions for upgrade persistence
    system func preupgrade() {
        usersEntries := Trie.toArray<Principal, Types.User, (Principal, Types.User)>(users, func(k : Principal, v : Types.User) : (Principal, Types.User) { (k, v) });
        skillCardsEntries := Trie.toArray<Text, Types.SkillCard, (Text, Types.SkillCard)>(skillCards, func(k : Text, v : Types.SkillCard) : (Text, Types.SkillCard) { (k, v) });
        questsEntries := Trie.toArray<Text, Types.Quest, (Text, Types.Quest)>(quests, func(k : Text, v : Types.Quest) : (Text, Types.Quest) { (k, v) });
        userProgressEntries := Trie.toArray<Text, Types.UserSkillProgress, (Text, Types.UserSkillProgress)>(userProgress, func(k : Text, v : Types.UserSkillProgress) : (Text, Types.UserSkillProgress) { (k, v) });
    };

    system func postupgrade() {
        for ((principal, user) in usersEntries.vals()) {
            users := Trie.put(users, principalKey(principal), Principal.equal, user).0;
        };
        for ((key, skillCard) in skillCardsEntries.vals()) {
            skillCards := Trie.put(skillCards, textKey(key), Text.equal, skillCard).0;
        };
        for ((key, quest) in questsEntries.vals()) {
            quests := Trie.put(quests, textKey(key), Text.equal, quest).0;
        };
        for ((key, progress) in userProgressEntries.vals()) {
            userProgress := Trie.put(userProgress, textKey(key), Text.equal, progress).0;
        };
        usersEntries := [];
        skillCardsEntries := [];
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

    // Helper function to ensure user exists, create if not
    private func ensureUserExists(userId : Principal) : Result.Result<Types.User, Text> {
        switch (Auth.getUserByPrincipal(users, userId)) {
            case (?existingUser) { #ok(existingUser) };
            case (null) {
                // Auto-create user with default data if they don't exist
                let defaultUserData : Types.UserCreateData = {
                    username = "user" # Principal.toText(userId);
                    fullName = null;
                    profilePicture = null;
                };
                
                switch (Auth.authenticateUser(users, userId, defaultUserData)) {
                    case (#ok(authResult)) {
                        users := Trie.put(users, principalKey(userId), Principal.equal, authResult.user).0;
                        #ok(authResult.user);
                    };
                    case (#err(error)) {
                        let errorMessage = switch (error) {
                            case (#UserNotFound) { "User not found" };
                            case (#InvalidPrincipal) { "Invalid principal" };
                            case (#UsernameTaken) { "Username taken" };
                            case (#UsernameInvalid) { "Username invalid" };
                            case (#UpdateFailed) { "Update failed" };
                        };
                        #err("Failed to create user: " # errorMessage);
                    };
                };
            };
        };
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

        switch (ensureUserExists(userId)) {
            case (#ok(user)) { #ok(user) };
            case (#err(error)) { #err(error) };
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
        
        switch (ensureUserExists(userId)) {
            case (#ok(_)) { true };
            case (#err(_)) { false };
        };
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

        let user = switch (ensureUserExists(userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

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

    // Get user level info
    public shared (msg) func getLevelInfo() : async Result.Result<Types.LevelInfo, Text> {
        let userId = msg.caller;

        let user = switch (ensureUserExists(userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        let userLevelInfo = Level.getLevelInfo(user.totalExperience);

        #ok(userLevelInfo);
    };

    // Add experience for specific activities
    public shared (msg) func completeActivity(activityType : Text) : async Result.Result<Types.LevelUpResult, Text> {
        let userId = msg.caller;
        
        let user = switch (ensureUserExists(userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };
        
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

    // ===== SKILL CARD SYSTEM =====

    // Commented out test functions since they don't exist in SkillCard module
    // public func testingLLM(prompt : Text) : async Result.Result<Text, Text> {
    //     await SkillCard.testingLLM(prompt);
    // };

    // public func testingSkillCardLLM( prompt : Text) : async Result.Result<Text, Text> {
    //     await SkillCard.testingSkillCardLLM(prompt);
    // };

    // Generate skill card based on user input
    public shared (msg) func generateSkillCard(request : Types.SkillCardRequest) : async Result.Result<Types.SkillCardGeneration, Text> {
        let userId = msg.caller;

        // Check if user exists, create if not
        let user = switch (Auth.getUserByPrincipal(users, userId)) {
            case (?existingUser) { existingUser };
            case (null) {
                // Auto-create user with default data if they don't exist
                let defaultUserData : Types.UserCreateData = {
                    username = "user" # Principal.toText(userId);
                    fullName = null;
                    profilePicture = null;
                };
                
                switch (Auth.authenticateUser(users, userId, defaultUserData)) {
                    case (#ok(authResult)) {
                        users := Trie.put(users, principalKey(userId), Principal.equal, authResult.user).0;
                        authResult.user;
                    };
                    case (#err(error)) {
                        let errorMessage = switch (error) {
                            case (#UserNotFound) { "User not found" };
                            case (#InvalidPrincipal) { "Invalid principal" };
                            case (#UsernameTaken) { "Username taken" };
                            case (#UsernameInvalid) { "Username invalid" };
                            case (#UpdateFailed) { "Update failed" };
                        };
                        return #err("Failed to create user: " # errorMessage);
                    };
                };
            };
        };

        switch (await SkillCard.generateSkillCard(request, userId)) {
            case (#ok(generation)) {
                // Store the generated skill cards and quests
                for (skillCard in generation.skillCards.vals()) {
                    skillCards := Trie.put(skillCards, textKey(skillCard.id), Text.equal, skillCard).0;
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

    // Accept a skill card
    public shared (msg) func acceptSkillCard(skillCardId : Text) : async Result.Result<Types.SkillCard, Text> {
        let userId = msg.caller;

        switch (SkillCard.acceptSkillCard(skillCards, skillCardId, userId)) {
            case (#ok(acceptedCard)) {
                // Update skill card in storage
                skillCards := Trie.put(skillCards, textKey(skillCardId), Text.equal, acceptedCard).0;

                // Create initial user progress
                let progressKey = SkillCard.createProgressKey(userId, skillCardId);
                let initialProgress : Types.UserSkillProgress = {
                    userId = userId;
                    skillCardId = skillCardId;
                    completedSkills = [];
                    questProgress = [];
                    totalPoints = 0;
                    lastUpdated = Time.now();
                };

                userProgress := Trie.put(userProgress, textKey(progressKey), Text.equal, initialProgress).0;

                #ok(acceptedCard);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#SkillCardNotFound) { "Skill card not found" };
                    case (#UserNotAuthorized) {
                        "Not authorized to access this skill card";
                    };
                    case (#SkillCardAlreadyAccepted) {
                        "Skill card already accepted";
                    };
                    case (_) { "Unknown error occurred" };
                };
                #err(errorMessage);
            };
        };
    };

    // Decline a skill card
    public shared (msg) func declineSkillCard(skillCardId : Text) : async Result.Result<Bool, Text> {
        let userId = msg.caller;

        switch (SkillCard.declineSkillCard(skillCards, skillCardId, userId)) {
            case (#ok(declinedCard)) {
                // Update skill card in storage
                skillCards := Trie.put(skillCards, textKey(skillCardId), Text.equal, declinedCard).0;
                #ok(true);
            };
            case (#err(error)) {
                let errorMessage = switch (error) {
                    case (#SkillCardNotFound) { "Skill card not found" };
                    case (#UserNotAuthorized) {
                        "Not authorized to access this skill card";
                    };
                    case (_) { "Unknown error occurred" };
                };
                #err(errorMessage);
            };
        };
    };

    // Get user's skill cards
    public shared (msg) func getUserSkillCards() : async [Types.SkillCard] {
        let userId = msg.caller;
        SkillCard.getUserSkillCards(skillCards, userId);
    };

    // Get skill card by ID
    public query func getSkillCardById(skillCardId : Text) : async ?Types.SkillCard {
        SkillCard.getSkillCardById(skillCards, skillCardId);
    };

    // Get quest by ID
    public query func getQuestById(questId : Text) : async ?Types.Quest {
        Trie.find(quests, textKey(questId), Text.equal);
    };

    // Get user progress for a skill card
    public shared (msg) func getUserSkillProgress(skillCardId : Text) : async ?Types.UserSkillProgress {
        let userId = msg.caller;
        let progressKey = SkillCard.createProgressKey(userId, skillCardId);
        Trie.find(userProgress, textKey(progressKey), Text.equal);
    };

    // Complete a skill and unlock dependencies
    public shared (msg) func completeSkill(skillCardId : Text, skillId : Text) : async Result.Result<{ skillCard : Types.SkillCard; expGained : Nat; levelUpResult : [Types.LevelUpResult] }, Text> {
        let userId = msg.caller;
        let progressKey = SkillCard.createProgressKey(userId, skillCardId);

        // Ensure user exists, create if not
        let user = switch (ensureUserExists(userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        switch (Trie.find(skillCards, textKey(skillCardId), Text.equal)) {
            case (?skillCard) {
                if (skillCard.userId != userId or skillCard.status != #accepted) {
                    return #err("Not authorized or skill card not accepted");
                };

                let currentProgress = Trie.find(userProgress, textKey(progressKey), Text.equal);

                switch (SkillCard.unlockSkill(skillCard, skillId, currentProgress)) {
                    case (#ok(updatedCard)) {
                        // Update skill card
                        skillCards := Trie.put(skillCards, textKey(skillCardId), Text.equal, updatedCard).0;

                        // Find the completed skill to get its points
                        var skillPoints : Nat = 50; // Default points
                        for (skill in updatedCard.skills.vals()) {
                            if (skill.id == skillId) {
                                skillPoints := skill.maxPoints;
                            };
                        };

                        // Update user progress
                        let updatedProgress = switch (currentProgress) {
                            case (?progress) {
                                {
                                    progress with
                                    completedSkills = Array.append([skillId], progress.completedSkills);
                                    totalPoints = progress.totalPoints + skillPoints;
                                    lastUpdated = Time.now();
                                };
                            };
                            case (null) {
                                {
                                    userId = userId;
                                    skillCardId = skillCardId;
                                    completedSkills = [skillId];
                                    questProgress = [];
                                    totalPoints = skillPoints;
                                    lastUpdated = Time.now();
                                };
                            };
                        };

                        userProgress := Trie.put(userProgress, textKey(progressKey), Text.equal, updatedProgress).0;

                        // Award experience points for skill completion
                        let expGained = skillPoints;
                        var levelUpResult : [Types.LevelUpResult] = [];
                        
                        // Calculate level up result similar to testLeveling
                        let levelUpResultCalc = Level.addExperience(user.totalExperience, expGained);
                        
                        // Update user with new experience and level directly in storage
                        let updatedUserForSkill : Types.User = {
                            id = user.id;
                            username = user.username;
                            fullName = user.fullName;
                            profilePicture = user.profilePicture;
                            createdAt = user.createdAt;
                            lastLogin = user.lastLogin;
                            level = levelUpResultCalc.newLevel;
                            experience = levelUpResultCalc.newLevelInfo.currentExp;
                            totalExperience = levelUpResultCalc.newLevelInfo.totalExp;
                        };

                        // Save updated user
                        users := Trie.put(users, principalKey(userId), Principal.equal, updatedUserForSkill).0;
                        
                        levelUpResult := [levelUpResultCalc];

                        #ok({
                            skillCard = updatedCard;
                            expGained = expGained;
                            levelUpResult = levelUpResult;
                        });
                    };
                    case (#err(error)) {
                        let errorMessage = switch (error) {
                            case (#SkillNotUnlocked) {
                                "Skill dependencies not met";
                            };
                            case (#SkillCardNotFound) {
                                "Skill not found in card";
                            };
                            case (_) { "Unknown error occurred" };
                        };
                        #err(errorMessage);
                    };
                };
            };
            case (null) { #err("Skill card not found") };
        };
    };

    // Submit quest answers and get score
    public shared (msg) func submitQuestAnswers(questId : Text, answers : [Nat]) : async Result.Result<{ score : Nat; passed : Bool; totalQuestions : Nat; expGained : Nat; levelUpResult : [Types.LevelUpResult] }, Text> {
        let userId = msg.caller;

        // Ensure user exists, create if not
        let user = switch (ensureUserExists(userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

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

                // Fix score calculation to avoid integer division issues
                let scorePercentage = if (totalQuestions > 0) {
                    (correctAnswers * 100) / totalQuestions
                } else { 0 };

                let passed = Float.fromInt(scorePercentage) >= (quest.passingThreshold * 100.0);

                var expGained : Nat = 0;
                var levelUpResult : [Types.LevelUpResult] = [];

                // Award experience points if quest is passed
                if (passed) {
                    // Calculate XP: base points + bonus for performance
                    let baseExp = quest.points;
                    let bonusExp = if (scorePercentage >= 95) {
                        baseExp / 2; // 50% bonus for 95%+ score
                    } else if (scorePercentage >= 85) {
                        baseExp / 4; // 25% bonus for 85%+ score
                    } else if (scorePercentage >= 75) {
                        baseExp / 10; // 10% bonus for 75%+ score
                    } else {
                        0; // No bonus below 75%
                    };
                    
                    expGained := baseExp + bonusExp;
                    
                    // Calculate level up result similar to testLeveling
                    let levelUpResultCalc = Level.addExperience(user.totalExperience, expGained);
                    
                    // Update user with new experience and level directly in storage
                    let updatedUserForQuest : Types.User = {
                        id = user.id;
                        username = user.username;
                        fullName = user.fullName;
                        profilePicture = user.profilePicture;
                        createdAt = user.createdAt;
                        lastLogin = user.lastLogin;
                        level = levelUpResultCalc.newLevel;
                        experience = levelUpResultCalc.newLevelInfo.currentExp;
                        totalExperience = levelUpResultCalc.newLevelInfo.totalExp;
                    };

                    // Save updated user
                    users := Trie.put(users, principalKey(userId), Principal.equal, updatedUserForQuest).0;
                    
                    levelUpResult := [levelUpResultCalc];
                };

                #ok({
                    score = scorePercentage;
                    passed = passed;
                    totalQuestions = totalQuestions;
                    expGained = expGained;
                    levelUpResult = levelUpResult;
                });
            };
            case (null) { 
                #err("Quest not found"); 
            };
        };
    };

    // Get all quests (for testing)
    public query func getAllQuests() : async [Types.Quest] {
        Trie.toArray<Text, Types.Quest, Types.Quest>(quests, func(k : Text, v : Types.Quest) : Types.Quest { v });
    };

    // Get all skill cards (for testing)
    public query func getAllSkillCards() : async [Types.SkillCard] {
        Trie.toArray<Text, Types.SkillCard, Types.SkillCard>(skillCards, func(k : Text, v : Types.SkillCard) : Types.SkillCard { v });
    };

    // Test function to verify leveling system
    public shared (msg) func testLeveling() : async Result.Result<{ oldLevel : Nat; newLevel : Nat; expGained : Nat; leveledUp : Bool }, Text> {
        let userId = msg.caller;

        let user = switch (ensureUserExists(userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        // Add 100 XP to test leveling
        let testExp = 100;
        let levelUpResult = Level.addExperience(user.totalExperience, testExp);

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

        #ok({
            oldLevel = user.level;
            newLevel = levelUpResult.newLevel;
            expGained = testExp;
            leveledUp = levelUpResult.leveledUp;
        });
    };

};
