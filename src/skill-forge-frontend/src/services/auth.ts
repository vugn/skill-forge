import { Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

import { IDENTITY_PROVIDERS, STORAGE_KEYS } from '../constants';
import { IAuthService, UserProfile } from '../types';
import { getStorageKey, retryAsync, safeJSONParse } from '../utils';
import { 
    canisterService, 
    backendUserToProfile, 
    profileToCreateData, 
    profileToUpdateData 
} from './canister';

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
                // Initialize canister service with the authenticated identity
                await canisterService.init(this.identity);
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
                onSuccess: async () => {
                    this.identity = this.authClient!.getIdentity();
                    // Initialize canister service with the authenticated identity
                    await canisterService.init(this.identity);
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
     * Get user profile from canister first, then fallback to cache/storage
     */
    async getUserProfile(principal: string): Promise<UserProfile | null> {
        // First check memory cache
        const cached = this.userProfiles.get(principal);
        if (cached) {
            console.log('Using cached profile for:', principal);
            return cached;
        }

        // Try to get from canister first if authenticated
        if (this.isAuthenticated()) {
            try {
                console.log('Fetching user from canister for principal:', principal);
                const backendUser = await canisterService.getCurrentUser();
                const profile = backendUserToProfile(backendUser);
                
                // Save to cache and localStorage for future use
                this.userProfiles.set(principal, profile);
                const storageKey = getStorageKey(STORAGE_KEYS.USER_PROFILE_PREFIX, principal);
                localStorage.setItem(storageKey, JSON.stringify(profile));
                
                console.log('User profile loaded from canister:', profile);
                return profile;
            } catch (error) {
                console.log('User not found in canister, trying localStorage:', error);
            }
        }

        // Fallback to localStorage
        const stored = await this.loadUserProfileFromStorage(principal);
        if (stored) {
            console.log('Using stored profile for:', principal);
            return stored;
        }

        console.log('No user profile found for principal:', principal);
        return null;
    }

    /**
     * Save user profile to storage, cache and canister
     */
    async saveUserProfile(profile: UserProfile): Promise<void> {
        try {
            // Extract username from fullName (first word) for canister compatibility
            const username = profile.fullName.split(' ')[0].toLowerCase() || 'user';
            
            // Save to canister
            if (this.isAuthenticated()) {
                const createData = profileToCreateData({
                    ...profile,
                    username
                });
                
                const authResult = await canisterService.authenticateUser(createData);
                const updatedProfile = backendUserToProfile(authResult.user);
                
                // Update local cache and storage with canister data
                this.userProfiles.set(profile.principal, updatedProfile);
                const storageKey = getStorageKey(STORAGE_KEYS.USER_PROFILE_PREFIX, profile.principal);
                localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
                return;
            }

            // Fallback to local storage only
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
     * Check if user has a profile - check backend first
     */
    async hasUserProfile(principal: string): Promise<boolean> {
        // Use getUserProfile which already checks backend first
        const profile = await this.getUserProfile(principal);
        return profile !== null;
    }

    /**
     * Update user profile in canister and local storage
     */
    async updateUserProfile(principal: string, updates: Partial<UserProfile>): Promise<void> {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            // Update in canister
            const updateData = profileToUpdateData(updates);
            const updatedBackendUser = await canisterService.updateUserProfile(updateData);
            const updatedProfile = backendUserToProfile(updatedBackendUser);

            // Update local cache and storage
            this.userProfiles.set(principal, updatedProfile);
            const storageKey = getStorageKey(STORAGE_KEYS.USER_PROFILE_PREFIX, principal);
            localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
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
