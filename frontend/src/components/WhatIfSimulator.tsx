import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calculator, TrendingUp, Clock } from "lucide-react";
import { uclaMajors, UCLAMajor } from "@/data/uclaMajors";
import { getDegreeRequirements, calculateProgress } from "@/data/degreeRequirements";

interface WhatIfSimulatorProps {
  currentMajor: string;
  completedCourses: string[];
}

interface SimulationResult {
  major: UCLAMajor;
  progress: any;
  additionalCoursesNeeded: number;
  estimatedTimeToGraduation: string;
  transferableCredits: number;
}

const WhatIfSimulator = ({ currentMajor, completedCourses }: WhatIfSimulatorProps) => {
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    if (!selectedMajor) return;

    setIsSimulating(true);
    
    // Simulate processing time
    setTimeout(() => {
      const targetMajor = uclaMajors.find(m => m.id === selectedMajor);
      if (!targetMajor) return;

      // Calculate progress for the new major
      const progress = calculateProgress(targetMajor.name, completedCourses);
      
      // Estimate transferable credits (simplified logic)
      const transferableCredits = Math.min(
        completedCourses.length * 4, // Assume 4 credits per course
        Math.floor(targetMajor.total_units * 0.6) // Max 60% transferable
      );

      // Calculate additional courses needed
      const remainingCredits = targetMajor.total_units - transferableCredits;
      const additionalCoursesNeeded = Math.ceil(remainingCredits / 4);

      // Estimate time to graduation
      const quartersNeeded = Math.ceil(additionalCoursesNeeded / 3); // 3 courses per quarter
      const yearsNeeded = Math.ceil(quartersNeeded / 3); // 3 quarters per year
      const estimatedTimeToGraduation = `${yearsNeeded} year${yearsNeeded > 1 ? 's' : ''}`;

      setSimulationResult({
        major: targetMajor,
        progress,
        additionalCoursesNeeded,
        estimatedTimeToGraduation,
        transferableCredits
      });
      
      setIsSimulating(false);
    }, 1500);
  };

  const resetSimulation = () => {
    setSelectedMajor("");
    setSimulationResult(null);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          What-If Major Simulator
        </CardTitle>
        <CardDescription>
          Explore how switching majors would affect your graduation timeline
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Major Display */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Current Major</h4>
              <p className="text-sm text-blue-700">{currentMajor}</p>
            </div>
            <Badge className="bg-blue-500 text-white">Active</Badge>
          </div>
        </div>

        {/* Major Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Simulate switching to:</span>
          </div>
          
          <Select value={selectedMajor} onValueChange={setSelectedMajor}>
            <SelectTrigger>
              <SelectValue placeholder="Select a major to simulate" />
            </SelectTrigger>
            <SelectContent>
              {uclaMajors
                .filter(major => major.name !== currentMajor)
                .map((major) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name} ({major.degree})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={runSimulation} 
            disabled={!selectedMajor || isSimulating}
            className="flex-1"
          >
            {isSimulating ? "Simulating..." : "Run Simulation"}
          </Button>
          {simulationResult && (
            <Button variant="outline" onClick={resetSimulation}>
              Reset
            </Button>
          )}
        </div>

        {/* Simulation Results */}
        {simulationResult && (
          <div className="space-y-4">
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Simulation Results
              </h4>

              {/* New Major Info */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-green-900">{simulationResult.major.name}</h5>
                    <Badge className="bg-green-500 text-white">Simulated</Badge>
                  </div>
                  <p className="text-sm text-green-700">{simulationResult.major.school}</p>
                  <p className="text-xs text-green-600">{simulationResult.major.description}</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {simulationResult.transferableCredits}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transferable Credits
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {simulationResult.additionalCoursesNeeded}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Additional Courses
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Estimated Timeline</span>
                </div>
                <p className="text-sm text-yellow-700">
                  With your current progress, you could complete this major in approximately{" "}
                  <span className="font-semibold">{simulationResult.estimatedTimeToGraduation}</span>
                </p>
              </div>

              {/* Progress Comparison */}
              <div className="space-y-3">
                <h5 className="font-medium">Degree Progress Comparison</h5>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{simulationResult.progress?.overallProgress || 0}%</span>
                  </div>
                  <Progress value={simulationResult.progress?.overallProgress || 0} />
                </div>

                <div className="text-xs text-muted-foreground">
                  * This simulation is based on course transferability and typical graduation requirements.
                  Consult with an academic advisor for official guidance.
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">Recommendations</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Meet with an academic advisor to discuss this major change</li>
                  <li>• Review prerequisite requirements for core courses</li>
                  <li>• Consider taking foundational courses in the new major</li>
                  {simulationResult.additionalCoursesNeeded > 20 && (
                    <li>• Explore summer session options to accelerate progress</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatIfSimulator;
