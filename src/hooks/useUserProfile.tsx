
import { useState, useCallback } from 'react';
import { UserProfile } from '@/types/auth';
import { authService } from '@/services/authService';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const profileData = await authService.fetchUserProfile(userId);
      console.log('User profile data received:', profileData);
      // Ensure the profile data includes all required fields
      const completeProfile: UserProfile = {
        ...profileData,
        rejection_reason: (profileData as any).rejection_reason || null
      };
      setProfile(completeProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Erro ao carregar perfil do usuário');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    clearProfile,
    setProfile
  };
};
