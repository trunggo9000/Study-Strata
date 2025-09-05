import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MultiStepForm from "@/components/MultiStepForm";
import ScheduleGrid from "@/components/ScheduleGrid";
import AdvisorChat from "@/components/AdvisorChat";
import { 
  CalendarDays, 
  BookOpen, 
  Target, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface FormData {
  major: string;
  year: string;
  graduationTimeline: string;
  workloadPreference: string;
  focusArea: string;
  constraints: string[];
}

const Dashboard = () => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<FormData | null>(null);

  const handleSetupComplete = (data: FormData) => {
    setUserProfile(data);
    setIsSetupComplete(true);
  };

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <MultiStepForm onComplete={handleSetupComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground shadow-elevated">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Academic Planner</h1>
              <p className="text-primary-foreground/80">Your personalized academic journey</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{userProfile?.major}</p>
                <p className="text-sm text-primary-foreground/80">{userProfile?.year} • {userProfile?.graduationTimeline}</p>
              </div>
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Courses</p>
                  <p className="text-3xl font-bold text-primary">32</p>
                </div>
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current GPA</p>
                  <p className="text-3xl font-bold text-primary">3.7</p>
                </div>
                <TrendingUp className="h-10 w-10 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Remaining</p>
                  <p className="text-3xl font-bold text-primary">48</p>
                </div>
                <Target className="h-10 w-10 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Time to Graduate</p>
                  <p className="text-3xl font-bold text-primary">2.5yr</p>
                </div>
                <Clock className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Schedule and Planning */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Current Schedule
                </TabsTrigger>
                <TabsTrigger value="roadmap" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Academic Roadmap
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Recommendations
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule" className="space-y-6">
                <ScheduleGrid courses={[]} />
              </TabsContent>
              
              <TabsContent value="roadmap" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>4-Year Academic Roadmap</CardTitle>
                    <CardDescription>Your personalized path to graduation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Year Progress */}
                      {["Freshman", "Sophomore", "Junior", "Senior"].map((year, index) => (
                        <div key={year} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              index <= 1 ? "bg-success text-success-foreground" : 
                              index === 2 ? "bg-warning text-warning-foreground" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {index + 1}
                            </div>
                            <h4 className="text-lg font-semibold">{year} Year</h4>
                            {index <= 1 && <Badge variant="secondary">Completed</Badge>}
                            {index === 2 && <Badge className="bg-warning text-warning-foreground">In Progress</Badge>}
                          </div>
                          
                          <div className="ml-11 grid grid-cols-2 gap-4">
                            <Card className="shadow-course">
                              <CardContent className="p-4">
                                <h5 className="font-medium mb-2">Fall Quarter</h5>
                                <div className="space-y-1 text-sm">
                                  {index <= 1 ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-success" />
                                        <span>CS31 - Intro to CS</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-success" />
                                        <span>Math 32A - Calculus</span>
                                      </div>
                                    </>
                                  ) : index === 2 ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3 text-warning" />
                                        <span>CS33 - Computer Org</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3 text-warning" />
                                        <span>Math 33A - Linear Algebra</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-muted-foreground">CS180 - Algorithms</div>
                                      <div className="text-muted-foreground">Upper Division Elective</div>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="shadow-course">
                              <CardContent className="p-4">
                                <h5 className="font-medium mb-2">Spring Quarter</h5>
                                <div className="space-y-1 text-sm">
                                  {index <= 1 ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-success" />
                                        <span>CS32 - Data Structures</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-success" />
                                        <span>Math 32B - Calculus</span>
                                      </div>
                                    </>
                                  ) : index === 2 ? (
                                    <>
                                      <div className="text-muted-foreground">CS111 - Operating Systems</div>
                                      <div className="text-muted-foreground">GE Course</div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-muted-foreground">CS170 - Machine Learning</div>
                                      <div className="text-muted-foreground">Technical Elective</div>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Recommended for Next Quarter</CardTitle>
                    <CardDescription>Based on your academic progress and goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        code: "CS111",
                        name: "Operating Systems Principles",
                        reason: "Critical prerequisite for advanced CS courses",
                        priority: "high"
                      },
                      {
                        code: "STATS100A",
                        name: "Introduction to Probability",
                        reason: "Foundation for machine learning track",
                        priority: "medium"
                      },
                      {
                        code: "ENGCOMP3",
                        name: "English Composition 3",
                        reason: "Fulfill writing requirement",
                        priority: "low"
                      }
                    ].map((course, index) => (
                      <Card key={index} className="shadow-course">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{course.code}</h4>
                              <p className="text-sm text-muted-foreground">{course.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{course.reason}</p>
                            </div>
                            <Badge className={
                              course.priority === "high" ? "bg-destructive text-destructive-foreground" :
                              course.priority === "medium" ? "bg-warning text-warning-foreground" :
                              "bg-muted text-muted-foreground"
                            }>
                              {course.priority} priority
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - AI Advisor */}
          <div className="space-y-8">
            <AdvisorChat />
            
            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Generate Alternative Schedules
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Degree Requirements
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Update Academic Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;