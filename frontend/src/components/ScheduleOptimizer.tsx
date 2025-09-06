import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Clock, MapPin, TrendingUp, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { ScheduledCourse } from "@/data/courseData";
import { convertTo12Hour } from "@/utils/timeUtils";

interface OptimizationResult {
  score: number;
  issues: string[];
  suggestions: string[];
  optimizedSchedule: ScheduledCourse[];
}

interface ScheduleOptimizerProps {
  currentSchedule: ScheduledCourse[];
  onScheduleUpdate: (schedule: ScheduledCourse[]) => void;
  scheduleDays: number;
  onScheduleDaysChange: (days: number) => void;
}

type ScheduleDays = "2" | "3" | "4" | "5";

const ScheduleOptimizer = ({ currentSchedule, onScheduleUpdate, scheduleDays, onScheduleDaysChange }: ScheduleOptimizerProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [localScheduleDays, setLocalScheduleDays] = useState<ScheduleDays>(scheduleDays.toString() as ScheduleDays);

  // Auto-update schedule when days preference changes
  const handleScheduleDaysChange = (newDaysValue: ScheduleDays) => {
    setLocalScheduleDays(newDaysValue);
    const newDaysNum = parseInt(newDaysValue);
    onScheduleDaysChange(newDaysNum);
    
    // Immediately redistribute courses based on new day preference
    const optimizedSchedule = currentSchedule.map((course, index) => {
      let newDays: string[] = [];
      
      if (newDaysValue === "2") {
        newDays = ["T", "R"];
      } else if (newDaysValue === "3") {
        const patterns = [["M", "W", "F"], ["M", "W"], ["W", "F"], ["M", "F"]];
        newDays = patterns[index % patterns.length];
      } else if (newDaysValue === "4") {
        const patterns = [["M", "W"], ["T", "R"], ["M", "T", "W"], ["T", "W", "R"]];
        newDays = patterns[index % patterns.length];
      } else {
        const patterns = [["M", "W", "F"], ["T", "R"], ["M", "W"], ["T", "R"], ["M", "T", "W", "R", "F"]];
        newDays = patterns[index % patterns.length];
      }
      
      return {
        ...course,
        days: newDays
      };
    });
    
    onScheduleUpdate(optimizedSchedule);
  };

  const analyzeSchedule = (schedule: ScheduledCourse[]): OptimizationResult => {
    let score = 100;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for time conflicts
    const conflicts = findTimeConflicts(schedule);
    if (conflicts.length > 0) {
      score -= conflicts.length * 20;
      issues.push(`${conflicts.length} time conflict(s) detected`);
      suggestions.push("Resolve overlapping class times");
    }

    // Check for back-to-back classes in different locations
    const locationIssues = findLocationIssues(schedule);
    if (locationIssues.length > 0) {
      score -= locationIssues.length * 10;
      issues.push(`${locationIssues.length} potential location issue(s)`);
      suggestions.push("Consider travel time between distant buildings");
    }

    // Check for optimal time distribution
    const timeDistribution = analyzeTimeDistribution(schedule);
    if (timeDistribution.earlyMorning > 2) {
      score -= 5;
      issues.push("Many early morning classes");
      suggestions.push("Consider spreading classes throughout the day");
    }
    if (timeDistribution.lateEvening > 1) {
      score -= 10;
      issues.push("Late evening classes detected");
      suggestions.push("Move classes to earlier time slots if possible");
    }

    // Check for day balance
    const dayBalance = analyzeDayBalance(schedule);
    if (dayBalance.maxDayLoad > 3) {
      score -= 15;
      issues.push("Uneven daily course load");
      suggestions.push("Redistribute classes more evenly across weekdays");
    }

    // Generate optimized schedule
    const optimizedSchedule = generateOptimizedSchedule(schedule);

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      optimizedSchedule
    };
  };

  const findTimeConflicts = (schedule: ScheduledCourse[]): string[] => {
    const conflicts: string[] = [];
    
    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const course1 = schedule[i];
        const course2 = schedule[j];
        
        // Check if days overlap
        const dayOverlap = course1.days.some(day => course2.days.includes(day));
        
        if (dayOverlap) {
          const start1 = parseInt(course1.startTime.replace(":", ""));
          const end1 = parseInt(course1.endTime.replace(":", ""));
          const start2 = parseInt(course2.startTime.replace(":", ""));
          const end2 = parseInt(course2.endTime.replace(":", ""));
          
          // Check if times overlap
          if (start1 < end2 && end1 > start2) {
            conflicts.push(`${course1.code} conflicts with ${course2.code}`);
          }
        }
      }
    }
    
    return conflicts;
  };

  const findLocationIssues = (schedule: ScheduledCourse[]): string[] => {
    const issues: string[] = [];
    const sortedByTime = [...schedule].sort((a, b) => 
      parseInt(a.startTime.replace(":", "")) - parseInt(b.startTime.replace(":", ""))
    );

    for (let i = 0; i < sortedByTime.length - 1; i++) {
      const current = sortedByTime[i];
      const next = sortedByTime[i + 1];
      
      // Check if classes are back-to-back (within 10 minutes)
      const currentEnd = parseInt(current.endTime.replace(":", ""));
      const nextStart = parseInt(next.startTime.replace(":", ""));
      const timeDiff = nextStart - currentEnd;
      
      if (timeDiff <= 10 && timeDiff >= 0) {
        // Check if locations are different buildings
        const currentBuilding = current.location.split(" ")[0];
        const nextBuilding = next.location.split(" ")[0];
        
        if (currentBuilding !== nextBuilding) {
          issues.push(`Tight transition from ${current.code} (${currentBuilding}) to ${next.code} (${nextBuilding})`);
        }
      }
    }
    
    return issues;
  };

  const analyzeTimeDistribution = (schedule: ScheduledCourse[]) => {
    let earlyMorning = 0; // Before 10 AM
    let lateEvening = 0;  // After 6 PM
    
    schedule.forEach(course => {
      const startHour = parseInt(course.startTime.split(":")[0]);
      if (startHour < 10) earlyMorning++;
      if (startHour >= 18) lateEvening++;
    });
    
    return { earlyMorning, lateEvening };
  };

  const analyzeDayBalance = (schedule: ScheduledCourse[]) => {
    const dayCount: { [key: string]: number } = { M: 0, T: 0, W: 0, R: 0, F: 0 };
    
    schedule.forEach(course => {
      course.days.forEach(day => {
        dayCount[day]++;
      });
    });
    
    const maxDayLoad = Math.max(...Object.values(dayCount));
    return { maxDayLoad, dayCount };
  };

  const generateOptimizedSchedule = (schedule: ScheduledCourse[]): ScheduledCourse[] => {
    // Simple optimization: spread classes evenly and avoid conflicts
    const optimized = [...schedule];
    const timeSlots = ["09:00", "11:00", "13:00", "15:00"];
    const days = [["M", "W", "F"], ["T", "R"], ["M", "W"], ["T", "R", "F"]];
    
    optimized.forEach((course, index) => {
      if (index < timeSlots.length) {
        course.startTime = timeSlots[index];
        course.endTime = addMinutesToTime(timeSlots[index], 110); // 1h 50min classes
        course.days = days[index % days.length];
      }
    });
    
    return optimized;
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
  };

  const optimizeSchedule = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Apply schedule days filter to current schedule
    const optimizedSchedule = currentSchedule.map((course, index) => {
      // Redistribute courses based on selected days
      let newDays: string[] = [];
      
      if (localScheduleDays === "2") {
        // Tuesday/Thursday pattern for 2-day schedule - alternate courses
        newDays = index % 2 === 0 ? ["T", "R"] : ["T", "R"];
      } else if (localScheduleDays === "3") {
        // Monday/Wednesday/Friday pattern for 3-day schedule
        const patterns = [["M", "W", "F"], ["M", "W"], ["W", "F"], ["M", "F"]];
        newDays = patterns[index % patterns.length];
      } else if (localScheduleDays === "4") {
        // Monday through Thursday for 4-day schedule
        const patterns = [["M", "W"], ["T", "R"], ["M", "T", "W"], ["T", "W", "R"]];
        newDays = patterns[index % patterns.length];
      } else {
        // All 5 days for 5-day schedule - distribute across week
        const patterns = [["M", "W", "F"], ["T", "R"], ["M", "W"], ["T", "R"], ["M", "T", "W", "R", "F"]];
        newDays = patterns[index % patterns.length];
      }
      
      return {
        ...course,
        days: newDays
      };
    });
    
    const result = analyzeSchedule(optimizedSchedule);
    result.optimizedSchedule = optimizedSchedule;
    setOptimizationResult(result);
    setIsOptimizing(false);
    
    if (result.optimizedSchedule.length > 0) {
      onScheduleUpdate(result.optimizedSchedule);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Schedule Optimizer
        </CardTitle>
        <CardDescription>
          Analyze and optimize your class schedule for better time management
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Schedule Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium">Current Schedule Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentSchedule.length}</div>
              <div className="text-sm text-blue-700">Total Classes</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {currentSchedule.reduce((sum, course) => sum + course.credits, 0)}
              </div>
              <div className="text-sm text-purple-700">Total Credits</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {new Set(currentSchedule.flatMap(c => c.days)).size}
              </div>
              <div className="text-sm text-green-700">Days Used</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Schedule Days Selector */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Days Preference
          </h4>
          <Select value={localScheduleDays} onValueChange={handleScheduleDaysChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select number of days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Days (T/R)</SelectItem>
              <SelectItem value="3">3 Days (M/W/F)</SelectItem>
              <SelectItem value="4">4 Days (M/T/W/R)</SelectItem>
              <SelectItem value="5">5 Days (M/T/W/R/F)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Optimization Button */}
        <Button 
          onClick={optimizeSchedule} 
          disabled={isOptimizing || currentSchedule.length === 0}
          className="w-full"
        >
          {isOptimizing ? "Analyzing Schedule..." : "Analyze & Optimize Schedule"}
        </Button>

        {/* Optimization Results */}
        {optimizationResult && (
          <div className="space-y-4">
            <Separator />
            
            {/* Optimization Score */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Optimization Score</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(optimizationResult.score)}`}>
                {optimizationResult.score}/100
              </div>
              <Badge className={getScoreBadge(optimizationResult.score)}>
                {optimizationResult.score >= 80 ? "Excellent" : 
                 optimizationResult.score >= 60 ? "Good" : "Needs Improvement"}
              </Badge>
              <Progress value={optimizationResult.score} className="mt-2" />
            </div>

            {/* Issues */}
            {optimizationResult.issues.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">Issues Detected</span>
                </div>
                <ul className="text-sm text-red-800 space-y-1">
                  {optimizationResult.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {optimizationResult.suggestions.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Optimization Suggestions</span>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  {optimizationResult.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optimized Schedule Preview */}
            <div className="space-y-3">
              <h4 className="font-medium">Optimized Schedule Preview</h4>
              <div className="space-y-2">
                {optimizationResult.optimizedSchedule.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <span className="font-medium text-green-900">{course.code}</span>
                      <p className="text-sm text-green-700">{course.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-900">
                        {course.days.join(", ")} • {convertTo12Hour(course.startTime)}-{convertTo12Hour(course.endTime)}
                      </div>
                      <div className="text-xs text-green-700">{course.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Optimization Button */}
            <Button 
              onClick={() => onOptimizedSchedule(optimizationResult.optimizedSchedule)}
              className="w-full"
              variant="outline"
            >
              Apply Optimized Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleOptimizer;
