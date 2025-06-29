import Types "../../core/Types";
import SkillCard "./SkillCard";
import Storage "../storage/Storage";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Float "mo:base/Float";

/// SkillCardService module handles all skill card-related business logic and operations
/// This module provides a clean interface for skill card management, generation, and progress tracking
module {
    
    /// Generate skill card based on user input
    /// @param skillCards - Current skill cards Trie
    /// @param quests - Current quests Trie
    /// @param request - Skill card generation request
    /// @param userId - User principal
    /// @return Result containing skill card generation or error
    public func generateSkillCard(_skillCards : Types.SkillCards, _quests : Types.Quests, request : Types.SkillCardRequest, userId : Principal) : async Result.Result<Types.SkillCardGeneration, Text> {
        switch (await SkillCard.generateSkillCard(request, userId)) {
            case (#ok(generation)) {
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

    /// Accept a skill card for the user
    /// @param skillCards - Current skill cards Trie
    /// @param skillCardId - ID of skill card to accept
    /// @param userId - User principal
    /// @return Result containing accepted skill card or error
    public func acceptSkillCard(skillCards : Types.SkillCards, skillCardId : Text, userId : Principal) : Result.Result<Types.SkillCard, Text> {
        switch (SkillCard.acceptSkillCard(skillCards, skillCardId, userId)) {
            case (#ok(acceptedCard)) {
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

    /// Decline a skill card
    /// @param skillCards - Current skill cards Trie
    /// @param skillCardId - ID of skill card to decline
    /// @param userId - User principal
    /// @return Result containing success status or error
    public func declineSkillCard(skillCards : Types.SkillCards, skillCardId : Text, userId : Principal) : Result.Result<Bool, Text> {
        switch (SkillCard.declineSkillCard(skillCards, skillCardId, userId)) {
            case (#ok(_declinedCard)) {
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

    /// Get user's skill cards
    /// @param skillCards - Current skill cards Trie
    /// @param userId - User principal
    /// @return Array of user's skill cards
    public func getUserSkillCards(skillCards : Types.SkillCards, userId : Principal) : [Types.SkillCard] {
        SkillCard.getUserSkillCards(skillCards, userId);
    };

    /// Get skill card by ID
    /// @param skillCards - Current skill cards Trie
    /// @param skillCardId - ID of skill card to find
    /// @return Optional skill card if found
    public func getSkillCardById(skillCards : Types.SkillCards, skillCardId : Text) : ?Types.SkillCard {
        Storage.findSkillCard(skillCards, skillCardId);
    };

    /// Get quest by ID
    /// @param quests - Current quests Trie
    /// @param questId - ID of quest to find
    /// @return Optional quest if found
    public func getQuestById(quests : Types.Quests, questId : Text) : ?Types.Quest {
        Storage.findQuest(quests, questId);
    };

    /// Get user progress for a skill card
    /// @param userProgress - Current user progress Trie
    /// @param userId - User principal
    /// @param skillCardId - Skill card ID
    /// @return Optional user progress if found
    public func getUserSkillProgress(userProgress : Types.UserSkillProgressMap, userId : Principal, skillCardId : Text) : ?Types.UserSkillProgress {
        Storage.findUserProgress(userProgress, userId, skillCardId);
    };

    /// Complete a skill and unlock dependencies
    /// @param skillCards - Current skill cards Trie
    /// @param userProgress - Current user progress Trie
    /// @param skillCardId - Skill card ID
    /// @param skillId - Skill ID to complete
    /// @param userId - User principal
    /// @return Result containing updated skill card and experience gained
    public func completeSkill(skillCards : Types.SkillCards, userProgress : Types.UserSkillProgressMap, skillCardId : Text, skillId : Text, userId : Principal) : Result.Result<{ skillCard : Types.SkillCard; expGained : Nat }, Text> {
        switch (Storage.findSkillCard(skillCards, skillCardId)) {
            case (?skillCard) {
                if (skillCard.userId != userId or skillCard.status != #accepted) {
                    return #err("Not authorized or skill card not accepted");
                };

                let currentProgress = Storage.findUserProgress(userProgress, userId, skillCardId);

                switch (SkillCard.unlockSkill(skillCard, skillId, currentProgress)) {
                    case (#ok(updatedCard)) {
                        // Find the completed skill to get its points
                        var skillPoints : Nat = 50; // Default points
                        for (skill in updatedCard.skills.vals()) {
                            if (skill.id == skillId) {
                                skillPoints := skill.maxPoints;
                            };
                        };

                        #ok({
                            skillCard = updatedCard;
                            expGained = skillPoints;
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

    /// Submit quest answers and calculate score
    /// @param quests - Current quests Trie
    /// @param questId - Quest ID
    /// @param answers - Array of answer indices
    /// @return Result containing score and pass status
    public func submitQuestAnswers(quests : Types.Quests, questId : Text, answers : [Nat]) : Result.Result<{ score : Nat; passed : Bool; totalQuestions : Nat; expGained : Nat }, Text> {
        switch (Storage.findQuest(quests, questId)) {
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

                // Calculate score percentage
                let scorePercentage = if (totalQuestions > 0) {
                    (correctAnswers * 100) / totalQuestions
                } else { 0 };

                let passed = Float.fromInt(scorePercentage) >= (quest.passingThreshold * 100.0);

                var expGained : Nat = 0;

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
                };

                #ok({
                    score = scorePercentage;
                    passed = passed;
                    totalQuestions = totalQuestions;
                    expGained = expGained;
                });
            };
            case (null) { 
                #err("Quest not found"); 
            };
        };
    };

    /// Create initial user progress for a skill card
    /// @param userId - User principal
    /// @param skillCardId - Skill card ID
    /// @return Initial user progress object
    public func createInitialProgress(userId : Principal, skillCardId : Text) : Types.UserSkillProgress {
        {
            userId = userId;
            skillCardId = skillCardId;
            completedSkills = [];
            questProgress = [];
            totalPoints = 0;
            lastUpdated = Time.now();
        };
    };

    /// Update user progress after completing a skill
    /// @param currentProgress - Current progress (optional)
    /// @param skillId - Completed skill ID
    /// @param skillPoints - Points earned from skill
    /// @param userId - User principal
    /// @param skillCardId - Skill card ID
    /// @return Updated progress object
    public func updateProgressAfterSkillCompletion(currentProgress : ?Types.UserSkillProgress, skillId : Text, skillPoints : Nat, userId : Principal, skillCardId : Text) : Types.UserSkillProgress {
        switch (currentProgress) {
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
    };

    /// Get all quests (for admin/testing purposes)
    /// @param quests - Current quests Trie
    /// @return Array of all quests
    public func getAllQuests(quests : Types.Quests) : [Types.Quest] {
        Storage.getAllQuests(quests);
    };

    /// Get all skill cards (for admin/testing purposes)
    /// @param skillCards - Current skill cards Trie
    /// @return Array of all skill cards
    public func getAllSkillCards(skillCards : Types.SkillCards) : [Types.SkillCard] {
        Storage.getAllSkillCards(skillCards);
    };
};
