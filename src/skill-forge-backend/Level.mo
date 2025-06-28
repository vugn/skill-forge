import Types "./Types";

module {
    // Safe subtraction for Nat
    private func safeSub(a: Nat, b: Nat): Nat {
        if (a >= b) { a - b } else { 0 };
    };

    // Experience required for each level (exponential growth)
    public func getExpRequiredForLevel(level: Nat): Nat {
        if (level <= 1) {
            return 0;
        };
        // Formula: level^2 * 100 (can be adjusted)
        level * level * 100;
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
        let expForNextLevel = getTotalExpForLevel(level + 1);
        
        // Safe subtraction to avoid trapping
        let currentExp = if (totalExp >= expForCurrentLevel) {
            safeSub(totalExp, expForCurrentLevel);
        } else {
            0;
        };
        
        let expToNextLevel = if (expForNextLevel >= totalExp) {
            safeSub(expForNextLevel, totalExp);
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
            case ("course_completed") { 100 };
            case ("achievement_unlocked") { 75 };
            case ("profile_completed") { 20 };
            case (_) { 5 }; // Default reward
        };
    };
}
