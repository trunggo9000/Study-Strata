import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePickerWithRange } from './ui/date-range-picker';
import { Separator } from './ui/separator';

interface AnalyticsData {
  performanceMetrics: {
    averageGPA: number;
    completionRate: number;
    timeToGraduation: number;
    courseLoad: number;
  };
  courseAnalytics: {
    popularCourses: Array<{ course: string; enrollment: number; rating: number }>;
    difficultyDistribution: Array<{ difficulty: string; count: number }>;
    departmentBreakdown: Array<{ department: string; courses: number; units: number }>;
  };
  progressTracking: {
    semesterProgress: Array<{ semester: string; gpa: number; units: number; courses: number }>;
    majorProgress: Array<{ requirement: string; completed: number; total: number }>;
    graduationTimeline: Array<{ year: string; projected: number; actual: number }>;
  };
  comparativeAnalysis: {
    peerComparison: Array<{ metric: string; you: number; average: number; top10: number }>;
    cohortPerformance: Array<{ cohort: string; avgGPA: number; graduationRate: number }>;
  };
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('gpa');
  const [loading, setLoading] = useState(false);

  // Mock analytics data
  const mockData: AnalyticsData = {
    performanceMetrics: {
      averageGPA: 3.75,
      completionRate: 92,
      timeToGraduation: 4.2,
      courseLoad: 16
    },
    courseAnalytics: {
      popularCourses: [
        { course: 'CS61A', enrollment: 450, rating: 4.2 },
        { course: 'CS61B', enrollment: 380, rating: 4.0 },
        { course: 'CS188', enrollment: 320, rating: 4.5 },
        { course: 'CS189', enrollment: 280, rating: 4.3 },
        { course: 'CS170', enrollment: 250, rating: 3.8 }
      ],
      difficultyDistribution: [
        { difficulty: 'Easy (1-2)', count: 12 },
        { difficulty: 'Medium (3)', count: 18 },
        { difficulty: 'Hard (4-5)', count: 15 }
      ],
      departmentBreakdown: [
        { department: 'Computer Science', courses: 15, units: 60 },
        { department: 'Mathematics', courses: 8, units: 32 },
        { department: 'Physics', courses: 4, units: 16 },
        { department: 'English', courses: 3, units: 12 }
      ]
    },
    progressTracking: {
      semesterProgress: [
        { semester: 'Fall 2022', gpa: 3.6, units: 16, courses: 4 },
        { semester: 'Spring 2023', gpa: 3.8, units: 18, courses: 4 },
        { semester: 'Fall 2023', gpa: 3.7, units: 16, courses: 4 },
        { semester: 'Spring 2024', gpa: 3.9, units: 17, courses: 4 },
        { semester: 'Fall 2024', gpa: 3.75, units: 16, courses: 4 }
      ],
      majorProgress: [
        { requirement: 'Core Courses', completed: 12, total: 16 },
        { requirement: 'Upper Division', completed: 8, total: 12 },
        { requirement: 'Electives', completed: 6, total: 8 },
        { requirement: 'Capstone', completed: 0, total: 1 }
      ],
      graduationTimeline: [
        { year: '2022', projected: 25, actual: 24 },
        { year: '2023', projected: 50, actual: 52 },
        { year: '2024', projected: 75, actual: 73 },
        { year: '2025', projected: 100, actual: 0 }
      ]
    },
    comparativeAnalysis: {
      peerComparison: [
        { metric: 'GPA', you: 3.75, average: 3.4, top10: 3.9 },
        { metric: 'Units/Semester', you: 16, average: 15, top10: 18 },
        { metric: 'Course Difficulty', you: 3.8, average: 3.2, top10: 4.2 },
        { metric: 'Completion Rate', you: 92, average: 85, top10: 98 }
      ],
      cohortPerformance: [
        { cohort: 'CS 2022', avgGPA: 3.4, graduationRate: 88 },
        { cohort: 'CS 2023', avgGPA: 3.5, graduationRate: 90 },
        { cohort: 'CS 2024', avgGPA: 3.6, graduationRate: 92 },
        { cohort: 'CS 2025', avgGPA: 3.7, graduationRate: 94 }
      ]
    }
  };

  useEffect(() => {
    setData(mockData);
  }, []);

  const metricCards: MetricCard[] = [
    {
      title: 'Average GPA',
      value: data?.performanceMetrics.averageGPA.toFixed(2) || '0.00',
      change: 5.2,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      title: 'Completion Rate',
      value: `${data?.performanceMetrics.completionRate || 0}%`,
      change: 2.1,
      icon: <Target className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      title: 'Time to Graduate',
      value: `${data?.performanceMetrics.timeToGraduation || 0} years`,
      change: -0.3,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600'
    },
    {
      title: 'Avg Course Load',
      value: `${data?.performanceMetrics.courseLoad || 0} units`,
      change: 1.5,
      icon: <BookOpen className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const exportData = () => {
    // Mock export functionality
    console.log('Exporting analytics data...');
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your academic performance</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester">This Semester</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className={`flex items-center text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{Math.abs(metric.change)}% from last semester</span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg bg-gray-100 ${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPA Trend */}
            <Card>
              <CardHeader>
                <CardTitle>GPA Trend</CardTitle>
                <CardDescription>Your academic performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.progressTracking.semesterProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[3.0, 4.0]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Units per Semester */}
            <Card>
              <CardHeader>
                <CardTitle>Course Load Analysis</CardTitle>
                <CardDescription>Units and courses taken each semester</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.progressTracking.semesterProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="units" fill="#8884d8" />
                    <Bar dataKey="courses" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Graduation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Graduation Timeline</CardTitle>
              <CardDescription>Progress towards degree completion</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.progressTracking.graduationTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="projected" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollment & Ratings</CardTitle>
                <CardDescription>Most popular courses and their ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.courseAnalytics.popularCourses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrollment" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Course Difficulty Distribution</CardTitle>
                <CardDescription>Breakdown of courses by difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.courseAnalytics.difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.courseAnalytics.difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Department Analysis</CardTitle>
              <CardDescription>Course distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.courseAnalytics.departmentBreakdown.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{dept.department}</h4>
                      <p className="text-sm text-gray-600">{dept.courses} courses • {dept.units} units</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{dept.courses} courses</Badge>
                      <Badge variant="secondary">{dept.units} units</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Major Requirements Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Major Requirements</CardTitle>
                <CardDescription>Progress towards degree completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.progressTracking.majorProgress.map((req, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{req.requirement}</span>
                      <span>{req.completed}/{req.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(req.completed / req.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Academic Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Milestones</CardTitle>
                <CardDescription>Key achievements and upcoming goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Completed Lower Division</p>
                      <p className="text-xs text-gray-500">Fall 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Declared Major</p>
                      <p className="text-xs text-gray-500">Spring 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Upper Division Progress</p>
                      <p className="text-xs text-gray-500">In Progress</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Capstone Project</p>
                      <p className="text-xs text-gray-500">Spring 2025</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peer Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Peer Comparison</CardTitle>
                <CardDescription>How you compare to your peers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.comparativeAnalysis.peerComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="you" fill="#8884d8" name="You" />
                    <Bar dataKey="average" fill="#82ca9d" name="Class Average" />
                    <Bar dataKey="top10" fill="#ffc658" name="Top 10%" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cohort Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Cohort Performance</CardTitle>
                <CardDescription>Performance trends across different cohorts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.comparativeAnalysis.cohortPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avgGPA" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Average GPA"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="graduationRate" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Graduation Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Your standing relative to peers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Top 25%</div>
                  <div className="text-sm text-gray-600">Overall Ranking</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">3.75</div>
                  <div className="text-sm text-gray-600">Your GPA</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">92%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
