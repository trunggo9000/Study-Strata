import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, MapPin, User, Edit, Plus, Trash2 } from "lucide-react";
import { convertTo12Hour, convertTo24Hour, generateTimeSlots, isValidTimeFormat } from "@/utils/timeUtils";
import ScheduleOptimizer from "./ScheduleOptimizer";
import { ScheduledCourse } from "@/data/courseData";

interface EditableScheduleGridProps {
  courses: ScheduledCourse[];
  title?: string;
  onCoursesUpdate?: (courses: ScheduledCourse[]) => void;
}

const EditableScheduleGrid = ({ courses: initialCourses, title = "Weekly Schedule", onCoursesUpdate }: EditableScheduleGridProps) => {
  const [courses, setCourses] = useState<ScheduledCourse[]>(initialCourses);
  const [editingCourse, setEditingCourse] = useState<ScheduledCourse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduledCourse>>({});

  // Update parent component when courses change
  const updateCourses = (newCourses: ScheduledCourse[]) => {
    setCourses(newCourses);
    onCoursesUpdate?.(newCourses);
  };

  const timeSlots = generateTimeSlots();
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayAbbr = ["M", "T", "W", "R", "F"];

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      id: Date.now().toString(),
      code: "",
      name: "",
      instructor: "",
      location: "",
      startTime: "09:00",
      endTime: "10:50",
      days: [],
      credits: 4,
      difficulty: "medium",
      type: "core",
      prerequisites: [],
      description: "",
      quarters: [],
      major: []
    });
    setIsDialogOpen(true);
  };

  const handleEditCourse = (course: ScheduledCourse) => {
    setEditingCourse(course);
    setFormData(course);
    setIsDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    updateCourses(courses.filter(c => c.id !== courseId));
  };

  const handleSaveCourse = () => {
    if (!formData.code || !formData.name || !formData.days?.length) return;

    const courseData = {
      ...formData,
      id: formData.id || Date.now().toString(),
    } as ScheduledCourse;

    if (editingCourse) {
      updateCourses(courses.map(c => c.id === editingCourse.id ? courseData : c));
    } else {
      updateCourses([...courses, courseData]);
    }

    setIsDialogOpen(false);
    setFormData({});
    setEditingCourse(null);
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setFormData({ ...formData, days: newDays });
  };

  const getCoursesForSlot = (day: string, timeSlot: string): ScheduledCourse[] => {
    return courses.filter(course => {
      if (!course.days.includes(day)) return false;
      
      const courseStart = parseInt(course.startTime.replace(":", ""));
      const courseEnd = parseInt(course.endTime.replace(":", ""));
      const slotTime = parseInt(timeSlot.replace(":", ""));
      
      return slotTime >= courseStart && slotTime < courseEnd;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "hard": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "core": return "bg-primary text-primary-foreground";
      case "elective": return "bg-secondary text-secondary-foreground";
      case "ge": return "bg-accent text-accent-foreground";
      case "math": return "bg-indigo-500 text-white";
      case "science": return "bg-teal-500 text-white";
      default: return "bg-muted";
    }
  };

  const renderCourseForm = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Course Code</Label>
            <Input
              id="code"
              value={formData.code || ""}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="CS31"
            />
          </div>
          <div>
            <Label htmlFor="credits">Credits</Label>
            <Input
              id="credits"
              type="number"
              value={formData.credits || 4}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="name">Course Name</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Introduction to Computer Science"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={formData.instructor || ""}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="Dr. Smith"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Boelter 5420"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Select value={formData.startTime} onValueChange={(value) => setFormData({ ...formData, startTime: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>{convertTo12Hour(time)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Select value={formData.endTime} onValueChange={(value) => setFormData({ ...formData, endTime: value })}>
              <SelectTrigger>
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>{convertTo12Hour(time)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label>Days</Label>
          <div className="flex gap-2 mt-2">
            {dayAbbr.map(day => (
              <Button
                key={day}
                variant={formData.days?.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDayToggle(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setFormData({ ...formData, difficulty: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: "core" | "elective" | "ge" | "math" | "science") => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Course type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
                <SelectItem value="math">Math</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="ge">General Ed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Schedule Optimizer */}
      <ScheduleOptimizer 
        currentSchedule={courses}
        onOptimizedSchedule={updateCourses}
      />
      
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Schedule</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? "Edit Course" : "Add New Course"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCourse ? "Update course details" : "Add a new course to your schedule"}
                  </DialogDescription>
                </DialogHeader>
                {renderCourseForm()}
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-2 text-sm">
            {/* Header row */}
            <div className="p-3 font-semibold text-center">Time</div>
            {weekdays.map((day, index) => (
              <div key={day} className="p-3 font-semibold text-center bg-muted rounded">
                {day}
                <br />
                <span className="text-xs text-muted-foreground">{dayAbbr[index]}</span>
              </div>
            ))}
            
            {/* Time slots */}
            {timeSlots.filter((_, index) => index % 2 === 0).map(timeSlot => (
              <div key={timeSlot} className="contents">
                <div className="p-3 text-center font-medium bg-muted/50 rounded">
                  {convertTo12Hour(timeSlot)}
                </div>
                
                {dayAbbr.map(day => {
                  const coursesInSlot = getCoursesForSlot(day, timeSlot);
                  
                  return (
                    <div key={`${day}-${timeSlot}`} className="p-1 border border-border/50 min-h-[60px] relative">
                      {coursesInSlot.map((course, index) => (
                        <div
                          key={`${course.id}-${index}`}
                          className="mb-2 p-2 rounded text-xs bg-card border shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                          onClick={() => handleEditCourse(course)}
                        >
                          <div className="font-medium text-foreground">{course.code}</div>
                          <div className="text-muted-foreground truncate">{course.name}</div>
                          
                          <div className="flex gap-1 mb-1 mt-1">
                            <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                              {course.difficulty}
                            </Badge>
                            <Badge className={getTypeColor(course.type)} variant="secondary">
                              {course.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">{course.instructor}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{course.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{convertTo12Hour(course.startTime)} - {convertTo12Hour(course.endTime)}</span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(course.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditableScheduleGrid;
