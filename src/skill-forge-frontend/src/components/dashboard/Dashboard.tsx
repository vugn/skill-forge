import { motion } from 'framer-motion';
import {
    ChevronRight,
    Crown,
    Trophy,
    User,
    Calendar,
    Code,
    Database,
    Globe,
    Palette,
    Terminal,
    Zap,
    Layers,
    Shield,
    Server,
    Brain,
    Smartphone,
    Cloud,
    Package,
    GitBranch,
    PenTool,
    Command,
    Settings,
    Monitor,
    Award,
    Target,
    Book,
    Star,
    CheckCircle,
    Lock,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { formatJoinDate } from '../../utils';
import { canisterService } from '../../services/canister';
import { authService } from '../../services/auth';
import DashboardNavbar from './DashboardNavbar';

const ICON_MAP = {
    globe: Globe,
    code: Code,
    palette: Palette,
    zap: Zap,
    brain: Brain,
    database: Database,
    smartphone: Smartphone,
    shield: Shield,
    star: Star,
    award: Award,
    target: Target,
    book: Book,
    settings: Settings,
    cloud: Cloud,
    server: Server,
    monitor: Monitor,
    layers: Layers,
    git: GitBranch,
    pen: PenTool,
    command: Command,
    terminal: Terminal,
    package: Package
};

// --- SKILL INTERFACES ---
interface SkillCard {
    id: string;
    name: string;
    description: string;
    iconName: keyof typeof ICON_MAP;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    isCompleted: boolean;
    isUnlocked: boolean;
    currentPoints: number;
    maxPoints: number;
    category: string;
}

// --- SKILL CARD DECK COMPONENT ---
interface SkillCardDeckProps {
    userSkills?: any[];
}

const SkillCardDeck: React.FC<SkillCardDeckProps> = ({ userSkills = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [skillCards, setSkillCards] = useState<SkillCard[]>([]);

    // Helper functions outside useEffect to avoid dependency issues
    const getRandomIcon = (): keyof typeof ICON_MAP => {
        const icons = Object.keys(ICON_MAP) as (keyof typeof ICON_MAP)[];
        return icons[Math.floor(Math.random() * icons.length)];
    };

    const getRandomRarity = (): 'common' | 'rare' | 'epic' | 'legendary' => {
        const rarities: ('common' | 'rare' | 'epic' | 'legendary')[] = ['common', 'rare', 'epic', 'legendary'];
        const weights = [50, 30, 15, 5]; // Common is most likely
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < rarities.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return rarities[i];
            }
        }
        return 'common';
    };

    const getDemoSkills = (): SkillCard[] => [
        {
            id: '1',
            name: 'React Development',
            description: 'Master modern React with hooks and context',
            iconName: 'code',
            rarity: 'epic',
            isCompleted: true,
            isUnlocked: true,
            currentPoints: 100,
            maxPoints: 100,
            category: 'Frontend'
        },
        {
            id: '2',
            name: 'TypeScript',
            description: 'Type-safe JavaScript for better code quality',
            iconName: 'terminal',
            rarity: 'rare',
            isCompleted: false,
            isUnlocked: true,
            currentPoints: 75,
            maxPoints: 100,
            category: 'Programming'
        },
        {
            id: '3',
            name: 'API Design',
            description: 'RESTful and GraphQL API development',
            iconName: 'globe',
            rarity: 'common',
            isCompleted: false,
            isUnlocked: true,
            currentPoints: 45,
            maxPoints: 100,
            category: 'Backend'
        },
        {
            id: '4',
            name: 'UI/UX Design',
            description: 'Create beautiful and intuitive user interfaces',
            iconName: 'palette',
            rarity: 'rare',
            isCompleted: false,
            isUnlocked: false,
            currentPoints: 0,
            maxPoints: 100,
            category: 'Design'
        },
        {
            id: '5',
            name: 'Database Design',
            description: 'Efficient data modeling and optimization',
            iconName: 'database',
            rarity: 'epic',
            isCompleted: false,
            isUnlocked: false,
            currentPoints: 0,
            maxPoints: 100,
            category: 'Backend'
        },
        {
            id: '6',
            name: 'Machine Learning',
            description: 'AI and ML algorithms for intelligent applications',
            iconName: 'brain',
            rarity: 'legendary',
            isCompleted: false,
            isUnlocked: false,
            currentPoints: 0,
            maxPoints: 150,
            category: 'AI/ML'
        }
    ];

    useEffect(() => {
        // If we have user skills from backend, use them
        if (userSkills && userSkills.length > 0) {
            // Transform backend skills to card format
            const transformedSkills = userSkills.map((skill, index) => ({
                id: skill.id || `skill-${index}`,
                name: skill.name,
                description: skill.description || 'A valuable skill to master',
                iconName: (skill.iconName || getRandomIcon()) as keyof typeof ICON_MAP,
                rarity: (skill.rarity || getRandomRarity()) as 'common' | 'rare' | 'epic' | 'legendary',
                isCompleted: skill.completed || false,
                isUnlocked: skill.unlocked || true,
                currentPoints: skill.currentXP || 0,
                maxPoints: skill.requiredXP || 100,
                category: skill.category || 'General'
            }));
            setSkillCards(transformedSkills);
        } else {
            // Fallback to demo cards if no user skills
            setSkillCards(getDemoSkills());
        }
    }, [userSkills]);

    const drawCard = () => {
        if (isDrawing || skillCards.length === 0) return;
        setIsDrawing(true);
        setCurrentIndex((prev) => (prev + 1) % skillCards.length);
        setTimeout(() => setIsDrawing(false), 600);
    };

    const prevCard = () => {
        if (isDrawing || skillCards.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + skillCards.length) % skillCards.length);
    };

    // Safety check for empty cards or invalid index
    if (skillCards.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">No skills available yet. Generate your first skill tree!</p>
            </div>
        );
    }

    const currentCard = skillCards[currentIndex];
    if (!currentCard) {
        // Reset index if it's out of bounds
        if (currentIndex >= skillCards.length) {
            setCurrentIndex(0);
        }
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">Loading skills...</p>
            </div>
        );
    }
    
    const IconComponent = ICON_MAP[currentCard.iconName] || ICON_MAP.code;

    // Get rarity colors with safe fallback
    const getRarityColors = (rarity?: string) => {
        switch (rarity) {
            case 'legendary':
                return {
                    border: 'from-yellow-300 via-orange-400 to-red-500',
                    glow: 'shadow-yellow-400/40',
                    bg: 'from-yellow-600 via-orange-600 to-red-600'
                };
            case 'epic':
                return {
                    border: 'from-purple-400 via-fuchsia-500 to-pink-500',
                    glow: 'shadow-purple-400/30',
                    bg: 'from-purple-600 via-fuchsia-600 to-pink-600'
                };
            case 'rare':
                return {
                    border: 'from-blue-400 via-cyan-400 to-indigo-500',
                    glow: 'shadow-blue-400/25',
                    bg: 'from-blue-600 via-cyan-600 to-indigo-700'
                };
            default:
                return {
                    border: 'from-slate-500 via-slate-600 to-slate-700',
                    glow: 'shadow-slate-600/20',
                    bg: 'from-slate-600 via-slate-700 to-slate-800'
                };
        }
    };

    const rarityColors = getRarityColors(currentCard?.rarity);

    return (
        <div className="relative flex items-center justify-center min-h-[400px]">
            {/* Card Deck Stack */}
            <div className="relative">
                {/* Background cards (deck) - Show more cards in the stack */}
                {Array.from({ length: 5 }, (_, i) => (
                    <motion.div
                        key={`bg-${i}`}
                        className="absolute w-48 h-64 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl border-2 border-slate-600 shadow-lg"
                        style={{
                            transform: `translate(${-3 * (i + 1)}px, ${-3 * (i + 1)}px) rotate(${(i + 1) * 0.5}deg)`,
                            zIndex: -i - 1,
                        }}
                        animate={{
                            rotateZ: isDrawing ? [0, -10, 0] : (i + 1) * 0.5,
                            x: isDrawing ? [0, -20, 0] : -3 * (i + 1),
                            y: isDrawing ? [0, -5, 0] : -3 * (i + 1),
                        }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                ))}

                {/* Main displayed card */}
                <motion.div
                    key={currentCard.id}
                    className={`w-48 h-64 cursor-pointer relative`}
                    onClick={drawCard}
                    initial={{ 
                        scale: 0.8, 
                        opacity: 0, 
                        y: 100,
                        rotateY: 180 
                    }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        y: 0,
                        rotateY: isDrawing ? [0, 15, 0] : 0,
                        x: isDrawing ? [0, 30, 0] : 0,
                        z: isDrawing ? [0, 50, 0] : 0
                    }}
                    whileHover={{ 
                        scale: 1.08, 
                        rotateY: 8,
                        rotateX: 3,
                        z: 100,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                        duration: 0.7, 
                        ease: [0.25, 0.46, 0.45, 0.94],
                        scale: { duration: 0.2 }
                    }}
                    style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1000px'
                    }}
                >
                    {/* Card Frame */}
                    <div className={`absolute inset-0 rounded-xl p-[2px] bg-gradient-to-br ${rarityColors.border} shadow-xl ${rarityColors.glow} ${currentCard.rarity === 'legendary' ? 'animate-pulse' : ''}`}>
                        {/* Card Body */}
                        <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600">
                            
                            {/* Header */}
                            <div className={`px-3 py-2 text-center border-b-2 bg-gradient-to-r ${rarityColors.bg} text-white`}>
                                <div className="absolute top-1 right-1 flex space-x-0.5">
                                    {Array.from({ length: currentCard.rarity === 'legendary' ? 5 : 
                                                        currentCard.rarity === 'epic' ? 4 : 
                                                        currentCard.rarity === 'rare' ? 3 : 2 }).map((_, i) => (
                                        <Star key={i} className="w-2 h-2 text-yellow-300 fill-current" />
                                    ))}
                                </div>
                                <h4 className="text-xs font-bold truncate">{currentCard.name.toUpperCase()}</h4>
                            </div>

                            {/* Icon Section */}
                            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                                <div className={`w-12 h-12 mb-3 ${currentCard.rarity === 'legendary' ? 'animate-pulse' : ''}`}
                                     style={{
                                         background: `linear-gradient(45deg, ${
                                             currentCard.rarity === 'legendary' ? '#fbbf24, #f59e0b, #dc2626' :
                                             currentCard.rarity === 'epic' ? '#a855f7, #ec4899, #ef4444' :
                                             currentCard.rarity === 'rare' ? '#3b82f6, #06b6d4, #6366f1' :
                                             '#64748b, #475569, #374151'
                                         })`,
                                         clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                     }}>
                                    <div className="w-full h-full flex items-center justify-center">
                                        <IconComponent className="w-6 h-6 text-slate-900" />
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className={`px-2 py-1 rounded-full text-xs font-bold mb-2 ${
                                    currentCard.isCompleted
                                        ? 'bg-green-500 text-white'
                                        : currentCard.isUnlocked
                                            ? `bg-gradient-to-r ${rarityColors.bg.replace('to-red-600', 'to-orange-600')} text-white`
                                            : 'bg-slate-700 text-slate-300'
                                }`}>
                                    {currentCard.isCompleted ? (
                                        <>
                                            <CheckCircle className="w-3 h-3 inline mr-1" />
                                            MASTERED
                                        </>
                                    ) : currentCard.isUnlocked ? (
                                        <>
                                            <Zap className="w-3 h-3 inline mr-1" />
                                            READY
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-3 h-3 inline mr-1" />
                                            LOCKED
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-xs text-slate-200 text-center leading-tight mb-2"
                                   style={{
                                       display: '-webkit-box',
                                       WebkitLineClamp: 2,
                                       WebkitBoxOrient: 'vertical',
                                       overflow: 'hidden'
                                   }}>
                                    {currentCard.description}
                                </p>
                            </div>

                            {/* Progress */}
                            <div className="px-3 pb-2">
                                <div className="text-xs text-slate-400 mb-1 flex justify-between">
                                    <span>{currentCard.rarity.toUpperCase()}</span>
                                    <span>{currentCard.currentPoints}/{currentCard.maxPoints} XP</span>
                                </div>
                                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            currentCard.isCompleted
                                                ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                : `bg-gradient-to-r ${rarityColors.border}`
                                        }`}
                                        style={{ 
                                            width: `${Math.min(100, (currentCard.currentPoints / currentCard.maxPoints) * 100)}%` 
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Lock Overlay */}
                            {!currentCard.isUnlocked && (
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-[10px]">
                                    <div className="text-center">
                                        <Lock className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-slate-300">LOCKED</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 mt-6">
                <button
                    onClick={prevCard}
                    className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
                    disabled={isDrawing || skillCards.length <= 1}
                >
                    <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                
                <div className="text-center bg-slate-800/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-600">
                    <div className="text-sm text-slate-300">Card {currentIndex + 1} of {skillCards.length}</div>
                    <div className="text-xs text-slate-500">
                        {skillCards.filter(s => s.isCompleted).length} Mastered • {skillCards.filter(s => s.isUnlocked && !s.isCompleted).length} Available
                    </div>
                </div>
                
                <button
                    onClick={drawCard}
                    className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg disabled:opacity-50"
                    disabled={isDrawing || skillCards.length === 0}
                >
                    <ArrowRight className="w-4 h-4 text-slate-900" />
                </button>
            </div>

            {/* Draw instruction floating above */}
            {!isDrawing && skillCards.length > 1 && (
                <motion.div
                    className="absolute top-4 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-slate-600 shadow-lg">
                        <div className="text-xs text-slate-300 text-center">
                            ✨ Click card or button to draw next ✨
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [userSkills, setUserSkills] = useState<any[]>([]);
    const [levelInfo, setLevelInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Load user's skill trees and level info on component mount
    useEffect(() => {
        const loadUserData = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);
                // Initialize canister service with the current identity
                const identity = authService.getIdentity();
                if (!identity) {
                    console.warn('No identity available');
                    return;
                }
                
                await canisterService.init(identity);
                
                // Load skill trees
                const userTrees = await canisterService.getUserSkillTrees();
                
                // Extract all skills from all trees with safe access
                const allSkills = userTrees?.flatMap(tree => tree?.skills || []) || [];
                setUserSkills(allSkills);

                // Load level info
                try {
                    const levelInfoResult = await canisterService.getLevelInfo();
                    setLevelInfo({
                        level: Number(levelInfoResult.level),
                        currentExp: Number(levelInfoResult.currentExp),
                        expToNextLevel: Number(levelInfoResult.expToNextLevel),
                        totalExp: Number(levelInfoResult.totalExp)
                    });
                } catch (levelError) {
                    console.error('Failed to load level info:', levelError);
                    // Use fallback data if level info fails
                    setLevelInfo(null);
                }
            } catch (error) {
                console.error('Failed to load skill trees:', error);
                // Don't show error for "User not found" - this is expected for new users
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (!errorMessage.includes('User not found')) {
                    console.warn('Failed to load your skill trees:', errorMessage);
                }
                // Set empty array on error to show demo cards
                setUserSkills([]);
                setLevelInfo(null);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            loadUserData();
        }
    }, [isAuthenticated]);
    
    // User data dengan data sebenarnya dari backend
    const userData = {
        name: user?.fullName || 'SkillForge User',
        username: user?.username || 'user',
        joinDate: user?.createdAt ? formatJoinDate(user.createdAt) : 'Baru bergabung',
        level: levelInfo?.level || user?.level || 1,
        currentXP: levelInfo?.currentExp || user?.experience || 0,
        nextLevelXP: levelInfo?.expToNextLevel || 100, // Use real data from backend
        totalXP: levelInfo?.totalExp || user?.totalExperience || 0,
        skillsCompleted: userSkills?.filter(skill => skill?.isCompleted)?.length || 0,
        avatar: user?.profilePicture || '/api/placeholder/150/150'
    };

    const xpProgress = userData.nextLevelXP > 0 
        ? (userData.currentXP / userData.nextLevelXP) * 100 
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-deep-navy via-dark-blue to-deep-navy">
            <DashboardNavbar />

            <div className="pt-20 pb-8">
                <div className="container mx-auto px-4 space-y-8">
                    {/* 1. Profile Section - Top */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                            {/* Avatar & Basic Info */}
                            <div className="flex flex-col items-center text-center lg:text-left">
                                <div className="relative mb-4">
                                    {userData.avatar && userData.avatar !== '/api/placeholder/150/150' ? (
                                        <img
                                            src={userData.avatar}
                                            alt="User Avatar"
                                            className="w-20 h-20 rounded-full border-4 border-gold object-cover"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full border-4 border-gold bg-slate-700 flex items-center justify-center">
                                            <User className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-gold text-deep-navy rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                        {userData.level}
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-1">{userData.name}</h1>
                                <p className="text-gold font-semibold mb-1">@{userData.username}</p>
                                <div className="flex items-center text-gray-300 text-sm">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>Bergabung {userData.joinDate}</span>
                                </div>
                            </div>

                            {/* XP Progress */}
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-semibold">Level {userData.level}</span>
                                    <span className="text-gray-300 text-sm">
                                        {userData.currentXP.toLocaleString()} / {userData.nextLevelXP.toLocaleString()} XP
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-4 mb-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpProgress}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="bg-gradient-to-r from-gold to-yellow-400 h-4 rounded-full relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                    </motion.div>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    {userData.nextLevelXP - userData.currentXP} XP to next level
                                </p>
                            </div>

                            {/* Skills Stat */}
                            <div className="text-center">
                                <Link
                                    to="/skills"
                                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer block"
                                >
                                    <Trophy className="w-6 h-6 text-gold mx-auto mb-2" />
                                    <div className="text-xl font-bold text-white">{userData.skillsCompleted}</div>
                                    <div className="text-xs text-gray-300">Skills Learned</div>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Combined Welcome & AI-Powered Learning Paths Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30"
                    >
                        <div className="text-center">
                            {/* Welcome Message */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-3">Welcome to SkillForge!</h2>
                                <p className="text-gray-300 text-lg">
                                    Ready to start your learning journey? Let AI create a personalized path for you.
                                </p>
                            </div>

                            {/* AI Section */}
                            <div className="border-t border-white/10 pt-8">
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="inline-block mb-4 text-4xl"
                                >
                                    🧠
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    AI-Powered Learning Paths
                                </h3>
                                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                                    Let AI create a personalized skill tree based on your career goals and current skills.
                                    Get recommendations tailored to your learning style and objectives.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/skills"
                                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                                    >
                                        <span>Generate My Path</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Skill Card Collection Section - Bottom */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                                <Crown className="w-6 h-6 text-gold" />
                                <span>Your Skill Card Collection</span>
                            </h2>
                            <Link
                                to="/skills"
                                className="text-gold hover:text-gold/80 text-sm font-semibold transition-colors flex items-center space-x-1"
                            >
                                <span>View All Cards</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-300 text-sm">
                                Draw cards to explore your skills. Each card represents a unique ability in your learning journey.
                                {loading && " Loading your skills..."}
                            </p>
                        </div>

                        <SkillCardDeck userSkills={userSkills} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;