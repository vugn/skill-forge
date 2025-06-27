import { motion } from 'framer-motion';
import React from 'react';
import { ANIMATION_VARIANTS } from '../../constants';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'number';
    maxLength?: number;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
    type = 'text',
    maxLength,
    className = '',
}) => {
    const inputClasses = `
    w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 
    focus:outline-none focus:ring-1 transition-colors
    ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
            : 'border-white/10 focus:border-gold/50 focus:ring-gold/50'
        }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

    return (
        <motion.div
            initial={ANIMATION_VARIANTS.fadeIn.initial}
            animate={ANIMATION_VARIANTS.fadeIn.animate}
            className="space-y-2"
        >
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                className={inputClasses}
                required={required}
            />

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </motion.div>
    );
};

export default Input;
