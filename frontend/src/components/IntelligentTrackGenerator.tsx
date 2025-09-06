import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Target
} from "lucide-react";
import { StudentProfile, Quarter } from "@/types/academic";
import { Course, allCourses } from "@/data/courseData";

interface TrackGenerationOptions {
  minCoursesPerQuarter: number;
  maxCoursesPerQuarter: number;
  targetGraduation: { season: string; year: number };
  prioritizeGPA: boolean;
  balanceWorkload: boolean;
}

interface GeneratedQuarter {
  quarter: string;
  year: number;
  courses: Course[];
  totalCredits: number;
  estimatedDifficulty: number;
  reasoning: string;
}

interface GeneratedTrack {
  quarters: GeneratedQuarter[];
  totalCredits: number;
  projectedGPA: number;
  trackType: 'accelerated' | 'standard' | 'extended';
  warnings: string[];
}

interface IntelligentTrackGeneratorProps {
  student?: StudentProfile;
  onTrackGenerated?: (track: GeneratedTrack) => void;
}

const IntelligentTrackGenerator = ({ student, onTrackGenerated }: IntelligentTrackGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrack, setGeneratedTrack] = useState<GeneratedTrack | null>(null);
  const [selectedTrackType, setSelectedTrackType] = useState<'accelerated' | 'standard' | 'extended'>('standard');

  const generateIntelligentTrack = async (trackType: 'accelerated' | 'standard' | 'extended') => {
    if (!student) return;

    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const options: TrackGenerationOptions = {
        minCoursesPerQuarter: trackType === 'accelerated' ? 4 : 3,
        maxCoursesPerQuarter: trackType === 'accelerated' ? 5 : 4,
        targetGraduation: student.expectedGraduation,
        prioritizeGPA: true,
        balanceWorkload: trackType !== 'accelerated'
      };

      const track = generateMockTrack(student, trackType, options);
      setGeneratedTrack(track);
      onTrackGenerated?.(track);
    } catch (error) {
      console.error('Track generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockTrack = (
    student: StudentProfile, 
    trackType: 'accelerated' | 'standard' | 'extended',
    options: TrackGenerationOptions
  ): GeneratedTrack => {
    const completedCourseIds = new Set(student.completedCourses.map(c => c.id));
    const availableCourses = allCourses.filter(course => 
      !completedCourseIds.has(course.id) && 
      course.major.includes("Computer Science")
    );

    // Analyze student performance
    const currentGPA = student.currentGPA;
    const strongInCore = currentGPA >= 3.5;
    const canHandleDifficult = currentGPA >= 3.3;

    const quarters: GeneratedQuarter[] = [];
    const remainingCourses = [...availableCourses];
    let currentQuarter = { ...student.currentQuarter };
    
    // Generate quarters based on track type
    const numQuarters = trackType === 'accelerated' ? 9 : trackType === 'standard' ? 12 : 15;
    
    for (let i = 0; i < numQuarters && remainingCourses.length > 0; i++) {
      const quarterCourses: Course[] = [];
      let totalCredits = 0;
      
      // Filter eligible courses (prerequisites satisfied)
      const eligibleCourses = remainingCourses.filter(course => {
        const prereqsSatisfied = course.prerequisites.every(prereq => 
          completedCourseIds.has(prereq) || 
          quarters.some(q => q.courses.some(c => c.id === prereq))
        );
        return prereqsSatisfied && course.quarters.includes(currentQuarter.season);
      });

      // Prioritize courses based on student performance and track type
      eligibleCourses.sort((a, b) => {
        let scoreA = 0, scoreB = 0;

        // Core courses priority
        if (a.type === 'core') scoreA += 100;
        if (b.type === 'core') scoreB += 100;

        // Math/Science priority for strong students
        if (strongInCore && (a.type === 'math' || a.type === 'science')) scoreA += 80;
        if (strongInCore && (b.type === 'math' || b.type === 'science')) scoreB += 80;

        // Difficulty balancing
        if (canHandleDifficult) {
          if (a.difficulty === 'hard') scoreA += 20;
          if (b.difficulty === 'hard') scoreB += 20;
        } else {
          if (a.difficulty === 'easy') scoreA += 20;
          if (b.difficulty === 'easy') scoreB += 20;
        }

        // Prerequisites unlock potential
        const aUnlocks = remainingCourses.filter(c => c.prerequisites.includes(a.id)).length;
        const bUnlocks = remainingCourses.filter(c => c.prerequisites.includes(b.id)).length;
        scoreA += aUnlocks * 10;
        scoreB += bUnlocks * 10;

        return scoreB - scoreA;
      });

      // Add courses to quarter
      const targetCourses = trackType === 'accelerated' ? 
        Math.max(4, options.minCoursesPerQuarter) : 
        options.minCoursesPerQuarter;

      for (const course of eligibleCourses) {
        if (quarterCourses.length >= options.maxCoursesPerQuarter) break;
        if (totalCredits + course.credits > (trackType === 'accelerated' ? 20 : 18)) break;

        quarterCourses.push(course);
        totalCredits += course.credits;
        
        // Remove from remaining courses
        const courseIndex = remainingCourses.findIndex(c => c.id === course.id);
        if (courseIndex !== -1) {
          remainingCourses.splice(courseIndex, 1);
        }

        if (quarterCourses.length >= targetCourses && totalCredits >= 12) break;
      }

      // Calculate difficulty
      const avgDifficulty = quarterCourses.length > 0 ? 
        quarterCourses.reduce((sum, c) => sum + getDifficultyScore(c.difficulty), 0) / quarterCourses.length : 0;

      // Generate reasoning
      const reasoning = generateQuarterReasoning(quarterCourses, trackType, currentGPA, currentQuarter);

      quarters.push({
        quarter: currentQuarter.season,
        year: currentQuarter.year,
        courses: quarterCourses,
        totalCredits,
        estimatedDifficulty: avgDifficulty,
        reasoning
      });

      // Move to next quarter
      currentQuarter = getNextQuarter(currentQuarter);
    }

    const totalCredits = quarters.reduce((sum, q) => sum + q.totalCredits, 0);
    const projectedGPA = calculateProjectedGPA(quarters, currentGPA);
    const warnings = generateWarnings(quarters, trackType);

    return {
      quarters,
      totalCredits,
      projectedGPA,
      trackType,
      warnings
    };
  };

  const getDifficultyScore = (difficulty: string): number => {
    const scores = { 'easy': 1, 'medium': 2, 'hard': 3 };
    return scores[difficulty as keyof typeof scores] || 2;
  };

  const generateQuarterReasoning = (
    courses: Course[], 
    trackType: string, 
    gpa: number, 
    quarter: { season: string; year: number }
  ): string => {
    if (courses.length === 0) return "No courses available this quarter.";
    
    const coreCount = courses.filter(c => c.type === 'core').length;
    const hardCount = courses.filter(c => c.difficulty === 'hard').length;
    
    let reasoning = `${quarter.season} ${quarter.year}: `;
    
    if (trackType === 'accelerated') {
      reasoning += `Accelerated track with ${courses.length} courses. `;
    }
    
    if (coreCount > 0) {
      reasoning += `${coreCount} core course${coreCount > 1 ? 's' : ''} for major progression. `;
    }
    
    if (hardCount > 0 && gpa >= 3.3) {
      reasoning += `Challenging coursework balanced with your strong academic performance. `;
    } else if (hardCount === 0) {
      reasoning += `Manageable workload to maintain GPA. `;
    }
    
    return reasoning.trim();
  };

  const getNextQuarter = (current: { season: Quarter; year: number }) => {
    const seasons = [Quarter.FALL, Quarter.WINTER, Quarter.SPRING];
    const currentIndex = seasons.indexOf(current.season);
    
    if (currentIndex === seasons.length - 1) {
      return { season: seasons[0], year: current.year + 1 };
    } else {
      return { season: seasons[currentIndex + 1], year: current.year };
    }
  };

  const calculateProjectedGPA = (quarters: GeneratedQuarter[], currentGPA: number): number => {
    let totalGradePoints = currentGPA * 40; // Assume 40 credits completed
    let totalCredits = 40;
    
    quarters.forEach(quarter => {
      quarter.courses.forEach(course => {
        const expectedGPA = estimateCourseGPA(course, currentGPA);
        totalGradePoints += expectedGPA * course.credits;
        totalCredits += course.credits;
      });
    });
    
    return totalCredits > 0 ? totalGradePoints / totalCredits : currentGPA;
  };

  const estimateCourseGPA = (course: Course, baseGPA: number): number => {
    let expectedGPA = baseGPA;
    
    // Adjust based on difficulty
    if (course.difficulty === 'hard') expectedGPA -= 0.2;
    if (course.difficulty === 'easy') expectedGPA += 0.1;
    
    return Math.max(0, Math.min(4.0, expectedGPA));
  };

  const generateWarnings = (quarters: GeneratedQuarter[], trackType: string): string[] => {
    const warnings: string[] = [];
    
    if (trackType === 'accelerated') {
      const underloadedQuarters = quarters.filter(q => q.courses.length < 4);
      if (underloadedQuarters.length > 0) {
        warnings.push(`${underloadedQuarters.length} quarters have fewer than 4 courses (accelerated track requirement)`);
      }
    }
    
    const overloadedQuarters = quarters.filter(q => q.totalCredits > 18);
    if (overloadedQuarters.length > 0) {
      warnings.push(`${overloadedQuarters.length} quarters exceed 18 credits`);
    }
    
    const difficultQuarters = quarters.filter(q => q.estimatedDifficulty >= 2.5);
    if (difficultQuarters.length > quarters.length * 0.5) {
      warnings.push('Over half of quarters are high-difficulty - consider balancing');
    }
    
    return warnings;
  };

  const renderTrackSummary = () => {
    if (!generatedTrack) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{generatedTrack.quarters.length}</div>
              <div className="text-sm text-muted-foreground">Quarters</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{generatedTrack.totalCredits}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{generatedTrack.projectedGPA.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Projected GPA</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Badge className={
                generatedTrack.trackType === 'accelerated' ? 'bg-red-500' :
                generatedTrack.trackType === 'standard' ? 'bg-blue-500' : 'bg-green-500'
              }>
                {generatedTrack.trackType}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Track Type</div>
            </CardContent>
          </Card>
        </div>

        {generatedTrack.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {generatedTrack.warnings.map((warning, index) => (
                  <div key={index}>• {warning}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderQuarterDetails = () => {
    if (!generatedTrack) return null;

    return (
      <div className="space-y-4">
        {generatedTrack.quarters.map((quarter, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {quarter.quarter} {quarter.year}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{quarter.totalCredits} credits</Badge>
                  <Badge variant={quarter.estimatedDifficulty >= 2.5 ? 'destructive' : 'secondary'}>
                    {quarter.estimatedDifficulty >= 2.5 ? 'High' : 'Moderate'} Difficulty
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{quarter.reasoning}</p>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quarter.courses.map((course, courseIndex) => (
                  <div key={courseIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">{course.code}</div>
                      <div className="text-sm text-muted-foreground">{course.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{course.credits} credits</div>
                      <Badge variant="outline" className="text-xs">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Intelligent Track Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!student && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Complete your student profile to generate personalized academic tracks.
            </AlertDescription>
          </Alert>
        )}

        {student && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Generate an optimized academic track based on your grades, completed courses, and performance patterns.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>• Current GPA: {student.currentGPA.toFixed(2)}</span>
                  <span>• Completed: {student.completedCourses.length} courses</span>
                  <span>• Target: {student.expectedGraduation.season} {student.expectedGraduation.year}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedTrackType === 'accelerated' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedTrackType('accelerated');
                    generateIntelligentTrack('accelerated');
                  }}
                  disabled={isGenerating}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Accelerated (3 years)
                </Button>
                
                <Button
                  variant={selectedTrackType === 'standard' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedTrackType('standard');
                    generateIntelligentTrack('standard');
                  }}
                  disabled={isGenerating}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Standard (4 years)
                </Button>
                
                <Button
                  variant={selectedTrackType === 'extended' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedTrackType('extended');
                    generateIntelligentTrack('extended');
                  }}
                  disabled={isGenerating}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Extended (5+ years)
                </Button>
              </div>
            </div>

            {isGenerating && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">
                    Analyzing your academic performance and generating optimal track...
                  </p>
                </div>
              </div>
            )}

            {generatedTrack && !isGenerating && (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Track Summary</TabsTrigger>
                  <TabsTrigger value="details">Quarter Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  {renderTrackSummary()}
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  {renderQuarterDetails()}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentTrackGenerator;
