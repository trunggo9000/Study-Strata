import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Upload, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { allCourses, getCoursesByMajor, Course } from "@/data/courseData";

interface CourseSelectorProps {
  major: string;
  completedCourses: string[];
  onCoursesUpdate: (courses: string[]) => void;
}

const CourseSelector = ({ major, completedCourses, onCoursesUpdate }: CourseSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>(completedCourses);
  const [uploadText, setUploadText] = useState("");

  const majorCourses = getCoursesByMajor(major);
  
  const filteredCourses = majorCourses.filter(course =>
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseToggle = (courseCode: string) => {
    const updated = selectedCourses.includes(courseCode)
      ? selectedCourses.filter(code => code !== courseCode)
      : [...selectedCourses, courseCode];
    
    setSelectedCourses(updated);
    onCoursesUpdate(updated);
  };

  const handleBulkUpload = () => {
    const courseCodes = uploadText
      .split(/[\n,;]/)
      .map(code => code.trim().toUpperCase())
      .filter(code => code.length > 0);
    
    const validCodes = courseCodes.filter(code => 
      allCourses.some(course => course.code === code)
    );
    
    const updated = [...new Set([...selectedCourses, ...validCodes])];
    setSelectedCourses(updated);
    onCoursesUpdate(updated);
    setUploadText("");
  };

  const getCoursesByType = (type: string) => {
    return filteredCourses.filter(course => course.type === type);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "core": return "bg-blue-100 text-blue-800 border-blue-200";
      case "elective": return "bg-purple-100 text-purple-800 border-purple-200";
      case "ge": return "bg-orange-100 text-orange-800 border-orange-200";
      case "math": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "science": return "bg-teal-100 text-teal-800 border-teal-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const isCompleted = selectedCourses.includes(course.code);
    const hasPrereqs = course.prerequisites.length > 0;
    const prereqsMet = course.prerequisites.every(prereq => selectedCourses.includes(prereq));

    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${isCompleted ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => handleCourseToggle(course.code)}
                className="mt-1"
              />
              <div>
                <h4 className="font-semibold text-lg">{course.code}</h4>
                <p className="text-sm text-muted-foreground">{course.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{course.credits} credits</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={getDifficultyColor(course.difficulty)} variant="outline">
                {course.difficulty}
              </Badge>
              <Badge className={getTypeColor(course.type)} variant="outline">
                {course.type}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
          
          {hasPrereqs && (
            <div className="flex items-center gap-2 text-sm">
              {prereqsMet ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-muted-foreground">
                Prerequisites: {course.prerequisites.join(", ")}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="text-muted-foreground">
              Offered: {course.quarters.join(", ")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Selection
        </CardTitle>
        <CardDescription>
          Select courses you have completed or plan to take. {selectedCourses.length} courses selected.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
            <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {["core", "elective", "math", "science", "ge"].map(type => {
                  const typeCourses = getCoursesByType(type);
                  if (typeCourses.length === 0) return null;
                  
                  return (
                    <div key={type}>
                      <h3 className="text-lg font-semibold mb-3 capitalize">
                        {type === "ge" ? "General Education" : type} Courses
                      </h3>
                      <div className="grid gap-3">
                        {typeCourses.map(course => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="upload-text">Paste Course Codes</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter course codes separated by commas, semicolons, or new lines (e.g., CS31, CS32, MATH31A)
                </p>
                <textarea
                  id="upload-text"
                  className="w-full h-32 p-3 border border-input rounded-md resize-none"
                  placeholder="CS31, CS32, MATH31A&#10;CS33&#10;ENGCOMP3"
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                />
              </div>
              
              <Button onClick={handleBulkUpload} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Add Courses
              </Button>
            </div>
            
            {selectedCourses.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Selected Courses ({selectedCourses.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCourses.map(courseCode => {
                    const course = allCourses.find(c => c.code === courseCode);
                    return (
                      <Badge
                        key={courseCode}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleCourseToggle(courseCode)}
                      >
                        {courseCode} ✕
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CourseSelector;
