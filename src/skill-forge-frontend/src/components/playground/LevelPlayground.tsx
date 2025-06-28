import React, { useState, useEffect } from 'react';
import { canisterService } from '../../services/canister';
import { LevelInfo, LevelUpResult } from '../../types';

const LevelPlayground: React.FC = () => {
    const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [lastLevelUp, setLastLevelUp] = useState<LevelUpResult | null>(null);

    // Load initial level info
    useEffect(() => {
        loadLevelInfo();
    }, []);

    const loadLevelInfo = async () => {
        try {
            setLoading(true);
            const backendLevelInfo = await canisterService.getLevelInfo();
            const levelInfo: LevelInfo = {
                level: Number(backendLevelInfo.level),
                currentExp: Number(backendLevelInfo.currentExp),
                expToNextLevel: Number(backendLevelInfo.expToNextLevel),
                totalExp: Number(backendLevelInfo.totalExp),
            };
            setLevelInfo(levelInfo);
            setMessage('Level info loaded successfully!');
        } catch (error) {
            console.error('Error loading level info:', error);
            setMessage('Error loading level info: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const completeActivity = async (activityType: string) => {
        try {
            setLoading(true);
            setMessage(`Completing ${activityType}...`);
            
            const result = await canisterService.completeActivity(activityType);
            const levelUpResult: LevelUpResult = {
                newLevel: Number(result.newLevel),
                expGained: Number(result.expGained),
                leveledUp: result.leveledUp,
                newLevelInfo: {
                    level: Number(result.newLevelInfo.level),
                    currentExp: Number(result.newLevelInfo.currentExp),
                    expToNextLevel: Number(result.newLevelInfo.expToNextLevel),
                    totalExp: Number(result.newLevelInfo.totalExp),
                }
            };

            setLevelInfo(levelUpResult.newLevelInfo);
            setLastLevelUp(levelUpResult);
            
            if (levelUpResult.leveledUp) {
                setMessage(`🎉 LEVEL UP! You reached level ${levelUpResult.newLevel}! (+${levelUpResult.expGained} EXP)`);
            } else {
                setMessage(`+${levelUpResult.expGained} EXP earned from ${activityType}!`);
            }
        } catch (error) {
            console.error('Error completing activity:', error);
            setMessage('Error: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const addCustomExp = async (amount: number) => {
        try {
            setLoading(true);
            setMessage(`Adding ${amount} EXP...`);
            
            const result = await canisterService.addExperience(amount, 'custom_exp');
            const levelUpResult: LevelUpResult = {
                newLevel: Number(result.newLevel),
                expGained: Number(result.expGained),
                leveledUp: result.leveledUp,
                newLevelInfo: {
                    level: Number(result.newLevelInfo.level),
                    currentExp: Number(result.newLevelInfo.currentExp),
                    expToNextLevel: Number(result.newLevelInfo.expToNextLevel),
                    totalExp: Number(result.newLevelInfo.totalExp),
                }
            };

            setLevelInfo(levelUpResult.newLevelInfo);
            setLastLevelUp(levelUpResult);
            
            if (levelUpResult.leveledUp) {
                setMessage(`🎉 LEVEL UP! You reached level ${levelUpResult.newLevel}! (+${levelUpResult.expGained} EXP)`);
            } else {
                setMessage(`+${levelUpResult.expGained} EXP added!`);
            }
        } catch (error) {
            console.error('Error adding experience:', error);
            setMessage('Error: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const getProgressPercentage = () => {
        if (!levelInfo) return 0;
        const totalExpForThisLevel = levelInfo.currentExp + levelInfo.expToNextLevel;
        if (totalExpForThisLevel === 0) return 100;
        return (levelInfo.currentExp / totalExpForThisLevel) * 100;
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Level & Experience Playground</h1>
                
                {/* Level Display */}
                {levelInfo && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Level {levelInfo.level}</h2>
                                <p className="text-gray-600">Total EXP: {levelInfo.totalExp.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Current Level Progress</p>
                                <p className="text-lg font-semibold">
                                    {levelInfo.currentExp.toLocaleString()} / {(levelInfo.currentExp + levelInfo.expToNextLevel).toLocaleString()} EXP
                                </p>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                            {levelInfo.expToNextLevel.toLocaleString()} EXP to next level
                        </p>
                    </div>
                )}

                {/* Message Display */}
                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${
                        message.includes('Error') 
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : message.includes('LEVEL UP')
                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                            : 'bg-green-50 border border-green-200 text-green-700'
                    }`}>
                        <p className="font-medium">{message}</p>
                    </div>
                )}

                {/* Activity Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => completeActivity('daily_login')}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Daily Login (+10 EXP)
                    </button>
                    
                    <button
                        onClick={() => completeActivity('skill_completion')}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Complete Skill (+50 EXP)
                    </button>
                    
                    <button
                        onClick={() => completeActivity('quiz_passed')}
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Pass Quiz (+25 EXP)
                    </button>
                    
                    <button
                        onClick={() => completeActivity('course_completed')}
                        disabled={loading}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Complete Course (+100 EXP)
                    </button>
                    
                    <button
                        onClick={() => completeActivity('achievement_unlocked')}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Unlock Achievement (+75 EXP)
                    </button>
                    
                    <button
                        onClick={() => completeActivity('profile_completed')}
                        disabled={loading}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Complete Profile (+20 EXP)
                    </button>
                </div>

                {/* Custom EXP Section */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Add Custom Experience</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[5, 10, 25, 50, 100, 250, 500, 1000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => addCustomExp(amount)}
                                disabled={loading}
                                className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-3 rounded transition-colors"
                            >
                                +{amount} EXP
                            </button>
                        ))}
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={loadLevelInfo}
                        disabled={loading}
                        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        {loading ? 'Loading...' : 'Refresh Level Info'}
                    </button>
                </div>

                {/* Last Level Up Details */}
                {lastLevelUp && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Last Activity Result:</h3>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>EXP Gained: +{lastLevelUp.expGained}</p>
                            <p>Current Level: {lastLevelUp.newLevel}</p>
                            <p>Level Up: {lastLevelUp.leveledUp ? '✅ Yes' : '❌ No'}</p>
                            <p>Total EXP: {lastLevelUp.newLevelInfo.totalExp.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LevelPlayground;
