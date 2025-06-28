import Types "./Types";
import Result "mo:base/Result";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Error "mo:base/Error";
import Debug "mo:base/Debug";

import LLM "mo:llm";
import Level "./Level";

module SkillCard {

    public type SkillCardError = {
        #SkillCardNotFound;
        #InvalidSkillCard;
        #UserNotAuthorized;
        #SkillCardAlreadyAccepted;
        #SkillNotUnlocked;
        #QuestNotFound;
        #GenerationFailed : Text;
    };

    // --- Simplified LLM Response Structures ---
    public type LLMQuestion = {
        text : Text;
        options : [Text];
        correctOptionIndex : Nat;
        explanation : Text;
    };

    public type LLMSkill = {
        skillName : Text;
        description : Text;
        iconName : ?Text;
        dependencies : [Text];
        questTitle : Text;
        questions : [LLMQuestion];
        maxPoints : ?Nat;
    };

    public type LLMResponse = {
        learningPath : [LLMSkill];
    };

    // Helper function to create Trie key from Text
    private func textKey(t : Text) : Trie.Key<Text> {
        { key = t; hash = Text.hash(t) };
    };
    
    // --- Real JSON Parsing Function ---
    // --- Real JSON Parsing Function (Manual Parser) ---
    private func cleanAndParseJson(rawContent: Text) : Result.Result<LLMResponse, Text> {
        Debug.print("=== PARSING JSON RESPONSE ===");
        Debug.print("Raw content length: " # Nat.toText(Text.size(rawContent)));
        Debug.print("Raw content: " # rawContent);
        
        // Clean the content by removing any markdown formatting
        let cleanedContent = cleanMarkdownFormatting(rawContent);
        Debug.print("Cleaned content: " # cleanedContent);
        
        // Parse skills manually from JSON string
        switch (extractSkillsFromJsonString(cleanedContent)) {
            case (#ok(skills)) {
                let response : LLMResponse = { learningPath = skills };
                Debug.print("✅ Skills parsed successfully: " # Nat.toText(skills.size()) # " skills");
                #ok(response);
            };
            case (#err(error)) {
                Debug.print("❌ Failed to parse skills: " # error);
                #err("Failed to parse skills from JSON: " # error);
            };
        };
    };

    // Clean markdown formatting from LLM response
    private func cleanMarkdownFormatting(text: Text) : Text {
        var cleaned = text;
        // Remove ```json and ``` markers
        cleaned := Text.replace(cleaned, #text("```json"), "");
        cleaned := Text.replace(cleaned, #text("```"), "");
        // Remove ** bold formatting
        cleaned := Text.replace(cleaned, #text("**"), "");
        // Remove * italic formatting  
        cleaned := Text.replace(cleaned, #text("*"), "");
        // Trim whitespace
        Text.trim(cleaned, #char(' '));
    };

    // Extract skills from JSON string manually
    private func extractSkillsFromJsonString(jsonString: Text) : Result.Result<[LLMSkill], Text> {
        Debug.print("=== EXTRACTING SKILLS FROM JSON STRING ===");
        
        // Find learningPath array
        if (not Text.contains(jsonString, #text("learningPath"))) {
            return #err("learningPath not found in JSON");
        };
        
        // Simple extraction: split by skill objects
        let skills = parseSkillObjects(jsonString);
        
        if (skills.size() > 0) {
            Debug.print("✅ Successfully extracted " # Nat.toText(skills.size()) # " skills");
            #ok(skills);
        } else {
            Debug.print("❌ No skills found in JSON");
            #err("No skills found in JSON");
        };
    };

    // Parse skill objects from JSON string
    private func parseSkillObjects(jsonString: Text) : [LLMSkill] {
        var skills: [LLMSkill] = [];
        
        // Find all skill objects by looking for "skillName" fields
        let lines = Text.split(jsonString, #char('\n'));
        var currentSkill: ?{
            skillName: Text;
            description: Text;
            iconName: ?Text;
            dependencies: [Text];
            questTitle: Text;
            questions: [LLMQuestion];
            maxPoints: ?Nat;
        } = null;
        
        var currentQuestion: ?{
            text: Text;
            options: [Text];
            correctOptionIndex: Nat;
            explanation: Text;
        } = null;
        
        for (line in lines) {
            let trimmedLine = Text.trim(line, #char(' '));
            
            // Parse skillName
            if (Text.contains(trimmedLine, #text("skillName")) and Text.contains(trimmedLine, #text(":"))) {
                // Save previous skill if exists
                switch (currentSkill) {
                    case (?skill) {
                        let skillObj: LLMSkill = {
                            skillName = skill.skillName;
                            description = skill.description;
                            iconName = skill.iconName;
                            dependencies = skill.dependencies;
                            questTitle = skill.questTitle;
                            questions = skill.questions;
                            maxPoints = skill.maxPoints;
                        };
                        skills := Array.append(skills, [skillObj]);
                    };
                    case (null) { };
                };
                
                let skillName = extractStringValue(trimmedLine);
                currentSkill := ?{
                    skillName = skillName;
                    description = "Learn " # skillName;
                    iconName = ?"code";
                    dependencies = [];
                    questTitle = skillName # " Quest";
                    questions = [];
                    maxPoints = ?100;
                };
                Debug.print("Found skill: " # skillName);
            };
            
            // Parse other fields
            if (Text.contains(trimmedLine, #text("description")) and Text.contains(trimmedLine, #text(":"))) {
                let description = extractStringValue(trimmedLine);
                switch (currentSkill) {
                    case (?skill) {
                        currentSkill := ?{ skill with description = description };
                    };
                    case (null) { };
                };
            };
            
            if (Text.contains(trimmedLine, #text("iconName")) and Text.contains(trimmedLine, #text(":"))) {
                let iconName = extractStringValue(trimmedLine);
                switch (currentSkill) {
                    case (?skill) {
                        currentSkill := ?{ skill with iconName = ?iconName };
                    };
                    case (null) { };
                };
            };
            
            if (Text.contains(trimmedLine, #text("questTitle")) and Text.contains(trimmedLine, #text(":"))) {
                let questTitle = extractStringValue(trimmedLine);
                switch (currentSkill) {
                    case (?skill) {
                        currentSkill := ?{ skill with questTitle = questTitle };
                    };
                    case (null) { };
                };
            };
            
            if (Text.contains(trimmedLine, #text("maxPoints")) and Text.contains(trimmedLine, #text(":"))) {
                let maxPoints = extractNumberValue(trimmedLine);
                switch (currentSkill) {
                    case (?skill) {
                        currentSkill := ?{ skill with maxPoints = ?maxPoints };
                    };
                    case (null) { };
                };
            };
            
            // Parse question fields
            if (Text.contains(trimmedLine, #text("text")) and Text.contains(trimmedLine, #text(":")) and not Text.contains(trimmedLine, #text("skillName"))) {
                let questionText = extractStringValue(trimmedLine);
                currentQuestion := ?{
                    text = questionText;
                    options = [];
                    correctOptionIndex = 0;
                    explanation = "";
                };
                Debug.print("Found question: " # questionText);
            };
            
            if (Text.contains(trimmedLine, #text("options")) and Text.contains(trimmedLine, #text(":"))) {
                let options = extractArrayValue(trimmedLine);
                switch (currentQuestion) {
                    case (?q) {
                        currentQuestion := ?{ q with options = options };
                    };
                    case (null) { };
                };
            };
            
            if (Text.contains(trimmedLine, #text("correctOptionIndex")) and Text.contains(trimmedLine, #text(":"))) {
                let correctIndex = extractNumberValue(trimmedLine);
                switch (currentQuestion) {
                    case (?q) {
                        currentQuestion := ?{ q with correctOptionIndex = correctIndex };
                    };
                    case (null) { };
                };
            };
            
            if (Text.contains(trimmedLine, #text("explanation")) and Text.contains(trimmedLine, #text(":"))) {
                let explanation = extractStringValue(trimmedLine);
                switch (currentQuestion) {
                    case (?q) {
                        currentQuestion := ?{ q with explanation = explanation };
                        
                        // Complete question, add to current skill
                        let question: LLMQuestion = {
                            text = q.text;
                            options = q.options;
                            correctOptionIndex = q.correctOptionIndex;
                            explanation = explanation;
                        };
                        
                        switch (currentSkill) {
                            case (?skill) {
                                let updatedQuestions = Array.append(skill.questions, [question]);
                                currentSkill := ?{ skill with questions = updatedQuestions };
                                Debug.print("Added question to skill");
                            };
                            case (null) { };
                        };
                        
                        currentQuestion := null;
                    };
                    case (null) { };
                };
            };
        };
        
        // Don't forget the last skill
        switch (currentSkill) {
            case (?skill) {
                let skillObj: LLMSkill = {
                    skillName = skill.skillName;
                    description = skill.description;
                    iconName = skill.iconName;
                    dependencies = skill.dependencies;
                    questTitle = skill.questTitle;
                    questions = skill.questions;
                    maxPoints = skill.maxPoints;
                };
                skills := Array.append(skills, [skillObj]);
            };
            case (null) { };
        };
        
        skills;
    };

    // Extract string value from JSON line like "key": "value"
    private func extractStringValue(line: Text) : Text {
        if (Text.contains(line, #text(":"))) {
            let parts = Text.split(line, #char(':'));
            var result = "";
            var count = 0;
            for (part in parts) {
                if (count > 0) {
                    if (result == "") {
                        result := Text.trim(part, #char(' '));
                    } else {
                        result := result # ":" # part;
                    };
                };
                count += 1;
            };
            // Remove quotes and comma
            result := Text.replace(result, #text("\""), "");
            result := Text.replace(result, #text(","), "");
            Text.trim(result, #char(' '));
        } else {
            "";
        };
    };

    // Extract number value from JSON line
    private func extractNumberValue(line: Text) : Nat {
        let stringValue = extractStringValue(line);
        switch (Nat.fromText(stringValue)) {
            case (?num) { num };
            case (null) { 100 };
        };
    };

    // Extract array value from JSON line (simplified)
    private func extractArrayValue(line: Text) : [Text] {
        // Look for array pattern [item1, item2, item3]
        if (Text.contains(line, #text("[")) and Text.contains(line, #text("]"))) {
            // Simple extraction - split by comma and clean
            let arrayPart = Text.replace(line, #text("["), "");
            let cleanArray = Text.replace(arrayPart, #text("]"), "");
            let items = Text.split(cleanArray, #char(','));
            
            var result: [Text] = [];
            for (item in items) {
                let cleaned = Text.trim(item, #char(' '));
                let withoutQuotes = Text.replace(cleaned, #text("\""), "");
                if (withoutQuotes != "" and not Text.contains(withoutQuotes, #text(":"))) {
                    result := Array.append(result, [withoutQuotes]);
                };
            };
            result;
        } else {
            ["Option A", "Option B", "Option C"];
        };
    };

    // --- Main function to generate skill tree ---
    public func generateSkillCard(request : Types.SkillCardRequest, userId : Principal) : async Result.Result<Types.SkillCardGeneration, SkillCardError> {
        // Optimized short prompt to fit 10KiB limit and produce 1000 token response
        let systemPrompt = "Generate JSON for learning path. Format: {\"learningPath\":[{\"skillName\":\"name\",\"description\":\"desc\",\"iconName\":\"code\",\"dependencies\":[],\"questTitle\":\"title\",\"maxPoints\":100,\"questions\":[{\"text\":\"question?\",\"options\":[\"A\",\"B\",\"C\"],\"correctOptionIndex\":0,\"explanation\":\"why\"}]}]}. Create 3-5 skills, 2-3 questions each. No markdown.";

        try {
            let llmResponse = await LLM.chat(#Llama3_1_8B).withMessages([
                #system_ { content = systemPrompt },
                #user {
                    content = "Create a comprehensive learning path for: " # request.prompt;
                },
            ]).send();

            switch (llmResponse.message.content) {
                case (?content) {
                    // Use the new robust parser
                    switch(cleanAndParseJson(content)) {
                        case (#ok(llmResponse)) {
                            let generation = jsonToSkillCardGeneration(llmResponse, request, userId);
                            #ok(generation);
                        };
                        case (#err(parseError)) {
                            #err(#GenerationFailed(parseError));
                        };
                    };
                };
                case (null) {
                    #err(#GenerationFailed("LLM response content was empty."));
                };
            };
        } catch (e) {
            #err(#GenerationFailed("LLM request failed: " # Error.message(e)));
        };
    };
    
    // --- Helper function to transform the valid LLMResponse into application types ---
    private func jsonToSkillCardGeneration(response : LLMResponse, request : Types.SkillCardRequest, userId : Principal) : Types.SkillCardGeneration {
        let currentTime = Time.now();
        let skillCardId = "card_" # Int.toText(currentTime);

        var skillsBuffer = Array.init<Types.SkillNode>(response.learningPath.size(), {
            id = "";
            name = "";
            description = "";
            iconName = "";
            gridPosition = { x = 0; y = 0 };
            dependencies = [];
            questId = "";
            isUnlocked = false;
            isCompleted = false;
            maxPoints = 0;
            currentPoints = 0;
        });
        
        var questsBuffer = Array.init<Types.Quest>(response.learningPath.size(), {
            id = "";
            title = "";
            description = "";
            questions = [];
            points = 0;
            passingThreshold = 0.0;
        });

        // Create a skill name to ID mapping
        var skillNameToIdMap = Trie.empty<Text, Text>();
        for (skill in response.learningPath.vals()) {
            let id = Text.toLowercase(Text.replace(skill.skillName, #char(' '), "_"));
            skillNameToIdMap := Trie.put(skillNameToIdMap, textKey(skill.skillName), Text.equal, id).0;
        };

        var skillIndex = 0;
        var questIndex = 0;
        
        for (i in response.learningPath.keys()) {
            let llmSkill = response.learningPath[i];
            let skillId = switch (Trie.find(skillNameToIdMap, textKey(llmSkill.skillName), Text.equal)) {
                case (?id) { id };
                case (null) { "skill_" # Nat.toText(i) };
            };

            let questId = "quest_" # skillId;

            var questQuestionsBuffer = Array.init<Types.Question>(llmSkill.questions.size(), {
                id = "";
                text = "";
                options = [];
                correctAnswer = 0;
                explanation = "";
            });
            
            for (qIndex in llmSkill.questions.keys()) {
                let q = llmSkill.questions[qIndex];
                questQuestionsBuffer[qIndex] := {
                    id = questId # "_q" # Nat.toText(qIndex);
                    text = q.text;
                    options = q.options;
                    correctAnswer = q.correctOptionIndex;
                    explanation = q.explanation;
                };
            };
            
            let questQuestions = Array.freeze(questQuestionsBuffer);
            if (questQuestions.size() > 0) {
                let skillPoints = switch (llmSkill.maxPoints) {
                    case (?points) { points };
                    case (null) { 100 };
                };

                questsBuffer[questIndex] := {
                    id = questId;
                    title = llmSkill.questTitle;
                    description = "Master " # llmSkill.skillName # " through practical challenges";
                    questions = questQuestions;
                    points = skillPoints;
                    passingThreshold = 0.7;
                };
                
                let dependencyIds = Array.mapFilter<Text, Text>(
                    llmSkill.dependencies,
                    func(depName) { Trie.find(skillNameToIdMap, textKey(depName), Text.equal) }
                );

                skillsBuffer[skillIndex] := {
                    id = skillId;
                    name = llmSkill.skillName;
                    description = llmSkill.description;
                    iconName = switch (llmSkill.iconName) {
                        case (?icon) { icon };
                        case (null) { getDefaultIcon(llmSkill.skillName) };
                    };
                    gridPosition = calculateGridPosition(i, response.learningPath.size());
                    dependencies = dependencyIds;
                    questId = questId;
                    isUnlocked = dependencyIds.size() == 0;
                    isCompleted = false;
                    maxPoints = skillPoints;
                    currentPoints = 0;
                };
                
                skillIndex += 1;
                questIndex += 1;
            };
        };

        let skills = Array.subArray(Array.freeze(skillsBuffer), 0, skillIndex);
        let quests = Array.subArray(Array.freeze(questsBuffer), 0, questIndex);
        let totalPoints = Array.foldLeft<Types.SkillNode, Nat>(skills, 0, func(acc, skill) { acc + skill.maxPoints });

        let skillCard : Types.SkillCard = {
            id = skillCardId;
            title = request.prompt # " Learning Path";
            description = "A comprehensive skill tree to master " # request.prompt;
            category = switch (request.category) {
                case (?cat) { cat };
                case (null) { "General" };
            };
            skills = skills;
            completedPoints = 0;
            totalPoints = totalPoints;
            status = #preview;
            createdAt = currentTime;
            userId = userId;
        };

        { skillCards = [skillCard]; quests = quests };
    };

    private func getDefaultIcon(skillName : Text) : Text {
        let lowerName = Text.toLowercase(skillName);
        if (Text.contains(lowerName, #text("html"))) { "globe" }
        else if (Text.contains(lowerName, #text("css"))) { "palette" }
        else if (Text.contains(lowerName, #text("js")) or Text.contains(lowerName, #text("javascript"))) { "code" }
        else if (Text.contains(lowerName, #text("react"))) { "zap" }
        else if (Text.contains(lowerName, #text("python"))) { "cpu" }
        else if (Text.contains(lowerName, #text("database"))) { "database" }
        else if (Text.contains(lowerName, #text("server"))) { "server" }
        else if (Text.contains(lowerName, #text("mobile"))) { "smartphone" }
        else if (Text.contains(lowerName, #text("ai"))) { "brain" }
        else { "code" };
    };

    private func calculateGridPosition(index : Nat, totalSkills : Nat) : Types.GridPosition {
        if (totalSkills <= 3) { { x = 1; y = index } }
        else if (totalSkills <= 8) { let cols = 3; { x = index % cols; y = index / cols } }
        else { let cols = 4; { x = index % cols; y = index / cols } };
    };

    // --- Other functions remain unchanged ---
    // Helper function to check if all dependencies are met
    private func checkDependencies(dependencies : [Text], completedSkills : [Text]) : Bool {
        Array.foldLeft<Text, Bool>(
            dependencies,
            true,
            func(acc, dep) {
                acc and (Array.find<Text>(completedSkills, func(skill) { Text.equal(skill, dep) }) != null);
            },
        );
    };
    public func unlockSkill(skillCard : Types.SkillCard, skillId : Text, userProgress : ?Types.UserSkillProgress) : Result.Result<Types.SkillCard, SkillCardError> {
        let skillIndex = Array.indexOf<Types.SkillNode>({ id = skillId; name = ""; description = ""; iconName = ""; gridPosition = { x = 0; y = 0 }; dependencies = []; questId = ""; isUnlocked = false; isCompleted = false; maxPoints = 0; currentPoints = 0 }, skillCard.skills, func(a, b) { a.id == b.id });

        switch (skillIndex) {
            case (?index) {
                let skill = skillCard.skills[index];

                // Check if dependencies are met
                let completedSkills = switch (userProgress) {
                    case (?progress) { progress.completedSkills };
                    case (null) { [] };
                };

                let dependenciesMet = checkDependencies(skill.dependencies, completedSkills);

                if (dependenciesMet) {
                    let updatedSkill = { skill with isUnlocked = true };
                    let updatedSkills = Array.tabulate<Types.SkillNode>(
                        skillCard.skills.size(),
                        func(i) {
                            if (i == index) { updatedSkill } else {
                                skillCard.skills[i];
                            };
                        },
                    );

                    let updatedCard = { skillCard with skills = updatedSkills };
                    #ok(updatedCard);
                } else {
                    #err(#SkillNotUnlocked);
                };
            };
            case (null) { #err(#SkillCardNotFound) };
        };
    };

    // Rest of the functions remain the same but with updated signatures...
    public func acceptSkillCard(skillCards : Types.SkillCards, skillCardId : Text, userId : Principal) : Result.Result<Types.SkillCard, SkillCardError> {
        switch (Trie.find(skillCards, textKey(skillCardId), Text.equal)) {
            case (?skillCard) {
                if (skillCard.userId != userId) {
                    return #err(#UserNotAuthorized);
                };

                if (skillCard.status != #preview) {
                    return #err(#SkillCardAlreadyAccepted);
                };

                let acceptedCard : Types.SkillCard = {
                    skillCard with status = #accepted;
                };

                #ok(acceptedCard);
            };
            case (null) { #err(#SkillCardNotFound) };
        };
    };

    public func declineSkillCard(skillCards : Types.SkillCards, skillCardId : Text, userId : Principal) : Result.Result<Types.SkillCard, SkillCardError> {
        switch (Trie.find(skillCards, textKey(skillCardId), Text.equal)) {
            case (?skillCard) {
                if (skillCard.userId != userId) {
                    return #err(#UserNotAuthorized);
                };

                let declinedCard : Types.SkillCard = {
                    skillCard with status = #declined;
                };

                #ok(declinedCard);
            };
            case (null) { #err(#SkillCardNotFound) };
        };
    };

    public func getUserSkillCards(skillCards : Types.SkillCards, userId : Principal) : [Types.SkillCard] {
        let userCards = Trie.toArray<Text, Types.SkillCard, Types.SkillCard>(skillCards, func(k : Text, v : Types.SkillCard) : Types.SkillCard { v });
        Array.filter<Types.SkillCard>(userCards, func(card) { card.userId == userId });
    };

    public func getSkillCardById(skillCards : Types.SkillCards, skillCardId : Text) : ?Types.SkillCard {
        Trie.find(skillCards, textKey(skillCardId), Text.equal);
    };

    public func createProgressKey(userId : Principal, skillCardId : Text) : Text {
        Principal.toText(userId) # "#" # skillCardId;
    };
    
    // --- Quest Completion and Level Integration ---
    
    public type QuestCompletionResult = {
        questCompleted: Bool;
        skillUnlocked: Bool;
        newSkillsUnlocked: [Text];
        expGained: Nat;
        levelUpResult: Types.LevelUpResult;
        finalScore: Nat;
    };

    // Complete a quest and gain XP/levels
    public func completeQuest(
        skillCards: Types.SkillCards,
        quests: Types.Quests,
        userProgress: Types.UserSkillProgress,
        questId: Text,
        answers: [Nat],
        currentUserLevel: Types.LevelInfo
    ) : Result.Result<QuestCompletionResult, SkillCardError> {
        
        Debug.print("=== COMPLETING QUEST ===");
        Debug.print("Quest ID: " # questId);
        Debug.print("User answers: " # debug_show(answers));
        
        // Find the quest
        switch (Trie.find(quests, textKey(questId), Text.equal)) {
            case (?quest) {
                Debug.print("Found quest: " # quest.title);
                
                // Calculate score
                let score = calculateQuestScore(quest, answers);
                let scorePercentage = if (quest.questions.size() > 0) {
                    (score * 100) / quest.questions.size()
                } else { 0 };
                
                Debug.print("Score: " # Nat.toText(score) # "/" # Nat.toText(quest.questions.size()));
                Debug.print("Percentage: " # Nat.toText(scorePercentage) # "%");
                
                // Check if quest is passed
                let passingScore = Float.toInt(quest.passingThreshold * 100.0);
                let questPassed = scorePercentage >= Int.abs(passingScore);
                
                Debug.print("Passing threshold: " # Nat.toText(Int.abs(passingScore)) # "%");
                Debug.print("Quest passed: " # debug_show(questPassed));
                
                if (questPassed) {
                    // Calculate XP gained
                    let baseExp = quest.points;
                    let bonusExp = calculateBonusExp(scorePercentage);
                    let totalExpGained = baseExp + bonusExp;
                    
                    Debug.print("Base EXP: " # Nat.toText(baseExp));
                    Debug.print("Bonus EXP: " # Nat.toText(bonusExp));
                    Debug.print("Total EXP gained: " # Nat.toText(totalExpGained));
                    
                    // Apply level up
                    let levelUpResult = Level.addExperience(currentUserLevel.totalExp, totalExpGained);
                    
                    Debug.print("Previous level: " # Nat.toText(currentUserLevel.level));
                    Debug.print("New level: " # Nat.toText(levelUpResult.newLevel));
                    Debug.print("Leveled up: " # debug_show(levelUpResult.leveledUp));
                    
                    // Find skill associated with this quest
                    let skillId = findSkillByQuestId(skillCards, userProgress.skillCardId, questId);
                    
                    var newSkillsUnlocked: [Text] = [];
                    var skillUnlocked = false;
                    
                    switch (skillId) {
                        case (?sId) {
                            Debug.print("Found skill for quest: " # sId);
                            
                            // Mark skill as completed and unlock dependent skills
                            let unlockedSkills = unlockDependentSkills(skillCards, userProgress.skillCardId, sId, userProgress.completedSkills);
                            newSkillsUnlocked := unlockedSkills;
                            skillUnlocked := unlockedSkills.size() > 0;
                            
                            Debug.print("New skills unlocked: " # debug_show(unlockedSkills));
                        };
                        case (null) {
                            Debug.print("No skill found for quest ID: " # questId);
                        };
                    };
                    
                    let result: QuestCompletionResult = {
                        questCompleted = true;
                        skillUnlocked = skillUnlocked;
                        newSkillsUnlocked = newSkillsUnlocked;
                        expGained = totalExpGained;
                        levelUpResult = levelUpResult;
                        finalScore = scorePercentage;
                    };
                    
                    Debug.print("Quest completion successful!");
                    #ok(result);
                } else {
                    // Quest failed
                    let levelUpResult = Level.addExperience(currentUserLevel.totalExp, 0);
                    let result: QuestCompletionResult = {
                        questCompleted = false;
                        skillUnlocked = false;
                        newSkillsUnlocked = [];
                        expGained = 0;
                        levelUpResult = levelUpResult;
                        finalScore = scorePercentage;
                    };
                    
                    Debug.print("Quest failed - score too low");
                    #ok(result);
                };
            };
            case (null) {
                Debug.print("Quest not found: " # questId);
                #err(#QuestNotFound);
            };
        };
    };

    // Calculate quest score based on correct answers
    private func calculateQuestScore(quest: Types.Quest, answers: [Nat]) : Nat {
        var correctAnswers = 0;
        let maxQuestions = Nat.min(quest.questions.size(), answers.size());
        
        var i = 0;
        while (i < maxQuestions) {
            if (i < quest.questions.size() and i < answers.size()) {
                let question = quest.questions[i];
                let userAnswer = answers[i];
                
                if (userAnswer == question.correctAnswer) {
                    correctAnswers += 1;
                    Debug.print("Question " # Nat.toText(i) # " correct");
                } else {
                    Debug.print("Question " # Nat.toText(i) # " incorrect - expected: " # 
                               Nat.toText(question.correctAnswer) # ", got: " # Nat.toText(userAnswer));
                };
            };
            i += 1;
        };
        
        correctAnswers;
    };

    // Calculate bonus XP based on performance
    private func calculateBonusExp(scorePercentage: Nat) : Nat {
        if (scorePercentage >= 95) {
            50; // Perfect score bonus
        } else if (scorePercentage >= 85) {
            25; // Excellent bonus
        } else if (scorePercentage >= 75) {
            10; // Good bonus
        } else {
            0; // No bonus
        };
    };

    // Find skill ID by quest ID
    private func findSkillByQuestId(skillCards: Types.SkillCards, skillCardId: Text, questId: Text) : ?Text {
        switch (Trie.find(skillCards, textKey(skillCardId), Text.equal)) {
            case (?skillCard) {
                for (skill in skillCard.skills.vals()) {
                    if (skill.questId == questId) {
                        return ?skill.id;
                    };
                };
                null;
            };
            case (null) { null };
        };
    };

    // Unlock skills that depend on completed skill
    private func unlockDependentSkills(skillCards: Types.SkillCards, skillCardId: Text, completedSkillId: Text, currentCompletedSkills: [Text]) : [Text] {
        var newUnlockedSkills: [Text] = [];
        let updatedCompletedSkills = Array.append(currentCompletedSkills, [completedSkillId]);
        
        switch (Trie.find(skillCards, textKey(skillCardId), Text.equal)) {
            case (?skillCard) {
                for (skill in skillCard.skills.vals()) {
                    // Check if this skill depends on the completed skill
                    let dependsOnCompletedSkill = Array.find<Text>(skill.dependencies, func(dep) { dep == completedSkillId });
                    
                    if (dependsOnCompletedSkill != null and not skill.isCompleted) {
                        // Check if all dependencies are met
                        let allDependenciesMet = checkDependencies(skill.dependencies, updatedCompletedSkills);
                        
                        if (allDependenciesMet) {
                            newUnlockedSkills := Array.append(newUnlockedSkills, [skill.id]);
                            Debug.print("Unlocked skill: " # skill.name);
                        };
                    };
                };
            };
            case (null) { };
        };
        
        newUnlockedSkills;
    };

    // Update user progress after quest completion
    public func updateUserProgress(
        userProgress: Types.UserSkillProgress,
        questId: Text,
        skillId: Text,
        score: Nat,
        expGained: Nat
    ) : Types.UserSkillProgress {
        
        // Add skill to completed skills if not already there
        let updatedCompletedSkills = if (Array.find<Text>(userProgress.completedSkills, func(s) { s == skillId }) == null) {
            Array.append(userProgress.completedSkills, [skillId]);
        } else {
            userProgress.completedSkills;
        };
        
        // Update quest progress
        let updatedQuestProgress = updateQuestProgress(userProgress.questProgress, questId, score);
        
        // Update total points
        let updatedTotalPoints = userProgress.totalPoints + expGained;
        
        {
            userId = userProgress.userId;
            skillCardId = userProgress.skillCardId;
            completedSkills = updatedCompletedSkills;
            questProgress = updatedQuestProgress;
            totalPoints = updatedTotalPoints;
            lastUpdated = Time.now();
        };
    };

    // Helper to update quest progress
    private func updateQuestProgress(questProgress: [(Text, Nat)], questId: Text, score: Nat) : [(Text, Nat)] {
        var updated = false;
        var newProgress: [(Text, Nat)] = [];
        
        for ((qId, qScore) in questProgress.vals()) {
            if (qId == questId) {
                newProgress := Array.append(newProgress, [(questId, score)]);
                updated := true;
            } else {
                newProgress := Array.append(newProgress, [(qId, qScore)]);
            };
        };
        
        if (not updated) {
            newProgress := Array.append(newProgress, [(questId, score)]);
        };
        
        newProgress;
    };

    // Get user level info with current progress
    public func getUserLevelInfo(userProgress: Types.UserSkillProgress) : Types.LevelInfo {
        Level.getLevelInfo(userProgress.totalPoints);
    };

    // Check if user can attempt quest (skill is unlocked)
    public func canAttemptQuest(skillCards: Types.SkillCards, userProgress: Types.UserSkillProgress, questId: Text) : Bool {
        switch (findSkillByQuestId(skillCards, userProgress.skillCardId, questId)) {
            case (?skillId) {
                switch (Trie.find(skillCards, textKey(userProgress.skillCardId), Text.equal)) {
                    case (?skillCard) {
                        // Find the skill
                        switch (Array.find<Types.SkillNode>(skillCard.skills, func(s) { s.id == skillId })) {
                            case (?skill) {
                                // Check if dependencies are met
                                checkDependencies(skill.dependencies, userProgress.completedSkills);
                            };
                            case (null) { false };
                        };
                    };
                    case (null) { false };
                };
            };
            case (null) { false };
        };
    };
};
