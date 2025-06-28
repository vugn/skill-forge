import { AnimatePresence, motion } from 'framer-motion';
import {
    Brain,
    Cloud,
    Code2,
    Cpu,
    Crown,
    Database,
    Globe,
    Hand,
    Palette,
    Rocket,
    RotateCcw,
    Server,
    Settings,
    Shield,
    Star,
    Target,
    Trophy,
    Zap,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SkillNode {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    status: 'locked' | 'available' | 'in-progress' | 'completed';
    level: number;
    xp: number;
    prerequisites: string[];
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'advanced';
    color: string;
}

interface CalculatedNode extends SkillNode {
    position: { x: number; y: number };
    tier: number;
}

interface Connection {
    from: CalculatedNode;
    to: CalculatedNode;
    status: 'locked' | 'available' | 'completed';
    id: string;
    fromId: string;
    toId: string;
}

const SkillCardCanvas: React.FC = () => {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [transform, setTransform] = useState({
        x: 0,
        y: 0,
        scale: 1
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTransform, setLastTransform] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Raw skill data - this would come from backend
    const rawSkillNodes = useMemo<SkillNode[]>(() => [
        // Tier 1 - Foundation (no prerequisites)
        {
            id: 'html-basics',
            title: 'HTML Basics',
            description: 'Learn the foundation of web structure and semantic markup',
            icon: Code2,
            status: 'completed',
            level: 5,
            xp: 250,
            prerequisites: [],
            category: 'frontend',
            color: 'from-orange-400 to-orange-500'
        },
        {
            id: 'css-fundamentals',
            title: 'CSS Fundamentals',
            description: 'Master styling, layouts, and responsive design',
            icon: Palette,
            status: 'completed',
            level: 4,
            xp: 200,
            prerequisites: ['html-basics'],
            category: 'frontend',
            color: 'from-blue-400 to-blue-500'
        },
        {
            id: 'javascript-core',
            title: 'JavaScript Core',
            description: 'Programming fundamentals and ES6+ features',
            icon: Zap,
            status: 'completed',
            level: 6,
            xp: 300,
            prerequisites: ['html-basics'],
            category: 'frontend',
            color: 'from-yellow-400 to-yellow-500'
        },

        // Tier 2 - Framework & Tools
        {
            id: 'react-basics',
            title: 'React Basics',
            description: 'Component-based UI development with hooks',
            icon: Crown,
            status: 'in-progress',
            level: 2,
            xp: 120,
            prerequisites: ['javascript-core', 'css-fundamentals'],
            category: 'frontend',
            color: 'from-cyan-400 to-cyan-500'
        },
        {
            id: 'vue-basics',
            title: 'Vue.js Basics',
            description: 'Progressive framework for building user interfaces',
            icon: Star,
            status: 'available',
            level: 0,
            xp: 0,
            prerequisites: ['javascript-core', 'css-fundamentals'],
            category: 'frontend',
            color: 'from-green-400 to-green-500'
        },
        {
            id: 'nodejs-basics',
            title: 'Node.js Basics',
            description: 'Server-side JavaScript runtime environment',
            icon: Server,
            status: 'available',
            level: 0,
            xp: 0,
            prerequisites: ['javascript-core'],
            category: 'backend',
            color: 'from-green-600 to-green-700'
        },
        {
            id: 'typescript',
            title: 'TypeScript',
            description: 'Static typing for JavaScript applications',
            icon: Cpu,
            status: 'available',
            level: 0,
            xp: 0,
            prerequisites: ['javascript-core'],
            category: 'frontend',
            color: 'from-blue-600 to-indigo-600'
        },

        // Tier 3 - Advanced
        {
            id: 'react-advanced',
            title: 'Advanced React',
            description: 'Context API, Performance optimization, Testing',
            icon: Rocket,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['react-basics'],
            category: 'frontend',
            color: 'from-cyan-500 to-blue-600'
        },
        {
            id: 'state-management',
            title: 'State Management',
            description: 'Redux, Zustand, Context patterns',
            icon: Settings,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['react-basics',],
            category: 'frontend',
            color: 'from-purple-400 to-purple-500'
        },
        {
            id: 'express-framework',
            title: 'Express.js',
            description: 'Fast, unopinionated web framework for Node.js',
            icon: Globe,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['nodejs-basics'],
            category: 'backend',
            color: 'from-gray-600 to-gray-700'
        },
        {
            id: 'database-basics',
            title: 'Database Design',
            description: 'SQL, NoSQL, and database optimization',
            icon: Database,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['nodejs-basics'],
            category: 'database',
            color: 'from-indigo-400 to-indigo-500'
        },
        {
            id: 'api-development',
            title: 'API Development',
            description: 'RESTful APIs, GraphQL, and microservices',
            icon: Target,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['express-framework', 'database-basics'],
            category: 'backend',
            color: 'from-emerald-400 to-emerald-500'
        },

        // Tier 4 - Specialization
        {
            id: 'fullstack-projects',
            title: 'Full-Stack Projects',
            description: 'End-to-end web application development',
            icon: Trophy,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['react-advanced', 'api-development'],
            category: 'advanced',
            color: 'from-gold to-yellow-400'
        },
        {
            id: 'devops-basics',
            title: 'DevOps & Deployment',
            description: 'CI/CD, Docker, AWS, and cloud deployment',
            icon: Cloud,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['express-framework', 'database-basics'],
            category: 'devops',
            color: 'from-blue-600 to-indigo-600'
        },

        // Tier 5 - Mastery
        {
            id: 'system-architecture',
            title: 'System Architecture',
            description: 'Scalable system design and architectural patterns',
            icon: Brain,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['fullstack-projects', 'devops-basics'],
            category: 'advanced',
            color: 'from-purple-600 to-pink-600'
        },
        {
            id: 'security-expert',
            title: 'Security Expert',
            description: 'Application security and penetration testing',
            icon: Shield,
            status: 'locked',
            level: 0,
            xp: 0,
            prerequisites: ['fullstack-projects'],
            category: 'advanced',
            color: 'from-red-500 to-red-600'
        }
    ], []);

    // FIXED: Better positioning calculation for 4-node tiers
    const calculatedNodes: CalculatedNode[] = useMemo(() => {
        // Step 1: Calculate tiers based on dependency depth
        const tierMap = new Map<string, number>();

        const calculateTier = (nodeId: string): number => {
            if (tierMap.has(nodeId)) {
                return tierMap.get(nodeId)!;
            }

            const node = rawSkillNodes.find(n => n.id === nodeId);
            if (!node) return 0;

            if (node.prerequisites.length === 0) {
                tierMap.set(nodeId, 1);
                return 1;
            }

            const maxPrereqTier = Math.max(...node.prerequisites.map(prereqId => calculateTier(prereqId)));
            const tier = maxPrereqTier + 1;
            tierMap.set(nodeId, tier);
            return tier;
        };

        // Calculate all tiers
        rawSkillNodes.forEach(node => calculateTier(node.id));

        // Step 2: Group nodes by tier
        const tierGroups = new Map<number, SkillNode[]>();
        rawSkillNodes.forEach(node => {
            const tier = tierMap.get(node.id)!;
            if (!tierGroups.has(tier)) {
                tierGroups.set(tier, []);
            }
            tierGroups.get(tier)!.push(node);
        });

        // Step 3: IMPROVED positioning calculation
        const baseNodeSpacing = isMobile ? 140 : 200; // Increased spacing
        const tierSpacing = isMobile ? 160 : 220;     // Increased tier spacing
        const canvasWidth = 1000;  // Wider canvas
        const startY = 120;

        const positioned: CalculatedNode[] = [];

        Array.from(tierGroups.entries())
            .sort(([a], [b]) => a - b)
            .forEach(([tier, nodes]) => {
                const y = startY + (tier - 1) * tierSpacing;

                // FIXED: Better spacing calculation for different node counts
                let nodeSpacing: number;
                let startX: number;

                if (nodes.length === 1) {
                    startX = canvasWidth / 2;
                    nodeSpacing = 0;
                } else if (nodes.length === 2) {
                    nodeSpacing = baseNodeSpacing * 1.2;
                    startX = (canvasWidth - nodeSpacing) / 2;
                } else if (nodes.length === 3) {
                    nodeSpacing = baseNodeSpacing * 1.1;
                    startX = (canvasWidth - (nodeSpacing * 2)) / 2;
                } else if (nodes.length === 4) {
                    // SPECIAL HANDLING for 4 nodes to prevent overlap
                    nodeSpacing = baseNodeSpacing * 0.9;
                    startX = (canvasWidth - (nodeSpacing * 3)) / 2;
                } else if (nodes.length === 5) {
                    nodeSpacing = baseNodeSpacing * 0.8;
                    startX = (canvasWidth - (nodeSpacing * 4)) / 2;
                } else {
                    // For more than 5 nodes
                    nodeSpacing = baseNodeSpacing * 0.7;
                    startX = (canvasWidth - (nodeSpacing * (nodes.length - 1))) / 2;
                }

                nodes.forEach((node, index) => {
                    const x = nodes.length === 1 ? startX : startX + index * nodeSpacing;

                    positioned.push({
                        ...node,
                        position: { x, y },
                        tier
                    });
                });
            });

        return positioned;
    }, [rawSkillNodes, isMobile]);

    // Fixed drag handlers
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        // Only start dragging if clicked on canvas or draggable area
        const target = e.target as HTMLElement;
        const isNodeClick = target.closest('[data-node]');
        const isControlClick = target.closest('[data-control]');

        if (isNodeClick || isControlClick) {
            return; // Don't start dragging on node or control clicks
        }

        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setLastTransform({ x: transform.x, y: transform.y });
        e.preventDefault();
    }, [transform]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const newX = lastTransform.x + deltaX;
        const newY = lastTransform.y + deltaY;

        // Add constraints
        const maxX = 300;
        const minX = -500;
        const maxY = 150;
        const minY = -400;

        setTransform(prev => ({
            ...prev,
            x: Math.max(minX, Math.min(maxX, newX)),
            y: Math.max(minY, Math.min(maxY, newY))
        }));
    }, [isDragging, dragStart, lastTransform]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Global drag handlers for outside canvas dragging
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMove = (e: PointerEvent) => {
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;

            const newX = lastTransform.x + deltaX;
            const newY = lastTransform.y + deltaY;

            const maxX = 300;
            const minX = -500;
            const maxY = 150;
            const minY = -400;

            setTransform(prev => ({
                ...prev,
                x: Math.max(minX, Math.min(maxX, newX)),
                y: Math.max(minY, Math.min(maxY, newY))
            }));
        };

        const handleGlobalUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('pointermove', handleGlobalMove);
        document.addEventListener('pointerup', handleGlobalUp);
        document.addEventListener('pointercancel', handleGlobalUp);

        return () => {
            document.removeEventListener('pointermove', handleGlobalMove);
            document.removeEventListener('pointerup', handleGlobalUp);
            document.removeEventListener('pointercancel', handleGlobalUp);
        };
    }, [isDragging, dragStart, lastTransform]);

    // FIXED: Wheel zoom to prevent page scroll completely
    useEffect(() => {
        const handleWheelGlobal = (e: WheelEvent) => {
            // Check if the wheel event is happening inside our canvas
            if (containerRef.current && containerRef.current.contains(e.target as Node)) {
                e.preventDefault();
                e.stopPropagation();

                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                setTransform(prev => {
                    const newScale = Math.max(0.5, Math.min(2, prev.scale * delta));
                    return { ...prev, scale: newScale };
                });
            }
        };

        // Use passive: false to allow preventDefault
        document.addEventListener('wheel', handleWheelGlobal, { passive: false });

        return () => {
            document.removeEventListener('wheel', handleWheelGlobal);
        };
    }, []);

    // Handle zoom
    const handleZoom = useCallback((delta: number) => {
        setTransform(prev => {
            const newScale = Math.max(0.5, Math.min(2, prev.scale * delta));
            return { ...prev, scale: newScale };
        });
    }, []);

    // Zoom controls
    const zoomIn = () => handleZoom(1.2);
    const zoomOut = () => handleZoom(0.8);
    const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

    // CLEAN connection logic without debug
    const connections = useMemo((): Connection[] => {
        const connectionsList: Connection[] = [];

        calculatedNodes.forEach(node => {
            if (node.prerequisites.length > 0) {
                node.prerequisites.forEach((prereqId, prereqIndex) => {
                    const prereqNode = calculatedNodes.find(n => n.id === prereqId);

                    if (prereqNode) {
                        const connectionStatus =
                            prereqNode.status === 'completed' ? 'completed' :
                                prereqNode.status === 'in-progress' ? 'available' : 'locked';

                        // Create unique ID with more specificity to prevent conflicts
                        const connectionId = `conn_${prereqNode.id}_to_${node.id}_idx${prereqIndex}_${Date.now()}`;

                        const connection: Connection = {
                            from: prereqNode,
                            to: node,
                            status: connectionStatus,
                            id: connectionId,
                            fromId: prereqNode.id,
                            toId: node.id
                        };

                        connectionsList.push(connection);
                    }
                });
            }
        });

        return connectionsList;
    }, [calculatedNodes]);

    const getNodeStatus = (node: CalculatedNode): 'locked' | 'available' | 'in-progress' | 'completed' => {
        if (node.prerequisites.length === 0) return node.status;

        const allPrereqsCompleted = node.prerequisites.every(prereqId => {
            const prereqNode = calculatedNodes.find(n => n.id === prereqId);
            return prereqNode?.status === 'completed';
        });

        if (!allPrereqsCompleted) return 'locked';
        return node.status;
    };

    const getNodeStyle = (status: string, color: string) => {
        const baseClasses = `${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full flex items-center justify-center border-3 shadow-lg transition-all duration-300`;

        switch (status) {
            case 'completed':
                return `${baseClasses} bg-gradient-to-br ${color} border-green-400/60 shadow-green-400/20`;
            case 'in-progress':
                return `${baseClasses} bg-gradient-to-br ${color} border-orange-400/60 shadow-orange-400/20 animate-pulse`;
            case 'available':
                return `${baseClasses} bg-gradient-to-br ${color} border-blue-400/60 shadow-blue-400/20`;
            default:
                return `${baseClasses} bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500/40 opacity-50`;
        }
    };

    return (
        <section className="py-12 lg:py-24 bg-gradient-to-br from-deep-navy via-dark-blue to-deep-navy relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple/8 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 lg:mb-16"
                >
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                        <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">
                            Dynamic Skill Tree
                        </span>
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-6">
                        Interactive skill progression with glowing connections and dynamic layout.
                    </p>

                    {/* Navigation Instructions */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                            <Hand className="w-4 h-4" />
                            <span>{isMobile ? 'Touch & Drag' : 'Click & Drag'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ZoomIn className="w-4 h-4" />
                            <span>Scroll to Zoom</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Tap Nodes for Details</span>
                        </div>
                    </div>
                </motion.div>

                {/* Skill Tree Canvas */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl lg:rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
                    style={{ height: isMobile ? '400px' : '600px' }}
                >
                    {/* Controls */}
                    <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2" data-control="true">
                        <button
                            onClick={zoomIn}
                            className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white transition-all active:scale-95`}
                        >
                            <ZoomIn className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                        </button>
                        <button
                            onClick={zoomOut}
                            className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white transition-all active:scale-95`}
                        >
                            <ZoomOut className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                        </button>
                        <button
                            onClick={resetView}
                            className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white transition-all active:scale-95`}
                        >
                            <RotateCcw className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                        </button>
                    </div>

                    {/* Zoom Level */}
                    <div className="absolute top-4 left-4 z-30 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20" data-control="true">
                        <span className="text-white text-sm font-medium">
                            {Math.round(transform.scale * 100)}%
                        </span>
                    </div>

                    {/* Canvas Container */}
                    <div
                        ref={containerRef}
                        className="relative w-full h-full overflow-hidden touch-none select-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        style={{
                            cursor: isDragging ? 'grabbing' : 'grab',
                            touchAction: 'none'
                        }}
                    >
                        {/* Main Canvas */}
                        <div
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full"
                            style={{
                                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                                transformOrigin: 'center center',
                                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                                width: '1000px',  // Wider to accommodate better spacing
                                height: '800px',  // Taller to accommodate better spacing
                                left: '50%',
                                top: '50%',
                                marginLeft: '-500px',
                                marginTop: '-400px'
                            }}
                        >
                            {/* Grid Background */}
                            <div className="absolute inset-0 opacity-5">
                                <svg width="100%" height="100%">
                                    <defs>
                                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            {/* GLOWING Connection Lines */}
                            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                                <defs>
                                    {/* Enhanced glowing gradients */}
                                    <linearGradient id="completedGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                                        <stop offset="50%" stopColor="#34D399" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#6EE7B7" stopOpacity="1" />
                                    </linearGradient>
                                    <linearGradient id="availableGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                                        <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#93C5FD" stopOpacity="1" />
                                    </linearGradient>
                                    <linearGradient id="lockedGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6B7280" stopOpacity="0.6" />
                                        <stop offset="50%" stopColor="#9CA3AF" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.6" />
                                    </linearGradient>

                                    {/* Multiple glow filters for different intensities */}
                                    <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    <filter id="mediumGlow" x="-30%" y="-30%" width="160%" height="160%">
                                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Render all connections with enhanced glowing effects */}
                                {connections.map((connection) => {
                                    const fromX = connection.from.position.x;
                                    const fromY = connection.from.position.y;
                                    const toX = connection.to.position.x;
                                    const toY = connection.to.position.y;

                                    // Skip invalid coordinates
                                    if (isNaN(fromX) || isNaN(fromY) || isNaN(toX) || isNaN(toY)) {
                                        return null;
                                    }

                                    // Enhanced curve calculation for better visual separation
                                    const controlPointOffset = Math.abs(toY - fromY) * 0.6;
                                    const controlY1 = fromY + controlPointOffset;
                                    const controlY2 = toY - controlPointOffset;

                                    // Use Bezier curves for smoother connections
                                    const pathData = `M ${fromX} ${fromY} C ${fromX} ${controlY1}, ${toX} ${controlY2}, ${toX} ${toY}`;

                                    // Determine glow properties based on status
                                    const strokeUrl =
                                        connection.status === 'completed' ? 'url(#completedGlow)' :
                                            connection.status === 'available' ? 'url(#availableGlow)' :
                                                'url(#lockedGlow)';

                                    const glowFilter =
                                        connection.status === 'completed' ? 'url(#strongGlow)' :
                                            connection.status === 'available' ? 'url(#mediumGlow)' :
                                                'url(#softGlow)';

                                    const strokeWidth =
                                        connection.status === 'completed' ? 6 :
                                            connection.status === 'available' ? 5 : 4;

                                    const opacity =
                                        connection.status === 'completed' ? 1 :
                                            connection.status === 'available' ? 0.9 : 0.6;

                                    return (
                                        <g key={connection.id}>
                                            {/* Background glow layer */}
                                            <path
                                                d={pathData}
                                                stroke={strokeUrl}
                                                strokeWidth={strokeWidth + 4}
                                                fill="none"
                                                strokeLinecap="round"
                                                opacity={opacity * 0.3}
                                                filter={glowFilter}
                                            />

                                            {/* Main connection line */}
                                            <path
                                                d={pathData}
                                                stroke={strokeUrl}
                                                strokeWidth={strokeWidth}
                                                fill="none"
                                                strokeLinecap="round"
                                                opacity={opacity}
                                                filter={glowFilter}
                                            />

                                            {/* Inner bright line for completed connections */}
                                            {connection.status === 'completed' && (
                                                <path
                                                    d={pathData}
                                                    stroke="rgba(255, 255, 255, 0.8)"
                                                    strokeWidth={2}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    opacity={0.6}
                                                />
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Skill Nodes */}
                            {calculatedNodes.map((node) => {
                                const IconComponent = node.icon;
                                const actualStatus = getNodeStatus(node);

                                return (
                                    <div
                                        key={node.id}
                                        data-node="true"
                                        className="absolute"
                                        style={{
                                            left: node.position.x,
                                            top: node.position.y,
                                            transform: 'translate(-50%, -50%)',
                                            zIndex: 10
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedNode(selectedNode === node.id ? null : node.id);
                                        }}
                                        onPointerEnter={() => !isMobile && setHoveredNode(node.id)}
                                        onPointerLeave={() => !isMobile && setHoveredNode(null)}
                                    >
                                        {/* Node Circle */}
                                        <div className="relative cursor-pointer">
                                            <div className={getNodeStyle(actualStatus, node.color)}>
                                                <IconComponent className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
                                            </div>

                                            {/* Tier Badge */}
                                            <div className={`absolute -top-2 -left-2 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-deep-navy border-2 border-gold rounded-full flex items-center justify-center`}>
                                                <span className="text-xs font-bold text-gold">{node.tier}</span>
                                            </div>

                                            {/* Level Badge */}
                                            {actualStatus === 'completed' && node.level > 0 && (
                                                <div className={`absolute -bottom-2 -right-2 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-green-500 border-2 border-white rounded-full flex items-center justify-center`}>
                                                    <span className="text-xs font-bold text-white">{node.level}</span>
                                                </div>
                                            )}

                                            {/* Progress Indicator */}
                                            {actualStatus === 'in-progress' && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3">
                                                    <div className="w-full h-full bg-orange-400 rounded-full animate-ping opacity-75"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Node Label - Desktop Only */}
                                        {!isMobile && (
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center pointer-events-none">
                                                <div className="text-white text-xs font-medium whitespace-nowrap bg-black/30 backdrop-blur-sm rounded px-2 py-1">
                                                    {node.title}
                                                </div>
                                            </div>
                                        )}

                                        {/* Desktop Tooltip */}
                                        <AnimatePresence>
                                            {hoveredNode === node.id && !isMobile && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-50 pointer-events-none"
                                                >
                                                    <div className="bg-deep-navy/95 backdrop-blur-sm text-white p-4 rounded-xl border border-gold/30 shadow-xl min-w-[250px]">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <IconComponent className="w-5 h-5 text-gold" />
                                                            <h4 className="font-bold text-gold">{node.title}</h4>
                                                        </div>
                                                        <p className="text-sm text-gray-300 mb-3">{node.description}</p>
                                                        <div className="flex items-center justify-between text-xs mb-2">
                                                            <span className={`px-2 py-1 rounded-full ${actualStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                                actualStatus === 'in-progress' ? 'bg-orange-500/20 text-orange-400' :
                                                                    actualStatus === 'available' ? 'bg-blue-500/20 text-blue-400' :
                                                                        'bg-gray-500/20 text-gray-400'
                                                                }`}>
                                                                {actualStatus.replace('-', ' ').toUpperCase()}
                                                            </span>
                                                            <span className="text-gold font-medium">{node.xp} XP</span>
                                                        </div>
                                                        {node.prerequisites.length > 0 && (
                                                            <div className="pt-2 border-t border-gray-600">
                                                                <div className="text-xs text-gray-400 mb-1">Prerequisites ({node.prerequisites.length}):</div>
                                                                <div className="text-xs text-gray-300">
                                                                    {node.prerequisites.map(prereq =>
                                                                        calculatedNodes.find(n => n.id === prereq)?.title
                                                                    ).join(', ')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-4 right-4 bg-deep-navy/90 backdrop-blur-sm rounded-xl p-3 border border-white/20 z-30" data-control="true">
                        <h4 className="text-white font-bold mb-2 text-xs">Status</h4>
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg shadow-green-400/50"></div>
                                <span className="text-xs text-gray-300">Completed</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-400/50"></div>
                                <span className="text-xs text-gray-300">In Progress</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full shadow-lg shadow-blue-400/50"></div>
                                <span className="text-xs text-gray-300">Available</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full opacity-50"></div>
                                <span className="text-xs text-gray-300">Locked</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Node Detail Modal */}
                <AnimatePresence>
                    {selectedNode && isMobile && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
                            onClick={() => setSelectedNode(null)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="bg-deep-navy text-white p-6 rounded-t-3xl border-t border-gold/30 shadow-xl w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {(() => {
                                    const node = calculatedNodes.find(n => n.id === selectedNode);
                                    if (!node) return null;
                                    const IconComponent = node.icon;
                                    const actualStatus = getNodeStatus(node);

                                    return (
                                        <>
                                            <div className="flex items-center space-x-3 mb-4">
                                                <IconComponent className="w-8 h-8 text-gold" />
                                                <h3 className="text-xl font-bold text-gold">{node.title}</h3>
                                            </div>
                                            <p className="text-gray-300 mb-4">{node.description}</p>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${actualStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                    actualStatus === 'in-progress' ? 'bg-orange-500/20 text-orange-400' :
                                                        actualStatus === 'available' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {actualStatus.replace('-', ' ').toUpperCase()}
                                                </span>
                                                <span className="text-gold font-bold">{node.xp} XP</span>
                                            </div>
                                            {node.prerequisites.length > 0 && (
                                                <div className="mb-4 pt-4 border-t border-gray-600">
                                                    <div className="text-sm text-gray-400 mb-2">Prerequisites ({node.prerequisites.length}):</div>
                                                    <div className="text-sm text-gray-300">
                                                        {node.prerequisites.map(prereq =>
                                                            calculatedNodes.find(n => n.id === prereq)?.title
                                                        ).join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setSelectedNode(null)}
                                                className="w-full bg-gold text-deep-navy py-3 rounded-xl font-semibold active:scale-95 transition-transform"
                                            >
                                                Close
                                            </button>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
                >
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20 text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-1 lg:mb-2">
                            {calculatedNodes.filter(n => n.status === 'completed').length}
                        </div>
                        <div className="text-gray-300 text-sm lg:text-base">Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20 text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-orange-400 mb-1 lg:mb-2">
                            {calculatedNodes.filter(n => n.status === 'in-progress').length}
                        </div>
                        <div className="text-gray-300 text-sm lg:text-base">In Progress</div>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20 text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-1 lg:mb-2">
                            {calculatedNodes.filter(n => getNodeStatus(n) === 'available').length}
                        </div>
                        <div className="text-gray-300 text-sm lg:text-base">Available</div>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20 text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-gold mb-1 lg:mb-2">
                            {calculatedNodes.filter(n => n.status === 'completed').reduce((total, n) => total + n.xp, 0)}
                        </div>
                        <div className="text-gray-300 text-sm lg:text-base">Total XP</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SkillCardCanvas;