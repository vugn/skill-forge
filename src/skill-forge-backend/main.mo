import Types "./core/Types";
import Level "./core/Level";

import Storage "./services/storage/Storage";
import UserService "./services/user/UserService";
import SkillCardService "./services/skillcard/SkillCardService";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Trie "mo:base/Trie";

import Text "mo:base/Text";

import Nat "mo:base/Nat";

/// SkillForge Backend - Main Actor
/// This is the main entry point for the SkillForge application backend
/// It orchestrates all user operations, skill card management, and data persistence
actor SkillForge {
    
    // ===== STABLE STORAGE FOR UPGRADES =====
    
    /// Stable storage entries for data persistence across upgrades
    private stable var usersEntries : [(Principal, Types.User)] = [];
    private stable var skillCardsEntries : [(Text, Types.SkillCard)] = [];
    private stable var questsEntries : [(Text, Types.Quest)] = [];
    private stable var userProgressEntries : [(Text, Types.UserSkillProgress)] = [];

    // ===== RUNTIME STORAGE =====
    
    /// Runtime storage using Trie for efficient data access
    private var users : Types.Users = Trie.empty();
    private var skillCards : Types.SkillCards = Trie.empty();
    private var quests : Types.Quests = Trie.empty();
    private var userProgress : Types.UserSkillProgressMap = Trie.empty();

    // ===== SYSTEM UPGRADE FUNCTIONS =====
    
    /// Pre-upgrade function to persist data to stable storage
    system func preupgrade() {
        usersEntries := Storage.usersToArray(users);
        skillCardsEntries := Storage.skillCardsToArray(skillCards);
        questsEntries := Storage.questsToArray(quests);
        userProgressEntries := Storage.userProgressToArray(userProgress);
    };

    /// Post-upgrade function to restore data from stable storage
    system func postupgrade() {
        users := Storage.rebuildUsers(users, usersEntries);
        skillCards := Storage.rebuildSkillCards(skillCards, skillCardsEntries);
        quests := Storage.rebuildQuests(quests, questsEntries);
        userProgress := Storage.rebuildUserProgress(userProgress, userProgressEntries);
        
        // Clear stable storage after successful restoration
        usersEntries := [];
        skillCardsEntries := [];
        questsEntries := [];
        userProgressEntries := [];
    };

    // ===== USER MANAGEMENT API =====

    /// Authenticate user with Internet Identity
    /// @param userData - User creation/update data
    /// @return Authentication result or error
    public shared (msg) func authenticateUser(userData : Types.UserCreateData) : async Result.Result<Types.AuthResult, Text> {
        let userId = msg.caller;
        
        switch (UserService.authenticateUser(users, userId, userData)) {
            case (#ok(authResult)) {
                // Update users storage with authenticated user
                users := Storage.storeUser(users, authResult.user);
                #ok(authResult);
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Get current user profile
    /// @return Current user or error
    public shared (msg) func getCurrentUser() : async Result.Result<Types.User, Text> {
        let userId = msg.caller;
        UserService.ensureUserExists(users, userId);
    };

    /// Update user profile information
    /// @param updateData - Profile update data
    /// @return Updated user or error
    public shared (msg) func updateUserProfile(updateData : Types.UserUpdateData) : async Result.Result<Types.User, Text> {
        let userId = msg.caller;
        
        switch (UserService.updateUserProfile(users, userId, updateData)) {
            case (#ok(updatedUser)) {
                // Update users storage
                users := Storage.storeUser(users, updatedUser);
                #ok(updatedUser);
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Get user by username (public query)
    /// @param username - Username to search for
    /// @return Optional user if found
    public query func getUserByUsername(username : Text) : async ?Types.User {
        UserService.getUserByUsername(users, username);
    };

    /// Check if user exists in the system
    /// @return True if user exists, false otherwise
    public shared (msg) func userExists() : async Bool {
        let userId = msg.caller;
        UserService.userExists(users, userId);
    };

    /// Get all users (for admin purposes)
    /// @return Array of all users
    public query func getAllUsers() : async [Types.User] {
        UserService.getAllUsers(users);
    };

    /// Get total user count
    /// @return Number of users in the system
    public query func getUserCount() : async Nat {
        UserService.getUserCount(users);
    };

    // ===== EXPERIENCE AND LEVELING API =====

    /// Add experience to user
    /// @param amount - Experience amount to add
    /// @param source - Source of experience
    /// @return Level up result or error
    public shared (msg) func addExperience(amount : Nat, source : Text) : async Result.Result<Types.LevelUpResult, Text> {
        let userId = msg.caller;
        
        switch (UserService.addExperience(users, userId, amount, source)) {
            case (#ok(levelUpResult)) {
                // Update user with new experience and level
                let user = switch (UserService.ensureUserExists(users, userId)) {
                    case (#ok(user)) { user };
                    case (#err(error)) { return #err(error) };
                };
                
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
                
                users := Storage.storeUser(users, updatedUser);
                #ok(levelUpResult);
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Get user level information
    /// @return Level info or error
    public shared (msg) func getLevelInfo() : async Result.Result<Types.LevelInfo, Text> {
        let userId = msg.caller;
        UserService.getLevelInfo(users, userId);
    };

    /// Complete an activity and award experience
    /// @param activityType - Type of activity completed
    /// @return Level up result or error
    public shared (msg) func completeActivity(activityType : Text) : async Result.Result<Types.LevelUpResult, Text> {
        let userId = msg.caller;
        
        switch (UserService.completeActivity(users, userId, activityType)) {
            case (#ok(levelUpResult)) {
                // Update user with new experience and level
                let user = switch (UserService.ensureUserExists(users, userId)) {
                    case (#ok(user)) { user };
                    case (#err(error)) { return #err(error) };
                };
                
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
                
                users := Storage.storeUser(users, updatedUser);
                #ok(levelUpResult);
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Get experience required for a specific level
    /// @param level - Target level
    /// @return Experience points required
    public query func getExpRequiredForLevel(level : Nat) : async Nat {
        Level.getExpRequiredForLevel(level);
    };

    // ===== SKILL CARD SYSTEM API =====

    /// Generate skill card based on user input
    /// @param request - Skill card generation request
    /// @return Generated skill cards and quests or error
    public shared (msg) func generateSkillCard(request : Types.SkillCardRequest) : async Result.Result<Types.SkillCardGeneration, Text> {
        let userId = msg.caller;

        // Ensure user exists
        let _user = switch (UserService.ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        switch (await SkillCardService.generateSkillCard(skillCards, quests, request, userId)) {
            case (#ok(generation)) {
                // Store the generated skill cards and quests
                for (skillCard in generation.skillCards.vals()) {
                    skillCards := Storage.storeSkillCard(skillCards, skillCard);
                };

                for (quest in generation.quests.vals()) {
                    quests := Storage.storeQuest(quests, quest);
                };

                #ok(generation);
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Accept a skill card for the user
    /// @param skillCardId - ID of skill card to accept
    /// @return Accepted skill card or error
    public shared (msg) func acceptSkillCard(skillCardId : Text) : async Result.Result<Types.SkillCard, Text> {
        let userId = msg.caller;

        // Ensure user exists
        let _user = switch (UserService.ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        switch (SkillCardService.acceptSkillCard(skillCards, skillCardId, userId)) {
            case (#ok(acceptedCard)) {
                // Update skill card in storage
                skillCards := Storage.storeSkillCard(skillCards, acceptedCard);

                // Create initial user progress
                let initialProgress = SkillCardService.createInitialProgress(userId, skillCardId);
                userProgress := Storage.storeUserProgress(userProgress, initialProgress);

                #ok(acceptedCard);
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Decline a skill card
    /// @param skillCardId - ID of skill card to decline
    /// @return Success status or error
    public shared (msg) func declineSkillCard(skillCardId : Text) : async Result.Result<Bool, Text> {
        let userId = msg.caller;

        // Ensure user exists
        let _user = switch (UserService.ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        switch (SkillCardService.declineSkillCard(skillCards, skillCardId, userId)) {
            case (#ok(_)) {
                // Update skill card in storage
                let skillCard = switch (Storage.findSkillCard(skillCards, skillCardId)) {
                    case (?card) { card };
                    case (null) { return #err("Skill card not found") };
                };
                
                let declinedCard = { skillCard with status = #declined };
                skillCards := Storage.storeSkillCard(skillCards, declinedCard);
                #ok(true);
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Get user's skill cards
    /// @return Array of user's skill cards
    public shared (msg) func getUserSkillCards() : async [Types.SkillCard] {
        let userId = msg.caller;
        
        // Return empty array if user doesn't exist (no auto-creation)
        switch (UserService.ensureUserExists(users, userId)) {
            case (#ok(_)) { SkillCardService.getUserSkillCards(skillCards, userId) };
            case (#err(_)) { [] };
        };
    };

    /// Get skill card by ID
    /// @param skillCardId - ID of skill card to find
    /// @return Optional skill card if found
    public query func getSkillCardById(skillCardId : Text) : async ?Types.SkillCard {
        SkillCardService.getSkillCardById(skillCards, skillCardId);
    };

    /// Get quest by ID
    /// @param questId - ID of quest to find
    /// @return Optional quest if found
    public query func getQuestById(questId : Text) : async ?Types.Quest {
        SkillCardService.getQuestById(quests, questId);
    };

    /// Get user progress for a skill card
    /// @param skillCardId - Skill card ID
    /// @return Optional user progress if found
    public shared (msg) func getUserSkillProgress(skillCardId : Text) : async ?Types.UserSkillProgress {
        let userId = msg.caller;
        
        // Return null if user doesn't exist (no auto-creation)
        switch (UserService.ensureUserExists(users, userId)) {
            case (#ok(_)) { SkillCardService.getUserSkillProgress(userProgress, userId, skillCardId) };
            case (#err(_)) { null };
        };
    };

    /// Complete a skill and unlock dependencies
    /// @param skillCardId - Skill card ID
    /// @param skillId - Skill ID to complete
    /// @return Updated skill card and experience gained or error
    public shared (msg) func completeSkill(skillCardId : Text, skillId : Text) : async Result.Result<{ skillCard : Types.SkillCard; expGained : Nat; levelUpResult : [Types.LevelUpResult] }, Text> {
        let userId = msg.caller;

        // Ensure user exists
        let user = switch (UserService.ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        switch (SkillCardService.completeSkill(skillCards, userProgress, skillCardId, skillId, userId)) {
            case (#ok(result)) {
                // Update skill card
                skillCards := Storage.storeSkillCard(skillCards, result.skillCard);

                // Update user progress
                let currentProgress = Storage.findUserProgress(userProgress, userId, skillCardId);
                let updatedProgress = SkillCardService.updateProgressAfterSkillCompletion(currentProgress, skillId, result.expGained, userId, skillCardId);
                userProgress := Storage.storeUserProgress(userProgress, updatedProgress);

                // Award experience points for skill completion
                let levelUpResult = Level.addExperience(user.totalExperience, result.expGained);
                
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

                users := Storage.storeUser(users, updatedUser);
                
                #ok({
                    skillCard = result.skillCard;
                    expGained = result.expGained;
                    levelUpResult = [levelUpResult];
                });
            };
            case (#err(error)) { #err(error) };
        };
    };

    /// Submit quest answers and get score
    /// @param questId - Quest ID
    /// @param answers - Array of answer indices
    /// @return Score, pass status, and experience gained or error
    public shared (msg) func submitQuestAnswers(questId : Text, answers : [Nat]) : async Result.Result<{ score : Nat; passed : Bool; totalQuestions : Nat; expGained : Nat; levelUpResult : [Types.LevelUpResult] }, Text> {
        let userId = msg.caller;

        // Ensure user exists
        let user = switch (UserService.ensureUserExists(users, userId)) {
            case (#ok(user)) { user };
            case (#err(error)) { return #err(error) };
        };

        switch (SkillCardService.submitQuestAnswers(quests, questId, answers)) {
            case (#ok(result)) {
                var levelUpResult : [Types.LevelUpResult] = [];

                // Award experience points if quest is passed
                if (result.passed) {
                    let levelUpResultCalc = Level.addExperience(user.totalExperience, result.expGained);
                    
                    // Update user with new experience and level
                    let updatedUser : Types.User = {
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

                    users := Storage.storeUser(users, updatedUser);
                    levelUpResult := [levelUpResultCalc];
                };

                #ok({
                    score = result.score;
                    passed = result.passed;
                    totalQuestions = result.totalQuestions;
                    expGained = result.expGained;
                    levelUpResult = levelUpResult;
                });
            };
            case (#err(error)) { #err(error) };
        };
    };

    // ===== ADMIN AND TESTING API =====

    /// Get all quests (for admin/testing purposes)
    /// @return Array of all quests
    public query func getAllQuests() : async [Types.Quest] {
        SkillCardService.getAllQuests(quests);
    };

    /// Get all skill cards (for admin/testing purposes)
    /// @return Array of all skill cards
    public query func getAllSkillCards() : async [Types.SkillCard] {
        SkillCardService.getAllSkillCards(skillCards);
    };

    /// Test function to verify leveling system
    /// @return Level up test result or error
    public shared (msg) func testLeveling() : async Result.Result<{ oldLevel : Nat; newLevel : Nat; expGained : Nat; leveledUp : Bool }, Text> {
        let userId = msg.caller;

        let user = switch (UserService.ensureUserExists(users, userId)) {
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

        users := Storage.storeUser(users, updatedUser);

        #ok({
            oldLevel = user.level;
            newLevel = levelUpResult.newLevel;
            expGained = testExp;
            leveledUp = levelUpResult.leveledUp;
        });
    };

    /// Health check endpoint
    /// @return True if service is healthy
    public query func healthCheck() : async Bool {
        true;
    };
};
