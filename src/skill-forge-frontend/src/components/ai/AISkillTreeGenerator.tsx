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
    Play,
    RotateCcw,
    Server,
    Settings,
    Shield,
    Smartphone,
    Star,
    Target,
    Terminal,
    TrendingUp,
    X,
    Zap,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    iconName: IconName; // Changed from icon component to icon name
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
const GRID_SIZE = 120;
const SKILL_SIZE = 80;

// Mobile responsive constants
const MOBILE_GRID_SIZE = 90;
const MOBILE_SKILL_SIZE = 60;

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
const gridToPixel = (gridPos: { x: number; y: number }, gridSize: number, skillSize: number) => {
    const skillOffset = (gridSize - skillSize) / 2;
    return {
        x: gridPos.x * gridSize + skillOffset,
        y: gridPos.y * gridSize + skillOffset
    };
};

// --- MEMOIZED SKILL CONNECTION COMPONENT ---
const SkillConnection = React.memo<{
    fromSkill: SkillNode;
    toSkill: SkillNode;
    isActive: boolean;
    gridSize: number;
    skillSize: number;
}>(({ fromSkill, toSkill, isActive, gridSize, skillSize }) => {
    const fromPos = gridToPixel(fromSkill.gridPosition, gridSize, skillSize);
    const toPos = gridToPixel(toSkill.gridPosition, gridSize, skillSize);

    const startX = fromPos.x + skillSize / 2;
    const startY = fromPos.y + skillSize;
    const endX = toPos.x + skillSize / 2;
    const endY = toPos.y;

    // Create smooth curved path
    const midY = startY + (endY - startY) / 2;
    const pathData = `M ${startX} ${startY} Q ${startX} ${midY} ${endX} ${endY}`;

    return (
        <path
            d={pathData}
            stroke={isActive ? '#fbbf24' : fromSkill.isCompleted ? '#10b981' : '#64748b'}
            strokeWidth={isActive ? 4 : 3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={fromSkill.isCompleted ? '0' : '8,4'}
            className={isActive ? 'animate-pulse' : ''}
            style={{
                filter: isActive ? 'drop-shadow(0 0 8px #fbbf24)' : 'none'
            }}
        />
    );
});

SkillConnection.displayName = 'SkillConnection';

// --- MEMOIZED SKILL NODE COMPONENT ---
const SkillNodeComponent = React.memo<{
    skill: SkillNode;
    pixelPos: { x: number; y: number };
    onSkillClick: (skill: SkillNode) => void;
    isPreview: boolean;
    skillSize: number;
}>(({ skill, pixelPos, onSkillClick, isPreview, skillSize }) => {
    const IconComponent = ICON_MAP[skill.iconName] || Code;

    return (
        <motion.div
            className="absolute cursor-pointer"
            style={{
                left: pixelPos.x,
                top: pixelPos.y,
                width: skillSize,
                height: skillSize
            }}
            onClick={() => !isPreview && onSkillClick(skill)}
            whileHover={{ scale: skill.isUnlocked ? 1.1 : 1 }}
            whileTap={{ scale: skill.isUnlocked ? 0.95 : 1 }}
            layout={false} // Disable layout animations to prevent flickering
        >
            {/* Skill Node Circle */}
            <div
                className={`w-full h-full rounded-full border-4 flex items-center justify-center relative transition-all duration-300 ${skill.isCompleted
                    ? 'bg-gradient-to-br from-green-500/30 to-green-600/30 border-green-400 shadow-lg shadow-green-400/30'
                    : skill.isUnlocked
                        ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400 shadow-lg shadow-yellow-400/40'
                        : 'bg-gradient-to-br from-slate-700/60 to-slate-800/60 border-slate-600'
                    }`}
                style={{
                    boxShadow: skill.isUnlocked && !skill.isCompleted
                        ? '0 0 20px rgba(251, 191, 36, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                        : skill.isCompleted
                            ? '0 0 15px rgba(34, 197, 94, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                            : 'inset 0 2px 4px rgba(255, 255, 255, 0.05)'
                }}
            >
                {/* Icon */}
                <IconComponent
                    className={`${skillSize >= SKILL_SIZE ? 'w-10 h-10' : 'w-8 h-8'} ${skill.isCompleted ? 'text-green-300' :
                        skill.isUnlocked ? 'text-yellow-300' :
                            'text-slate-500'
                        }`}
                />

                {/* Status Indicator */}
                <div className={`absolute -top-1 -right-1 ${skillSize >= SKILL_SIZE ? 'w-6 h-6' : 'w-5 h-5'} rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center`}>
                    {skill.isCompleted ? (
                        <CheckCircle className={`${skillSize >= SKILL_SIZE ? 'w-4 h-4' : 'w-3 h-3'} text-green-400`} />
                    ) : skill.isUnlocked ? (
                        <Play className={`${skillSize >= SKILL_SIZE ? 'w-3 h-3' : 'w-2 h-2'} text-yellow-400`} />
                    ) : (
                        <Lock className={`${skillSize >= SKILL_SIZE ? 'w-3 h-3' : 'w-2 h-2'} text-slate-500`} />
                    )}
                </div>

                {/* Points Indicator */}
                <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 bg-slate-800/90 border border-slate-600 rounded-full ${skillSize >= SKILL_SIZE ? 'text-xs' : 'text-[10px]'} font-bold text-white backdrop-blur-sm`}>
                    {skill.currentPoints}/{skill.maxPoints}
                </div>

                {/* Pulsing Effect for Available Skills */}
                {skill.isUnlocked && !skill.isCompleted && (
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping opacity-30" />
                )}
            </div>

            {/* Skill Name Tooltip */}
            <div className={`absolute ${skillSize >= SKILL_SIZE ? '-bottom-8' : '-bottom-6'} left-1/2 transform -translate-x-1/2 bg-slate-800/90 text-white ${skillSize >= SKILL_SIZE ? 'text-xs' : 'text-[10px]'} px-2 py-1 rounded backdrop-blur-sm border border-slate-600 opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none`}>
                {skill.name}
            </div>
        </motion.div>
    );
});

SkillNodeComponent.displayName = 'SkillNodeComponent';

// --- OPTIMIZED SKILL TREE CANVAS ---
const SkillTreeCanvas: React.FC<SkillTreeCanvasProps> = ({
    tree,
    onSkillClick,
    isDraggable = true,
    isPreview = false,
    gridSize = GRID_SIZE,
    skillSize = SKILL_SIZE
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(0.8);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Mobile detection
    const isMobile = useIsMobile();

    // Touch gesture state
    const [lastTouchDistance, setLastTouchDistance] = useState(0);
    const [touchStartTime, setTouchStartTime] = useState(0);
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

    // Touch gesture handlers
    const getTouchDistance = useCallback((touch1: React.Touch, touch2: React.Touch) => {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }, []);

    const handleZoom = useCallback((delta: number) => {
        setZoom(prev => Math.max(0.4, Math.min(1.5, prev + delta)));
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!isDraggable) return;

        setTouchStartTime(Date.now());

        if (e.touches.length === 1) {
            // Single touch - start dragging
            const touch = e.touches[0];
            setTouchStart({ x: touch.clientX, y: touch.clientY });
            setIsDragging(true);
        } else if (e.touches.length === 2) {
            // Two finger touch - start zooming
            const distance = getTouchDistance(e.touches[0], e.touches[1]);
            setLastTouchDistance(distance);
        }
    }, [isDraggable, getTouchDistance]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling

        if (e.touches.length === 1 && isDragging) {
            // Single touch - dragging
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStart.x;
            const deltaY = touch.clientY - touchStart.y;

            setDragOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));
            setTouchStart({ x: touch.clientX, y: touch.clientY });
        } else if (e.touches.length === 2) {
            // Two finger touch - zooming
            const distance = getTouchDistance(e.touches[0], e.touches[1]);
            if (lastTouchDistance > 0) {
                const scale = distance / lastTouchDistance;
                handleZoom((scale - 1) * 0.5);
            }
            setLastTouchDistance(distance);
        }
    }, [isDragging, touchStart, lastTouchDistance, getTouchDistance, handleZoom]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const touchDuration = Date.now() - touchStartTime;

        if (e.touches.length === 0) {
            setIsDragging(false);
            setLastTouchDistance(0);

            // Double tap to reset view
            if (touchDuration < 300 && e.changedTouches.length === 1) {
                // Check for double tap here if needed
                setTimeout(() => {
                    // If no second tap within 300ms, ignore
                }, 300);
            }
        }
    }, [touchStartTime]);

    // Memoize tree bounds calculation
    const bounds = useMemo(() => {
        if (!tree.skills.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

        const positions = tree.skills.map(s => s.gridPosition);
        return {
            minX: Math.min(...positions.map(p => p.x)),
            maxX: Math.max(...positions.map(p => p.x)),
            minY: Math.min(...positions.map(p => p.y)),
            maxY: Math.max(...positions.map(p => p.y))
        };
    }, [tree.skills]);

    const treeWidth = (bounds.maxX - bounds.minX + 1) * gridSize;
    const treeHeight = (bounds.maxY - bounds.minY + 1) * gridSize;

    // Memoize connections
    const connections = useMemo(() =>
        tree.skills.flatMap(skill =>
            skill.dependencies.map(depId => ({
                from: depId,
                to: skill.id
            }))
        ), [tree.skills]);

    // Center the tree initially - menggunakan ukuran canvas yang dinamis
    const initialOffset = useMemo(() => {
        if (!canvasRef.current) {
            return { x: 0, y: 0 };
        }

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const canvasWidth = canvasRect.width || (isMobile ? 350 : 600); // fallback values
        const canvasHeight = canvasRect.height || (isMobile ? 400 : 500);

        const firstUnlockedSkill = tree.skills.find(s => s.isUnlocked);
        if (firstUnlockedSkill) {
            const firstSkillPixel = gridToPixel(firstUnlockedSkill.gridPosition, gridSize, skillSize);
            return {
                x: (canvasWidth / 2) - (firstSkillPixel.x * zoom) - (skillSize * zoom / 2),
                y: (canvasHeight / 2) - (firstSkillPixel.y * zoom) - (skillSize * zoom / 2)
            };
        }

        // Fallback: center berdasarkan tree bounds
        const treeCenterX = (bounds.minX + bounds.maxX) / 2 * gridSize;
        const treeCenterY = (bounds.minY + bounds.maxY) / 2 * gridSize;

        return {
            x: (canvasWidth / 2) - (treeCenterX * zoom),
            y: (canvasHeight / 2) - (treeCenterY * zoom)
        };
    }, [tree.skills, zoom, gridSize, skillSize, bounds, isMobile]);

    const totalOffset = {
        x: initialOffset.x + dragOffset.x,
        y: initialOffset.y + dragOffset.y
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isDraggable) return;
        setIsDragging(true);
        const startX = e.clientX - dragOffset.x;
        const startY = e.clientY - dragOffset.y;

        const handleMouseMove = (e: MouseEvent) => {
            setDragOffset({
                x: e.clientX - startX,
                y: e.clientY - startY
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [isDraggable, dragOffset]);

    const resetView = useCallback(() => {
        const targetZoom = 0.8;
        setZoom(targetZoom);

        // Reset ke posisi tengah berdasarkan skill tree yang sebenarnya
        const firstUnlockedSkill = tree.skills.find(s => s.isUnlocked);
        if (firstUnlockedSkill && canvasRef.current) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const canvasWidth = canvasRect.width;
            const canvasHeight = canvasRect.height;

            const firstSkillPixel = gridToPixel(firstUnlockedSkill.gridPosition, gridSize, skillSize);

            // Hitung offset untuk menempatkan skill pertama di tengah canvas
            const centeredX = (canvasWidth / 2) - (firstSkillPixel.x * targetZoom) - (skillSize * targetZoom / 2);
            const centeredY = (canvasHeight / 2) - (firstSkillPixel.y * targetZoom) - (skillSize * targetZoom / 2);

            setDragOffset({ x: centeredX, y: centeredY });
        } else {
            // Fallback: center berdasarkan tree bounds
            const treeCenterX = (bounds.minX + bounds.maxX) / 2 * gridSize;
            const treeCenterY = (bounds.minY + bounds.maxY) / 2 * gridSize;

            if (canvasRef.current) {
                const canvasRect = canvasRef.current.getBoundingClientRect();
                const canvasWidth = canvasRect.width;
                const canvasHeight = canvasRect.height;

                const centeredX = (canvasWidth / 2) - (treeCenterX * targetZoom);
                const centeredY = (canvasHeight / 2) - (treeCenterY * targetZoom);

                setDragOffset({ x: centeredX, y: centeredY });
            } else {
                setDragOffset({ x: 0, y: 0 });
            }
        }
    }, [tree.skills, canvasRef, gridSize, skillSize, bounds]);

    // Auto-center skill tree ketika component di-mount atau tree berubah
    useEffect(() => {
        // Delay sedikit untuk memastikan canvas sudah ter-render
        const timer = setTimeout(() => {
            if (canvasRef.current && tree.skills.length > 0) {
                resetView();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [tree.id, tree.skills.length, resetView]); // Trigger ketika tree berubah

    // Handle window resize untuk re-center skill tree
    useEffect(() => {
        const handleResize = () => {
            // Delay untuk memastikan canvas sudah resize
            const timer = setTimeout(() => {
                if (canvasRef.current && tree.skills.length > 0) {
                    resetView();
                }
            }, 150);
            return () => clearTimeout(timer);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [resetView, tree.skills.length]);

    // Memoize pixel positions
    const skillPositions = useMemo(() =>
        tree.skills.map(skill => ({
            skill,
            pixelPos: gridToPixel(skill.gridPosition, gridSize, skillSize)
        })), [tree.skills, gridSize, skillSize]);

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden"
            style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                 radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
            }}
        >
            {/* Grid Background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='${GRID_SIZE}' height='${GRID_SIZE}' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='${GRID_SIZE}' height='${GRID_SIZE}' patternUnits='userSpaceOnUse'%3e%3cpath d='M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}' fill='none' stroke='%23475569' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e")`,
                    backgroundPosition: `${totalOffset.x}px ${totalOffset.y}px`,
                    transform: `scale(${zoom})`
                }}
            />

            {/* Controls */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 flex space-x-1 md:space-x-2">
                <button
                    onClick={() => handleZoom(0.1)}
                    className="p-1.5 md:p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-lg border border-slate-600 text-white transition-all backdrop-blur-sm"
                >
                    <ZoomIn className="w-3 h-3 md:w-4 md:h-4" />
                </button>
                <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-1.5 md:p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-lg border border-slate-600 text-white transition-all backdrop-blur-sm"
                >
                    <ZoomOut className="w-3 h-3 md:w-4 md:h-4" />
                </button>
                <button
                    onClick={resetView}
                    className="p-1.5 md:p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-lg border border-slate-600 text-white transition-all backdrop-blur-sm"
                >
                    <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                </button>
            </div>

            {/* Canvas Content */}
            <div
                className={`relative w-full h-full ${isDraggable ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }} // Prevent default touch behaviors
            >
                <div
                    style={{
                        transform: `translate(${totalOffset.x}px, ${totalOffset.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out', // Reduced transition time
                        willChange: 'transform' // Optimize for transforms
                    }}
                >
                    {/* Connections SVG */}
                    <svg
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            width: treeWidth + 200,
                            height: treeHeight + 200,
                            transform: 'translateZ(0)' // Force hardware acceleration
                        }}
                    >
                        {connections.map(connection => {
                            const fromSkill = tree.skills.find(s => s.id === connection.from);
                            const toSkill = tree.skills.find(s => s.id === connection.to);

                            if (!fromSkill || !toSkill) return null;

                            const isActive = toSkill.isUnlocked && !toSkill.isCompleted;

                            return (
                                <SkillConnection
                                    key={`${connection.from}-${connection.to}`}
                                    fromSkill={fromSkill}
                                    toSkill={toSkill}
                                    isActive={isActive}
                                    gridSize={gridSize}
                                    skillSize={skillSize}
                                />
                            );
                        })}
                    </svg>

                    {/* Skill Nodes */}
                    <div style={{ transform: 'translateZ(0)' }}> {/* Force hardware acceleration */}
                        {skillPositions.map(({ skill, pixelPos }) => (
                            <SkillNodeComponent
                                key={skill.id}
                                skill={skill}
                                pixelPos={pixelPos}
                                onSkillClick={onSkillClick}
                                isPreview={isPreview}
                                skillSize={skillSize}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress Stats */}
            <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 md:px-4 md:py-3 border border-slate-600">
                <div className="text-xs md:text-sm font-semibold text-slate-200 mb-1 md:mb-2">
                    Progress: {tree.completedPoints} / {tree.totalPoints} pts
                </div>
                <div className="w-32 md:w-48 h-2 md:h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(100, (tree.completedPoints / tree.totalPoints) * 100)}%` }}
                    />
                </div>
                <div className="text-xs text-slate-400 mt-1">
                    {Math.round((tree.completedPoints / tree.totalPoints) * 100)}% Complete
                </div>
            </div>

            {/* Mobile Instructions */}
            {isMobile && (
                <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-600">
                    <div className="text-xs text-slate-300 space-y-1">
                        <div>🤏 Pinch to zoom</div>
                        <div>👆 Drag to pan</div>
                        <div>🎯 Tap skills to play</div>
                    </div>
                </div>
            )}

            {/* Desktop Instructions */}
            {!isMobile && !isPreview && (
                <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-600">
                    <div className="text-xs text-slate-300 space-y-1">
                        <div>🖱️ Drag to pan</div>
                        <div>🔍 Use controls to zoom</div>
                        <div>🎯 Click skills to play</div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
const AISkillTreeGenerator: React.FC = () => {
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTrees, setGeneratedTrees] = useState<SkillTree[]>([]);
    const [previewTree, setPreviewTree] = useState<SkillTree | null>(null);

    // Quest system state
    const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questAnswers, setQuestAnswers] = useState<number[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Mobile support
    const isMobile = useIsMobile();
    const currentGridSize = isMobile ? MOBILE_GRID_SIZE : GRID_SIZE;
    const currentSkillSize = isMobile ? MOBILE_SKILL_SIZE : SKILL_SIZE;

    // Mock quests
    const mockQuests: Quest[] = useMemo(() => [
        {
            id: 'html-quest',
            title: 'HTML5 Mastery Challenge',
            description: 'Prove your HTML5 knowledge',
            questions: [
                {
                    id: 'q1',
                    text: 'What does HTML stand for?',
                    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'],
                    correctAnswer: 0,
                    explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages.'
                },
                {
                    id: 'q2',
                    text: 'Which HTML5 element is used for the main content?',
                    options: ['<main>', '<content>', '<primary>'],
                    correctAnswer: 0,
                    explanation: 'The <main> element represents the main content of the document body.'
                }
            ],
            points: 100,
            passingThreshold: 0.7
        }
    ], []);

    // Dynamic icon selection based on skill type
    const getIconForSkill = (skillName: string, category: string): IconName => {
        const name = skillName.toLowerCase();
        const cat = category.toLowerCase();

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

        // Category-based defaults
        if (cat.includes('frontend')) return 'monitor';
        if (cat.includes('backend')) return 'server';
        if (cat.includes('mobile')) return 'smartphone';
        if (cat.includes('ai')) return 'brain';

        return 'code'; // Default fallback
    };

    const generateMockSkillTree = useCallback((prompt: string): SkillTree => {
        const templates: { [key: string]: Omit<SkillNode, 'iconName'>[] } = {
            frontend: [
                {
                    id: 'html5',
                    name: 'HTML5',
                    description: 'Master semantic HTML5 structure',
                    gridPosition: { x: 2, y: 0 },
                    dependencies: [],
                    questId: 'html-quest',
                    isUnlocked: true,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'css3',
                    name: 'CSS3',
                    description: 'Style with modern CSS3',
                    gridPosition: { x: 1, y: 1 },
                    dependencies: ['html5'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'javascript',
                    name: 'JavaScript',
                    description: 'Interactive web programming',
                    gridPosition: { x: 3, y: 1 },
                    dependencies: ['html5'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'typescript',
                    name: 'TypeScript',
                    description: 'Typed JavaScript development',
                    gridPosition: { x: 4, y: 1 },
                    dependencies: ['javascript'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'react',
                    name: 'React',
                    description: 'Component-based UI library',
                    gridPosition: { x: 2, y: 2 },
                    dependencies: ['css3', 'javascript'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'nextjs',
                    name: 'Next.js',
                    description: 'Full-stack React framework',
                    gridPosition: { x: 2, y: 3 },
                    dependencies: ['react'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'testing',
                    name: 'Testing',
                    description: 'Unit and integration testing',
                    gridPosition: { x: 1, y: 3 },
                    dependencies: ['react'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'deployment',
                    name: 'Deployment',
                    description: 'Deploy applications to production',
                    gridPosition: { x: 3, y: 3 },
                    dependencies: ['react'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                }
            ],
            backend: [
                {
                    id: 'nodejs',
                    name: 'Node.js',
                    description: 'Server-side JavaScript runtime',
                    gridPosition: { x: 2, y: 0 },
                    dependencies: [],
                    questId: 'html-quest',
                    isUnlocked: true,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'express',
                    name: 'Express.js',
                    description: 'Web framework for Node.js',
                    gridPosition: { x: 2, y: 1 },
                    dependencies: ['nodejs'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'database',
                    name: 'Database',
                    description: 'Data persistence layer',
                    gridPosition: { x: 1, y: 2 },
                    dependencies: ['express'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'api-design',
                    name: 'API Design',
                    description: 'RESTful API development',
                    gridPosition: { x: 3, y: 2 },
                    dependencies: ['express'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'authentication',
                    name: 'Authentication',
                    description: 'Security and user management',
                    gridPosition: { x: 2, y: 3 },
                    dependencies: ['database', 'api-design'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'cloud-deployment',
                    name: 'Cloud Deployment',
                    description: 'Deploy to cloud platforms',
                    gridPosition: { x: 2, y: 4 },
                    dependencies: ['authentication'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                }
            ],
            ai: [
                {
                    id: 'python',
                    name: 'Python',
                    description: 'Programming language for AI/ML',
                    gridPosition: { x: 2, y: 0 },
                    dependencies: [],
                    questId: 'html-quest',
                    isUnlocked: true,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'numpy',
                    name: 'NumPy',
                    description: 'Numerical computing library',
                    gridPosition: { x: 1, y: 1 },
                    dependencies: ['python'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'pandas',
                    name: 'Pandas',
                    description: 'Data manipulation and analysis',
                    gridPosition: { x: 3, y: 1 },
                    dependencies: ['python'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'machine-learning',
                    name: 'Machine Learning',
                    description: 'ML algorithms and models',
                    gridPosition: { x: 2, y: 2 },
                    dependencies: ['numpy', 'pandas'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'deep-learning',
                    name: 'Deep Learning',
                    description: 'Neural networks and deep learning',
                    gridPosition: { x: 1, y: 3 },
                    dependencies: ['machine-learning'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'nlp',
                    name: 'Natural Language Processing',
                    description: 'Process and understand human language',
                    gridPosition: { x: 3, y: 3 },
                    dependencies: ['machine-learning'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                }
            ],
            mobile: [
                {
                    id: 'mobile-basics',
                    name: 'Mobile Development Basics',
                    description: 'Mobile development fundamentals',
                    gridPosition: { x: 2, y: 0 },
                    dependencies: [],
                    questId: 'html-quest',
                    isUnlocked: true,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'react-native',
                    name: 'React Native',
                    description: 'Cross-platform mobile development',
                    gridPosition: { x: 1, y: 1 },
                    dependencies: ['mobile-basics'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'flutter',
                    name: 'Flutter',
                    description: 'Google\'s UI toolkit for mobile',
                    gridPosition: { x: 3, y: 1 },
                    dependencies: ['mobile-basics'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'mobile-ui',
                    name: 'Mobile UI/UX',
                    description: 'Mobile user interface design',
                    gridPosition: { x: 2, y: 2 },
                    dependencies: ['react-native', 'flutter'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                },
                {
                    id: 'app-store',
                    name: 'App Store Publishing',
                    description: 'Publish apps to app stores',
                    gridPosition: { x: 2, y: 3 },
                    dependencies: ['mobile-ui'],
                    questId: 'html-quest',
                    isUnlocked: false,
                    isCompleted: false,
                    maxPoints: 100,
                    currentPoints: 0
                }
            ]
        };

        const detectCategory = (input: string): string => {
            const lower = input.toLowerCase();
            if (lower.includes('frontend') || lower.includes('web') || lower.includes('ui')) return 'frontend';
            if (lower.includes('backend') || lower.includes('server') || lower.includes('api')) return 'backend';
            if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) return 'ai';
            if (lower.includes('mobile') || lower.includes('app')) return 'mobile';
            return 'frontend';
        };

        const category = detectCategory(prompt);
        const skillsTemplate = templates[category] || templates.frontend;

        // Add dynamic icons
        const skills: SkillNode[] = skillsTemplate.map(skill => ({
            ...skill,
            iconName: getIconForSkill(skill.name, category)
        }));

        const totalPoints = skills.reduce((sum, skill) => sum + skill.maxPoints, 0);

        const titles: { [key: string]: string } = {
            frontend: 'Frontend Developer Mastery',
            backend: 'Backend Engineer Path',
            ai: 'AI/ML Engineer Journey',
            mobile: 'Mobile Developer Track'
        };

        return {
            id: `tree_${Date.now()}`,
            title: titles[category] || 'Custom Learning Path',
            description: `Master ${category} development with this comprehensive skill tree`,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            skills,
            completedPoints: 0,
            totalPoints,
            status: 'preview'
        };
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!input.trim()) return;
        setIsGenerating(true);

        // Simulate AI generation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newTree = generateMockSkillTree(input);
        setGeneratedTrees(prev => [newTree, ...prev]);
        setInput('');
        setIsGenerating(false);
    }, [input, generateMockSkillTree]);

    const handleSkillClick = useCallback((skill: SkillNode) => {
        if (skill.isUnlocked && !skill.isCompleted) {
            setSelectedSkill(skill);
        }
    }, []);

    const handleStartQuest = useCallback(() => {
        if (!selectedSkill) return;
        const quest = mockQuests.find(q => q.id === selectedSkill.questId);
        if (quest) {
            setActiveQuest(quest);
            setCurrentQuestionIndex(0);
            setQuestAnswers([]);
            setSelectedAnswer(null);
            setShowResult(false);
            setSelectedSkill(null);
        }
    }, [selectedSkill, mockQuests]);

    const handleAnswerSubmit = useCallback(() => {
        if (selectedAnswer === null || !activeQuest) return;
        setShowResult(true);

        setTimeout(() => {
            const newAnswers = [...questAnswers, selectedAnswer];
            setQuestAnswers(newAnswers);

            if (currentQuestionIndex < activeQuest.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                // Quest completed - check if passed
                const correctAnswers = activeQuest.questions.reduce((count, q, index) => {
                    return newAnswers[index] === q.correctAnswer ? count + 1 : count;
                }, 0);

                const score = correctAnswers / activeQuest.questions.length;

                if (score >= activeQuest.passingThreshold) {
                    // Update skill tree
                    setGeneratedTrees(prevTrees => prevTrees.map(tree => {
                        const updatedSkills = tree.skills.map(s => {
                            if (s.id === selectedSkill?.id) {
                                return { ...s, isCompleted: true, currentPoints: s.maxPoints };
                            }
                            return s;
                        });

                        // Unlock dependent skills
                        const completedSkillIds = new Set(updatedSkills.filter(s => s.isCompleted).map(s => s.id));
                        const finalSkills = updatedSkills.map(s => {
                            if (!s.isCompleted && s.dependencies.length > 0) {
                                const allDepsMet = s.dependencies.every(depId => completedSkillIds.has(depId));
                                if (allDepsMet) {
                                    return { ...s, isUnlocked: true };
                                }
                            }
                            return s;
                        });

                        return {
                            ...tree,
                            skills: finalSkills,
                            completedPoints: tree.completedPoints + activeQuest.points
                        };
                    }));
                }
                setActiveQuest(null);
            }
        }, 2000);
    }, [selectedAnswer, activeQuest, questAnswers, currentQuestionIndex, selectedSkill]);

    const handleAcceptTree = useCallback((tree: SkillTree) => {
        const acceptedTree = { ...tree, status: 'accepted' as const };
        setGeneratedTrees(prev => prev.map(t => t.id === tree.id ? acceptedTree : t));

        // Save to localStorage
        const savedTrees = JSON.parse(localStorage.getItem('acceptedSkillTrees') || '[]');
        savedTrees.push(acceptedTree);
        localStorage.setItem('acceptedSkillTrees', JSON.stringify(savedTrees));

        setPreviewTree(null);
    }, []);

    const handleDeclineTree = useCallback((tree: SkillTree) => {
        setGeneratedTrees(prev => prev.filter(t => t.id !== tree.id));
        setPreviewTree(null);
    }, []);

    const closeQuestModal = useCallback(() => {
        setActiveQuest(null);
        setSelectedSkill(null);
    }, []);

    return (
        <div className="min-h-screen text-white">
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

                            {/* Skill Tree Canvas */}
                            <SkillTreeCanvas
                                tree={tree}
                                onSkillClick={handleSkillClick}
                                isDraggable={true}
                                isPreview={false}
                                gridSize={currentGridSize}
                                skillSize={currentSkillSize}
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
                                    <SkillTreeCanvas
                                        tree={previewTree}
                                        onSkillClick={() => { }}
                                        isDraggable={true}
                                        isPreview={true}
                                        gridSize={currentGridSize}
                                        skillSize={currentSkillSize}
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
                                    <p className="text-slate-400 text-sm mb-6">
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