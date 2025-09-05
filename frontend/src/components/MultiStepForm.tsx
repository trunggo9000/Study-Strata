import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Target, Clock, Brain } from "lucide-react";

interface FormData {
  major: string;
  year: string;
  graduationTimeline: string;
  workloadPreference: string;
  focusArea: string;
  constraints: string[];
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
    workloadPreference: "",
    focusArea: "",
    constraints: []
  });

  const totalSteps = 4;
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

  const updateFormData = (key: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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
                    <SelectItem value="3-years">3 Years (Accelerated)</SelectItem>
                    <SelectItem value="4-years">4 Years (Standard)</SelectItem>
                    <SelectItem value="5-years">5+ Years (Extended)</SelectItem>
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
              <Clock className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Schedule Preferences</h3>
              <p className="text-muted-foreground">How do you prefer to structure your time?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Course Load Preference</Label>
                <Select value={formData.workloadPreference} onValueChange={(value) => updateFormData("workloadPreference", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How many courses per term?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light (3 courses)</SelectItem>
                    <SelectItem value="normal">Normal (4 courses)</SelectItem>
                    <SelectItem value="heavy">Heavy (5+ courses)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
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