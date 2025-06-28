import Types "./Types";
import Result "mo:base/Result";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Error "mo:base/Error";
import Debug "mo:base/Debug";

import LLM "mo:llm";

module SkillTree {

    public type SkillTreeError = {
        #SkillTreeNotFound;
        #InvalidSkillTree;
        #UserNotAuthorized;
        #SkillTreeAlreadyAccepted;
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
    public func generateSkillTree(request : Types.SkillTreeRequest, userId : Principal) : async Result.Result<Types.SkillTreeGeneration, SkillTreeError> {
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
                            let generation = jsonToSkillTreeGeneration(llmResponse, request, userId);
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
    private func jsonToSkillTreeGeneration(response : LLMResponse, request : Types.SkillTreeRequest, userId : Principal) : Types.SkillTreeGeneration {
        let currentTime = Time.now();
        let skillTreeId = "tree_" # Int.toText(currentTime);

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

        let skillTree : Types.SkillTree = {
            id = skillTreeId;
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

        { skillTrees = [skillTree]; quests = quests };
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
    public func unlockSkill(skillTree : Types.SkillTree, skillId : Text, userProgress : ?Types.UserSkillProgress) : Result.Result<Types.SkillTree, SkillTreeError> {
        let skillIndex = Array.indexOf<Types.SkillNode>({ id = skillId; name = ""; description = ""; iconName = ""; gridPosition = { x = 0; y = 0 }; dependencies = []; questId = ""; isUnlocked = false; isCompleted = false; maxPoints = 0; currentPoints = 0 }, skillTree.skills, func(a, b) { a.id == b.id });

        switch (skillIndex) {
            case (?index) {
                let skill = skillTree.skills[index];

                // Check if dependencies are met
                let completedSkills = switch (userProgress) {
                    case (?progress) { progress.completedSkills };
                    case (null) { [] };
                };

                let dependenciesMet = checkDependencies(skill.dependencies, completedSkills);

                if (dependenciesMet) {
                    let updatedSkill = { skill with isUnlocked = true };
                    let updatedSkills = Array.tabulate<Types.SkillNode>(
                        skillTree.skills.size(),
                        func(i) {
                            if (i == index) { updatedSkill } else {
                                skillTree.skills[i];
                            };
                        },
                    );

                    let updatedTree = { skillTree with skills = updatedSkills };
                    #ok(updatedTree);
                } else {
                    #err(#SkillNotUnlocked);
                };
            };
            case (null) { #err(#SkillTreeNotFound) };
        };
    };

    // Rest of the functions remain the same but with updated signatures...
    public func acceptSkillTree(skillTrees : Types.SkillTrees, skillTreeId : Text, userId : Principal) : Result.Result<Types.SkillTree, SkillTreeError> {
        switch (Trie.find(skillTrees, textKey(skillTreeId), Text.equal)) {
            case (?skillTree) {
                if (skillTree.userId != userId) {
                    return #err(#UserNotAuthorized);
                };

                if (skillTree.status != #preview) {
                    return #err(#SkillTreeAlreadyAccepted);
                };

                let acceptedTree : Types.SkillTree = {
                    skillTree with status = #accepted;
                };

                #ok(acceptedTree);
            };
            case (null) { #err(#SkillTreeNotFound) };
        };
    };

    public func declineSkillTree(skillTrees : Types.SkillTrees, skillTreeId : Text, userId : Principal) : Result.Result<Types.SkillTree, SkillTreeError> {
        switch (Trie.find(skillTrees, textKey(skillTreeId), Text.equal)) {
            case (?skillTree) {
                if (skillTree.userId != userId) {
                    return #err(#UserNotAuthorized);
                };

                let declinedTree : Types.SkillTree = {
                    skillTree with status = #declined;
                };

                #ok(declinedTree);
            };
            case (null) { #err(#SkillTreeNotFound) };
        };
    };

    public func getUserSkillTrees(skillTrees : Types.SkillTrees, userId : Principal) : [Types.SkillTree] {
        let userTrees = Trie.toArray<Text, Types.SkillTree, Types.SkillTree>(skillTrees, func(k : Text, v : Types.SkillTree) : Types.SkillTree { v });
        Array.filter<Types.SkillTree>(userTrees, func(tree) { tree.userId == userId });
    };

    public func getSkillTreeById(skillTrees : Types.SkillTrees, skillTreeId : Text) : ?Types.SkillTree {
        Trie.find(skillTrees, textKey(skillTreeId), Text.equal);
    };

    public func createProgressKey(userId : Principal, skillTreeId : Text) : Text {
        Principal.toText(userId) # "#" # skillTreeId;
    };
};
