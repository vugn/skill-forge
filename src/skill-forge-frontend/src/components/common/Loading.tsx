import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';
import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-deep-navy to-midnight-blue flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="relative mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative"
                    >
                        <Hammer className="w-16 h-16 text-gold mx-auto" />
                        <div className="absolute inset-0 w-16 h-16 bg-gold/20 rounded-full blur-md animate-pulse mx-auto" />
                    </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">SkillForge</h2>
                <p className="text-gray-300">Loading your experience...</p>
            </motion.div>
        </div>
    );
};

export default Loading;
