import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export interface UserProfile {
    principal: string;
    fullName: string;
    username: string;
    profilePicture: string;
    createdAt: Date;
    lastLogin: Date;
    level: number;
    experience: number;
    totalExperience: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: UserProfile | null;
    loading: boolean;
    checkingProfile: boolean;
}

export interface AuthContextType extends AuthState {
    login: () => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (updatedData: Partial<UserProfile>) => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

export interface IAuthService {
    init(): Promise<void>;
    login(): Promise<boolean>;
    logout(): Promise<void>;
    isAuthenticated(): boolean;
    getPrincipal(): Principal | null;
    getPrincipalText(): string | null;
    getIdentity(): Identity | null;
    getUserProfile(principal: string): Promise<UserProfile | null>;
    saveUserProfile(profile: UserProfile): Promise<void>;
    hasUserProfile(principal: string): Promise<boolean>;
    loadUserProfileFromStorage(principal: string): Promise<UserProfile | null>; // Add this if needed
    saveUserProfileToStorage(principal: string, profile: UserProfile): Promise<void>; // Add this if needed
}

export interface LevelInfo {
    level: number;
    currentExp: number;
    expToNextLevel: number;
    totalExp: number;
}

export interface LevelUpResult {
    newLevel: number;
    expGained: number;
    leveledUp: boolean;
    newLevelInfo: LevelInfo;
}

export interface ExperienceGain {
    amount: number;
    source: string;
    timestamp: Date;
}

export interface NavLink {
    to: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface Quest {
    id: number;
    title: string;
    description: string;
    progress: number;
    total: number;
    xpReward: number;
    difficulty: string;
    timeLeft: string;
    category: string;
}

export interface UserData {
    name: string;
    level: number;
    currentXP: number;
    nextLevelXP: number;
    totalXP: number;
    streak: number;
    skillsCompleted: number;
    questsCompleted: number;
    rank: string;
    avatar: string;
}