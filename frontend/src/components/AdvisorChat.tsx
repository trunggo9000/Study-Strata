import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Bot, User, Lightbulb, BookOpen, Target } from "lucide-react";
import { generatePersonalizedRecommendations, getInitialAdvisorMessage, StudentProfile as RecommendationProfile } from "@/utils/courseRecommendations";
import { useStudent } from "@/hooks/useStudent";

interface Message {
  id: string;
  content: string;
  sender: "user" | "advisor";
  timestamp: Date;
  type?: "suggestion" | "warning" | "info";
}

const AdvisorChat = () => {
  const { student } = useStudent();
  
  // Mock student data for development when API is not available
  const mockStudent = {
    id: "mock-student-1",
    name: "Test Student",
    email: "test@ucla.edu",
    major: "COMPUTER_SCIENCE",
    totalCredits: 12,
    currentGPA: 3.5,
    completedCourses: [
      { id: "CS31", code: "CS31", name: "Introduction to Computer Science I", credits: 4 }
    ],
    currentQuarter: { season: "Fall", year: 2024 },
    preferences: {}
  };
  
  // Use mock data if student is null (API not available)
  const activeStudent = student || mockStudent;
  
  // Generate initial message based on student profile
  const getInitialMessage = (): Message => {
    // Determine year level based on completed courses and total credits
    const getYearLevel = (): 'freshman' | 'sophomore' | 'junior' | 'senior' => {
      const totalCredits = activeStudent.totalCredits || 0;
      if (totalCredits >= 135) return 'senior';
      if (totalCredits >= 90) return 'junior';
      if (totalCredits >= 45) return 'sophomore';
      return 'freshman';
    };

    const studentProfile: RecommendationProfile = {
      year: getYearLevel(),
      major: activeStudent.major === 'COMPUTER_SCIENCE' ? 'Computer Science' : 'Computer Science',
      completedCourses: activeStudent.completedCourses?.map(course => course.id) || [],
      currentGPA: activeStudent.currentGPA
    };
    
    return {
      id: "1",
      content: getInitialAdvisorMessage(studentProfile),
      sender: "advisor",
      timestamp: new Date(),
      type: "info"
    };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response with more realistic timing
    setTimeout(() => {
      const advisorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAdvisorResponse(currentInput),
        sender: "advisor", 
        timestamp: new Date(),
        type: "info"
      };
      
      setMessages(prev => [...prev, advisorResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAdvisorResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Determine year level for personalized responses
    const getYearLevel = (): 'freshman' | 'sophomore' | 'junior' | 'senior' => {
      const totalCredits = activeStudent.totalCredits || 0;
      if (totalCredits >= 135) return 'senior';
      if (totalCredits >= 90) return 'junior';
      if (totalCredits >= 45) return 'sophomore';
      return 'freshman';
    };

    const yearLevel = getYearLevel();
    const completedCourseIds = activeStudent.completedCourses?.map(course => course.id) || [];
    
    if (input.includes("schedule") || input.includes("plan") || input.includes("next quarter")) {
      if (yearLevel === 'freshman') {
        if (!completedCourseIds.includes('CS31')) {
          return "As a freshman, I recommend starting with CS31 - this is the essential first course for all Computer Science majors. Pair it with MATH31A (Differential Calculus) and ENGCOMP3 (Writing I) for a balanced 12-credit quarter.";
        } else if (!completedCourseIds.includes('CS32')) {
          return "Great progress! Next, take CS32 to continue building your programming foundation with object-oriented programming and data structures. Add MATH31B and a GE course for balance.";
        }
      } else if (yearLevel === 'sophomore') {
        if (completedCourseIds.includes('CS32') && !completedCourseIds.includes('CS33')) {
          return "As a sophomore who's completed CS32, I recommend CS33 (Computer Organization) next quarter - it's a prerequisite for many upper-division courses. Pair it with CS35L and MATH32A for solid progress.";
        }
      }
      return "Based on your completed courses and year level, I can provide personalized recommendations. What specific courses or areas are you interested in exploring?";
    } else if (input.includes("difficult") || input.includes("hard")) {
      return `Looking at your ${yearLevel} status and course history, I recommend balancing one challenging course with easier ones each quarter. Consider your current GPA of ${activeStudent.currentGPA?.toFixed(2) || 'N/A'} when planning workload.`;
    } else if (input.includes("graduate") || input.includes("grad") || input.includes("industry") || input.includes("career")) {
      if (yearLevel === 'freshman' || yearLevel === 'sophomore') {
        return "Focus on building a strong foundation first with core CS courses. Maintain a high GPA and consider research opportunities. Both industry and graduate school value strong fundamentals in algorithms, systems, and mathematics.";
      } else {
        return "For industry preparation, focus on practical skills: CS143 (Databases), CS161 (AI), and CS170A (Machine Learning) are highly valued. For graduate school, maintain a 3.5+ GPA and consider research-oriented electives.";
      }
    } else if (input.includes("prerequisite") || input.includes("prereq") || input.includes("requirements")) {
      const completedCount = completedCourseIds.length;
      return `You've completed ${completedCount} courses so far. Based on your progress, focus on prerequisite chains: CS31→CS32→CS33 opens upper-division courses, and MATH31A→31B→32A provides the mathematical foundation you'll need.`;
    } else if (input.includes("credit") || input.includes("graduation")) {
      const totalCredits = activeStudent.totalCredits || 0;
      const creditsNeeded = Math.max(0, 180 - totalCredits);
      return `You've earned ${totalCredits} credits toward your degree. You need approximately ${creditsNeeded} more credits to graduate. Focus on completing core CS requirements first, then electives aligned with your career goals.`;
    } else if (input.includes("math") || input.includes("calculus")) {
      if (yearLevel === 'freshman') {
        return "For freshmen, start with MATH31A (Differential Calculus) - it's essential for CS and pairs well with CS31. Follow with MATH31B and MATH32A to complete your calculus sequence.";
      } else {
        return "Mathematics is crucial for CS. Complete MATH31A/31B/32A for calculus, then consider MATH33A (Linear Algebra) and MATH61 (Discrete Structures) for advanced CS courses.";
      }
    } else if (input.includes("programming") || input.includes("coding")) {
      if (yearLevel === 'freshman') {
        return "Start with CS31 to learn fundamental programming concepts in C++. This builds the foundation for all future CS courses. No prior programming experience is required!";
      } else {
        return "Continue building programming skills with CS32 (data structures), CS33 (systems programming), and CS35L (software construction tools). Each course builds on the previous one.";
      }
    } else {
      return "I'm here to help with your academic planning! I can assist with course selection, prerequisite planning, career preparation, or degree requirement tracking. What specific aspect would you like guidance on?";
    }
  };

  const quickSuggestions = [
    { icon: Lightbulb, text: "Suggest next quarter courses", action: "What courses should I take next quarter?" },
    { icon: BookOpen, text: "Check degree progress", action: "How many requirements do I have left?" },
    { icon: Target, text: "Career guidance", action: "What courses prepare me for industry?" }
  ];

  const handleQuickSuggestion = (action: string) => {
    setInputMessage(action);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case "suggestion": return <Lightbulb className="h-4 w-4 text-warning" />;
      case "warning": return <MessageCircle className="h-4 w-4 text-destructive" />;
      default: return <MessageCircle className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-elevated">
      <CardHeader className="bg-gradient-primary text-primary-foreground flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Academic Advisor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: 'calc(100% - 140px)' }}>
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
              {message.sender === "advisor" && (
                <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[75%] ${message.sender === "user" ? "order-1" : ""}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type && getMessageIcon(message.type)}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="flex-shrink-0 p-3 border-t bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSuggestion(suggestion.action)}
                className="text-xs flex items-center gap-1"
              >
                <suggestion.icon className="h-3 w-3" />
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about your academic plan..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvisorChat;