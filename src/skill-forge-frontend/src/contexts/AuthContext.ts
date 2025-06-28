import { createContext } from 'react';
import { AuthContextType } from '../types';

/**
 * Authentication Context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
