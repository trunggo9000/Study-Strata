import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { scheduleService } from "@/services/api";
import { 
  ScheduleGenerationRequest, 
  ScheduleOptimizationResult, 
  StudentProfile, 
  Course,
  ScheduleConstraints,
  Quarter
} from "@/types/academic";

interface ScheduleIntegrationProps {
  student: StudentProfile;
  availableCourses: Course[];
  onScheduleGenerated: (result: ScheduleOptimizationResult) => void;
}

const ScheduleIntegration = ({ student, availableCourses, onScheduleGenerated }: ScheduleIntegrationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<ScheduleOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateOptimizedSchedule = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const constraints: ScheduleConstraints = {
        maxCreditsPerQuarter: student.preferences.maxCreditsPerQuarter,
        minCreditsPerQuarter: student.preferences.minCreditsPerQuarter,
        preferredTimeSlots: student.preferences.preferredTimeSlots,
        avoidTimeSlots: student.preferences.avoidTimeSlots,
        maxWorkloadPerWeek: student.preferences.workloadLimit,
        gpaGoal: student.preferences.gpaGoal,
        graduationDeadline: student.expectedGraduation
      };

      const request: ScheduleGenerationRequest = {
        studentProfile: student,
        availableCourses,
        constraints,
        targetQuarters: calculateQuartersToGraduation(student.currentQuarter, student.expectedGraduation),
        optimizationGoals: {
          prioritizeGPA: true,
          prioritizeWorkload: true,
          prioritizeGraduation: true,
          prioritizePreferences: true
        }
      };

      const response = await scheduleService.generate(request);
      
      if (response.success && response.data) {
        setLastResult(response.data);
        onScheduleGenerated(response.data);
      } else {
        throw new Error(response.error || 'Failed to generate schedule');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Schedule generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateQuartersToGraduation = (current: { season: Quarter; year: number }, target: { season: Quarter; year: number }): number => {
    const quarterOrder = [Quarter.FALL, Quarter.WINTER, Quarter.SPRING, Quarter.SUMMER];
    const currentIndex = quarterOrder.indexOf(current.season);
    const targetIndex = quarterOrder.indexOf(target.season);
    
    const yearDiff = target.year - current.year;
    const quarterDiff = targetIndex - currentIndex;
    
    return yearDiff * 4 + quarterDiff;
  };

  const renderScheduleResult = () => {
    if (!lastResult) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Schedule</h3>
          <div className="flex items-center gap-2">
            <Badge variant={lastResult.success ? "default" : "destructive"}>
              Score: {Math.round(lastResult.score * 100)}%
            </Badge>
            {lastResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{lastResult.metadata.totalCredits}</p>
                <p className="text-sm text-muted-foreground">Total Credits</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{lastResult.metadata.projectedGPA.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Projected GPA</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {lastResult.metadata.graduationQuarter.season} {lastResult.metadata.graduationQuarter.year}
                </p>
                <p className="text-sm text-muted-foreground">Graduation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {lastResult.conflicts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Schedule Conflicts ({lastResult.conflicts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lastResult.conflicts.slice(0, 5).map((conflict, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                    <Badge variant={conflict.severity === 'ERROR' ? 'destructive' : 'secondary'}>
                      {conflict.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{conflict.message}</p>
                      {conflict.suggestions && conflict.suggestions.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Suggestion: {conflict.suggestions[0]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {lastResult.warnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
                Recommendations ({lastResult.warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {lastResult.warnings.slice(0, 3).map((warning, index) => (
                  <p key={index} className="text-sm text-muted-foreground">• {warning}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          AI Schedule Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Generate an optimized academic schedule based on your preferences and requirements
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>• {availableCourses.length} available courses</span>
              <span>• {student.completedCourses.length} completed courses</span>
              <span>• Target: {student.expectedGraduation.season} {student.expectedGraduation.year}</span>
            </div>
          </div>
          <Button 
            onClick={generateOptimizedSchedule}
            disabled={isGenerating || availableCourses.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {renderScheduleResult()}
      </CardContent>
    </Card>
  );
};

export default ScheduleIntegration;
