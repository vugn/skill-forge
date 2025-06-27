import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import React from 'react';
import { ANIMATION_VARIANTS } from '../../constants';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    className = '',
    type = 'button',
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-gold text-deep-navy hover:bg-gold/90 focus:ring-gold',
        secondary: 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500',
        ghost: 'text-gray-300 hover:text-white hover:bg-white/10 focus:ring-white/20',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <motion.button
            whileHover={!disabled ? ANIMATION_VARIANTS.scale.hover : undefined}
            whileTap={!disabled ? ANIMATION_VARIANTS.scale.tap : undefined}
            className={`${combinedClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
            ) : Icon ? (
                <Icon className="w-5 h-5 mr-2" />
            ) : null}
            {children}
        </motion.button>
    );
};

export default Button;
