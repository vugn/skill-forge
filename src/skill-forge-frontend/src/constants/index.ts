export const IDENTITY_PROVIDERS = {
    DEVELOPMENT: 'http://vpyes-67777-77774-qaaeq-cai.localhost:4943',
    PRODUCTION: 'https://identity.ic0.app',
} as const;

export const ROUTES = {
    HOME: '/',
    SETUP: '/setup',
    DASHBOARD: '/dashboard',
    SKILLS: '/skills',
    ACHIEVEMENTS: '/achievements',
} as const;

export const STORAGE_KEYS = {
    USER_PROFILE_PREFIX: 'user_profile_',
} as const;

export const ANIMATION_VARIANTS = {
    fadeIn: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    slideIn: {
        initial: { x: -100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 100, opacity: 0 },
    },
    scale: {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    },
} as const;

export const VALIDATION = {
    FULL_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },
} as const;
