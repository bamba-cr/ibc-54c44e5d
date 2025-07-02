
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_admin: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: { username?: string; full_name?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getPendingUsers: () => Promise<PendingUser[]>;
  approveUser: (userId: string) => Promise<{ error: any }>;
  rejectUser: (userId: string, reason?: string) => Promise<{ error: any }>;
  promoteToAdmin: (userId: string) => Promise<{ error: any }>;
}
