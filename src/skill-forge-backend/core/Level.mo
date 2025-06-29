import Types "./Types";
import Nat "mo:base/Nat";

/// Level module handles all leveling system logic and experience calculations
/// This module provides functions for calculating levels, experience requirements, and rewards
module {
    
    /// Safe subtraction for Nat values, returns 0 if result would be negative
    /// @param a - First number
    /// @param b - Second number to subtract
    /// @return Result of subtraction or 0 if negative
    private func safeSub(a: Nat, b: Nat): Nat {
        if (a >= b) { a - b } else { 0 };
    };

    /// Get experience required to reach a specific level
    /// @param level - Target level
    /// @return Experience points required for that level
    public func getExpRequiredForLevel(level: Nat): Nat {
        if (level <= 1) {
            return 0;
        };
        // Formula: level * 50 (reasonable progression)
        level * 50;
    };

    /// Calculate total experience required to reach a specific level
    /// @param level - Target level
    /// @return Total experience points needed from level 1 to target level
    public func getTotalExpForLevel(level: Nat): Nat {
        var total = 0;
        var currentLevel = 1;
        while (currentLevel < level) {
            total += getExpRequiredForLevel(currentLevel + 1);
            currentLevel += 1;
        };
        total;
    };

    /// Calculate level from total experience points
    /// @param totalExp - Total experience points
    /// @return Current level based on experience
    public func calculateLevelFromExp(totalExp: Nat): Nat {
        var level = 1;
        var expNeeded = getTotalExpForLevel(level + 1);
        
        while (totalExp >= expNeeded) {
            level += 1;
            expNeeded := getTotalExpForLevel(level + 1);
        };
        
        level;
    };

    /// Get current level information including progress details
    /// @param totalExp - Total experience points
    /// @return LevelInfo containing current level, progress, and requirements
    public func getLevelInfo(totalExp: Nat): Types.LevelInfo {
        let level = calculateLevelFromExp(totalExp);
        let expForCurrentLevel = getTotalExpForLevel(level);
        let expRequiredForNextLevel = getExpRequiredForLevel(level + 1);
        
        // Calculate current XP within the level (progress toward next level)
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

    /// Add experience and check for level up
    /// @param currentTotalExp - Current total experience
    /// @param expToAdd - Experience to add
    /// @return LevelUpResult containing new level and level up status
    public func addExperience(currentTotalExp: Nat, expToAdd: Nat): Types.LevelUpResult {
        let oldLevel = calculateLevelFromExp(currentTotalExp);
        let newTotalExp = currentTotalExp + expToAdd;
        let newLevel = calculateLevelFromExp(newTotalExp);
        let leveledUp = newLevel > oldLevel;
        let newLevelInfo = getLevelInfo(newTotalExp);
        
        {
            newLevel = newLevel;
            expGained = expToAdd;
            leveledUp = leveledUp;
            newLevelInfo = newLevelInfo;
        };
    };

    /// Get experience reward for different activities
    /// @param source - Activity type that earned experience
    /// @return Experience points awarded for the activity
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
};
