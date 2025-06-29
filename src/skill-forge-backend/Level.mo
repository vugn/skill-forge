import Types "./Types";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

module {
    // Safe subtraction for Nat
    private func safeSub(a: Nat, b: Nat): Nat {
        if (a >= b) { a - b } else { 0 };
    };

    // Experience required for each level (more reasonable for testing)
    public func getExpRequiredForLevel(level: Nat): Nat {
        if (level <= 1) {
            return 0;
        };
        // Formula: level * 50 (more reasonable progression)
        level * 50;
    };

    // Calculate total experience required to reach a specific level
    public func getTotalExpForLevel(level: Nat): Nat {
        var total = 0;
        var currentLevel = 1;
        while (currentLevel < level) {
            total += getExpRequiredForLevel(currentLevel + 1);
            currentLevel += 1;
        };
        total;
    };

    // Calculate level from total experience
    public func calculateLevelFromExp(totalExp: Nat): Nat {
        var level = 1;
        var expNeeded = getTotalExpForLevel(level + 1);
        
        while (totalExp >= expNeeded) {
            level += 1;
            expNeeded := getTotalExpForLevel(level + 1);
        };
        
        level;
    };

    // Get current level info
    public func getLevelInfo(totalExp: Nat): Types.LevelInfo {
        let level = calculateLevelFromExp(totalExp);
        let expForCurrentLevel = getTotalExpForLevel(level);
        let expRequiredForNextLevel = getExpRequiredForLevel(level + 1);
        
        // Calculate current XP within the level (how much progress toward next level)
        let currentExp = if (totalExp >= expForCurrentLevel) {
            safeSub(totalExp, expForCurrentLevel);
        } else {
            0;
        };
        
        // Calculate how much XP is still needed for next level
        let expToNextLevel = if (currentExp < expRequiredForNextLevel) {
            safeSub(expRequiredForNextLevel, currentExp);
        } else {
            0;
        };
        
        {
            level = level;
            currentExp = currentExp;
            expToNextLevel = expToNextLevel;
            totalExp = totalExp;
        };
    };

    // Add experience and check for level up
    public func addExperience(currentTotalExp: Nat, expToAdd: Nat): Types.LevelUpResult {
        let oldLevel = calculateLevelFromExp(currentTotalExp);
        let newTotalExp = currentTotalExp + expToAdd;
        let newLevel = calculateLevelFromExp(newTotalExp);
        let leveledUp = newLevel > oldLevel;
        let newLevelInfo = getLevelInfo(newTotalExp);
        
        Debug.print("=== LEVEL CALCULATION DEBUG ===");
        Debug.print("Old total exp: " # Nat.toText(currentTotalExp));
        Debug.print("Exp to add: " # Nat.toText(expToAdd));
        Debug.print("New total exp: " # Nat.toText(newTotalExp));
        Debug.print("Old level: " # Nat.toText(oldLevel));
        Debug.print("New level: " # Nat.toText(newLevel));
        Debug.print("Leveled up: " # debug_show(leveledUp));
        Debug.print("New level info: " # debug_show(newLevelInfo));
        Debug.print("================================");
        
        {
            newLevel = newLevel;
            expGained = expToAdd;
            leveledUp = leveledUp;
            newLevelInfo = newLevelInfo;
        };
    };

    // Experience rewards for different activities
    public func getExpReward(source: Text): Nat {
        switch (source) {
            case ("daily_login") { 10 };
            case ("skill_completion") { 50 };
            case ("quiz_passed") { 25 };
            case ("quest_completion") { 30 };
            case ("course_completed") { 100 };
            case ("achievement_unlocked") { 75 };
            case ("profile_completed") { 20 };
            case (_) { 5 }; // Default reward
        };
    };
}
