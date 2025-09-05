import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  location: string;
  startTime: string;
  endTime: string;
  days: string[];
  credits: number;
  difficulty: "easy" | "medium" | "hard";
  type: "core" | "elective" | "ge";
}

interface ScheduleGridProps {
  courses: Course[];
  title?: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    code: "CS33",
    name: "Introduction to Computer Organization",
    instructor: "Dr. Smith",
    location: "Boelter 5420",
    startTime: "09:00",
    endTime: "10:50",
    days: ["M", "W", "F"],
    credits: 4,
    difficulty: "medium",
    type: "core"
  },
  {
    id: "2", 
    code: "MATH33A",
    name: "Linear Algebra and Applications",
    instructor: "Prof. Johnson",
    location: "MS 6221",
    startTime: "11:00",
    endTime: "12:50",
    days: ["T", "R"],
    credits: 4,
    difficulty: "hard",
    type: "core"
  },
  {
    id: "3",
    code: "ENGCOMP3",
    name: "English Composition 3",
    instructor: "Dr. Williams",
    location: "Humanities A65",
    startTime: "14:00", 
    endTime: "15:50",
    days: ["M", "W"],
    credits: 4,
    difficulty: "easy",
    type: "ge"
  },
  {
    id: "4",
    code: "PHILOS7",
    name: "Introduction to Philosophy",
    instructor: "Prof. Davis",
    location: "Dodd 154",
    startTime: "16:00",
    endTime: "17:50", 
    days: ["T", "R"],
    credits: 4,
    difficulty: "medium",
    type: "ge"
  }
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const dayAbbr = ["M", "T", "W", "R", "F"];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy": return "bg-success text-success-foreground";
    case "medium": return "bg-warning text-warning-foreground";
    case "hard": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "core": return "bg-primary text-primary-foreground";
    case "elective": return "bg-secondary text-secondary-foreground";
    case "ge": return "bg-accent text-accent-foreground";
    default: return "bg-muted";
  }
};

const ScheduleGrid = ({ courses = mockCourses, title = "Weekly Schedule" }: ScheduleGridProps) => {
  const getCoursesForSlot = (day: string, time: string) => {
    return courses.filter(course => {
      if (!course.days.includes(day)) return false;
      
      const courseStart = parseInt(course.startTime.replace(":", ""));
      const courseEnd = parseInt(course.endTime.replace(":", ""));
      const slotTime = parseInt(time.replace(":", ""));
      
      return slotTime >= courseStart && slotTime < courseEnd;
    });
  };

  return (
    <Card className="w-full shadow-card">
      <CardHeader className="bg-gradient-subtle">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
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
          {timeSlots.map(time => (
            <div key={time} className="contents">
              <div className="p-3 text-center font-medium bg-muted/50 rounded">
                {time}
              </div>
              
              {dayAbbr.map(day => {
                const coursesInSlot = getCoursesForSlot(day, time);
                
                return (
                  <div key={`${day}-${time}`} className="p-1 border border-border/50 min-h-[60px] relative">
                    {coursesInSlot.map(course => (
                      <div
                        key={course.id}
                        className="bg-gradient-primary text-primary-foreground p-2 rounded text-xs shadow-course mb-1 animate-bounce-in"
                      >
                        <div className="font-semibold">{course.code}</div>
                        <div className="truncate">{course.name}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-90">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{course.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Course details */}
        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-lg">Course Details</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map(course => (
              <Card key={course.id} className="shadow-course hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-lg">{course.code}</h5>
                      <p className="text-sm text-muted-foreground">{course.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                        {course.difficulty}
                      </Badge>
                      <Badge className={getTypeColor(course.type)} variant="secondary">
                        {course.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{course.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {course.days.join(", ")} • {course.startTime} - {course.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{course.credits} credits</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleGrid;