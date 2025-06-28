import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, User, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { authService } from '../../services/auth';
import { UserProfile } from '../../types';
import { Button, Input, Card } from '../ui';
import { validateFullName, formatPrincipal } from '../../utils';
import { ROUTES, VALIDATION } from '../../constants';
import { useAuth } from '../../hooks';

/**
 * AccountSetup component for new user profile creation
 */
const AccountSetup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; username?: string }>({});
  
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  /**
   * Handle profile picture upload
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
      setUploading(false);
    };
    
    reader.onerror = () => {
      setUploading(false);
      alert('Failed to read image file');
    };
    
    reader.readAsDataURL(file);
  };

  /**
   * Handle full name change with validation
   */
  const handleFullNameChange = (value: string): void => {
    setFullName(value);
    
    // Auto-generate username from full name
    const generatedUsername = value.toLowerCase().replace(/\s+/g, '').slice(0, 20);
    setUsername(generatedUsername);
    
    // Clear error when user starts typing
    if (errors.fullName) {
      setErrors(prev => ({ ...prev, fullName: undefined }));
    }
  };

  /**
   * Handle username change with validation
   */
  const handleUsernameChange = (value: string): void => {
    // Only allow lowercase letters, numbers, and underscores
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanValue);
    
    // Clear error when user starts typing
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: undefined }));
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const nameValidation = validateFullName(fullName);
    const newErrors: { fullName?: string; username?: string } = {};
    
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.error;
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSave = async (): Promise<void> => {
    if (!validateForm()) return;

    setSaving(true);
    
    try {
      const principal = authService.getPrincipalText();
      
      if (!principal) {
        alert('Authentication error. Please try again.');
        return;
      }

      const profile: UserProfile = {
        principal,
        fullName: fullName.trim(),
        username: username.trim(),
        profilePicture: profilePicture || '',
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await authService.saveUserProfile(profile);
      
      // Update user state in context
      await updateUser(profile);
      
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const principal = authService.getPrincipalText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy to-midnight-blue flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Setup Your Account</h1>
          <p className="text-gray-300">Complete your profile to get started</p>
        </div>

        {/* Profile Picture Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Profile Picture
          </label>
          <div className="flex flex-col items-center">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gold/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-gold/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 bg-gold text-deep-navy p-2 rounded-full cursor-pointer hover:bg-gold/90 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            {uploading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-400 mt-2"
              >
                Uploading...
              </motion.p>
            )}
          </div>
        </div>

        {/* Full Name Input */}
        <div className="mb-6">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={handleFullNameChange}
            error={errors.fullName}
            required
            maxLength={VALIDATION.FULL_NAME.MAX_LENGTH}
          />
        </div>

        {/* Username Input */}
        <div className="mb-8">
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={handleUsernameChange}
            error={errors.username}
            required
            maxLength={20}
          />
          <p className="text-xs text-gray-400 mt-1">
            Only lowercase letters, numbers, and underscores allowed
          </p>
        </div>

        {/* Principal ID Display */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Principal ID
          </label>
          <div className="px-4 py-3 bg-slate-700/30 border border-white/10 rounded-lg">
            <p className="text-sm text-gray-400 font-mono break-all" title={principal || ''}>
              {principal ? formatPrincipal(principal) : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !fullName.trim() || !username.trim()}
          loading={saving}
          icon={Save}
          className="w-full"
          size="lg"
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </Card>
    </div>
  );
};

export default AccountSetup;
