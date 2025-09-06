import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Clock, BookOpen } from "lucide-react";
import { calculateProgress, getDegreeRequirements } from "@/data/degreeRequirements";
import { allCourses } from "@/data/courseData";

interface AcademicRoadmapProps {
  major: string;
  completedCourses: string[];
}

const AcademicRoadmap = ({ major, completedCourses }: AcademicRoadmapProps) => {
  const progress = calculateProgress(major, completedCourses);
  const requirements = getDegreeRequirements(major);

  if (!progress || !requirements) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Academic Roadmap</CardTitle>
          <CardDescription>Degree requirements not available for {major}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusIcon = (isComplete: boolean, hasProgress: boolean) => {
    if (isComplete) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (hasProgress) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (isComplete: boolean, hasProgress: boolean) => {
    if (isComplete) return "bg-green-100 border-green-300";
    if (hasProgress) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Academic Roadmap - {major}
        </CardTitle>
        <CardDescription>
          Track your progress toward graduation • {progress.totalCredits}/{requirements.totalCredits} credits completed
        </CardDescription>
        <Progress value={progress.overallProgress} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-1">
          {progress.overallProgress.toFixed(1)}% complete
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {progress.requirements.map((req, index) => {
          const hasProgress = req.completedRequired.length > 0 || req.completedElectives.length > 0;
          
          return (
            <div key={index} className={`p-4 rounded-lg border-2 ${getStatusColor(req.isComplete, hasProgress)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(req.isComplete, hasProgress)}
                  <h3 className="font-semibold text-lg">{req.category}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {req.completedCredits}/{req.minCredits} credits
                  </Badge>
                  {req.isComplete && <Badge className="bg-green-500 text-white">Complete</Badge>}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{req.description}</p>
              
              {/* Required Courses */}
              {req.remainingRequired.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2 text-red-700">Required Courses Still Needed:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {req.remainingRequired.map(courseCode => {
                      const course = allCourses.find(c => c.code === courseCode);
                      return (
                        <div key={courseCode} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <span className="font-medium">{courseCode}</span>
                            {course && <span className="text-xs text-muted-foreground ml-2">{course.name}</span>}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {course?.credits || 0} credits
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Completed Required Courses */}
              {req.completedRequired.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2 text-green-700">Completed Required Courses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {req.completedRequired.map(courseCode => (
                      <Badge key={courseCode} className="bg-green-500 text-white">
                        {courseCode}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Electives */}
              {req.minElectives && req.minElectives > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Electives ({req.completedElectives.length}/{req.minElectives} completed):
                  </h4>
                  
                  {req.completedElectives.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-green-700 mb-1">Completed:</p>
                      <div className="flex flex-wrap gap-1">
                        {req.completedElectives.map(courseCode => (
                          <Badge key={courseCode} variant="secondary" className="text-xs">
                            {courseCode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {req.completedElectives.length < req.minElectives && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Choose {req.minElectives - req.completedElectives.length} more from:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {req.remainingElectives.slice(0, 6).map(courseCode => {
                          const course = allCourses.find(c => c.code === courseCode);
                          return (
                            <div key={courseCode} className="text-xs p-1 bg-gray-50 rounded">
                              <span className="font-medium">{courseCode}</span>
                              {course && <div className="text-gray-600 truncate">{course.name}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Progress value={req.progress} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {req.progress.toFixed(1)}% complete
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AcademicRoadmap;
