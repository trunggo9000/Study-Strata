import { useState, useEffect, useCallback } from 'react';
import { StudentProfile, Course, ScheduledCourse } from '../types/academic';

interface UseStudentReturn {
  student: StudentProfile | null;
  loading: boolean;
  error: string | null;
  updateStudent: (updates: Partial<StudentProfile>) => Promise<void>;
  addCompletedCourse: (course: Course) => Promise<void>;
  removeCompletedCourse: (courseId: string) => Promise<void>;
  updatePreferences: (preferences: Partial<StudentProfile['preferences']>) => Promise<void>;
  refreshStudent: () => Promise<void>;
}

export const useStudent = (studentId?: string): UseStudentReturn => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setStudent(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch student');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const updateStudent = useCallback(async (updates: Partial<StudentProfile>) => {
    if (!student) return;

    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update student: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setStudent(prev => prev ? { ...prev, ...updates } : null);
      } else {
        throw new Error(data.error || 'Failed to update student');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [student]);

  const addCompletedCourse = useCallback(async (course: Course) => {
    if (!student) return;

    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/students/${student.id}/completed-courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: course.id,
          grade: null, // Will be set later
          quarter: student.currentQuarter.season,
          year: student.currentQuarter.year,
          units: course.credits
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add completed course: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setStudent(prev => prev ? {
          ...prev,
          completedCourses: [...prev.completedCourses, course]
        } : null);
      } else {
        throw new Error(data.error || 'Failed to add completed course');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [student]);

  const removeCompletedCourse = useCallback(async (courseId: string) => {
    if (!student) return;

    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/students/${student.id}/completed-courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to remove completed course: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setStudent(prev => prev ? {
          ...prev,
          completedCourses: prev.completedCourses.filter(c => c.id !== courseId)
        } : null);
      } else {
        throw new Error(data.error || 'Failed to remove completed course');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [student]);

  const updatePreferences = useCallback(async (preferences: Partial<StudentProfile['preferences']>) => {
    if (!student) return;

    const updatedPreferences = {
      ...student.preferences,
      ...preferences
    };

    await updateStudent({ preferences: updatedPreferences });
  }, [student, updateStudent]);

  const refreshStudent = useCallback(async () => {
    await fetchStudent();
  }, [fetchStudent]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return {
    student,
    loading,
    error,
    updateStudent,
    addCompletedCourse,
    removeCompletedCourse,
    updatePreferences,
    refreshStudent
  };
};

// Hook for authentication state
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('auth_token', data.data.token);
        setUser(data.data.user);
        return data.data.user;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('auth_token', data.data.token);
        setUser(data.data.user);
        return data.data.user;
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        } else {
          localStorage.removeItem('auth_token');
        }
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth
  };
};
