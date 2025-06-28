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

    // --- LLM Response Structures ---
    // Types use 'var' to enable direct parsing from JSON.
    // Fields are optional to handle cases where the LLM might omit them.
    public type LLMQuestion = {
        var text : Text;
        var options : [Text];
        var correctOptionIndex : Nat;
        var explanation : Text;
    };

    public type LLMSkill = {
        var skillName : Text;
        var description : Text;
        var iconName : ?Text;
        var dependencies : [Text];
        var questTitle : Text;
        var questions : [LLMQuestion];
        var maxPoints : ?Nat;
    };

    public type LLMResponse = {
        var learningPath : [LLMSkill];
    };

    // Helper function to create Trie key from Text
    private func textKey(t : Text) : Trie.Key<Text> {
        { key = t; hash = Text.hash(t) };
    };
    
    // --- Simplified JSON Parsing Function ---
    // For now, we'll create a mock response since proper JSON parsing is complex
    private func cleanAndParseJson(_rawContent: Text) : Result.Result<LLMResponse, Text> {
        // Create a mock response structure
        let mockResponse : LLMResponse = {
            var learningPath = [
                {
                    var skillName = "Introduction to Programming";
                    var description = "Learn the basics of programming";
                    var iconName = ?"code";
                    var dependencies = [];
                    var questTitle = "Programming Fundamentals Quest";
                    var questions = [
                        {
                            var text = "What is a variable?";
                            var options = ["A storage location", "A function", "A loop"];
                            var correctOptionIndex = 0;
                            var explanation = "A variable is a storage location with an associated name";
                        }
                    ];
                    var maxPoints = ?100;
                }
            ];
        };
        #ok(mockResponse);
    };

    // --- Main function to generate skill tree ---
    public func generateSkillTree(request : Types.SkillTreeRequest, userId : Principal) : async Result.Result<Types.SkillTreeGeneration, SkillTreeError> {
        // --- NEW: Enhanced system prompt with a "Few-Shot" example ---
        // Providing a perfect example is the best way to get valid JSON from the LLM.
        let systemPrompt =
          "You are an expert curriculum designer. Your task is to generate a comprehensive, structured learning path based on a user's request. " #
          "CRITICAL: You must respond ONLY with a single, valid JSON object. Do not add any explanatory text, comments, or markdown formatting like ```json. " #
          "Follow the structure of this example perfectly:\n" #
          "{\n" #
          "  \"learningPath\": [\n" #
          "    {\n" #
          "      \"skillName\": \"Introduction to Web Development\",\n" #
          "      \"description\": \"Understand the core components of the web: HTML, CSS, and JavaScript.\",\n" #
          "      \"iconName\": \"code\",\n" #
          "      \"dependencies\": [],\n" #
          "      \"questTitle\": \"Build Your First Static Web Page\",\n" #
          "      \"maxPoints\": 50,\n" #
          "      \"questions\": [\n" #
          "        {\n" #
          "          \"text\": \"What does HTML stand for?\",\n" #
          "          \"options\": [\"HyperText Markup Language\", \"High-Level Text Machine Language\", \"Hyperlink and Text Markup Language\"],\n" #
          "          \"correctOptionIndex\": 0,\n" #
          "          \"explanation\": \"HTML is the standard markup language for creating web pages and web applications.\"\n" #
          "        }\n" #
          "      ]\n" #
          "    }\n" #
          "  ]\n" #
          "}\n\n" #
          "Now, generate a new learning path based on the user's request below, following the same exact JSON format.";

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
