import { Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

import { IDENTITY_PROVIDERS, STORAGE_KEYS } from '../constants';
import { IAuthService, UserProfile } from '../types';
import { getStorageKey, retryAsync, safeJSONParse } from '../utils';

/**
 * AuthService class implementing IAuthService interface
 * Handles Internet Identity authentication and user profile management
 */
class AuthService implements IAuthService {
    private authClient: AuthClient | null = null;
    private identity: Identity | null = null;
    private userProfiles: Map<string, UserProfile> = new Map();

    /**
     * Initialize the authentication client
     */
    async init(): Promise<void> {
        try {
            this.authClient = await retryAsync(() => AuthClient.create(), 3, 1000);

            if (await this.authClient.isAuthenticated()) {
                this.identity = this.authClient.getIdentity();
            }
        } catch (error) {
            console.error('Failed to initialize auth client:', error);
            throw new Error('Authentication initialization failed');
        }
    }

    /**
     * Login with Internet Identity
     */
    async login(): Promise<boolean> {
        if (!this.authClient) {
            await this.init();
        }

        return new Promise((resolve) => {
            this.authClient!.login({
                identityProvider: this.getIdentityProvider(),
                onSuccess: () => {
                    this.identity = this.authClient!.getIdentity();
                    resolve(true);
                },
                onError: (error) => {
                    console.error('Login failed:', error);
                    resolve(false);
                },
            });
        });
    }

    /**
     * Logout and clear identity
     */
    async logout(): Promise<void> {
        if (this.authClient) {
            await this.authClient.logout();
            this.identity = null;
        }
    }


    /**
 * Save user profile to localStorage
 */
    async saveUserProfileToStorage(principal: string, profile: UserProfile): Promise<void> {
        try {
            const key = `skillforge_profile_${principal}`;
            localStorage.setItem(key, JSON.stringify(profile));
        } catch (error) {
            console.error('Failed to save user profile:', error);
            throw new Error('Failed to save profile');
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.identity !== null && !this.identity.getPrincipal().isAnonymous();
    }

    /**
     * Get user's Principal
     */
    getPrincipal(): Principal | null {
        return this.identity?.getPrincipal() || null;
    }

    /**
     * Get user's Principal as string
     */
    getPrincipalText(): string | null {
        const principal = this.getPrincipal();
        return principal ? principal.toString() : null;
    }

    /**
     * Get user's Identity
     */
    getIdentity(): Identity | null {
        return this.identity;
    }

    /**
     * Get user profile from memory cache
     */
    async getUserProfile(principal: string): Promise<UserProfile | null> {
        return this.userProfiles.get(principal) || null;
    }

    /**
     * Save user profile to storage and cache
     */
    async saveUserProfile(profile: UserProfile): Promise<void> {
        try {
            this.userProfiles.set(profile.principal, profile);
            const storageKey = getStorageKey(STORAGE_KEYS.USER_PROFILE_PREFIX, profile.principal);
            localStorage.setItem(storageKey, JSON.stringify(profile));
        } catch (error) {
            console.error('Failed to save user profile:', error);
            throw new Error('Profile save failed');
        }
    }

    /**
     * Load user profile from localStorage
     */
    async loadUserProfileFromStorage(principal: string): Promise<UserProfile | null> {
        try {
            const storageKey = getStorageKey(STORAGE_KEYS.USER_PROFILE_PREFIX, principal);
            const stored = localStorage.getItem(storageKey);
            const profile = safeJSONParse<UserProfile | null>(stored, null);

            if (profile) {
                // Convert date strings back to Date objects
                profile.createdAt = new Date(profile.createdAt);
                profile.lastLogin = new Date(profile.lastLogin);
                this.userProfiles.set(principal, profile);
                return profile;
            }

            return null;
        } catch (error) {
            console.error('Failed to load user profile from storage:', error);
            return null;
        }
    }

    /**
     * Check if user has a profile
     */
    async hasUserProfile(principal: string): Promise<boolean> {
        const profile = await this.getUserProfile(principal);

        if (!profile) {
            const stored = await this.loadUserProfileFromStorage(principal);
            return stored !== null;
        }

        return true;
    }

    /**
     * Get appropriate identity provider based on environment
     */
    private getIdentityProvider(): string {
        return process.env.NODE_ENV === 'development'
            ? IDENTITY_PROVIDERS.DEVELOPMENT
            : IDENTITY_PROVIDERS.PRODUCTION;
    }
}

// Export singleton instance
export const authService = new AuthService();
