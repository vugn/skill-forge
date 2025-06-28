import { useState, useCallback } from 'react';
import { LevelInfo, LevelUpResult } from '../types';
import { canisterService } from '../services/canister';

export const useLevel = () => {
    const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Convert backend level info to frontend format
    const convertBackendLevelInfo = useCallback((backendLevelInfo: any): LevelInfo => {
        return {
            level: Number(backendLevelInfo.level),
            currentExp: Number(backendLevelInfo.currentExp),
            expToNextLevel: Number(backendLevelInfo.expToNextLevel),
            totalExp: Number(backendLevelInfo.totalExp),
        };
    }, []);

    // Convert backend level up result to frontend format
    const convertBackendLevelUpResult = useCallback((backendResult: any): LevelUpResult => {
        return {
            newLevel: Number(backendResult.newLevel),
            expGained: Number(backendResult.expGained),
            leveledUp: backendResult.leveledUp,
            newLevelInfo: convertBackendLevelInfo(backendResult.newLevelInfo),
        };
    }, [convertBackendLevelInfo]);
 
    // Fetch current level info
    const fetchLevelInfo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const backendLevelInfo = await canisterService.getLevelInfo();
            const frontendLevelInfo = convertBackendLevelInfo(backendLevelInfo);
            setLevelInfo(frontendLevelInfo);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch level info';
            setError(errorMessage);
            console.error('Error fetching level info:', err);
        } finally {
            setIsLoading(false);
        }
    }, [convertBackendLevelInfo]);

    // Add experience
    const addExperience = useCallback(async (amount: number, source: string): Promise<LevelUpResult | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const backendResult = await canisterService.addExperience(amount, source);
            const frontendResult = convertBackendLevelUpResult(backendResult);
            
            // Update level info with new data
            setLevelInfo(frontendResult.newLevelInfo);
            
            return frontendResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add experience';
            setError(errorMessage);
            console.error('Error adding experience:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [convertBackendLevelUpResult]);

    // Complete activity (predefined experience reward)
    const completeActivity = useCallback(async (activityType: string): Promise<LevelUpResult | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const backendResult = await canisterService.completeActivity(activityType);
            const frontendResult = convertBackendLevelUpResult(backendResult);
            
            // Update level info with new data
            setLevelInfo(frontendResult.newLevelInfo);
            
            return frontendResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to complete activity';
            setError(errorMessage);
            console.error('Error completing activity:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [convertBackendLevelUpResult]);

    // Get experience required for a specific level
    const getExpRequiredForLevel = useCallback(async (level: number): Promise<number | null> => {
        try {
            return await canisterService.getExpRequiredForLevel(level);
        } catch (err) {
            console.error('Error getting exp required for level:', err);
            return null;
        }
    }, []);

    return {
        levelInfo,
        isLoading,
        error,
        fetchLevelInfo,
        addExperience,
        completeActivity,
        getExpRequiredForLevel,
    };
};

export default useLevel;
