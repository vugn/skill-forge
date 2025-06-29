import React, { useState } from 'react';
import { canisterService } from '../../services/canister';
import { authService } from '../../services/auth';

const LevelingTest: React.FC = () => {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testLeveling = async () => {
        setLoading(true);
        setResult('Testing...');
        
        try {
            const identity = authService.getIdentity();
            if (!identity) {
                setResult('Error: Not authenticated');
                return;
            }

            await canisterService.init(identity);
            
            // Test the leveling system
            const testResult = await canisterService.testLeveling();
            
            setResult(`
                ✅ Leveling Test Results:
                Old Level: ${testResult.oldLevel}
                New Level: ${testResult.newLevel}
                Exp Gained: ${testResult.expGained}
                Leveled Up: ${testResult.leveledUp ? 'YES!' : 'No'}
            `);
        } catch (error) {
            setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLevel = async () => {
        setLoading(true);
        setResult('Getting current level...');
        
        try {
            const identity = authService.getIdentity();
            if (!identity) {
                setResult('Error: Not authenticated');
                return;
            }

            await canisterService.init(identity);
            
            const levelInfo = await canisterService.getLevelInfo();
            
            setResult(`
                📊 Current Level Info:
                Level: ${Number(levelInfo.level)}
                Current Exp: ${Number(levelInfo.currentExp)}
                Exp to Next Level: ${Number(levelInfo.expToNextLevel)}
                Total Exp: ${Number(levelInfo.totalExp)}
            `);
        } catch (error) {
            setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Leveling System Test</h2>
            
            <div className="space-y-4">
                <button
                    onClick={testLeveling}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg"
                >
                    {loading ? 'Testing...' : 'Test Leveling (+100 XP)'}
                </button>
                
                <button
                    onClick={getCurrentLevel}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg ml-2"
                >
                    {loading ? 'Loading...' : 'Get Current Level'}
                </button>
            </div>
            
            {result && (
                <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                    <pre className="text-white text-sm whitespace-pre-wrap">{result}</pre>
                </div>
            )}
        </div>
    );
};

export default LevelingTest;