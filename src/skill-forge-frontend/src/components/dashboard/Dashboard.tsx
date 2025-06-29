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
    Lock
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

interface CardPosition {
    x: number;
    y: number;
}

const SkillCardDeck: React.FC<SkillCardDeckProps> = ({ userSkills = [] }) => {
    const [skillCards, setSkillCards] = useState<SkillCard[]>([]);
    const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });
    const [, setIsDragging] = useState(false);
    const [cardPositions, setCardPositions] = useState<Record<string, CardPosition>>({});

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

    const generateCardPositions = (cards: SkillCard[]) => {
        const positions: Record<string, CardPosition> = {};
        // Safe check for window object (SSR compatibility)
        const baseGridSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 200 : 280;
        const cols = Math.ceil(Math.sqrt(cards.length * 1.5)); // More spread out
        
        cards.forEach((card, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            // Add some randomness to make it more organic, but less on mobile
            const randomRange = typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 100;
            const randomOffsetX = (Math.random() - 0.5) * randomRange;
            const randomOffsetY = (Math.random() - 0.5) * randomRange;
            
            positions[card.id] = {
                x: col * baseGridSize + randomOffsetX,
                y: row * baseGridSize + randomOffsetY
            };
        });
        
        return positions;
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
        let cards: SkillCard[] = [];
        if (userSkills && userSkills.length > 0) {
            // Transform backend skills to card format
            cards = userSkills.map((skill, index) => ({
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
        } else {
            // Fallback to demo cards if no user skills
            cards = getDemoSkills();
        }
        
        setSkillCards(cards);
        // Generate initial positions for cards
        const positions = generateCardPositions(cards);
        setCardPositions(positions);
    }, [userSkills]);

    // Safety check for empty cards
    if (skillCards.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">No skills available yet. Generate your first skill tree!</p>
            </div>
        );
    }

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

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-600">
            {/* Viewport Container */}
            <motion.div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                drag
                dragMomentum={false}
                dragConstraints={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                onDrag={(_, info) => {
                    setViewportPosition(prev => ({
                        x: prev.x + info.delta.x,
                        y: prev.y + info.delta.y
                    }));
                }}
                style={{
                    transform: `translate(${viewportPosition.x}px, ${viewportPosition.y}px)`
                }}
            >
                {/* Grid Background */}
                <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        transform: `translate(${viewportPosition.x % 50}px, ${viewportPosition.y % 50}px)`
                    }}
                />

                {/* Skill Cards */}
                {skillCards.map((card) => {
                    const position = cardPositions[card.id] || { x: 0, y: 0 };
                    const IconComponent = ICON_MAP[card.iconName] || ICON_MAP.code;
                    const rarityColors = getRarityColors(card.rarity);

                    return (
                        <motion.div
                            key={card.id}
                            className="absolute cursor-move select-none"
                            style={{
                                left: position.x,
                                top: position.y,
                                width: 'clamp(160px, 20vw, 200px)',
                                height: 'clamp(220px, 25vw, 280px)'
                            }}
                            drag
                            dragMomentum={false}
                            dragConstraints={false}
                            dragElastic={0}
                            onDragEnd={(_, info) => {
                                // Update position only on drag end to prevent conflicts
                                setCardPositions(prev => ({
                                    ...prev,
                                    [card.id]: {
                                        x: position.x + info.offset.x,
                                        y: position.y + info.offset.y
                                    }
                                }));
                            }}
                            whileHover={{ 
                                scale: 1.05,
                                zIndex: 10,
                                boxShadow: "0 20px 25px rgba(0,0,0,0.4)"
                            }}
                            whileDrag={{ 
                                scale: 1.1,
                                zIndex: 30,
                                rotate: 3,
                                cursor: "grabbing"
                            }}
                            transition={{ 
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                mass: 0.5
                            }}
                        >
                            {/* Card Frame */}
                            <div className={`absolute inset-0 rounded-xl p-[2px] bg-gradient-to-br ${rarityColors.border} shadow-xl ${rarityColors.glow} ${card.rarity === 'legendary' ? 'animate-pulse' : ''}`}>
                                {/* Card Body */}
                                <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600">
                                    
                                    {/* Header */}
                                    <div className={`px-2 sm:px-3 py-1 sm:py-2 text-center border-b-2 bg-gradient-to-r ${rarityColors.bg} text-white`}>
                                        <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex space-x-0.5">
                                            {Array.from({ length: card.rarity === 'legendary' ? 5 : 
                                                                card.rarity === 'epic' ? 4 : 
                                                                card.rarity === 'rare' ? 3 : 2 }).map((_, i) => (
                                                <Star key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-yellow-300 fill-current" />
                                            ))}
                                        </div>
                                        <h4 className="text-xs sm:text-xs font-bold truncate">{card.name.toUpperCase()}</h4>
                                    </div>

                                    {/* Icon Section */}
                                    <div className="flex-1 p-2 sm:p-4 flex flex-col items-center justify-center">
                                        <div className={`w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-3 ${card.rarity === 'legendary' ? 'animate-pulse' : ''}`}
                                             style={{
                                                 background: `linear-gradient(45deg, ${
                                                     card.rarity === 'legendary' ? '#fbbf24, #f59e0b, #dc2626' :
                                                     card.rarity === 'epic' ? '#a855f7, #ec4899, #ef4444' :
                                                     card.rarity === 'rare' ? '#3b82f6, #06b6d4, #6366f1' :
                                                     '#64748b, #475569, #374151'
                                                 })`,
                                                 clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                             }}>
                                            <div className="w-full h-full flex items-center justify-center">
                                                <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 text-slate-900" />
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold mb-1 sm:mb-2 ${
                                            card.isCompleted
                                                ? 'bg-green-500 text-white'
                                                : card.isUnlocked
                                                    ? `bg-gradient-to-r ${rarityColors.bg.replace('to-red-600', 'to-orange-600')} text-white`
                                                    : 'bg-slate-700 text-slate-300'
                                        }`}>
                                            {card.isCompleted ? (
                                                <>
                                                    <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                                                    <span className="hidden sm:inline">MASTERED</span>
                                                    <span className="sm:hidden">DONE</span>
                                                </>
                                            ) : card.isUnlocked ? (
                                                <>
                                                    <Zap className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                                                    <span className="hidden sm:inline">READY</span>
                                                    <span className="sm:hidden">OPEN</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                                                    <span>LOCKED</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-slate-200 text-center leading-tight mb-1 sm:mb-2 px-1"
                                           style={{
                                               display: '-webkit-box',
                                               WebkitLineClamp: 2,
                                               WebkitBoxOrient: 'vertical',
                                               overflow: 'hidden'
                                           }}>
                                            {card.description}
                                        </p>
                                    </div>

                                    {/* Progress */}
                                    <div className="px-2 sm:px-3 pb-1 sm:pb-2">
                                        <div className="text-xs text-slate-400 mb-1 flex justify-between">
                                            <span className="hidden sm:inline">{card.rarity.toUpperCase()}</span>
                                            <span className="sm:hidden">{card.rarity.charAt(0).toUpperCase()}</span>
                                            <span>{card.currentPoints}/{card.maxPoints} XP</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${
                                                    card.isCompleted
                                                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                        : `bg-gradient-to-r ${rarityColors.border}`
                                                }`}
                                                style={{ 
                                                    width: `${Math.min(100, (card.currentPoints / card.maxPoints) * 100)}%` 
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Lock Overlay */}
                                    {!card.isUnlocked && (
                                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-[10px]">
                                            <div className="text-center">
                                                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-1" />
                                                <div className="text-xs font-bold text-slate-300">LOCKED</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Controls Overlay */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-slate-600 max-w-[180px] sm:max-w-none">
                <div className="text-xs text-slate-300 mb-1 font-semibold">Skill Map</div>
                <div className="text-xs text-slate-400 space-y-1">
                    <div className="hidden sm:block">🖱️ Drag background to pan</div>
                    <div className="hidden sm:block">📦 Drag cards to reorganize</div>
                    <div className="sm:hidden">🖱️ Drag to move</div>
                    <div className="border-t border-slate-600 pt-1 mt-1">
                        <div>{skillCards.filter(s => s.isCompleted).length} Mastered</div>
                        <div>{skillCards.filter(s => s.isUnlocked && !s.isCompleted).length} Available</div>
                        <div>{skillCards.filter(s => !s.isUnlocked).length} Locked</div>
                    </div>
                </div>
            </div>

            {/* Reset View Button */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <button
                    onClick={() => {
                        setViewportPosition({ x: 0, y: 0 });
                        const positions = generateCardPositions(skillCards);
                        setCardPositions(positions);
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-semibold transition-colors border border-slate-600"
                >
                    <span className="hidden sm:inline">Reset View</span>
                    <span className="sm:hidden">Reset</span>
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-slate-600 max-w-[160px] sm:max-w-none">
                <div className="text-xs text-slate-300 mb-1 sm:mb-2 font-semibold">Rarity</div>
                <div className="space-y-1">
                    {[
                        { rarity: 'legendary', color: 'from-yellow-300 to-red-500', name: 'Legendary', short: 'Leg' },
                        { rarity: 'epic', color: 'from-purple-400 to-pink-500', name: 'Epic', short: 'Epic' },
                        { rarity: 'rare', color: 'from-blue-400 to-indigo-500', name: 'Rare', short: 'Rare' },
                        { rarity: 'common', color: 'from-slate-500 to-slate-700', name: 'Common', short: 'Com' }
                    ].map(({ rarity, color, name, short }) => (
                        <div key={rarity} className="flex items-center space-x-1 sm:space-x-2 text-xs">
                            <div className={`w-2 sm:w-3 h-1 rounded bg-gradient-to-r ${color}`} />
                            <span className="text-slate-300 hidden sm:inline">{name}</span>
                            <span className="text-slate-300 sm:hidden">{short}</span>
                            <span className="text-slate-500">({skillCards.filter(s => s.rarity === rarity).length})</span>
                        </div>
                    ))}
                </div>
            </div>
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
                
                // Load skill cards
                const userCards = await canisterService.getUserSkillCards();
                
                // Extract all skills from all cards with safe access
                const allSkills = userCards?.flatMap(card => card?.skills || []) || [];
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
                                <span className="hidden sm:inline">Draw cards to explore your skills. Each card represents a unique ability in your learning journey.</span>
                                <span className="sm:hidden">Drag cards to explore your skills.</span>
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