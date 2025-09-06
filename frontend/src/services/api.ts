import { 
  StudentProfile, 
  Course, 
  ScheduleGenerationRequest, 
  ScheduleOptimizationResult,
  AdvisorQuery,
  AdvisorResponse,
  ApiResponse,
  PaginatedResponse,
  AcademicPlan
} from '../types/academic';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Student profile endpoints
  async getStudentProfile(studentId: string) {
    return this.request<StudentProfile>(`/students/${studentId}`);
  }

  async updateStudentProfile(studentId: string, updates: Partial<StudentProfile>) {
    return this.request<StudentProfile>(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addCompletedCourse(studentId: string, courseData: {
    courseId: string;
    grade: string;
    quarter: string;
    year: number;
    units: number;
  }) {
    return this.request(`/students/${studentId}/completed-courses`, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async removeCompletedCourse(studentId: string, courseId: string) {
    return this.request(`/students/${studentId}/completed-courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  // Course endpoints
  async getCourses(params?: {
    type?: string;
    quarter?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<PaginatedResponse<Course>>(endpoint);
  }

  async getCourse(courseId: string) {
    return this.request<Course>(`/courses/${courseId}`);
  }

  async checkPrerequisites(studentId: string, courseId: string) {
    return this.request<{
      satisfied: boolean;
      missing: string[];
      recommendations: string[];
    }>(`/courses/${courseId}/prerequisites?studentId=${studentId}`);
  }

  // Schedule endpoints
  async generateSchedule(request: ScheduleGenerationRequest) {
    return this.request<ScheduleOptimizationResult>('/schedule/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async optimizeSchedule(scheduleId: string, constraints: any) {
    return this.request<ScheduleOptimizationResult>(`/schedule/${scheduleId}/optimize`, {
      method: 'POST',
      body: JSON.stringify({ constraints }),
    });
  }

  async detectConflicts(courses: any[]) {
    return this.request<any>('/schedule/conflicts', {
      method: 'POST',
      body: JSON.stringify({ courses }),
    });
  }

  async saveSchedule(studentId: string, schedule: any) {
    return this.request<AcademicPlan>('/schedule/save', {
      method: 'POST',
      body: JSON.stringify({ studentId, schedule }),
    });
  }

  async getSchedules(studentId: string) {
    return this.request<AcademicPlan[]>(`/schedule/student/${studentId}`);
  }

  async getSchedule(scheduleId: string) {
    return this.request<AcademicPlan>(`/schedule/${scheduleId}`);
  }

  async deleteSchedule(scheduleId: string) {
    return this.request(`/schedule/${scheduleId}`, {
      method: 'DELETE',
    });
  }

  // AI Advisor endpoints
  async queryAdvisor(query: AdvisorQuery) {
    return this.request<AdvisorResponse>('/advisor/query', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async getWhatIfAnalysis(studentId: string, scenario: any) {
    return this.request<any>('/advisor/what-if', {
      method: 'POST',
      body: JSON.stringify({ studentId, scenario }),
    });
  }

  async getCourseRecommendations(studentId: string, filters?: any) {
    return this.request<any>('/advisor/recommendations', {
      method: 'POST',
      body: JSON.stringify({ studentId, filters }),
    });
  }

  async getCareerGuidance(studentId: string, careerPath: string) {
    return this.request<any>('/advisor/career-guidance', {
      method: 'POST',
      body: JSON.stringify({ studentId, careerPath }),
    });
  }

  async getPerformanceAnalysis(studentId: string) {
    return this.request<any>(`/advisor/performance/${studentId}`);
  }

  // Utility methods
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // File upload helper
  async uploadFile(file: File, endpoint: string) {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual service functions for convenience
export const authService = {
  login: (email: string, password: string) => apiClient.login(email, password),
  register: (email: string, password: string, name: string) => apiClient.register(email, password, name),
  logout: () => apiClient.logout(),
  refreshToken: () => apiClient.refreshToken(),
  getCurrentUser: () => apiClient.getCurrentUser(),
};

export const studentService = {
  getProfile: (studentId: string) => apiClient.getStudentProfile(studentId),
  updateProfile: (studentId: string, updates: Partial<StudentProfile>) => 
    apiClient.updateStudentProfile(studentId, updates),
  addCompletedCourse: (studentId: string, courseData: any) => 
    apiClient.addCompletedCourse(studentId, courseData),
  removeCompletedCourse: (studentId: string, courseId: string) => 
    apiClient.removeCompletedCourse(studentId, courseId),
};

export const courseService = {
  getCourses: (params?: any) => apiClient.getCourses(params),
  getCourse: (courseId: string) => apiClient.getCourse(courseId),
  checkPrerequisites: (studentId: string, courseId: string) => 
    apiClient.checkPrerequisites(studentId, courseId),
};

export const scheduleService = {
  generate: (request: ScheduleGenerationRequest) => apiClient.generateSchedule(request),
  optimize: (scheduleId: string, constraints: any) => apiClient.optimizeSchedule(scheduleId, constraints),
  detectConflicts: (courses: any[]) => apiClient.detectConflicts(courses),
  save: (studentId: string, schedule: any) => apiClient.saveSchedule(studentId, schedule),
  getAll: (studentId: string) => apiClient.getSchedules(studentId),
  get: (scheduleId: string) => apiClient.getSchedule(scheduleId),
  delete: (scheduleId: string) => apiClient.deleteSchedule(scheduleId),
};

export const advisorService = {
  query: (query: AdvisorQuery) => apiClient.queryAdvisor(query),
  getWhatIfAnalysis: (studentId: string, scenario: any) => 
    apiClient.getWhatIfAnalysis(studentId, scenario),
  getRecommendations: (studentId: string, filters?: any) => 
    apiClient.getCourseRecommendations(studentId, filters),
  getCareerGuidance: (studentId: string, careerPath: string) => 
    apiClient.getCareerGuidance(studentId, careerPath),
  getPerformanceAnalysis: (studentId: string) => apiClient.getPerformanceAnalysis(studentId),
};

export default apiClient;
