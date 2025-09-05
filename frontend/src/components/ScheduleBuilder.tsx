import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';

interface Course {
  id: string;
  title: string;
  units: number;
  difficulty: number;
  offered: string[];
  tags: string[];
  prerequisites: string[];
  description?: string;
}

interface QuarterSchedule {
  quarter: string;
  year: number;
  courses: Course[];
  totalUnits: number;
  averageDifficulty: number;
  conflicts: string[];
}

interface ScheduleConstraints {
  maxUnitsPerQuarter: number;
  minUnitsPerQuarter: number;
  maxDifficultyPerQuarter: number;
  avoidBackToBackDifficult: boolean;
  preferredQuarters: string[];
  graduationTimeline: string;
}

interface ScheduleBuilderProps {
  initialSchedule?: QuarterSchedule[];
  availableCourses?: Course[];
  onScheduleChange?: (schedule: QuarterSchedule[]) => void;
  onSave?: (schedule: QuarterSchedule[], constraints: ScheduleConstraints) => void;
}

const QUARTERS = ['Fall', 'Winter', 'Spring', 'Summer'];
const CURRENT_YEAR = 2024;

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({
  initialSchedule = [],
  availableCourses = [],
  onScheduleChange,
  onSave
}) => {
  const [schedule, setSchedule] = useState<QuarterSchedule[]>(initialSchedule);
  const [constraints, setConstraints] = useState<ScheduleConstraints>({
    maxUnitsPerQuarter: 20,
    minUnitsPerQuarter: 12,
    maxDifficultyPerQuarter: 4.0,
    avoidBackToBackDifficult: true,
    preferredQuarters: ['Fall', 'Spring'],
    graduationTimeline: '4_years'
  });
  const [showConstraints, setShowConstraints] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock available courses
  const mockCourses: Course[] = [
    {
      id: 'CS61A',
      title: 'Structure and Interpretation of Computer Programs',
      units: 4,
      difficulty: 4,
      offered: ['Fall', 'Spring'],
      tags: ['programming', 'theory', 'core'],
      prerequisites: ['CS1']
    },
    {
      id: 'CS61B',
      title: 'Data Structures',
      units: 4,
      difficulty: 4,
      offered: ['Fall', 'Winter', 'Spring'],
      tags: ['data structures', 'algorithms', 'core'],
      prerequisites: ['CS61A']
    },
    {
      id: 'MATH53',
      title: 'Multivariable Calculus',
      units: 4,
      difficulty: 4,
      offered: ['Fall', 'Winter', 'Spring'],
      tags: ['math', 'calculus', 'required'],
      prerequisites: ['MATH1B']
    },
    {
      id: 'CS188',
      title: 'Introduction to Artificial Intelligence',
      units: 4,
      difficulty: 4,
      offered: ['Fall', 'Spring'],
      tags: ['AI', 'machine learning', 'elective'],
      prerequisites: ['CS61B', 'CS70']
    }
  ];

  const [courses] = useState<Course[]>(availableCourses.length > 0 ? availableCourses : mockCourses);

  useEffect(() => {
    if (initialSchedule.length === 0) {
      // Initialize with empty quarters for 4 years
      const emptySchedule: QuarterSchedule[] = [];
      for (let year = 0; year < 4; year++) {
        for (const quarter of ['Fall', 'Winter', 'Spring']) {
          emptySchedule.push({
            quarter: `${quarter} ${CURRENT_YEAR + year}`,
            year: CURRENT_YEAR + year,
            courses: [],
            totalUnits: 0,
            averageDifficulty: 0,
            conflicts: []
          });
        }
      }
      setSchedule(emptySchedule);
    }
  }, [initialSchedule]);

  const validateSchedule = useCallback((scheduleToValidate: QuarterSchedule[]) => {
    const errors: string[] = [];
    const completedCourses = new Set<string>();

    scheduleToValidate.forEach((quarter, index) => {
      // Check unit constraints
      if (quarter.totalUnits > constraints.maxUnitsPerQuarter) {
        errors.push(`${quarter.quarter}: Exceeds maximum units (${quarter.totalUnits}/${constraints.maxUnitsPerQuarter})`);
      }
      if (quarter.courses.length > 0 && quarter.totalUnits < constraints.minUnitsPerQuarter) {
        errors.push(`${quarter.quarter}: Below minimum units (${quarter.totalUnits}/${constraints.minUnitsPerQuarter})`);
      }

      // Check difficulty constraints
      if (quarter.averageDifficulty > constraints.maxDifficultyPerQuarter) {
        errors.push(`${quarter.quarter}: Average difficulty too high (${quarter.averageDifficulty.toFixed(1)}/${constraints.maxDifficultyPerQuarter})`);
      }

      // Check prerequisites
      quarter.courses.forEach(course => {
        course.prerequisites.forEach(prereq => {
          if (!completedCourses.has(prereq)) {
            errors.push(`${quarter.quarter}: ${course.id} missing prerequisite ${prereq}`);
          }
        });
      });

      // Check course availability
      quarter.courses.forEach(course => {
        const season = quarter.quarter.split(' ')[0];
        if (!course.offered.includes(season)) {
          errors.push(`${quarter.quarter}: ${course.id} not offered in ${season}`);
        }
      });

      // Add completed courses
      quarter.courses.forEach(course => {
        completedCourses.add(course.id);
      });
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [constraints]);

  const calculateQuarterStats = (courses: Course[]) => {
    const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
    const averageDifficulty = courses.length > 0 
      ? courses.reduce((sum, course) => sum + course.difficulty, 0) / courses.length 
      : 0;
    return { totalUnits, averageDifficulty };
  };

  const updateQuarter = (quarterIndex: number, courses: Course[]) => {
    const newSchedule = [...schedule];
    const { totalUnits, averageDifficulty } = calculateQuarterStats(courses);
    
    newSchedule[quarterIndex] = {
      ...newSchedule[quarterIndex],
      courses,
      totalUnits,
      averageDifficulty,
      conflicts: [] // Would calculate conflicts here
    };

    setSchedule(newSchedule);
    validateSchedule(newSchedule);
    onScheduleChange?.(newSchedule);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceQuarterIndex = parseInt(result.source.droppableId);
    const destQuarterIndex = parseInt(result.destination.droppableId);
    const courseIndex = result.source.index;

    if (sourceQuarterIndex === destQuarterIndex) {
      // Reordering within the same quarter
      const newCourses = [...schedule[sourceQuarterIndex].courses];
      const [reorderedCourse] = newCourses.splice(courseIndex, 1);
      newCourses.splice(result.destination.index, 0, reorderedCourse);
      updateQuarter(sourceQuarterIndex, newCourses);
    } else {
      // Moving between quarters
      const sourceCourses = [...schedule[sourceQuarterIndex].courses];
      const destCourses = [...schedule[destQuarterIndex].courses];
      const [movedCourse] = sourceCourses.splice(courseIndex, 1);
      destCourses.splice(result.destination.index, 0, movedCourse);
      
      updateQuarter(sourceQuarterIndex, sourceCourses);
      updateQuarter(destQuarterIndex, destCourses);
    }
  };

  const addCourseToQuarter = (quarterIndex: number, course: Course) => {
    const newCourses = [...schedule[quarterIndex].courses, course];
    updateQuarter(quarterIndex, newCourses);
  };

  const removeCourseFromQuarter = (quarterIndex: number, courseIndex: number) => {
    const newCourses = [...schedule[quarterIndex].courses];
    newCourses.splice(courseIndex, 1);
    updateQuarter(quarterIndex, newCourses);
  };

  const generateAISchedule = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI-generated schedule
    const aiSchedule = [...schedule];
    aiSchedule[0].courses = [mockCourses[0]]; // Add CS61A to first quarter
    aiSchedule[1].courses = [mockCourses[1]]; // Add CS61B to second quarter
    
    aiSchedule.forEach((quarter, index) => {
      const { totalUnits, averageDifficulty } = calculateQuarterStats(quarter.courses);
      aiSchedule[index] = { ...quarter, totalUnits, averageDifficulty };
    });
    
    setSchedule(aiSchedule);
    validateSchedule(aiSchedule);
    setIsGenerating(false);
  };

  const getQuarterStatusColor = (quarter: QuarterSchedule) => {
    if (quarter.conflicts.length > 0) return 'border-red-200 bg-red-50';
    if (quarter.totalUnits > constraints.maxUnitsPerQuarter) return 'border-orange-200 bg-orange-50';
    if (quarter.courses.length > 0 && quarter.totalUnits < constraints.minUnitsPerQuarter) return 'border-yellow-200 bg-yellow-50';
    if (quarter.courses.length > 0) return 'border-green-200 bg-green-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    if (difficulty <= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getTotalStats = () => {
    const totalUnits = schedule.reduce((sum, quarter) => sum + quarter.totalUnits, 0);
    const totalCourses = schedule.reduce((sum, quarter) => sum + quarter.courses.length, 0);
    const averageDifficulty = totalCourses > 0 
      ? schedule.reduce((sum, quarter) => sum + (quarter.averageDifficulty * quarter.courses.length), 0) / totalCourses
      : 0;
    
    return { totalUnits, totalCourses, averageDifficulty };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Schedule Builder</h2>
          <p className="text-gray-600">Drag and drop courses to build your academic plan</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showConstraints} onOpenChange={setShowConstraints}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Constraints
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Constraints</DialogTitle>
                <DialogDescription>
                  Configure constraints for schedule generation and validation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Units per Quarter</Label>
                    <Slider
                      value={[constraints.maxUnitsPerQuarter]}
                      onValueChange={(value) => setConstraints(prev => ({ ...prev, maxUnitsPerQuarter: value[0] }))}
                      max={24}
                      min={12}
                      step={1}
                    />
                    <div className="text-sm text-gray-500">{constraints.maxUnitsPerQuarter} units</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Units per Quarter</Label>
                    <Slider
                      value={[constraints.minUnitsPerQuarter]}
                      onValueChange={(value) => setConstraints(prev => ({ ...prev, minUnitsPerQuarter: value[0] }))}
                      max={20}
                      min={8}
                      step={1}
                    />
                    <div className="text-sm text-gray-500">{constraints.minUnitsPerQuarter} units</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Max Average Difficulty per Quarter</Label>
                  <Slider
                    value={[constraints.maxDifficultyPerQuarter]}
                    onValueChange={(value) => setConstraints(prev => ({ ...prev, maxDifficultyPerQuarter: value[0] }))}
                    max={5}
                    min={1}
                    step={0.1}
                  />
                  <div className="text-sm text-gray-500">{constraints.maxDifficultyPerQuarter.toFixed(1)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Avoid back-to-back difficult quarters</Label>
                  <Switch
                    checked={constraints.avoidBackToBackDifficult}
                    onCheckedChange={(checked) => setConstraints(prev => ({ ...prev, avoidBackToBackDifficult: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Graduation Timeline</Label>
                  <Select
                    value={constraints.graduationTimeline}
                    onValueChange={(value) => setConstraints(prev => ({ ...prev, graduationTimeline: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3_years">3 Years</SelectItem>
                      <SelectItem value="4_years">4 Years</SelectItem>
                      <SelectItem value="5_years">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={generateAISchedule} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            Generate AI Schedule
          </Button>
          
          <Button onClick={() => onSave?.(schedule, constraints)}>
            <Save className="h-4 w-4 mr-2" />
            Save Schedule
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
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
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Difficulty</p>
                <p className="text-2xl font-bold">{stats.averageDifficulty.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <Progress value={(stats.totalUnits / 180) * 100} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">{Math.round((stats.totalUnits / 180) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Schedule validation issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.slice(0, 5).map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
              {validationErrors.length > 5 && (
                <p className="text-sm text-gray-600">...and {validationErrors.length - 5} more issues</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Schedule Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {schedule.map((quarter, quarterIndex) => (
            <Card key={quarter.quarter} className={getQuarterStatusColor(quarter)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{quarter.quarter}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {quarter.conflicts.length > 0 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    {quarter.courses.length > 0 && quarter.conflicts.length === 0 && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{quarter.totalUnits} units</span>
                  <span>Avg difficulty: {quarter.averageDifficulty.toFixed(1)}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <Droppable droppableId={quarterIndex.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-2 ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg' : ''
                      }`}
                    >
                      {quarter.courses.map((course, courseIndex) => (
                        <Draggable key={course.id} draggableId={`${quarterIndex}-${course.id}`} index={courseIndex}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-sm">{course.id}</h4>
                                    <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                                      {course.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {course.units}u
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2">{course.title}</p>
                                  {course.prerequisites.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Prereq: {course.prerequisites.join(', ')}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCourseFromQuarter(quarterIndex, courseIndex)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {quarter.courses.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                          <div className="text-center">
                            <Plus className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Drop courses here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {/* Available Courses Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>Drag courses to add them to your schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm">{course.id}</h4>
                    <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                      {course.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.units}u
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{course.title}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
