import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Award,
    Book,
    Brain,
    Check,
    CheckCircle,
    Cloud,
    Code,
    Command,
    Cpu,
    Database,
    Eye,
    GitBranch,
    Globe,
    Layers,
    Lock,
    Monitor,
    Package,
    Palette,
    PenTool,
    Server,
    Settings,
    Shield,
    Smartphone,
    Star,
    Target,
    Terminal,
    TrendingUp,
    X,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { canisterService } from '../../services/canister';
import { authService } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';

// --- CUSTOM STYLES FOR CARD EFFECTS ---
const cardStyles = `
    .animate-spin-slow {
        animation: spin 8s linear infinite;
    }
    
    .bg-gradient-radial {
        background: radial-gradient(ellipse at center, var(--tw-gradient-stops));
    }
    
    .bg-gradient-conic {
        background: conic-gradient(var(--tw-gradient-stops));
    }
    
    .perspective-1000 {
        perspective: 1000px;
    }
    
    .animation-delay-200 {
        animation-delay: 0.2s;
    }
    
    .animation-delay-500 {
        animation-delay: 0.5s;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = cardStyles;
    document.head.appendChild(styleSheet);
}

// --- ICON MAPPING ---
const ICON_MAP = {
    globe: Globe,
    code: Code,
    palette: Palette,
    zap: Zap,
    brain: Brain,
    database: Database,
    smartphone: Smartphone,
    trending: TrendingUp,
    shield: Shield,
    star: Star,
    award: Award,
    target: Target,
    book: Book,
    settings: Settings,
    cpu: Cpu,
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

type IconName = keyof typeof ICON_MAP;

// --- INTERFACES ---
// Backend types that match the Motoko Types.mo
interface BackendQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: bigint;
    explanation: string;
}

interface BackendQuest {
    id: string;
    title: string;
    description: string;
    questions: BackendQuestion[];
    points: bigint;
    passingThreshold: number;
}

interface BackendGridPosition {
    x: bigint;
    y: bigint;
}

interface BackendSkillNode {
    id: string;
    name: string;
    description: string;
    iconName: string;
    gridPosition: BackendGridPosition;
    dependencies: string[];
    questId: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    maxPoints: bigint;
    currentPoints: bigint;
}

interface BackendSkillTree {
    id: string;
    title: string;
    description: string;
    category: string;
    skills: BackendSkillNode[];
    completedPoints: bigint;
    totalPoints: bigint;
    status: { preview: null } | { accepted: null } | { declined: null };
    createdAt: bigint;
    userId: string;
}

// Frontend interfaces for display
interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface Quest {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    points: number;
    passingThreshold: number;
}

interface SkillNode {
    id: string;
    name: string;
    description: string;
    iconName: IconName;
    gridPosition: { x: number; y: number };
    dependencies: string[];
    questId: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    maxPoints: number;
    currentPoints: number;
}

interface SkillTree {
    id: string;
    title: string;
    description: string;
    category: string;
    skills: SkillNode[];
    completedPoints: number;
    totalPoints: number;
    status: 'preview' | 'accepted' | 'declined';
}

interface SkillTreeCanvasProps {
    tree: SkillTree;
    onSkillClick: (skill: SkillNode) => void;
    isDraggable?: boolean;
    isPreview?: boolean;
    gridSize?: number;
    skillSize?: number;
}

// --- CONSTANTS ---
// Hook for mobile detection
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// --- UTILITY FUNCTIONS ---
// Convert backend data to frontend data
const convertBackendQuestion = (backendQ: BackendQuestion): Question => ({
    id: backendQ.id,
    text: backendQ.text,
    options: backendQ.options,
    correctAnswer: Number(backendQ.correctAnswer),
    explanation: backendQ.explanation,
});

const convertBackendQuest = (backendQuest: BackendQuest): Quest => ({
    id: backendQuest.id,
    title: backendQuest.title,
    description: backendQuest.description,
    questions: backendQuest.questions.map(convertBackendQuestion),
    points: Number(backendQuest.points),
    passingThreshold: backendQuest.passingThreshold,
});

const convertBackendSkillNode = (backendSkill: BackendSkillNode): SkillNode => ({
    id: backendSkill.id,
    name: backendSkill.name,
    description: backendSkill.description,
    iconName: getIconForSkill(backendSkill.name, backendSkill.iconName),
    gridPosition: {
        x: Number(backendSkill.gridPosition.x),
        y: Number(backendSkill.gridPosition.y),
    },
    dependencies: backendSkill.dependencies,
    questId: backendSkill.questId,
    isUnlocked: backendSkill.isUnlocked,
    isCompleted: backendSkill.isCompleted,
    maxPoints: Number(backendSkill.maxPoints),
    currentPoints: Number(backendSkill.currentPoints),
});

const convertBackendSkillTree = (backendTree: BackendSkillTree): SkillTree => ({
    id: backendTree.id,
    title: backendTree.title,
    description: backendTree.description,
    category: backendTree.category,
    skills: backendTree.skills.map(convertBackendSkillNode),
    completedPoints: Number(backendTree.completedPoints),
    totalPoints: Number(backendTree.totalPoints),
    status: 'preview' in backendTree.status ? 'preview' :
            'accepted' in backendTree.status ? 'accepted' : 'declined',
});

// Dynamic icon selection based on skill type
const getIconForSkill = (skillName: string, iconName?: string): IconName => {
    // If backend provides iconName, try to use it first
    if (iconName && iconName in ICON_MAP) {
        return iconName as IconName;
    }

    const name = skillName.toLowerCase();

    // Specific skill mappings
    if (name.includes('html')) return 'globe';
    if (name.includes('css')) return 'palette';
    if (name.includes('javascript') || name.includes('js')) return 'code';
    if (name.includes('typescript') || name.includes('ts')) return 'terminal';
    if (name.includes('react')) return 'zap';
    if (name.includes('vue')) return 'layers';
    if (name.includes('angular')) return 'shield';
    if (name.includes('node')) return 'server';
    if (name.includes('express')) return 'globe';
    if (name.includes('database') || name.includes('sql')) return 'database';
    if (name.includes('python')) return 'code';
    if (name.includes('machine learning') || name.includes('ml') || name.includes('ai')) return 'brain';
    if (name.includes('mobile') || name.includes('app')) return 'smartphone';
    if (name.includes('cloud')) return 'cloud';
    if (name.includes('docker')) return 'package';
    if (name.includes('git')) return 'git';
    if (name.includes('design')) return 'pen';
    if (name.includes('test')) return 'target';

    return 'code'; // Default fallback
};

// --- SKILL CARD COMPONENT ---
const SkillCard: React.FC<{
    skill: SkillNode;
    onSkillClick: (skill: SkillNode) => void;
    isPreview: boolean;
}> = ({ skill, onSkillClick, isPreview }) => {
    const IconComponent = ICON_MAP[skill.iconName] || Code;

    // Enhanced rarity system with randomization
    const getRarity = () => {
        if (skill.isCompleted) return 'legendary';
        
        // Use skill ID as seed for consistent randomization
        const seed = skill.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const random = (seed % 100) / 100;
        
        if (skill.dependencies.length >= 3) {
            // High dependency skills have higher chance for epic/rare
            if (random < 0.3) return 'epic';
            if (random < 0.7) return 'rare';
            return 'common';
        } else if (skill.dependencies.length >= 1) {
            // Medium dependency skills
            if (random < 0.15) return 'epic';
            if (random < 0.5) return 'rare';
            return 'common';
        } else {
            // No dependencies - mostly common with small chance for higher rarity
            if (random < 0.05) return 'epic';
            if (random < 0.2) return 'rare';
            return 'common';
        }
    };

    const rarity = getRarity();
    
    return (
        <motion.div
            className="relative w-full aspect-[2.5/3.5] cursor-pointer group perspective-1000"
            onClick={() => !isPreview && onSkillClick(skill)}
            whileHover={{ 
                scale: skill.isUnlocked ? 1.08 : 1,
                rotateY: skill.isUnlocked ? 8 : 0,
                rotateX: skill.isUnlocked ? 2 : 0,
                z: skill.isUnlocked ? 100 : 0
            }}
            whileTap={{ scale: skill.isUnlocked ? 0.92 : 1 }}
            style={{
                filter: skill.isUnlocked ? 'none' : 'grayscale(50%) brightness(0.6)',
                opacity: skill.isUnlocked ? 1 : 0.7,
            }}
        >
            {/* Card Shadow - Creates 3D depth */}
            <div className="absolute inset-0 bg-black/30 rounded-2xl translate-y-3 translate-x-2 group-hover:translate-y-4 group-hover:translate-x-3 transition-transform duration-300 -z-10" />
            
            {/* Outer Card Frame */}
            <div className={`absolute inset-0 rounded-2xl p-[3px] transition-all duration-500 ${
                rarity === 'legendary' 
                    ? 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-2xl shadow-yellow-400/40 animate-pulse' 
                    : rarity === 'epic'
                        ? 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500 shadow-xl shadow-purple-400/30'
                        : rarity === 'rare'
                            ? 'bg-gradient-to-br from-blue-400 via-cyan-400 to-indigo-500 shadow-lg shadow-blue-400/25'
                            : 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 shadow-md shadow-slate-600/20'
            }`}>
                
                {/* Inner Card Body */}
                <div className="relative h-full w-full rounded-[18px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600">
                    
                    {/* Card Header - Ornate Title Bar */}
                    <div className={`relative px-4 py-3 text-center border-b-2 ${
                        rarity === 'legendary'
                            ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 border-red-700 text-yellow-100'
                            : rarity === 'epic'
                                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 border-pink-700 text-purple-100'
                                : rarity === 'rare'
                                    ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-700 border-indigo-700 text-blue-100'
                                    : 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 border-slate-800 text-slate-100'
                    }`}>
                        
                        {/* Ornate Corner Decorations */}
                        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/50 rounded-tl-lg" />
                        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white/50 rounded-tr-lg" />
                        
                        <h4 className="text-sm font-bold tracking-wider drop-shadow-lg">
                            {skill.name.toUpperCase()}
                        </h4>
                        
                        {/* Rarity Stars */}
                        <div className="absolute top-1 right-4 flex space-x-0.5">
                            {Array.from({ length: rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2 }).map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 text-yellow-300 fill-current drop-shadow-md" />
                            ))}
                        </div>
                    </div>

                    {/* Card Artwork Section */}
                    <div className="relative flex-1 p-6 flex flex-col items-center justify-center">
                        
                        {/* Background Art Pattern */}
                        <div className={`absolute inset-0 opacity-20 ${
                            rarity === 'legendary'
                                ? 'bg-gradient-radial from-yellow-300 via-orange-300 to-transparent'
                                : rarity === 'epic'
                                    ? 'bg-gradient-radial from-purple-300 via-fuchsia-300 to-transparent'
                                    : rarity === 'rare'
                                        ? 'bg-gradient-radial from-blue-300 via-cyan-300 to-transparent'
                                        : 'bg-gradient-radial from-slate-400 via-slate-500 to-transparent'
                        }`} />
                        
                        {/* Hexagonal Frame for Icon */}
                        <div className={`relative mb-4 ${
                            rarity === 'legendary' ? 'animate-pulse' : ''
                        }`}>
                            {/* Hexagon Background */}
                            <div className={`w-20 h-20 relative ${
                                rarity === 'legendary'
                                    ? 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-lg shadow-yellow-500/50'
                                    : rarity === 'epic'
                                        ? 'bg-gradient-to-br from-purple-300 via-fuchsia-400 to-pink-500 shadow-lg shadow-purple-500/40'
                                        : rarity === 'rare'
                                            ? 'bg-gradient-to-br from-blue-300 via-cyan-400 to-indigo-500 shadow-lg shadow-blue-500/40'
                                            : 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-md shadow-slate-500/30'
                            }`}
                            style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                            }}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <IconComponent className={`w-10 h-10 drop-shadow-lg ${
                                        rarity === 'legendary' ? 'text-red-800' :
                                        rarity === 'epic' ? 'text-purple-800' :
                                        rarity === 'rare' ? 'text-blue-800' :
                                        'text-slate-800'
                                    }`} />
                                </div>
                            </div>
                            
                            {/* Glowing Ring Effect for Higher Rarities */}
                            {rarity !== 'common' && (
                                <div className={`absolute inset-0 rounded-full animate-spin-slow ${
                                    rarity === 'legendary' ? 'bg-gradient-conic from-yellow-400 via-orange-500 to-red-500' :
                                    rarity === 'epic' ? 'bg-gradient-conic from-purple-400 via-fuchsia-500 to-pink-500' :
                                    'bg-gradient-conic from-blue-400 via-cyan-500 to-indigo-500'
                                }`}
                                style={{
                                    mask: 'radial-gradient(circle at center, transparent 60%, black 61%, black 65%, transparent 66%)',
                                    WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 61%, black 65%, transparent 66%)'
                                }} />
                            )}
                        </div>

                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 border-2 ${
                            skill.isCompleted
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-lg shadow-green-500/50'
                                : skill.isUnlocked
                                    ? `bg-gradient-to-r ${
                                        rarity === 'legendary' ? 'from-yellow-500 to-orange-600 text-white border-yellow-400' :
                                        rarity === 'epic' ? 'from-purple-500 to-fuchsia-600 text-white border-purple-400' :
                                        rarity === 'rare' ? 'from-blue-500 to-cyan-600 text-white border-blue-400' :
                                        'from-slate-500 to-slate-600 text-white border-slate-400'
                                    }`
                                    : 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-300 border-slate-600'
                        }`}>
                            {skill.isCompleted ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    <span>MASTERED</span>
                                </>
                            ) : skill.isUnlocked ? (
                                <>
                                    <Zap className="w-3 h-3" />
                                    <span>READY</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-3 h-3" />
                                    <span>SEALED</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Card Description Box */}
                    <div className="px-4 pb-4">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded-lg p-3 shadow-inner">
                            <p className="text-xs text-slate-200 text-center leading-relaxed" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {skill.description}
                            </p>
                        </div>
                    </div>

                    {/* Card Stats Panel */}
                    <div className="px-4 pb-4">
                        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-lg p-3 border border-slate-700">
                            {/* XP Stats */}
                            <div className="flex items-center justify-between text-xs mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        rarity === 'legendary' ? 'bg-yellow-400 animate-pulse' :
                                        rarity === 'epic' ? 'bg-purple-400' :
                                        rarity === 'rare' ? 'bg-blue-400' : 'bg-slate-400'
                                    }`} />
                                    <span className="font-bold text-white tracking-wider">
                                        {rarity.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-yellow-400 font-mono font-bold">
                                    {skill.currentPoints}/{skill.maxPoints} XP
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                                <div
                                    className={`h-full transition-all duration-700 ${
                                        skill.isCompleted
                                            ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600'
                                            : rarity === 'legendary'
                                                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
                                                : rarity === 'epic'
                                                    ? 'bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500'
                                                    : rarity === 'rare'
                                                        ? 'bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-500'
                                                        : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
                                    }`}
                                    style={{ 
                                        width: `${Math.min(100, (skill.currentPoints / skill.maxPoints) * 100)}%` 
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card Footer - Action Zone */}
                    <div className={`px-3 py-2 text-center text-xs border-t-2 ${
                        rarity === 'legendary'
                            ? 'bg-gradient-to-r from-yellow-700 via-orange-700 to-red-700 border-red-800 text-yellow-100'
                            : rarity === 'epic'
                                ? 'bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 border-pink-800 text-purple-100'
                                : rarity === 'rare'
                                    ? 'bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-800 border-indigo-800 text-blue-100'
                                    : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-slate-900 text-slate-100'
                    }`}>
                        {skill.dependencies.length > 0 ? (
                            <div className="font-semibold">
                                🔒 Requires {skill.dependencies.length} prerequisites
                            </div>
                        ) : skill.isCompleted ? (
                            <div className="font-bold text-green-300">
                                ✨ SKILL MASTERED ✨
                            </div>
                        ) : skill.isUnlocked ? (
                            <div className="font-semibold">
                                ⚡ Click to start quest
                            </div>
                        ) : (
                            <div className="font-semibold">
                                📚 Ready to learn
                            </div>
                        )}
                    </div>

                    {/* Holographic Foil Effect */}
                    {rarity !== 'common' && skill.isUnlocked && (
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${
                            rarity === 'legendary'
                                ? 'bg-gradient-to-br from-yellow-400/20 via-orange-300/10 to-red-400/20'
                                : rarity === 'epic'
                                    ? 'bg-gradient-to-br from-purple-400/20 via-fuchsia-300/10 to-pink-400/20'
                                    : 'bg-gradient-to-br from-blue-400/20 via-cyan-300/10 to-indigo-400/20'
                        }`} />
                    )}

                    {/* Shimmer Effect for Activated Cards */}
                    {skill.isUnlocked && !skill.isCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out pointer-events-none" />
                    )}

                    {/* Legendary Particle Effects */}
                    {rarity === 'legendary' && skill.isUnlocked && (
                        <>
                            <div className="absolute top-3 right-3 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
                            <div className="absolute top-5 right-6 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                            <div className="absolute top-7 right-4 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                        </>
                    )}

                    {/* Lock Overlay for Unavailable Skills */}
                    {!skill.isUnlocked && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-[18px]">
                            <div className="text-center">
                                <Lock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                                <div className="text-sm font-bold text-slate-300">LOCKED</div>
                                <div className="text-xs text-slate-400 mt-1">Complete prerequisites</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- SKILL TREE GRID ---
const SkillTreeGrid: React.FC<SkillTreeCanvasProps> = ({
    tree,
    onSkillClick,
    isPreview = false
}) => {
    // Mobile detection
    const isMobile = useIsMobile();

    // Group skills by their unlock status and dependencies
    const organizedSkills = useMemo(() => {
        const completed = tree.skills.filter(skill => skill.isCompleted);
        const available = tree.skills.filter(skill => skill.isUnlocked && !skill.isCompleted);
        const locked = tree.skills.filter(skill => !skill.isUnlocked);

        return { completed, available, locked };
    }, [tree.skills]);

    return (
        <div className="w-full space-y-6">
            {/* Progress Summary */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Learning Progress</h3>
                    <div className="text-sm text-slate-400">
                        {tree.completedPoints} / {tree.totalPoints} points
                    </div>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(100, (tree.completedPoints / tree.totalPoints) * 100)}%` }}
                    />
                </div>
                <div className="text-xs text-slate-400 mt-2">
                    {Math.round((tree.completedPoints / tree.totalPoints) * 100)}% Complete
                </div>
            </div>

            {/* Available Skills */}
            {organizedSkills.available.length > 0 && (
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <h3 className="text-lg font-semibold text-yellow-300">
                            Available Skills ({organizedSkills.available.length})
                        </h3>
                    </div>
                    <div className={`grid gap-4 ${
                        isMobile 
                            ? 'grid-cols-1' 
                            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                        {organizedSkills.available.map(skill => (
                            <SkillCard
                                key={skill.id}
                                skill={skill}
                                onSkillClick={onSkillClick}
                                isPreview={isPreview}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Skills */}
            {organizedSkills.completed.length > 0 && (
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-green-300">
                            Completed Skills ({organizedSkills.completed.length})
                        </h3>
                    </div>
                    <div className={`grid gap-4 ${
                        isMobile 
                            ? 'grid-cols-1' 
                            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                        {organizedSkills.completed.map(skill => (
                            <SkillCard
                                key={skill.id}
                                skill={skill}
                                onSkillClick={onSkillClick}
                                isPreview={isPreview}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Skills */}
            {organizedSkills.locked.length > 0 && (
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-slate-400">
                            Locked Skills ({organizedSkills.locked.length})
                        </h3>
                    </div>
                    <div className={`grid gap-4 ${
                        isMobile 
                            ? 'grid-cols-1' 
                            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                        {organizedSkills.locked.map(skill => (
                            <SkillCard
                                key={skill.id}
                                skill={skill}
                                onSkillClick={onSkillClick}
                                isPreview={isPreview}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {tree.skills.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Book className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-400 mb-2">No Skills Available</h3>
                    <p className="text-sm text-slate-500">Generate a skill tree to start learning!</p>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
const AISkillTreeGenerator: React.FC = () => {
    const { isAuthenticated, loading, refreshUserProfile } = useAuth();
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTrees, setGeneratedTrees] = useState<SkillTree[]>([]);
    const [previewTree, setPreviewTree] = useState<SkillTree | null>(null);
    const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Quest system state
    const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questAnswers, setQuestAnswers] = useState<number[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Mobile support
    const loadUserSkillTrees = useCallback(async () => {
        if (!isAuthenticated) {
            console.log('User not authenticated, skipping skill tree load');
            return;
        }

        try {
            // Initialize canister service with the current identity
            const identity = authService.getIdentity();
            await canisterService.init(identity);
            const userTrees = await canisterService.getUserSkillTrees();
            const convertedTrees = userTrees.map(convertBackendSkillTree);
            setGeneratedTrees(convertedTrees);
        } catch (error) {
            console.error('Failed to load skill trees:', error);
            // Don't show error for "User not found" - this is expected for new users
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (!errorMessage.includes('User not found')) {
                setError('Failed to load your skill trees. Please try again.');
            }
        }
    }, [isAuthenticated]);

    // Load user's existing skill trees on component mount
    useEffect(() => {
        if (isAuthenticated && !loading) {
            loadUserSkillTrees();
        }
    }, [isAuthenticated, loading, loadUserSkillTrees]);

    const handleGenerate = useCallback(async () => {
        if (!input.trim()) return;
        
        // Check authentication first - only need to be authenticated, user profile will be created if needed
        if (!isAuthenticated) {
            setError('Please log in to generate skill trees.');
            return;
        }
        
        setIsGenerating(true);
        setError(null);

        try {
            // Initialize canister service with the current identity
            const identity = authService.getIdentity();
            await canisterService.init(identity);

            // Call the real backend to generate skill tree
            const request = {
                prompt: input.trim(),
                category: [], // Optional, let LLM decide
                difficulty: [], // Optional, let LLM decide
            };

            console.log('Generating skill tree for authenticated user');
            const generation = await canisterService.generateSkillTree(request);
            
            // Convert backend data to frontend format
            const convertedTrees = generation.skillTrees.map(convertBackendSkillTree);
            const convertedQuests = generation.quests.map(convertBackendQuest);
            
            // Update state with new trees and quests
            setGeneratedTrees(prev => [...convertedTrees, ...prev]);
            setAvailableQuests(prev => [...convertedQuests, ...prev]);
            setInput('');
        } catch (error) {
            console.error('Generation failed:', error);
            setError(error instanceof Error ? error.message : 'Failed to generate skill tree. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    }, [input, isAuthenticated]);

    const handleSkillClick = useCallback(async (skill: SkillNode) => {
        if (skill.isUnlocked && !skill.isCompleted) {
            setSelectedSkill(skill);
            
            // Try to load the quest from available quests first
            let quest = availableQuests.find(q => q.id === skill.questId);
            
            // If not found in local state, fetch from backend
            if (!quest) {
                try {
                    const identity = authService.getIdentity();
                    await canisterService.init(identity);
                    const backendQuest = await canisterService.getQuestById(skill.questId);
                    if (backendQuest && backendQuest.length > 0) {
                        quest = convertBackendQuest(backendQuest[0]);
                        setAvailableQuests(prev => [...prev, quest!]);
                    }
                } catch (error) {
                    console.error('Failed to load quest:', error);
                    setError('Failed to load quest. Please try again.');
                    return;
                }
            }
            
            if (!quest) {
                setError('Quest not found. Please try again.');
                return;
            }
        }
    }, [availableQuests]);

    const handleStartQuest = useCallback(() => {
        if (!selectedSkill) return;
        const quest = availableQuests.find(q => q.id === selectedSkill.questId);
        if (quest) {
            setActiveQuest(quest);
            setCurrentQuestionIndex(0);
            setQuestAnswers([]);
            setSelectedAnswer(null);
            setShowResult(false);
            setSelectedSkill(null);
        }
    }, [selectedSkill, availableQuests]);

    const handleAnswerSubmit = useCallback(async () => {
        if (selectedAnswer === null || !activeQuest) return;
        setShowResult(true);

        setTimeout(async () => {
            const newAnswers = [...questAnswers, selectedAnswer];
            setQuestAnswers(newAnswers);

            if (currentQuestionIndex < activeQuest.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                // Quest completed - submit to backend
                try {
                    const identity = authService.getIdentity();
                    await canisterService.init(identity);

                    const questResult = await canisterService.submitQuestAnswers(
                        activeQuest.id,
                        newAnswers.map(BigInt)
                    );

                    if (questResult.passed) {
                        // Complete the skill to unlock dependencies and get additional XP
                        try {
                            // Find which skill tree this quest belongs to
                            // For now, we'll need to find the skill tree that contains this quest
                            const currentTrees = generatedTrees.filter(tree => 
                                tree.skills.some(skill => skill.questId === activeQuest.id)
                            );
                            
                            if (currentTrees.length > 0) {
                                const skillTree = currentTrees[0];
                                const skill = skillTree.skills.find(s => s.questId === activeQuest.id);
                                
                                if (skill) {
                                    const skillResult = await canisterService.completeSkill(skillTree.id, skill.id);
                                    
                                    if (skillResult.expGained > 0) {
                                        questResult.expGained = BigInt(Number(questResult.expGained) + Number(skillResult.expGained));
                                    }
                                    
                                    if (skillResult.levelUpResult && skillResult.levelUpResult.length > 0) {
                                        const skillLevelUp = skillResult.levelUpResult[0];
                                        if (skillLevelUp && skillLevelUp.leveledUp) {
                                            if (!questResult.levelUpResult || questResult.levelUpResult.length === 0) {
                                                questResult.levelUpResult = skillResult.levelUpResult;
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (skillError) {
                            console.error('Failed to complete skill:', skillError);
                            // Continue even if skill completion fails
                        }
                        
                        // Update skill trees with completed skill
                        await loadUserSkillTrees();
                        
                        // Refresh user profile to update XP/Level in UI
                        try {
                            await refreshUserProfile();
                        } catch (error) {
                            console.error('Failed to refresh user profile:', error);
                        }
                        
                        // Show success message with XP and level info
                        let successMessage = `🎉 Quest Completed!\nScore: ${Number(questResult.score)}/${Number(questResult.totalQuestions)}`;
                        
                        if (questResult.expGained > 0) {
                            successMessage += `\n💰 +${Number(questResult.expGained)} XP gained!`;
                        }
                        
                        if (questResult.levelUpResult && questResult.levelUpResult.length > 0) {
                            const levelUp = questResult.levelUpResult[0];
                            if (levelUp && levelUp.leveledUp) {
                                successMessage += `\n🎊 LEVEL UP! You are now level ${Number(levelUp.newLevel)}!`;
                            }
                        }
                        
                        alert(successMessage);
                    } else {
                        alert(`❌ Quest Failed\nScore: ${Number(questResult.score)}/${Number(questResult.totalQuestions)}\nTry again to earn XP!`);
                    }
                } catch (error) {
                    console.error('Failed to submit quest:', error);
                    setError('Failed to submit quest results. Please try again.');
                }
                
                setActiveQuest(null);
            }
        }, 2000);
    }, [selectedAnswer, activeQuest, questAnswers, currentQuestionIndex, loadUserSkillTrees, generatedTrees, refreshUserProfile]);

    const handleAcceptTree = useCallback(async (tree: SkillTree) => {
        try {
            const identity = authService.getIdentity();
            await canisterService.init(identity);

            const acceptedTree = await canisterService.acceptSkillTree(tree.id);
            const convertedTree = convertBackendSkillTree(acceptedTree);
            setGeneratedTrees(prev => prev.map(t => t.id === tree.id ? convertedTree : t));
            setPreviewTree(null);
        } catch (error) {
            console.error('Failed to accept skill tree:', error);
            setError('Failed to accept skill tree. Please try again.');
        }
    }, []);

    const handleDeclineTree = useCallback(async (tree: SkillTree) => {
        try {
            const identity = authService.getIdentity();
            await canisterService.init(identity);

            await canisterService.declineSkillTree(tree.id);
            setGeneratedTrees(prev => prev.filter(t => t.id !== tree.id));
            setPreviewTree(null);
        } catch (error) {
            console.error('Failed to decline skill tree:', error);
            setError('Failed to decline skill tree. Please try again.');
        }
    }, []);

    const closeQuestModal = useCallback(() => {
        setActiveQuest(null);
        setSelectedSkill(null);
    }, []);

    return (
        <div className="min-h-screen text-white">{error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200">
                    {error}
                    <button 
                        onClick={() => setError(null)}
                        className="ml-4 text-red-400 hover:text-red-200"
                    >
                        ✕
                    </button>
                </div>
            )}
            <div className="max-w-7xl mx-auto p-6 space-y-8">


                {/* Generator Input */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 md:p-8">
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., I want to become a frontend developer master"
                            className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all text-sm md:text-base"
                            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <motion.button
                            onClick={handleGenerate}
                            disabled={isGenerating || !input.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
                        >
                            {isGenerating ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm md:text-base">Generating...</span>
                                </div>
                            ) : (
                                'Generate Path'
                            )}
                        </motion.button>
                    </div>

                    {/* Quick Examples */}
                    <div className="mt-6">
                        <p className="text-sm text-slate-400 mb-3">Quick examples:</p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                "I want to be a frontend developer",
                                "I want to learn backend development",
                                "I want to master AI and machine learning",
                                "I want to build mobile apps"
                            ].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => setInput(example)}
                                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Generated Trees */}
                <AnimatePresence>
                    {generatedTrees.map((tree, index) => (
                        <motion.div
                            key={tree.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-slate-800/30 backdrop-blur-xl border rounded-2xl p-4 md:p-8 ${index === 0 ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/10' : 'border-slate-700'
                                }`}
                        >
                            {/* Tree Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
                                <div className="flex-1">
                                    <h3 className="text-xl md:text-2xl font-bold text-white flex flex-col md:flex-row md:items-center gap-2">
                                        <span>{tree.title}</span>
                                        {index === 0 && (
                                            <span className="self-start md:self-auto px-3 py-1 bg-yellow-400 text-black text-xs md:text-sm rounded-full font-medium">
                                                NEW
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-slate-400 mt-1 text-sm md:text-base">{tree.description}</p>
                                </div>

                                {tree.status === 'preview' && (
                                    <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => setPreviewTree(tree)}
                                            className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>Preview</span>
                                        </button>
                                        <button
                                            onClick={() => handleAcceptTree(tree)}
                                            className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Accept</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeclineTree(tree)}
                                            className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Decline</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Tree Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-yellow-400">{tree.skills.length}</div>
                                    <div className="text-xs md:text-sm text-slate-400">Skills</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-green-400">{tree.category}</div>
                                    <div className="text-xs md:text-sm text-slate-400">Category</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-blue-400">{tree.completedPoints}</div>
                                    <div className="text-xs md:text-sm text-slate-400">Points Earned</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-purple-400">{tree.totalPoints}</div>
                                    <div className="text-xs md:text-sm text-slate-400">Total Points</div>
                                </div>
                            </div>

                            {/* Skill Tree Grid */}
                            <SkillTreeGrid
                                tree={tree}
                                onSkillClick={handleSkillClick}
                                isPreview={false}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Modals */}
                <AnimatePresence>
                    {/* Preview Modal */}
                    {previewTree && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setPreviewTree(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white">Preview: {previewTree.title}</h3>
                                    <button
                                        onClick={() => setPreviewTree(null)}
                                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <SkillTreeGrid
                                        tree={previewTree}
                                        onSkillClick={() => { }}
                                        isPreview={true}
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setPreviewTree(null)}
                                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleAcceptTree(previewTree)}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    >
                                        Accept & Start Learning
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Skill Detail Modal */}
                    {selectedSkill && (
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 flex items-center justify-center">
                                            {React.createElement(ICON_MAP[selectedSkill.iconName], {
                                                className: "w-8 h-8 text-yellow-300"
                                            })}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{selectedSkill.name}</h3>
                                            <p className="text-slate-400">{selectedSkill.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSkill(null)}
                                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                                    <h4 className="text-lg font-semibold text-white mb-2">Ready for the challenge?</h4>
                                    <p className="text-slate-300 text-sm mb-6">
                                        Complete the quest to master this skill and unlock new abilities.
                                    </p>
                                    <button
                                        onClick={handleStartQuest}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
                                    >
                                        <span>Start Quest</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Quest Modal */}
                    {activeQuest && (
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                            >
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-2">{activeQuest.title}</h3>
                                    <div className="flex items-center justify-center space-x-2 text-slate-400">
                                        <span>Question {currentQuestionIndex + 1} of {activeQuest.questions.length}</span>
                                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
                                                style={{ width: `${((currentQuestionIndex + 1) / activeQuest.questions.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-xl font-semibold text-white mb-6">
                                        {activeQuest.questions[currentQuestionIndex].text}
                                    </h4>
                                    <div className="space-y-4">
                                        {activeQuest.questions[currentQuestionIndex].options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => !showResult && setSelectedAnswer(index)}
                                                disabled={showResult}
                                                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${showResult && index === activeQuest.questions[currentQuestionIndex].correctAnswer
                                                    ? 'border-green-500 bg-green-500/20 text-white'
                                                    : showResult && selectedAnswer === index && index !== activeQuest.questions[currentQuestionIndex].correctAnswer
                                                        ? 'border-red-500 bg-red-500/20 text-white'
                                                        : selectedAnswer === index
                                                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                                                            : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showResult && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mb-8"
                                        >
                                            <div className={`p-6 rounded-xl text-center ${selectedAnswer === activeQuest.questions[currentQuestionIndex].correctAnswer
                                                ? 'bg-green-500/20 border border-green-500/50'
                                                : 'bg-red-500/20 border border-red-500/50'
                                                }`}>
                                                <p className="font-bold text-lg text-white mb-2">
                                                    {selectedAnswer === activeQuest.questions[currentQuestionIndex].correctAnswer
                                                        ? '🎉 Correct!'
                                                        : '❌ Incorrect'
                                                    }
                                                </p>
                                                <p className="text-slate-300">
                                                    {activeQuest.questions[currentQuestionIndex].explanation}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-between">
                                    <button
                                        onClick={closeQuestModal}
                                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                                    >
                                        Cancel Quest
                                    </button>
                                    {!showResult && (
                                        <button
                                            onClick={handleAnswerSubmit}
                                            disabled={selectedAnswer === null}
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all"
                                        >
                                            Submit Answer
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AISkillTreeGenerator;