import Types "../../core/Types";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

/// Storage module handles all data persistence operations for the SkillForge backend
/// This module provides a clean interface for storing and retrieving data using Trie structures
module {
    
    /// Helper function to create a principal key for Trie operations
    /// @param p - The principal to create a key for
    /// @return Trie key for the principal
    public func principalKey(p : Principal) : Trie.Key<Principal> {
        { key = p; hash = Principal.hash(p) };
    };

    /// Helper function to create a text key for Trie operations
    /// @param t - The text to create a key for
    /// @return Trie key for the text
    public func textKey(t : Text) : Trie.Key<Text> {
        { key = t; hash = Text.hash(t) };
    };

    /// Store a user in the users Trie
    /// @param users - Current users Trie
    /// @param user - User to store
    /// @return Updated users Trie
    public func storeUser(users : Types.Users, user : Types.User) : Types.Users {
        Trie.put(users, principalKey(user.id), Principal.equal, user).0;
    };

    /// Store a skill card in the skill cards Trie
    /// @param skillCards - Current skill cards Trie
    /// @param skillCard - Skill card to store
    /// @return Updated skill cards Trie
    public func storeSkillCard(skillCards : Types.SkillCards, skillCard : Types.SkillCard) : Types.SkillCards {
        Trie.put(skillCards, textKey(skillCard.id), Text.equal, skillCard).0;
    };

    /// Store a quest in the quests Trie
    /// @param quests - Current quests Trie
    /// @param quest - Quest to store
    /// @return Updated quests Trie
    public func storeQuest(quests : Types.Quests, quest : Types.Quest) : Types.Quests {
        Trie.put(quests, textKey(quest.id), Text.equal, quest).0;
    };

    /// Store user skill progress in the progress Trie
    /// @param userProgress - Current user progress Trie
    /// @param progress - Progress to store
    /// @return Updated user progress Trie
    public func storeUserProgress(userProgress : Types.UserSkillProgressMap, progress : Types.UserSkillProgress) : Types.UserSkillProgressMap {
        let progressKey = createProgressKey(progress.userId, progress.skillCardId);
        Trie.put(userProgress, textKey(progressKey), Text.equal, progress).0;
    };

    /// Find a user by principal
    /// @param users - Users Trie to search in
    /// @param userId - Principal to search for
    /// @return Optional user if found
    public func findUser(users : Types.Users, userId : Principal) : ?Types.User {
        Trie.find(users, principalKey(userId), Principal.equal);
    };

    /// Find a skill card by ID
    /// @param skillCards - Skill cards Trie to search in
    /// @param skillCardId - ID to search for
    /// @return Optional skill card if found
    public func findSkillCard(skillCards : Types.SkillCards, skillCardId : Text) : ?Types.SkillCard {
        Trie.find(skillCards, textKey(skillCardId), Text.equal);
    };

    /// Find a quest by ID
    /// @param quests - Quests Trie to search in
    /// @param questId - ID to search for
    /// @return Optional quest if found
    public func findQuest(quests : Types.Quests, questId : Text) : ?Types.Quest {
        Trie.find(quests, textKey(questId), Text.equal);
    };

    /// Find user skill progress by user ID and skill card ID
    /// @param userProgress - User progress Trie to search in
    /// @param userId - User principal
    /// @param skillCardId - Skill card ID
    /// @return Optional progress if found
    public func findUserProgress(userProgress : Types.UserSkillProgressMap, userId : Principal, skillCardId : Text) : ?Types.UserSkillProgress {
        let progressKey = createProgressKey(userId, skillCardId);
        Trie.find(userProgress, textKey(progressKey), Text.equal);
    };

    /// Get all users as an array
    /// @param users - Users Trie
    /// @return Array of all users
    public func getAllUsers(users : Types.Users) : [Types.User] {
        Trie.toArray<Principal, Types.User, Types.User>(users, func(k : Principal, v : Types.User) : Types.User { v });
    };

    /// Get all skill cards as an array
    /// @param skillCards - Skill cards Trie
    /// @return Array of all skill cards
    public func getAllSkillCards(skillCards : Types.SkillCards) : [Types.SkillCard] {
        Trie.toArray<Text, Types.SkillCard, Types.SkillCard>(skillCards, func(k : Text, v : Types.SkillCard) : Types.SkillCard { v });
    };

    /// Get all quests as an array
    /// @param quests - Quests Trie
    /// @return Array of all quests
    public func getAllQuests(quests : Types.Quests) : [Types.Quest] {
        Trie.toArray<Text, Types.Quest, Types.Quest>(quests, func(k : Text, v : Types.Quest) : Types.Quest { v });
    };

    /// Get user count
    /// @param users - Users Trie
    /// @return Number of users
    public func getUserCount(users : Types.Users) : Nat {
        Trie.size(users);
    };

    /// Create a progress key for user skill progress storage
    /// @param userId - User principal
    /// @param skillCardId - Skill card ID
    /// @return Progress key string
    public func createProgressKey(userId : Principal, skillCardId : Text) : Text {
        Principal.toText(userId) # "#" # skillCardId;
    };

    /// Convert users Trie to array for upgrade persistence
    /// @param users - Users Trie
    /// @return Array of principal-user pairs
    public func usersToArray(users : Types.Users) : [(Principal, Types.User)] {
        Trie.toArray<Principal, Types.User, (Principal, Types.User)>(users, func(k : Principal, v : Types.User) : (Principal, Types.User) { (k, v) });
    };

    /// Convert skill cards Trie to array for upgrade persistence
    /// @param skillCards - Skill cards Trie
    /// @return Array of text-skillCard pairs
    public func skillCardsToArray(skillCards : Types.SkillCards) : [(Text, Types.SkillCard)] {
        Trie.toArray<Text, Types.SkillCard, (Text, Types.SkillCard)>(skillCards, func(k : Text, v : Types.SkillCard) : (Text, Types.SkillCard) { (k, v) });
    };

    /// Convert quests Trie to array for upgrade persistence
    /// @param quests - Quests Trie
    /// @return Array of text-quest pairs
    public func questsToArray(quests : Types.Quests) : [(Text, Types.Quest)] {
        Trie.toArray<Text, Types.Quest, (Text, Types.Quest)>(quests, func(k : Text, v : Types.Quest) : (Text, Types.Quest) { (k, v) });
    };

    /// Convert user progress Trie to array for upgrade persistence
    /// @param userProgress - User progress Trie
    /// @return Array of text-progress pairs
    public func userProgressToArray(userProgress : Types.UserSkillProgressMap) : [(Text, Types.UserSkillProgress)] {
        Trie.toArray<Text, Types.UserSkillProgress, (Text, Types.UserSkillProgress)>(userProgress, func(k : Text, v : Types.UserSkillProgress) : (Text, Types.UserSkillProgress) { (k, v) });
    };

    /// Rebuild users Trie from array after upgrade
    /// @param users - Current users Trie
    /// @param entries - Array of principal-user pairs
    /// @return Updated users Trie
    public func rebuildUsers(users : Types.Users, entries : [(Principal, Types.User)]) : Types.Users {
        var updatedUsers = users;
        for ((principal, user) in entries.vals()) {
            updatedUsers := Trie.put(updatedUsers, principalKey(principal), Principal.equal, user).0;
        };
        updatedUsers;
    };

    /// Rebuild skill cards Trie from array after upgrade
    /// @param skillCards - Current skill cards Trie
    /// @param entries - Array of text-skillCard pairs
    /// @return Updated skill cards Trie
    public func rebuildSkillCards(skillCards : Types.SkillCards, entries : [(Text, Types.SkillCard)]) : Types.SkillCards {
        var updatedSkillCards = skillCards;
        for ((key, skillCard) in entries.vals()) {
            updatedSkillCards := Trie.put(updatedSkillCards, textKey(key), Text.equal, skillCard).0;
        };
        updatedSkillCards;
    };

    /// Rebuild quests Trie from array after upgrade
    /// @param quests - Current quests Trie
    /// @param entries - Array of text-quest pairs
    /// @return Updated quests Trie
    public func rebuildQuests(quests : Types.Quests, entries : [(Text, Types.Quest)]) : Types.Quests {
        var updatedQuests = quests;
        for ((key, quest) in entries.vals()) {
            updatedQuests := Trie.put(updatedQuests, textKey(key), Text.equal, quest).0;
        };
        updatedQuests;
    };

    /// Rebuild user progress Trie from array after upgrade
    /// @param userProgress - Current user progress Trie
    /// @param entries - Array of text-progress pairs
    /// @return Updated user progress Trie
    public func rebuildUserProgress(userProgress : Types.UserSkillProgressMap, entries : [(Text, Types.UserSkillProgress)]) : Types.UserSkillProgressMap {
        var updatedUserProgress = userProgress;
        for ((key, progress) in entries.vals()) {
            updatedUserProgress := Trie.put(updatedUserProgress, textKey(key), Text.equal, progress).0;
        };
        updatedUserProgress;
    };
};
