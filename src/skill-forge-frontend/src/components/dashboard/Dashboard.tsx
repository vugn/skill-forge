import { motion } from 'framer-motion';
import {
    ChevronRight,
    Crown,
    Trophy
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import DashboardNavbar from './DashboardNavbar';
import SkillTreeCanvas from './SkillTreeCanvas';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    // Simple user data for MVP
    const userData = {
        name: user?.fullName || 'SkillForge User',
        level: 12,
        currentXP: 2450,
        nextLevelXP: 3000,
        totalXP: 15750,
        skillsCompleted: 23,
        avatar: user?.profilePicture || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    };

    const xpProgress = (userData.currentXP / userData.nextLevelXP) * 100;

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
                                    <img
                                        src={userData.avatar}
                                        alt="User Avatar"
                                        className="w-20 h-20 rounded-full border-4 border-gold"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-gold text-deep-navy rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                        {userData.level}
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-1">{userData.name}</h1>
                                <p className="text-gold font-semibold">Level {userData.level} Learner</p>
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

                    {/* 3. Dynamic Skill Tree Section - Bottom */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                                <Crown className="w-6 h-6 text-gold" />
                                <span>Your Dynamic Skill Tree</span>
                            </h2>
                            <Link
                                to="/skills"
                                className="text-gold hover:text-gold/80 text-sm font-semibold transition-colors flex items-center space-x-1"
                            >
                                <span>Explore Full Tree</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-300 text-sm">
                                Your personalized learning path adapts as you progress. Complete skills to unlock new opportunities.
                            </p>
                        </div>

                        <SkillTreeCanvas />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;