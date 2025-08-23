const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001';
const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:8000';

export interface CreateProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  job_title?: string;
  subscribe_newsletter?: boolean;
  is_active?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JDGeneratorRequest {
  job_title: string;
  company_name: string;
  location?: string;
  tone?: string;
  job_details?: string;
}

export interface JDGeneratorResponse {
  job_description: string;
  success: boolean;
  model_used: string;
  tokens_used?: number;
}

export interface Template {
  title: string;
  department: string;
  key_responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
}

export interface TemplatesResponse {
  templates: Record<string, Template>;
}

class ApiGatewayService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // User Profile Management
  async registerUser(profileData: CreateProfileData): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/auth/profile/${userId}`, {
      method: 'GET',
    });
  }

  async updateUserProfile(userId: string, updates: Partial<CreateProfileData>): Promise<ApiResponse<any>> {
    return this.request(`/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

class LLMService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Job Description Generation
  async generateJobDescription(data: JDGeneratorRequest): Promise<JDGeneratorResponse> {
    return this.request<JDGeneratorResponse>('/generate-jd', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get Job Description Templates
  async getJobDescriptionTemplates(): Promise<TemplatesResponse> {
    return this.request<TemplatesResponse>('/job-description-templates');
  }
}

export const apiGatewayService = new ApiGatewayService(API_GATEWAY_URL);
export const llmService = new LLMService(LLM_SERVICE_URL);