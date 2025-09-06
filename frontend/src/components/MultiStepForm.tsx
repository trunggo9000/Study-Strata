import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Target, Clock, Brain, BookOpen, Award, Plus, Trash2 } from "lucide-react";
import { uclaMajors, searchMajors } from "@/data/uclaMajors";
import CourseSelector from "./CourseSelector";
import { apCourseConversions, getAPConversions, getRecommendedFirstCourses } from "@/data/apCourseConversions";

interface FormData {
  major: string;
  year: string;
  graduationTimeline: string;
  focusArea: string;
  constraints: string[];
  completedCourses: string[];
  apScores: { course: string; score: number }[];
}

interface MultiStepFormProps {
  onComplete: (data: FormData) => void;
}

const majors = [
  "Computer Science",
  "Mathematics",
  "Biology", 
  "Psychology",
  "Economics",
  "Engineering",
  "Business Administration",
  "English Literature"
];

const MultiStepForm = ({ onComplete }: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    major: "",
    year: "",
    graduationTimeline: "",
    focusArea: "",
    constraints: [],
    completedCourses: [],
    apScores: []
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (key: keyof FormData, value: string | string[] | { course: string; score: number }[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addAPScore = () => {
    setFormData(prev => ({
      ...prev,
      apScores: [...prev.apScores, { course: "", score: 3 }]
    }));
  };

  const removeAPScore = (index: number) => {
    setFormData(prev => ({
      ...prev,
      apScores: prev.apScores.filter((_, i) => i !== index)
    }));
  };

  const updateAPScore = (index: number, field: 'course' | 'score', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      apScores: prev.apScores.map((ap, i) => 
        i === index ? { ...ap, [field]: value } : ap
      )
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Academic Background</h3>
              <p className="text-muted-foreground">Tell us about your academic journey</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="major">Major</Label>
                <Select value={formData.major} onValueChange={(value) => updateFormData("major", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major} value={major}>{major}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="year">Academic Year</Label>
                <Select value={formData.year} onValueChange={(value) => updateFormData("year", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freshman">Freshman</SelectItem>
                    <SelectItem value="sophomore">Sophomore</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Goals & Timeline</h3>
              <p className="text-muted-foreground">What are your academic goals?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Graduation Timeline</Label>
                <Select value={formData.graduationTimeline} onValueChange={(value) => updateFormData("graduationTimeline", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you plan to graduate?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3_years">3 Years (Accelerated)</SelectItem>
                    <SelectItem value="4_years">4 Years (Standard)</SelectItem>
                    <SelectItem value="5_years">5+ Years (Extended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Focus Area</Label>
                <Select value={formData.focusArea} onValueChange={(value) => updateFormData("focusArea", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's your primary focus?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research Preparation</SelectItem>
                    <SelectItem value="industry">Industry Preparation</SelectItem>
                    <SelectItem value="exploration">Academic Exploration</SelectItem>
                    <SelectItem value="graduate-school">Graduate School Prep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-2">AP Credits</h3>
              <p className="text-muted-foreground">Add your AP exam scores to get credit for completed courses</p>
            </div>
            
            <div className="space-y-4">
              {formData.apScores.map((ap, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label>AP Course</Label>
                      <Select 
                        value={ap.course} 
                        onValueChange={(value) => updateAPScore(index, 'course', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select AP course" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set(apCourseConversions.map(ap => ap.apCourse))).map(course => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label>Score</Label>
                      <Select 
                        value={ap.score.toString()} 
                        onValueChange={(value) => updateAPScore(index, 'score', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeAPScore(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addAPScore}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add AP Score
              </Button>
              
              {formData.apScores.length > 0 && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold mb-2">AP Credit Summary</h4>
                  {(() => {
                    const conversions = getAPConversions(formData.apScores);
                    const totalCredits = conversions.reduce((sum, ap) => sum + ap.credits, 0);
                    const equivalentCourses = conversions.flatMap(ap => ap.uclaEquivalent);
                    
                    return (
                      <div className="space-y-2 text-sm">
                        <p><strong>Total Credits:</strong> {totalCredits}</p>
                        <p><strong>Equivalent Courses:</strong> {equivalentCourses.join(", ") || "None"}</p>
                        {formData.major === "Computer Science" && (
                          <p><strong>Recommended First Courses:</strong> {getRecommendedFirstCourses(conversions, formData.major).join(", ")}</p>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Course History</h3>
              <p className="text-muted-foreground">Select additional courses you have completed</p>
            </div>
            
            {formData.major && (
              <CourseSelector
                major={formData.major}
                completedCourses={formData.completedCourses}
                onCoursesUpdate={(courses) => updateFormData("completedCourses", courses)}
              />
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Ready to Start!</h3>
              <p className="text-muted-foreground">Let's create your personalized academic plan</p>
            </div>
            
            <div className="bg-gradient-subtle p-6 rounded-lg space-y-4">
              <h4 className="font-semibold">Your Profile Summary:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Major:</span>
                  <Badge variant="secondary" className="ml-2">{formData.major}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>
                  <Badge variant="secondary" className="ml-2">{formData.year}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Timeline:</span>
                  <Badge variant="secondary" className="ml-2">{formData.graduationTimeline}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Focus:</span>
                  <Badge variant="secondary" className="ml-2">{formData.focusArea}</Badge>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-muted-foreground">AP Credits:</span>
                <Badge variant="outline" className="ml-2">{formData.apScores.length} exams</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Completed Courses:</span>
                <Badge variant="outline" className="ml-2">{formData.completedCourses.length} courses</Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elevated">
      <CardHeader className="text-center bg-gradient-primary text-primary-foreground">
        <CardTitle className="text-2xl">Academic Planner Setup</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Step {currentStep} of {totalSteps}
        </CardDescription>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      
      <CardContent className="p-8">
        {renderStep()}
        
        <Separator className="my-8" />
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <Button onClick={handleNext} className="bg-gradient-primary hover:bg-gradient-secondary">
            {currentStep === totalSteps ? "Get Started" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiStepForm;