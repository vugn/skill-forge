import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { UserProfile } from '../types';
import { idlFactory } from '../../../declarations/skill-forge-backend';

// Backend types for canister communication
export interface BackendUser {
    id: Principal;
    username: string;
    fullName: string[]; // Optional in Candid is represented as array
    profilePicture: string[]; // Optional in Candid is represented as array
    createdAt: bigint;
    lastLogin: bigint;
}

export interface UserCreateData {
    username: string;
    fullName: string[]; // Optional in Candid is represented as array
    profilePicture: string[]; // Optional in Candid is represented as array
}

export interface UserUpdateData {
    username?: string[];
    fullName?: string[]; // Optional in Candid is represented as array
    profilePicture?: string[]; // Optional in Candid is represented as array
}

export interface AuthResult {
    user: BackendUser;
    isNewUser: boolean;
}

// Convert backend user to frontend UserProfile
export function backendUserToProfile(backendUser: BackendUser): UserProfile {
    return {
        principal: backendUser.id.toString(),
        fullName: (backendUser.fullName && backendUser.fullName.length > 0) ? backendUser.fullName[0] : '',
        username: backendUser.username,
        profilePicture: (backendUser.profilePicture && backendUser.profilePicture.length > 0) ? backendUser.profilePicture[0] : '',
        createdAt: new Date(Number(backendUser.createdAt) / 1000000), // Convert from nanoseconds
        lastLogin: new Date(Number(backendUser.lastLogin) / 1000000), // Convert from nanoseconds
    };
}

// Convert frontend UserProfile to backend create data
export function profileToCreateData(profile: Partial<UserProfile> & { username: string }): UserCreateData {
    return {
        username: profile.username,
        fullName: profile.fullName ? [profile.fullName] : [],
        profilePicture: profile.profilePicture ? [profile.profilePicture] : [],
    };
}

// Convert frontend UserProfile to backend update data
export function profileToUpdateData(profile: Partial<UserProfile>): UserUpdateData {
    const updateData: UserUpdateData = {};
    
    if (profile.username !== undefined) {
        updateData.username = [profile.username];
    }
    if (profile.fullName !== undefined) {
        updateData.fullName = profile.fullName ? [profile.fullName] : [];
    }
    if (profile.profilePicture !== undefined) {
        updateData.profilePicture = profile.profilePicture ? [profile.profilePicture] : [];
    }
    
    return updateData;
}

export class CanisterService {
    private agent: HttpAgent | null = null;
    
    private actor: any = null;

    
    async init(identity?: any): Promise<void> {
        const host = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:4943' 
            : 'https://ic0.app';

        this.agent = await  HttpAgent.create({ 
            host: host,
            identity:identity 
        });

        // Fetch root key for development
        if (process.env.NODE_ENV === 'development') {
            await this.agent.fetchRootKey();
        }

        // Get canister ID from environment or use default
        const canisterId = process.env.REACT_APP_CANISTER_ID_SKILL_FORGE_BACKEND || 
                          process.env.CANISTER_ID_SKILL_FORGE_BACKEND ||
                          'rrkah-fqaaa-aaaaa-aaaaq-cai'; // Default local canister ID

        this.actor = Actor.createActor(idlFactory, {
            agent: this.agent,
            canisterId,
        });
    }

    async authenticateUser(userData: UserCreateData): Promise<AuthResult> {
        if (!this.actor) {
            throw new Error('Canister service not initialized');
        }

        const result = await this.actor.authenticateUser(userData);
        
        if ('ok' in result) {
            return result.ok;
        } else {
            throw new Error(result.err);
        }
    }

    async getCurrentUser(): Promise<BackendUser> {
        if (!this.actor) {
            throw new Error('Canister service not initialized');
        }

        const result = await this.actor.getCurrentUser();
        
        if ('ok' in result) {
            return result.ok;
        } else {
            throw new Error(result.err);
        }
    }

    async updateUserProfile(updateData: UserUpdateData): Promise<BackendUser> {
        if (!this.actor) {
            throw new Error('Canister service not initialized');
        }

        const result = await this.actor.updateUserProfile(updateData);
        
        if ('ok' in result) {
            return result.ok;
        } else {
            throw new Error(result.err);
        }
    }

    async userExists(): Promise<boolean> {
        if (!this.actor) {
            throw new Error('Canister service not initialized');
        }

        return await this.actor.userExists();
    }

    async getUserByUsername(username: string): Promise<BackendUser | null> {
        if (!this.actor) {
            throw new Error('Canister service not initialized');
        }

        const result = await this.actor.getUserByUsername(username);
        return result.length > 0 ? result[0] : null;
    }
}

export const canisterService = new CanisterService();
