import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    this.initializeSupabase();
  }

  private initializeSupabase(): void {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase URL and Service Role Key are not configured. Supabase features will be disabled.');
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase client', error);
    }
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  // User operations
  async createUser(userData: any) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findUserByEmail(email: string) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findUserById(id: string) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, updates: any) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { error } = await this.supabase.from('users').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // Authentication methods
  async signInWithPassword(email: string, password: string) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signUpWithPassword(email: string, password: string, userData?: any) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  }

  async getCurrentUser() {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async refreshSession(refreshToken: string) {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return data;
  }
}
