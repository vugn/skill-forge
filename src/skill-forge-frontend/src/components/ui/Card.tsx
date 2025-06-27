import { motion } from 'framer-motion';
import React from 'react';
import { ANIMATION_VARIANTS } from '../../constants';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'glass' | 'solid';
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    variant = 'glass',
}) => {
    const baseClasses = 'rounded-2xl border';

    const variantClasses = {
        default: 'bg-white border-gray-200',
        glass: 'bg-slate-800/50 backdrop-blur-md border-white/10',
        solid: 'bg-slate-800 border-slate-700',
    };

    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

    return (
        <motion.div
            initial={ANIMATION_VARIANTS.fadeIn.initial}
            animate={ANIMATION_VARIANTS.fadeIn.animate}
            className={combinedClasses}
        >
            {children}
        </motion.div>
    );
};

export default Card;
