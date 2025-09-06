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
  type: "core" | "elective" | "ge" | "math" | "science";
}

interface ScheduleGridProps {
  courses: Course[];
  title?: string;
  scheduleDays?: number;
}

const mockCourses: Course[] = [
  {
    id: "1",
    code: "CS31",
    name: "Introduction to Computer Science I",
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
    code: "MATH31A",
    name: "Differential and Integral Calculus",
    instructor: "Prof. Johnson",
    location: "MS 6221",
    startTime: "11:00",
    endTime: "12:50",
    days: ["T", "R"],
    credits: 4,
    difficulty: "medium",
    type: "math"
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
    code: "LIFESCI7A",
    name: "Cell and Molecular Biology",
    instructor: "Prof. Davis",
    location: "Dodd 154",
    startTime: "16:00",
    endTime: "17:50", 
    days: ["T", "R"],
    credits: 4,
    difficulty: "medium",
    type: "science"
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
    case "math": return "bg-indigo-500 text-white";
    case "science": return "bg-teal-500 text-white";
    default: return "bg-muted";
  }
};

const ScheduleGrid = ({ courses = mockCourses, title = "Weekly Schedule", scheduleDays = 5 }: ScheduleGridProps) => {
  const getCoursesForSlot = (day: string, time: string) => {
    return courses.filter(course => {
      if (!course.days.includes(day)) return false;
      
      const start = parseInt(time.replace(":", ""));
      const end = parseInt(course.startTime.replace(":", ""));
      return start === end;
    });
  };

  const getDurationInSlots = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.replace(":", ""));
    const end = parseInt(endTime.replace(":", ""));
    return Math.ceil((end - start) / 100);
  };

  const displayWeekdays = weekdays.slice(0, scheduleDays);
  const displayDayAbbr = dayAbbr.slice(0, scheduleDays);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className={`grid gap-1 min-w-[800px]`} style={{ gridTemplateColumns: `120px repeat(${scheduleDays}, 1fr)` }}>
            {/* Header row */}
            <div className="p-2 font-semibold text-center border-b">Time</div>
            {displayWeekdays.map((day, index) => (
              <div key={day} className="p-2 font-semibold text-center border-b">
                {day}
                <div className="text-xs text-muted-foreground mt-1">{displayDayAbbr[index]}</div>
              </div>
            ))}
            
            {/* Time slots */}
            {timeSlots.map(time => (
              <div key={time} className="contents">
                <div className="p-2 text-sm font-medium text-center border-r bg-muted/30">
                  {time}
                </div>
                {displayDayAbbr.map(day => {
                  const coursesInSlot = getCoursesForSlot(day, time);
                  return (
                    <div key={`${day}-${time}`} className="p-1 border-r border-b min-h-[60px] relative">
                      {coursesInSlot.map(course => {
                        const duration = getDurationInSlots(course.startTime, course.endTime);
                        return (
                          <div
                            key={course.id}
                            className="absolute inset-1 rounded-md p-2 text-xs overflow-hidden shadow-sm"
                            style={{
                              height: `${duration * 60 - 8}px`,
                              backgroundColor: 'var(--primary)',
                              color: 'var(--primary-foreground)'
                            }}
                          >
                            <div className="font-semibold text-xs mb-1">{course.code}</div>
                            <div className="text-xs opacity-90 mb-1 line-clamp-2">{course.name}</div>
                            <div className="flex items-center gap-1 text-xs opacity-75">
                              <User className="h-3 w-3" />
                              <span className="truncate">{course.instructor}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{course.location}</span>
                            </div>
                            <div className="flex gap-1 mt-1">
                              <Badge className={`text-xs px-1 py-0 ${getDifficultyColor(course.difficulty)}`}>
                                {course.difficulty}
                              </Badge>
                              <Badge className={`text-xs px-1 py-0 ${getTypeColor(course.type)}`}>
                                {course.type}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleGrid;