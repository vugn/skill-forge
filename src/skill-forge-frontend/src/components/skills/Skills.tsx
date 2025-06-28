import { motion } from 'framer-motion';
import React from 'react';
import AISkillCardGenerator from '../ai/AISkillCardGenerator';
import DashboardNavbar from '../dashboard/DashboardNavbar';

const Skills: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-deep-navy via-dark-blue to-deep-navy">
            <DashboardNavbar />

            <div className="pt-20 pb-8">
                <div className="container mx-auto px-4 pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                            AI Skill Tree <span className="text-gold">Generator</span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Input your career goal and let our AI create a personalized learning path with interactive quests.
                        </p>
                    </motion.div>

                    <AISkillCardGenerator />
                </div>
            </div>
        </div>
    );
};

export default Skills;
