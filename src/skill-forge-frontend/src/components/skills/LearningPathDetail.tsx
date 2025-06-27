import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Code,
    Database,
    Globe,
    Palette,
    Target,
    Trophy,
    X,
    Zap
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

// Reuse the same interfaces and components from AISkillTreeGenerator
const ICON_MAP = {
    globe: Globe,
    code: Code,
    palette: Palette,
    zap: Zap,
    database: Database
};

type IconName = keyof typeof ICON_MAP;

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

// Simplified SkillTreeCanvas component for LearningPathDetail
interface SkillTreeCanvasProps {
    tree: SkillTree;
    onSkillClick: (skill: SkillNode) => void;
}

const SkillTreeCanvas: React.FC<SkillTreeCanvasProps> = ({ tree, onSkillClick }) => {
    const [zoom, setZoom] = useState(0.8);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const GRID_SIZE = 120;
    const SKILL_SIZE = 80;

    const gridToPixel = (gridPos: { x: number; y: number }) => {
        const skillOffset = (GRID_SIZE - SKILL_SIZE) / 2;
        return {
            x: gridPos.x * GRID_SIZE + skillOffset,
            y: gridPos.y * GRID_SIZE + skillOffset
        };
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const startX = e.clientX - dragOffset.x;
        const startY = e.clientY - dragOffset.y;

        const handleMouseMove = (e: MouseEvent) => {
            setDragOffset({
                x: e.clientX - startX,
                y: e.clientY - startY
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [dragOffset]);

    const bounds = tree.skills.length > 0 ? {
        minX: Math.min(...tree.skills.map(s => s.gridPosition.x)),
        maxX: Math.max(...tree.skills.map(s => s.gridPosition.x)),
        minY: Math.min(...tree.skills.map(s => s.gridPosition.y)),
        maxY: Math.max(...tree.skills.map(s => s.gridPosition.y))
    } : { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const initialOffset = {
        x: 300 - (bounds.minX + bounds.maxX) / 2 * GRID_SIZE * zoom,
        y: 250 - (bounds.minY + bounds.maxY) / 2 * GRID_SIZE * zoom
    };

    const totalOffset = {
        x: initialOffset.x + dragOffset.x,
        y: initialOffset.y + dragOffset.y
    };

    // Connections
    const connections = tree.skills.flatMap(skill =>
        skill.dependencies.map(depId => ({
            from: tree.skills.find(s => s.id === depId),
            to: skill
        })).filter(conn => conn.from !== undefined)
    );

    return (
        <div
            className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                 radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
            }}
        >
            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='${GRID_SIZE}' height='${GRID_SIZE}' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='${GRID_SIZE}' height='${GRID_SIZE}' patternUnits='userSpaceOnUse'%3e%3cpath d='M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}' fill='none' stroke='%23475569' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e")`,
                    backgroundPosition: `${totalOffset.x}px ${totalOffset.y}px`,
                    transform: `scale(${zoom})`
                }}
            />

            {/* Skill Tree Container */}
            <div
                className="absolute inset-0"
                style={{
                    transform: `translate(${totalOffset.x}px, ${totalOffset.y}px) scale(${zoom})`
                }}
            >
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {connections.map((conn, index) => {
                        if (!conn.from) return null;

                        const fromPos = gridToPixel(conn.from.gridPosition);
                        const toPos = gridToPixel(conn.to.gridPosition);

                        const startX = fromPos.x + SKILL_SIZE / 2;
                        const startY = fromPos.y + SKILL_SIZE;
                        const endX = toPos.x + SKILL_SIZE / 2;
                        const endY = toPos.y;

                        const midY = startY + (endY - startY) / 2;
                        const pathData = `M ${startX} ${startY} Q ${startX} ${midY} ${endX} ${endY}`;

                        return (
                            <path
                                key={index}
                                d={pathData}
                                stroke={conn.from.isCompleted ? '#10b981' : '#64748b'}
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={conn.from.isCompleted ? '0' : '8,4'}
                            />
                        );
                    })}
                </svg>

                {/* Skill nodes */}
                {tree.skills.map((skill) => {
                    const pixelPos = gridToPixel(skill.gridPosition);
                    const IconComponent = ICON_MAP[skill.iconName] || Code;

                    return (
                        <motion.div
                            key={skill.id}
                            className="absolute cursor-pointer"
                            style={{
                                left: pixelPos.x,
                                top: pixelPos.y,
                                width: SKILL_SIZE,
                                height: SKILL_SIZE
                            }}
                            onClick={() => onSkillClick(skill)}
                            whileHover={{ scale: skill.isUnlocked ? 1.1 : 1 }}
                            whileTap={{ scale: skill.isUnlocked ? 0.95 : 1 }}
                            layout={false}
                        >
                            {/* Skill circle with enhanced design */}
                            <div
                                className={`
                                    w-full h-full rounded-full border-4 flex items-center justify-center relative transition-all duration-200
                                    ${skill.isCompleted
                                        ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-lg shadow-green-500/50'
                                        : skill.isUnlocked
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300 hover:from-blue-400 hover:to-blue-600 shadow-lg shadow-blue-500/50 animate-pulse'
                                            : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500 opacity-50'
                                    }
                                `}
                            >
                                <IconComponent className={`w-8 h-8 text-white ${skill.isUnlocked ? 'drop-shadow-lg' : ''}`} />

                                {/* Status indicators */}
                                {skill.isCompleted && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
                                        <Trophy className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                {/* Points display */}
                                {skill.isUnlocked && (
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                        {skill.currentPoints}/{skill.maxPoints}
                                    </div>
                                )}

                                {/* Pulsing effect for unlocked skills */}
                                {skill.isUnlocked && !skill.isCompleted && (
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-75" />
                                )}
                            </div>

                            {/* Skill name tooltip */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="font-semibold">{skill.name}</div>
                                <div className="text-gray-400 text-xs mt-1">{skill.description}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button
                    onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
                >
                    +
                </button>
                <button
                    onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
                >
                    −
                </button>
                <button
                    onClick={() => {
                        setZoom(0.8);
                        setDragOffset({ x: 0, y: 0 });
                    }}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors text-xs"
                >
                    ⌂
                </button>
            </div>
        </div>
    );
};

const LearningPathDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questAnswers, setQuestAnswers] = useState<number[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Mock quests data - menggunakan struktur yang sama dengan AISkillTreeGenerator
    const mockQuests = useMemo<Quest[]>(() => [
        {
            id: 'html-quest',
            title: 'HTML5 Mastery Challenge',
            description: 'Prove your HTML5 knowledge with interactive questions',
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
        },
        {
            id: 'css-quest',
            title: 'CSS3 Styling Challenge',
            description: 'Master modern CSS3 techniques and properties',
            questions: [
                {
                    id: 'q3',
                    text: 'Which CSS property is used for flexible layouts?',
                    options: ['flexbox', 'display: flex', 'flex-layout'],
                    correctAnswer: 1,
                    explanation: 'The display: flex property creates a flexible layout container.'
                }
            ],
            points: 150,
            passingThreshold: 0.7
        },
        {
            id: 'js-quest',
            title: 'JavaScript Fundamentals',
            description: 'Test your JavaScript programming skills',
            questions: [
                {
                    id: 'q4',
                    text: 'What is the correct way to declare a variable in modern JavaScript?',
                    options: ['var myVar', 'let myVar', 'const myVar'],
                    correctAnswer: 1,
                    explanation: 'let is preferred for variables that will change, const for constants.'
                }
            ],
            points: 200,
            passingThreshold: 0.8
        }
    ], []);

    // Mock skill tree data - menggunakan struktur yang sama dengan AISkillTreeGenerator
    const skillTreeData = useMemo<SkillTree>(() => ({
        id: `learning-path-${id}`,
        title: id === '1' ? 'Frontend Developer Mastery' : 'Data Science Basics',
        description: id === '1'
            ? 'Master modern frontend development with React, TypeScript, and advanced UI/UX principles'
            : 'Learn the fundamentals of data science, including Python, statistics, and machine learning basics',
        category: id === '1' ? 'Frontend' : 'Data Science',
        skills: id === '1' ? [
            {
                id: 'html5',
                name: 'HTML5',
                description: 'Master semantic HTML5 structure and elements',
                iconName: 'globe',
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
                description: 'Style with modern CSS3 features and layouts',
                iconName: 'palette',
                gridPosition: { x: 1, y: 1 },
                dependencies: ['html5'],
                questId: 'css-quest',
                isUnlocked: false,
                isCompleted: false,
                maxPoints: 150,
                currentPoints: 0
            },
            {
                id: 'javascript',
                name: 'JavaScript',
                description: 'Interactive web programming with JavaScript',
                iconName: 'code',
                gridPosition: { x: 3, y: 1 },
                dependencies: ['html5'],
                questId: 'js-quest',
                isUnlocked: false,
                isCompleted: false,
                maxPoints: 200,
                currentPoints: 0
            },
            {
                id: 'react',
                name: 'React',
                description: 'Component-based UI library development',
                iconName: 'zap',
                gridPosition: { x: 2, y: 2 },
                dependencies: ['css3', 'javascript'],
                questId: 'html-quest',
                isUnlocked: false,
                isCompleted: false,
                maxPoints: 250,
                currentPoints: 0
            }
        ] : [
            {
                id: 'python',
                name: 'Python',
                description: 'Programming language for data science',
                iconName: 'code',
                gridPosition: { x: 2, y: 0 },
                dependencies: [],
                questId: 'html-quest',
                isUnlocked: true,
                isCompleted: false,
                maxPoints: 150,
                currentPoints: 0
            },
            {
                id: 'pandas',
                name: 'Pandas',
                description: 'Data manipulation and analysis library',
                iconName: 'database',
                gridPosition: { x: 2, y: 1 },
                dependencies: ['python'],
                questId: 'html-quest',
                isUnlocked: false,
                isCompleted: false,
                maxPoints: 200,
                currentPoints: 0
            }
        ],
        completedPoints: 0,
        totalPoints: id === '1' ? 700 : 350,
        status: 'accepted'
    }), [id]);

    const handleSkillClick = useCallback((skill: SkillNode) => {
        if (skill.isUnlocked && !skill.isCompleted) {
            setSelectedSkill(skill);
            const quest = mockQuests.find(q => q.id === skill.questId);
            if (quest) {
                setActiveQuest(quest);
                setCurrentQuestionIndex(0);
                setQuestAnswers([]);
                setSelectedAnswer(null);
                setShowResult(false);
            }
        }
    }, [mockQuests]);

    const handleAnswerSubmit = useCallback(() => {
        if (selectedAnswer === null || !activeQuest) return;

        const newAnswers = [...questAnswers, selectedAnswer];
        setQuestAnswers(newAnswers);

        if (currentQuestionIndex < activeQuest.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            // Quest completed
            const correctAnswers = newAnswers.filter((answer, index) =>
                answer === activeQuest.questions[index].correctAnswer
            ).length;
            const score = correctAnswers / activeQuest.questions.length;

            if (score >= activeQuest.passingThreshold && selectedSkill) {
                // Mark skill as completed
                selectedSkill.isCompleted = true;
                selectedSkill.currentPoints = selectedSkill.maxPoints;

                // Unlock dependent skills
                skillTreeData.skills.forEach(skill => {
                    if (skill.dependencies.includes(selectedSkill.id)) {
                        skill.isUnlocked = true;
                    }
                });

                // Update completed points
                skillTreeData.completedPoints += selectedSkill.maxPoints;
            }

            setShowResult(true);
        }
    }, [selectedAnswer, activeQuest, questAnswers, currentQuestionIndex, selectedSkill, skillTreeData]);

    const closeQuestModal = useCallback(() => {
        setSelectedSkill(null);
        setActiveQuest(null);
        setCurrentQuestionIndex(0);
        setQuestAnswers([]);
        setSelectedAnswer(null);
        setShowResult(false);
    }, []);

    const progress = Math.round((skillTreeData.completedPoints / skillTreeData.totalPoints) * 100);
    const completedSkills = skillTreeData.skills.filter(s => s.isCompleted).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-deep-navy via-dark-blue to-deep-navy">
            {/* Header */}
            <div className="border-b border-white/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/profile"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{skillTreeData.title}</h1>
                                <p className="text-gray-400">{skillTreeData.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gold">{progress}%</div>
                                <div className="text-xs text-gray-400">Complete</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{completedSkills}/{skillTreeData.skills.length}</div>
                                <div className="text-xs text-gray-400">Skills</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-400">{skillTreeData.completedPoints}</div>
                                <div className="text-xs text-gray-400">XP Earned</div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="bg-gradient-to-r from-gold to-yellow-400 h-2 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-140px)]">
                {/* Full Screen Skill Tree */}
                <div className="flex-1 relative">
                    <div className="absolute inset-0">
                        <SkillTreeCanvas tree={skillTreeData} onSkillClick={handleSkillClick} />
                    </div>
                </div>

                {/* Skills Sidebar */}
                <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 p-6 overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                            <Target className="w-5 h-5 text-gold" />
                            <span>Available Skills</span>
                        </h2>
                        <p className="text-gray-400 text-sm">Click on unlocked skills to start learning</p>
                    </div>

                    <div className="space-y-4">
                        {skillTreeData.skills.map((skill) => (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`bg-white/5 rounded-lg p-4 border border-white/10 hover:border-gold/30 transition-all cursor-pointer ${skill.isCompleted ? 'opacity-75 border-green-500/30' :
                                    !skill.isUnlocked ? 'opacity-50' : ''
                                    }`}
                                onClick={() => skill.isUnlocked && !skill.isCompleted && handleSkillClick(skill)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-white text-sm">{skill.name}</h3>
                                    {skill.isCompleted && (
                                        <Trophy className="w-4 h-4 text-gold flex-shrink-0" />
                                    )}
                                </div>

                                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{skill.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs px-2 py-1 rounded ${skill.isCompleted ? 'text-green-400 bg-green-400/20' :
                                            skill.isUnlocked ? 'text-blue-400 bg-blue-400/20' :
                                                'text-gray-400 bg-gray-400/20'
                                            }`}>
                                            {skill.isCompleted ? 'Completed' : skill.isUnlocked ? 'Available' : 'Locked'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gold font-semibold">+{skill.maxPoints} XP</div>
                                </div>

                                {skill.isUnlocked && !skill.isCompleted && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSkillClick(skill);
                                        }}
                                        className="w-full mt-3 bg-gold/20 hover:bg-gold/30 text-gold text-xs py-2 rounded transition-colors"
                                    >
                                        Start Learning
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quest Modal */}
            {activeQuest && selectedSkill && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                        {(() => {
                                            const IconComponent = ICON_MAP[selectedSkill.iconName] || Code;
                                            return <IconComponent className="w-8 h-8 text-white" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{activeQuest.title}</h2>
                                        <p className="text-gray-600">{activeQuest.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeQuestModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedSkill.currentPoints}/{selectedSkill.maxPoints} points
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(selectedSkill.currentPoints / selectedSkill.maxPoints) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {!showResult ? (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                                        Question {currentQuestionIndex + 1} of {activeQuest.questions.length}
                                    </h3>
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 mb-6">
                                        <h4 className="text-lg font-semibold mb-3 text-gray-900">
                                            {activeQuest.questions[currentQuestionIndex].text}
                                        </h4>

                                        {/* Answer Options */}
                                        <div className="space-y-3 mb-6">
                                            {activeQuest.questions[currentQuestionIndex].options.map((option, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedAnswer(index)}
                                                    className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${selectedAnswer === index
                                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {selectedAnswer === index && (
                                                                <div className="w-2 h-2 bg-white rounded-full" />
                                                            )}
                                                        </div>
                                                        <span className="text-gray-700">{option}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={closeQuestModal}
                                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAnswerSubmit}
                                                disabled={selectedAnswer === null}
                                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                            >
                                                {currentQuestionIndex < activeQuest.questions.length - 1 ? 'Next Question' : 'Submit Answer'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">
                                        {questAnswers.filter((answer, index) =>
                                            answer === activeQuest.questions[index].correctAnswer
                                        ).length >= activeQuest.questions.length * activeQuest.passingThreshold ? '🎉' : '😔'}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {questAnswers.filter((answer, index) =>
                                            answer === activeQuest.questions[index].correctAnswer
                                        ).length >= activeQuest.questions.length * activeQuest.passingThreshold ? 'Congratulations!' : 'Try Again!'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        You got {questAnswers.filter((answer, index) =>
                                            answer === activeQuest.questions[index].correctAnswer
                                        ).length} out of {activeQuest.questions.length} questions correct
                                    </p>
                                    <button
                                        onClick={closeQuestModal}
                                        className="bg-gradient-to-r from-gold to-yellow-500 text-deep-navy px-8 py-3 rounded-lg font-semibold hover:from-yellow-400 hover:to-gold transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Continue Learning
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default LearningPathDetail;
