import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Award,
  ChevronRight,
  ChevronDown,
  Filter,
  Download
} from "lucide-react";

interface QuarterData {
  id: string;
  season: 'Fall' | 'Winter' | 'Spring' | 'Summer';
  year: number;
  courses: CourseInRoadmap[];
  totalUnits: number;
  estimatedGPA: number;
  status: 'completed' | 'current' | 'planned';
  milestones: string[];
}

interface CourseInRoadmap {
  code: string;
  name: string;
  credits: number;
  type: 'core' | 'elective' | 'ge' | 'math' | 'science';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'completed' | 'enrolled' | 'planned';
  grade?: number;
  prerequisites: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  quarter: string;
  type: 'academic' | 'career' | 'personal';
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface RoadmapProps {
  studentId: string;
  major: string;
}

const Roadmap: React.FC<RoadmapProps> = ({ studentId, major }) => {
  const [quarters, setQuarters] = useState<QuarterData[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedView, setSelectedView] = useState<'timeline' | 'grid' | 'gantt'>('timeline');
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'core' | 'elective' | 'ge'>('all');

  useEffect(() => {
    loadRoadmapData();
  }, [studentId, major]);

  const loadRoadmapData = async () => {
    // Simulate API call - in production, this would fetch from backend
    const mockQuarters: QuarterData[] = [
      {
        id: 'fall-2024',
        season: 'Fall',
        year: 2024,
        courses: [
          {
            code: 'CS31',
            name: 'Introduction to Computer Science I',
            credits: 4,
            type: 'core',
            difficulty: 'medium',
            status: 'completed',
            grade: 3.7,
            prerequisites: []
          },
          {
            code: 'MATH31A',
            name: 'Differential and Integral Calculus',
            credits: 4,
            type: 'math',
            difficulty: 'hard',
            status: 'completed',
            grade: 3.3,
            prerequisites: []
          },
          {
            code: 'ENGCOMP3',
            name: 'English Composition',
            credits: 4,
            type: 'ge',
            difficulty: 'easy',
            status: 'completed',
            grade: 3.8,
            prerequisites: []
          }
        ],
        totalUnits: 12,
        estimatedGPA: 3.6,
        status: 'completed',
        milestones: ['Completed first quarter', 'Declared CS major']
      },
      {
        id: 'winter-2025',
        season: 'Winter',
        year: 2025,
        courses: [
          {
            code: 'CS32',
            name: 'Introduction to Computer Science II',
            credits: 4,
            type: 'core',
            difficulty: 'hard',
            status: 'enrolled',
            prerequisites: ['CS31']
          },
          {
            code: 'MATH31B',
            name: 'Integration and Infinite Series',
            credits: 4,
            type: 'math',
            difficulty: 'hard',
            status: 'enrolled',
            prerequisites: ['MATH31A']
          },
          {
            code: 'PHYSICS1A',
            name: 'Mechanics and Wave Motion',
            credits: 4,
            type: 'science',
            difficulty: 'medium',
            status: 'enrolled',
            prerequisites: ['MATH31A']
          }
        ],
        totalUnits: 12,
        estimatedGPA: 3.4,
        status: 'current',
        milestones: ['Complete data structures', 'Join ACM club']
      },
      {
        id: 'spring-2025',
        season: 'Spring',
        year: 2025,
        courses: [
          {
            code: 'CS33',
            name: 'Computer Organization',
            credits: 4,
            type: 'core',
            difficulty: 'hard',
            status: 'planned',
            prerequisites: ['CS32']
          },
          {
            code: 'CS35L',
            name: 'Software Construction',
            credits: 4,
            type: 'core',
            difficulty: 'medium',
            status: 'planned',
            prerequisites: ['CS32']
          },
          {
            code: 'MATH32A',
            name: 'Calculus of Several Variables',
            credits: 4,
            type: 'math',
            difficulty: 'hard',
            status: 'planned',
            prerequisites: ['MATH31B']
          }
        ],
        totalUnits: 12,
        estimatedGPA: 3.5,
        status: 'planned',
        milestones: ['Complete lower division requirements', 'Apply for internships']
      }
    ];

    const mockMilestones: Milestone[] = [
      {
        id: '1',
        title: 'Complete Lower Division CS Requirements',
        description: 'Finish CS31, CS32, CS33, CS35L',
        quarter: 'Spring 2025',
        type: 'academic',
        completed: false,
        priority: 'high'
      },
      {
        id: '2',
        title: 'Secure Summer Internship',
        description: 'Apply and secure internship at tech company',
        quarter: 'Spring 2025',
        type: 'career',
        completed: false,
        priority: 'high'
      },
      {
        id: '3',
        title: 'Maintain 3.5+ GPA',
        description: 'Keep cumulative GPA above 3.5',
        quarter: 'Ongoing',
        type: 'academic',
        completed: false,
        priority: 'medium'
      }
    ];

    setQuarters(mockQuarters);
    setMilestones(mockMilestones);
  };

  const toggleQuarterExpansion = (quarterId: string) => {
    const newExpanded = new Set(expandedQuarters);
    if (newExpanded.has(quarterId)) {
      newExpanded.delete(quarterId);
    } else {
      newExpanded.add(quarterId);
    }
    setExpandedQuarters(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'planned': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'math': return 'bg-purple-100 text-purple-800';
      case 'science': return 'bg-teal-100 text-teal-800';
      case 'elective': return 'bg-orange-100 text-orange-800';
      case 'ge': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    const totalCourses = quarters.reduce((sum, q) => sum + q.courses.length, 0);
    const completedCourses = quarters.reduce((sum, q) => 
      sum + q.courses.filter(c => c.status === 'completed').length, 0
    );
    return totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
  };

  const filteredCourses = (courses: CourseInRoadmap[]) => {
    if (filterType === 'all') return courses;
    return courses.filter(course => course.type === filterType);
  };

  const renderTimelineView = () => (
    <div className="space-y-6">
      {quarters.map((quarter, index) => (
        <div key={quarter.id} className="relative">
          {/* Timeline connector */}
          {index < quarters.length - 1 && (
            <div className="absolute left-6 top-16 w-0.5 h-20 bg-border"></div>
          )}
          
          <Card className="ml-12 shadow-sm">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleQuarterExpansion(quarter.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 w-4 h-4 rounded-full ${getStatusColor(quarter.status)} border-2 border-background`}></div>
                  
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{quarter.season} {quarter.year}</span>
                      <Badge variant="outline">{quarter.totalUnits} units</Badge>
                      {quarter.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800">
                          GPA: {quarter.estimatedGPA.toFixed(1)}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {quarter.courses.length} courses • {quarter.status}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={quarter.status === 'current' ? 'default' : 'secondary'}>
                    {quarter.status}
                  </Badge>
                  {expandedQuarters.has(quarter.id) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </div>
            </CardHeader>
            
            {expandedQuarters.has(quarter.id) && (
              <CardContent className="pt-0">
                <div className="grid gap-3">
                  {filteredCourses(quarter.courses).map((course) => (
                    <div key={course.code} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{course.code}</span>
                          <Badge className={getTypeColor(course.type)} variant="secondary">
                            {course.type}
                          </Badge>
                          <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                            {course.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.credits} units
                          {course.prerequisites.length > 0 && (
                            <span> • Prerequisites: {course.prerequisites.join(', ')}</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={course.status === 'completed' ? 'default' : 'outline'}>
                          {course.status}
                        </Badge>
                        {course.grade && (
                          <p className="text-sm font-medium mt-1">
                            {course.grade.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {quarter.milestones.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Milestones
                    </h4>
                    <ul className="space-y-1">
                      {quarter.milestones.map((milestone, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center">
                          <ChevronRight className="h-3 w-3 mr-1" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quarters.map((quarter) => (
        <Card key={quarter.id} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{quarter.season} {quarter.year}</span>
              <Badge variant={quarter.status === 'current' ? 'default' : 'secondary'}>
                {quarter.status}
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {quarter.courses.length} courses
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {quarter.totalUnits} units
              </span>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 mb-4">
              {quarter.courses.map((course) => (
                <div key={course.code} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{course.code}</span>
                  <div className="flex items-center space-x-1">
                    <Badge className={getTypeColor(course.type)} variant="secondary" size="sm">
                      {course.type}
                    </Badge>
                    {course.grade && (
                      <span className="text-xs">{course.grade.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {quarter.status === 'completed' && (
              <div className="flex items-center justify-between text-sm">
                <span>Quarter GPA:</span>
                <span className="font-medium">{quarter.estimatedGPA.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMilestones = () => (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <Card key={milestone.id} className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium">{milestone.title}</h3>
                  <Badge variant={milestone.priority === 'high' ? 'destructive' : 
                                 milestone.priority === 'medium' ? 'default' : 'secondary'}>
                    {milestone.priority}
                  </Badge>
                  <Badge variant="outline">{milestone.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                <p className="text-xs text-muted-foreground">Target: {milestone.quarter}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {milestone.completed ? (
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                ) : (
                  <Badge variant="outline">In Progress</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Academic Roadmap - {major}
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{calculateProgress().toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{quarters.reduce((sum, q) => sum + q.totalUnits, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">3.5</div>
              <div className="text-sm text-muted-foreground">Cumulative GPA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Spring 2027</div>
              <div className="text-sm text-muted-foreground">Expected Graduation</div>
            </div>
          </div>
          
          <Progress value={calculateProgress()} className="h-2" />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All Courses</option>
            <option value="core">Core</option>
            <option value="elective">Electives</option>
            <option value="ge">General Ed</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <Tabs value={selectedView} className="space-y-6">
        <TabsContent value="timeline">
          {renderTimelineView()}
        </TabsContent>
        
        <TabsContent value="grid">
          {renderGridView()}
        </TabsContent>
        
        <TabsContent value="milestones">
          {renderMilestones()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Roadmap;
