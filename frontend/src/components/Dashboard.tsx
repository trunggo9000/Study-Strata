import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  Target,
  Award,
  Users,
  Bell,
  ChevronRight,
  Plus,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DashboardStats {
  totalUnits: number;
  completedCourses: number;
  currentGPA: number;
  graduationProgress: number;
  upcomingDeadlines: number;
}

interface RecentActivity {
  id: string;
  type: 'course_added' | 'schedule_updated' | 'grade_received' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: Date;
  course?: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'registration' | 'deadline';
  date: Date;
  course?: string;
  priority: 'high' | 'medium' | 'low';
}

interface CourseProgress {
  courseId: string;
  title: string;
  progress: number;
  grade: string;
  units: number;
  quarter: string;
}

interface Recommendation {
  id: string;
  type: 'course' | 'schedule' | 'career' | 'research';
  title: string;
  description: string;
  priority: number;
  actionable: boolean;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUnits: 120,
    completedCourses: 24,
    currentGPA: 3.75,
    graduationProgress: 67,
    upcomingDeadlines: 3
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'course_added',
      title: 'Course Added',
      description: 'CS188 - Introduction to Artificial Intelligence added to Spring 2024',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      course: 'CS188'
    },
    {
      id: '2',
      type: 'grade_received',
      title: 'Grade Posted',
      description: 'Received A- in CS61B - Data Structures',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      course: 'CS61B'
    },
    {
      id: '3',
      type: 'schedule_updated',
      title: 'Schedule Optimized',
      description: 'AI advisor suggested schedule improvements for better workload balance',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'milestone_reached',
      title: 'Milestone Achieved',
      description: 'Completed 50% of major requirements',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: '1',
      title: 'CS61B Project 2 Due',
      type: 'assignment',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      course: 'CS61B',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Spring Registration Opens',
      type: 'registration',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: '3',
      title: 'MATH53 Midterm',
      type: 'exam',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      course: 'MATH53',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Research Proposal Deadline',
      type: 'deadline',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      priority: 'medium'
    }
  ]);

  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([
    {
      courseId: 'CS61B',
      title: 'Data Structures',
      progress: 85,
      grade: 'A-',
      units: 4,
      quarter: 'Fall 2024'
    },
    {
      courseId: 'MATH53',
      title: 'Multivariable Calculus',
      progress: 70,
      grade: 'B+',
      units: 4,
      quarter: 'Fall 2024'
    },
    {
      courseId: 'CS70',
      title: 'Discrete Mathematics',
      progress: 60,
      grade: 'A',
      units: 4,
      quarter: 'Fall 2024'
    },
    {
      courseId: 'ENGL1A',
      title: 'Reading and Composition',
      progress: 90,
      grade: 'A',
      units: 4,
      quarter: 'Fall 2024'
    }
  ]);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'course',
      title: 'Consider CS188 for Spring',
      description: 'Based on your strong performance in CS61B, CS188 would be an excellent next step',
      priority: 1,
      actionable: true
    },
    {
      id: '2',
      type: 'schedule',
      title: 'Balance Course Load',
      description: 'Your current schedule is heavy on technical courses. Consider adding a breadth requirement',
      priority: 2,
      actionable: true
    },
    {
      id: '3',
      type: 'research',
      title: 'Research Opportunities',
      description: 'Prof. Johnson\'s AI lab is accepting undergraduates for Spring research positions',
      priority: 3,
      actionable: true
    },
    {
      id: '4',
      type: 'career',
      title: 'Summer Internship Prep',
      description: 'Start preparing for summer internship applications. Technical interview prep recommended',
      priority: 4,
      actionable: false
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_added': return <Plus className="h-4 w-4 text-blue-600" />;
      case 'grade_received': return <Award className="h-4 w-4 text-green-600" />;
      case 'schedule_updated': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'milestone_reached': return <Target className="h-4 w-4 text-orange-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'exam': return <Clock className="h-4 w-4 text-red-600" />;
      case 'registration': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'deadline': return <Target className="h-4 w-4 text-orange-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatUpcoming = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `In ${diffInDays} days`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your academic overview.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-2xl font-bold">{stats.totalUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Current GPA</p>
                <p className="text-2xl font-bold">{stats.currentGPA}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold">{stats.graduationProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Deadlines</p>
                <p className="text-2xl font-bold">{stats.upcomingDeadlines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Courses */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Current Courses</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseProgress.map((course) => (
                  <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{course.courseId}</h4>
                          <p className="text-sm text-gray-600">{course.title}</p>
                        </div>
                        <Badge className={getGradeColor(course.grade)}>
                          {course.grade}
                        </Badge>
                        <Badge variant="outline">{course.units} units</Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Graduation Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Graduation Progress</CardTitle>
              <CardDescription>Track your progress towards degree completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{stats.graduationProgress}%</span>
                </div>
                <Progress value={stats.graduationProgress} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Major Requirements</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>General Education</span>
                    <span>80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">120</p>
                  <p className="text-sm text-gray-600">Units Earned</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">60</p>
                  <p className="text-sm text-gray-600">Units Remaining</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">3.5</p>
                  <p className="text-sm text-gray-600">Years to Graduate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>AI Recommendations</span>
              </CardTitle>
              <CardDescription>Personalized suggestions to optimize your academic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      {rec.actionable && (
                        <Button variant="outline" size="sm" className="mt-2">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-gray-500">{formatUpcoming(event.date)}</p>
                        {event.course && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {event.course}
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs ${getPriorityColor(event.priority)}`}>
                        {event.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Plan Next Semester
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find Study Groups
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Set Academic Goals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
