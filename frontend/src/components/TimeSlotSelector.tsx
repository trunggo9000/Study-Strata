import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { convertTo12Hour, convertTo24Hour, generateTimeSlots } from "@/utils/timeUtils";

interface TimeSlot {
  startTime: string;
  endTime: string;
  days: string[];
}

interface TimeSlotSelectorProps {
  courseCode: string;
  courseName: string;
  currentTimeSlot?: TimeSlot;
  onTimeSlotChange: (timeSlot: TimeSlot) => void;
  existingSchedule: TimeSlot[];
}

const TimeSlotSelector = ({ 
  courseCode, 
  courseName, 
  currentTimeSlot, 
  onTimeSlotChange,
  existingSchedule 
}: TimeSlotSelectorProps) => {
  const [selectedStartTime, setSelectedStartTime] = useState(currentTimeSlot?.startTime || "09:00");
  const [selectedEndTime, setSelectedEndTime] = useState(currentTimeSlot?.endTime || "10:50");
  const [selectedDays, setSelectedDays] = useState<string[]>(currentTimeSlot?.days || []);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const timeSlots = generateTimeSlots();
  const daysOfWeek = [
    { short: "M", full: "Monday" },
    { short: "T", full: "Tuesday" },
    { short: "W", full: "Wednesday" },
    { short: "R", full: "Thursday" },
    { short: "F", full: "Friday" }
  ];

  const checkForConflicts = (startTime: string, endTime: string, days: string[]): string[] => {
    const conflicts: string[] = [];
    const newStart = parseInt(startTime.replace(":", ""));
    const newEnd = parseInt(endTime.replace(":", ""));

    existingSchedule.forEach((slot, index) => {
      const existingStart = parseInt(slot.startTime.replace(":", ""));
      const existingEnd = parseInt(slot.endTime.replace(":", ""));
      
      // Check if days overlap
      const dayOverlap = days.some(day => slot.days.includes(day));
      
      // Check if times overlap
      const timeOverlap = (newStart < existingEnd && newEnd > existingStart);
      
      if (dayOverlap && timeOverlap) {
        conflicts.push(`Conflict with existing class ${index + 1} (${slot.days.join(", ")} ${convertTo12Hour(slot.startTime)}-${convertTo12Hour(slot.endTime)})`);
      }
    });

    return conflicts;
  };

  const handleTimeSlotUpdate = () => {
    const conflictList = checkForConflicts(selectedStartTime, selectedEndTime, selectedDays);
    
    if (conflictList.length > 0) {
      setConflicts(conflictList);
      setShowConflictDialog(true);
      return;
    }

    const newTimeSlot: TimeSlot = {
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      days: selectedDays
    };

    onTimeSlotChange(newTimeSlot);
  };

  const forceUpdate = () => {
    const newTimeSlot: TimeSlot = {
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      days: selectedDays
    };
    onTimeSlotChange(newTimeSlot);
    setShowConflictDialog(false);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const getOptimalTimeSlots = () => {
    const optimal: { time: string, reason: string }[] = [];
    
    // Morning slots (9-11 AM)
    optimal.push({
      time: "09:00-10:50",
      reason: "Peak focus hours, less traffic"
    });
    
    // Mid-morning (10-12 PM)
    optimal.push({
      time: "10:00-11:50", 
      reason: "Good concentration, avoids rush hour"
    });
    
    // Early afternoon (1-3 PM)
    optimal.push({
      time: "13:00-14:50",
      reason: "Post-lunch energy, good for technical subjects"
    });

    return optimal;
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Slot Selector
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {courseCode} - {courseName}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Time</label>
              <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {convertTo12Hour(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">End Time</label>
              <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {convertTo12Hour(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Days of Week</label>
            <div className="flex gap-2">
              {daysOfWeek.map(day => (
                <Button
                  key={day.short}
                  variant={selectedDays.includes(day.short) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.short)}
                  className="w-12"
                >
                  {day.short}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selected: {selectedDays.map(d => daysOfWeek.find(day => day.short === d)?.full).join(", ")}
            </p>
          </div>

          {/* Current Selection Preview */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Selected Time Slot</span>
            </div>
            <p className="text-sm text-blue-700">
              {selectedDays.join(", ")} • {convertTo12Hour(selectedStartTime)} - {convertTo12Hour(selectedEndTime)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Duration: {Math.round((parseInt(selectedEndTime.replace(":", "")) - parseInt(selectedStartTime.replace(":", ""))) / 100 * 60)} minutes
            </p>
          </div>

          {/* Optimal Time Suggestions */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Optimal Time Slots
            </h4>
            <div className="space-y-2">
              {getOptimalTimeSlots().map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div>
                    <span className="text-sm font-medium text-green-900">{slot.time}</span>
                    <p className="text-xs text-green-700">{slot.reason}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const [start, end] = slot.time.split("-");
                      setSelectedStartTime(convertTo24Hour(start));
                      setSelectedEndTime(convertTo24Hour(end));
                    }}
                    className="text-xs"
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button onClick={handleTimeSlotUpdate} className="w-full">
            Update Time Slot
          </Button>
        </CardContent>
      </Card>

      {/* Conflict Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Schedule Conflict Detected
            </DialogTitle>
            <DialogDescription>
              The selected time slot conflicts with your existing schedule.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Conflicts:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index}>• {conflict}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConflictDialog(false)}>
                Choose Different Time
              </Button>
              <Button onClick={forceUpdate} className="bg-yellow-600 hover:bg-yellow-700">
                Override Conflict
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeSlotSelector;
