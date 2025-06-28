/**
 * Validation utility functions
 */

export const validateFullName = (name: string): { isValid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'Full name is required' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, error: 'Full name must be at least 2 characters' };
    }

    if (name.length > 100) {
        return { isValid: false, error: 'Full name must not exceed 100 characters' };
    }

    return { isValid: true };
};

export const validateProfilePicture = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
        return { isValid: false, error: 'Image size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
    }

    return { isValid: true };
};

/**
 * Format utility functions
 */

export const formatPrincipal = (principal: string): string => {
    if (principal.length <= 16) return principal;
    return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
};

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

    return formatDate(date);
};

/**
 * Generate username from full name
 */
export const generateUsername = (fullName: string): string => {
    if (!fullName || fullName.trim().length === 0) {
        return 'user';
    }

    // Ambil kata pertama dan convert ke lowercase
    const firstName = fullName.trim().split(' ')[0].toLowerCase();

    // Hapus karakter non-alphanumeric dan ganti dengan underscore
    const cleanUsername = firstName.replace(/[^a-z0-9]/g, '_');

    return cleanUsername || 'user';
};

/**
 * Format tanggal join user
 */
export const formatJoinDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
    }).format(date);
};

/**
 * Storage utility functions
 */

export const getStorageKey = (prefix: string, identifier: string): string => {
    return `${prefix}${identifier}`;
};

export const safeJSONParse = <T>(value: string | null, fallback: T): T => {
    if (!value) return fallback;

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
};

/**
 * Array utility functions
 */

export const chunk = <T>(array: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
        array.slice(index * size, index * size + size)
    );
};

/**
 * Async utility functions
 */

export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retryAsync = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries) {
                await delay(delayMs * Math.pow(2, i)); // Exponential backoff
            }
        }
    }

    throw lastError!;
};
