
export interface User {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_admin: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  getPendingUsers: () => Promise<PendingUser[]>;
  approveUser: (userId: string) => Promise<{ error: any }>;
  rejectUser: (userId: string, reason?: string) => Promise<{ error: any }>;
  promoteToAdmin: (userId: string) => Promise<{ error: any }>;
}
