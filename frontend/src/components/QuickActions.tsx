import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen, Target, MessageCircle, Download, Share2 } from "lucide-react";
import { getDegreeRequirements, calculateProgress } from "@/data/degreeRequirements";
import { getAvailableCourses, allCourses } from "@/data/courseData";

interface QuickActionsProps {
  userProfile: {
    major: string;
    year: string;
    completedCourses: string[];
    graduationTimeline: string;
    focusArea: string;
    apScores?: { course: string; score: number }[];
  } | null;
}

const QuickActions = ({ userProfile }: QuickActionsProps) => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const generateAlternativeSchedules = () => {
    if (!userProfile) return [];
    
    // Get AP credit equivalents
    const apEquivalents = (userProfile.apScores || []).flatMap(ap => {
      if (ap.course === "AP Calculus AB" && ap.score >= 3) return ["MATH31A"];
      if (ap.course === "AP Calculus BC" && ap.score >= 3) return ["MATH31A", "MATH31B"];
      if (ap.course === "AP Computer Science A" && ap.score >= 3) return ["CS31"];
      if (ap.course === "AP Physics C: Mechanics" && ap.score >= 3) return ["PHYSICS1A"];
      if (ap.course === "AP English Language" && ap.score >= 3) return ["ENGCOMP3"];
      return [];
    });
    
    // Combine completed courses with AP equivalents
    const allCompletedCourses = [...userProfile.completedCourses, ...apEquivalents];
    const availableCourses = getAvailableCourses(userProfile.major, allCompletedCourses);
    const schedules = [];
    const completedSet = new Set(allCompletedCourses);
    
    // Determine student level and major-specific course recommendations based on completed courses
    const getYearLevelCourses = (year: string, major: string, completed: Set<string>) => {
      const getNextCourses = (prerequisites: string[], nextCourses: string[]) => {
        // Check if prerequisites are met and return next appropriate courses
        return nextCourses.filter(course => {
          const courseObj = availableCourses.find(c => c.code === course);
          if (!courseObj || completed.has(course)) return false;
          
          // Check if prerequisites are satisfied
          if (courseObj.prerequisites && courseObj.prerequisites.length > 0) {
            return courseObj.prerequisites.every(prereq => completed.has(prereq));
          }
          return true;
        });
      };

      if (year === "freshman") {
        if (major === "Computer Science") {
          const baseCourses = ["CS31", "MATH31A", "ENGCOMP3", "PHYSICS1A", "PHILOS7"];
          return getNextCourses([], baseCourses);
        } else if (major === "Mathematics") {
          const baseCourses = ["MATH31A", "MATH31B", "ENGCOMP3", "PHYSICS1A", "PHILOS7"];
          return getNextCourses([], baseCourses);
        } else {
          const baseCourses = ["ENGCOMP3", "MATH31A", "PHILOS7", "HIST13A", "PSYCH10"];
          return getNextCourses([], baseCourses);
        }
      } else if (year === "sophomore") {
        if (major === "Computer Science") {
          const sophCourses = ["CS32", "CS33", "MATH32A", "PHYSICS1B", "STATS10"];
          return getNextCourses(["CS31", "MATH31A"], sophCourses);
        } else if (major === "Mathematics") {
          const sophCourses = ["MATH32A", "MATH32B", "MATH33A", "PHYSICS1A", "CS31"];
          return getNextCourses(["MATH31A"], sophCourses);
        } else {
          return availableCourses.filter(c => 
            (c.type === "core" || c.type === "math") && 
            !completed.has(c.code)
          ).map(c => c.code);
        }
      } else if (year === "junior") {
        if (major === "Computer Science") {
          const juniorCourses = ["CS35L", "CS111", "CS118", "CS131", "MATH33A"];
          return getNextCourses(["CS32", "CS33"], juniorCourses);
        } else {
          return availableCourses.filter(c => 
            c.type === "core" && 
            c.difficulty !== "easy" && 
            !completed.has(c.code)
          ).map(c => c.code);
        }
      } else {
        return availableCourses.filter(c => 
          (c.type === "elective" || c.difficulty === "hard") && 
          !completed.has(c.code)
        ).map(c => c.code);
      }
    };
    
    const yearLevelCourses = getYearLevelCourses(userProfile.year, userProfile.major, completedSet);
    
    // Determine course count based on graduation timeline
    const getCoursesPerQuarter = (timeline: string) => {
      switch (timeline) {
        case "3_years": return 5; // Accelerated - 5 courses
        case "4_years": return 4; // Standard - 4 courses
        case "5_years": return 2; // Extended - 2 courses
        default: return 4;
      }
    };
    
    const coursesPerQuarter = getCoursesPerQuarter(userProfile.graduationTimeline);
    
    // Balanced Schedule - appropriate for student level
    let balancedCourses = [];
    const recommendedCodes = yearLevelCourses.filter(code => !completedSet.has(code));
    balancedCourses = availableCourses.filter(c => 
      recommendedCodes.includes(c.code) && !completedSet.has(c.code)
    );
    
    // If not enough year-level courses, add more appropriate courses
    if (balancedCourses.length < 4) {
      const additionalCourses = availableCourses.filter(c => 
        !completedSet.has(c.code) && 
        !balancedCourses.some(bc => bc.code === c.code) &&
        (c.type === "core" || c.type === "math" || c.type === "ge")
      );
      balancedCourses = [...balancedCourses, ...additionalCourses];
    }
    
    schedules.push({
      name: "Balanced Load",
      description: `Mix of core requirements and easier courses (4 courses)`,
      courses: balancedCourses.slice(0, 4),
      totalCredits: balancedCourses.slice(0, 4).reduce((sum, c) => sum + c.credits, 0),
      difficulty: "Medium"
    });

    // Intensive Schedule - challenging courses based on timeline
    let intensiveCourses = [];
    const challengingCourses = availableCourses.filter(c => 
      (recommendedCodes.includes(c.code) || c.difficulty === "hard" || c.type === "math" || c.type === "science") && 
      !completedSet.has(c.code)
    );
    intensiveCourses = challengingCourses;
    
    // If not enough challenging courses, add more rigorous options
    if (intensiveCourses.length < 5) {
      const moreRigorous = availableCourses.filter(c => 
        !completedSet.has(c.code) && 
        !intensiveCourses.some(ic => ic.code === c.code) &&
        (c.type === "core" || c.difficulty === "medium")
      );
      intensiveCourses = [...intensiveCourses, ...moreRigorous];
    }
    
    schedules.push({
      name: "Intensive Track",
      description: `Challenging course load with rigorous subjects (5 courses)`,
      courses: intensiveCourses.slice(0, 5),
      totalCredits: intensiveCourses.slice(0, 5).reduce((sum, c) => sum + c.credits, 0),
      difficulty: "Hard"
    });

    // Light Schedule - easier courses based on timeline
    let lightCourses = [];
    const easyCourses = availableCourses.filter(c => 
      (c.type === "ge" || c.difficulty === "easy") && 
      !completedSet.has(c.code)
    );
    lightCourses = easyCourses;
    
    // If not enough easy courses, add more general education options
    if (lightCourses.length < 3) {
      const moreGE = availableCourses.filter(c => 
        !completedSet.has(c.code) && 
        !lightCourses.some(lc => lc.code === c.code) &&
        (c.type === "elective" || c.difficulty === "medium")
      );
      lightCourses = [...lightCourses, ...moreGE];
    }
    
    schedules.push({
      name: "Light Load",
      description: `Easier courses for busy quarters (3 courses)`,
      courses: lightCourses.slice(0, 3),
      totalCredits: lightCourses.slice(0, 3).reduce((sum, c) => sum + c.credits, 0),
      difficulty: "Easy"
    });

    return schedules;
  };

  const getDegreeRequirementsData = () => {
    if (!userProfile) return null;
    return calculateProgress(userProfile.major, userProfile.completedCourses);
  };

  const updateAcademicGoals = () => {
    if (!userProfile) return;
    
    // Create a modal-like dialog for updating academic goals
    const newFocusArea = prompt(
      `Current Focus Area: ${userProfile.focusArea}\n\nEnter new focus area (e.g., Software Engineering, Data Science, AI/ML, Cybersecurity):`,
      userProfile.focusArea
    );
    
    if (newFocusArea && newFocusArea !== userProfile.focusArea) {
      const newTimeline = prompt(
        `Current Graduation Timeline: ${userProfile.graduationTimeline}\n\nEnter new timeline (3_years, 4_years, 5_years):`,
        userProfile.graduationTimeline
      );
      
      if (newTimeline && ['3_years', '4_years', '5_years'].includes(newTimeline)) {
        const updatedProfile = {
          ...userProfile,
          focusArea: newFocusArea,
          graduationTimeline: newTimeline
        };
          
          // This would typically call an API to save changes
          console.log('Updated Academic Goals:', updatedProfile);
          alert(`Academic goals updated successfully!\n\nFocus Area: ${newFocusArea}\nTimeline: ${newTimeline}\n\nRefresh the page to see updated recommendations.`);
          
          // In a real app, you'd call onProfileUpdate or similar
          // onProfileUpdate?.(updatedProfile);
      } else {
        alert('Invalid timeline. Please use: 3_years, 4_years, or 5_years');
      }
    }
  };

  const exportSchedule = () => {
    if (!userProfile) return;
    
    const progress = calculateProgress(userProfile.major, userProfile.completedCourses);
    const availableCourses = getAvailableCourses(userProfile.major, userProfile.completedCourses);
    
    const exportData = {
      profile: userProfile,
      progress: progress,
      recommendedCourses: availableCourses.slice(0, 10),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-plan-${userProfile.major.replace(' ', '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareProgress = () => {
    if (!userProfile) return;
    
    const progress = calculateProgress(userProfile.major, userProfile.completedCourses);
    const shareText = `My ${userProfile.major} Progress:\n` +
      `📚 Completed: ${userProfile.completedCourses.length} courses\n` +
      `🎯 Credits: ${progress?.totalCredits}/${progress?.totalRequired}\n` +
      `⏰ Timeline: ${userProfile.graduationTimeline}\n` +
      `🔥 Focus: ${userProfile.focusArea}\n\n` +
      `Track your academic journey with Study Strata!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Academic Progress',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  const renderScheduleDialog = () => {
    const schedules = generateAlternativeSchedules();
    
    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alternative Schedule Options</DialogTitle>
          <DialogDescription>
            Choose a schedule that fits your goals and workload preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {schedules.map((schedule, index) => (
            <Card key={index} className="shadow-course">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {schedule.name}
                  <Badge className={
                    schedule.difficulty === "Easy" ? "bg-green-500 text-white" :
                    schedule.difficulty === "Medium" ? "bg-yellow-500 text-white" :
                    "bg-red-500 text-white"
                  }>
                    {schedule.difficulty}
                  </Badge>
                </CardTitle>
                <CardDescription>{schedule.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Total Credits: {schedule.totalCredits}</p>
                  <div className="space-y-1">
                    {schedule.courses.map(course => (
                      <div key={course.id} className="flex items-center justify-between text-sm">
                        <span>{course.code} - {course.name}</span>
                        <Badge variant="outline">{course.credits} cr</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    );
  };

  const renderRequirementsDialog = () => {
    const progress = calculateProgress(userProfile.major, userProfile.completedCourses);
    
    if (!progress) return null;
    
    return (
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Degree Requirements Overview</DialogTitle>
          <DialogDescription>
            Track your progress toward graduation in {userProfile?.major}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{progress.totalCredits}</div>
                  <div className="text-sm text-muted-foreground">Credits Completed</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{progress.totalRequired - progress.totalCredits}</div>
                  <div className="text-sm text-muted-foreground">Credits Remaining</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-3">
            {progress.requirements.map((req, index) => (
              <Card key={index} className={req.isComplete ? "border-green-300 bg-green-50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{req.category}</h4>
                    <Badge className={req.isComplete ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                      {req.isComplete ? "Complete" : "In Progress"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Credits: {req.completedCredits}/{req.minCredits}</span>
                    <span>{req.progress.toFixed(0)}% Complete</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setActiveDialog("schedules")}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Generate Alternative Schedules
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setActiveDialog("requirements")}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Degree Requirements
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={updateAcademicGoals}
          >
            <Target className="h-4 w-4 mr-2" />
            Update Academic Goals
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={exportSchedule}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Academic Plan
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={shareProgress}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
        </CardContent>
      </Card>

      <Dialog open={activeDialog === "schedules"} onOpenChange={() => setActiveDialog(null)}>
        {renderScheduleDialog()}
      </Dialog>

      <Dialog open={activeDialog === "requirements"} onOpenChange={() => setActiveDialog(null)}>
        {renderRequirementsDialog()}
      </Dialog>
    </>
  );
};

export default QuickActions;
