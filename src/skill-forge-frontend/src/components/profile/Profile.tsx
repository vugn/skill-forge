import { motion } from 'framer-motion';
import {
    Camera,
    Save,
    Star,
    Target,
    User,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import DashboardNavbar from '../dashboard/DashboardNavbar';

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: user?.fullName || '',
        profilePicture: user?.profilePicture || ''
    });

    // Mock data simplified for MVP
    const learningStats = {
        totalSkillTrees: 2,
        skillsCompleted: 8
    };

    // Simplified skill trees data
    const mySkillTrees = [
        {
            id: 1,
            title: 'Frontend Developer',
            progress: 45,
            totalSkills: 12,
            completedSkills: 5,
            status: 'in-progress'
        },
        {
            id: 2,
            title: 'Data Science Basics',
            progress: 25,
            totalSkills: 10,
            completedSkills: 3,
            status: 'in-progress'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'from-green-500 to-green-600';
            case 'in-progress': return 'from-gold to-yellow-400';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form if canceling
            setEditForm({
                fullName: user?.fullName || '',
                profilePicture: user?.profilePicture || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async () => {
        try {
            await updateUser({
                fullName: editForm.fullName,
                profilePicture: editForm.profilePicture
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEditForm(prev => ({
                    ...prev,
                    profilePicture: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-deep-navy via-dark-blue to-deep-navy">
            <DashboardNavbar />

            <div className="pt-20 pb-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Profile Header with Edit Functionality */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            {/* User Info */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="relative mb-3">
                                    {/* Profile Image */}
                                    <div className="w-20 h-20 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center overflow-hidden">
                                        {(isEditing ? editForm.profilePicture : user?.profilePicture) ? (
                                            <img
                                                src={isEditing ? editForm.profilePicture : user?.profilePicture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-8 h-8 text-deep-navy" />
                                        )}
                                    </div>

                                    {/* Edit Button / Image Upload */}
                                    {isEditing ? (
                                        <label className="absolute -top-1 -right-1 bg-gold hover:bg-gold/90 rounded-full p-1.5 cursor-pointer transition-colors">
                                            <Camera className="w-3 h-3 text-deep-navy" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    ) : (
                                        <button
                                            onClick={handleEditToggle}
                                            className="absolute -top-1 -right-1 bg-white/20 backdrop-blur-sm rounded-full p-1.5 hover:bg-white/30 transition-colors"
                                        >
                                            <User className="w-3 h-3 text-white" />
                                        </button>
                                    )}
                                </div>

                                {/* Name Input/Display */}
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.fullName}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="text-xl font-bold text-white mb-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-center md:text-left focus:outline-none focus:border-gold"
                                        placeholder="Your full name"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-white mb-1">{user?.fullName || 'Your Name'}</h1>
                                )}
                                <p className="text-gold text-sm font-medium">SkillForge Learner</p>
                            </div>

                            {/* Learning Stats */}
                            <div className="flex-1 grid grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-gold mb-1">{learningStats.totalSkillTrees}</div>
                                    <div className="text-sm text-gray-300">Learning Paths</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-gold mb-1">{learningStats.skillsCompleted}</div>
                                    <div className="text-sm text-gray-300">Skills Mastered</div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Actions */}
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex justify-center space-x-3 mt-6 pt-6 border-t border-white/10"
                            >
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex items-center space-x-2 bg-gold hover:bg-gold/90 text-deep-navy px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </button>
                                <button
                                    onClick={handleEditToggle}
                                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/20 mb-6"
                    >
                        <div className="flex space-x-2">
                            {[
                                { id: 'overview', label: 'Overview', icon: User },
                                { id: 'skill-trees', label: 'My Learning', icon: Target }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gold text-deep-navy'
                                        : 'text-gray-300 hover:text-gold hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                        >
                            <h2 className="text-lg font-bold text-white mb-6">Your Learning Journey</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Quick Stats */}
                                <div>
                                    <h3 className="text-md font-semibold text-white mb-4">Progress Overview</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                            <span className="text-gray-300">Learning Paths</span>
                                            <span className="text-gold font-semibold">{learningStats.totalSkillTrees}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                            <span className="text-gray-300">Skills Mastered</span>
                                            <span className="text-gold font-semibold">{learningStats.skillsCompleted}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div>
                                    <h3 className="text-md font-semibold text-white mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <Link
                                            to="/learning-path/1"
                                            className="w-full p-3 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg text-gold font-medium transition-colors block text-center"
                                        >
                                            Continue Learning
                                        </Link>
                                        <Link
                                            to="/skills"
                                            className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-medium transition-colors block text-center"
                                        >
                                            Explore New Skills
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'skill-trees' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                                    <Target className="w-5 h-5 text-gold" />
                                    <span>My Learning Paths</span>
                                </h2>

                                <div className="space-y-4">
                                    {mySkillTrees.map((tree, index) => (
                                        <motion.div
                                            key={tree.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-gold/30 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-white">{tree.title}</h3>
                                                    <p className="text-sm text-gray-400">{tree.completedSkills}/{tree.totalSkills} skills completed</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gold">{tree.progress}%</div>
                                                    <div className="text-xs text-gray-400">Progress</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-3">
                                                <div className="w-full bg-white/10 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${tree.progress}%` }}
                                                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                                                        className={`bg-gradient-to-r ${getStatusColor(tree.status)} h-2 rounded-full`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="flex items-center space-x-1 text-sm text-gray-400">
                                                    <Star className="w-3 h-3" />
                                                    <span>In Progress</span>
                                                </span>
                                                <Link
                                                    to={`/learning-path/${tree.id}`}
                                                    className="bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded text-sm font-medium transition-colors"
                                                >
                                                    Continue
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* CTA for MVP */}
                                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                    <Link
                                        to="/skills"
                                        className="bg-gold hover:bg-gold/90 text-deep-navy px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                                    >
                                        Create New Learning Path
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;