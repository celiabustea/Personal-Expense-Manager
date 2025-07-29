import { supabase } from '../config/supabase';

export interface AuthUser {
  id: number;
  email: string;
  token: string;
}

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Failed to create user account');
    }

    return {
      id: parseInt(data.user.id),
      email: data.user.email!,
      token: data.session.access_token,
    };
  }

  /**
   * Sign in an existing user
   */
  static async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Invalid credentials');
    }

    return {
      id: parseInt(data.user.id),
      email: data.user.email!,
      token: data.session.access_token,
    };
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get the current user session
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return null;
    }

    return {
      id: parseInt(session.user.id),
      email: session.user.email!,
      token: session.access_token,
    };
  }

  /**
   * Refresh the current user's session
   */
  static async refreshSession(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session || !data.user) {
      return null;
    }

    return {
      id: parseInt(data.user.id),
      email: data.user.email!,
      token: data.session.access_token,
    };
  }

  /**
   * Reset password for a user
   */
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
