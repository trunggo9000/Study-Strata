import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User, Lightbulb, TrendingUp, Calendar, BookOpen } from "lucide-react";
import { advisorService } from "@/services/api";
import { AdvisorQuery, AdvisorResponse, StudentProfile } from "@/types/academic";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryType?: string;
  recommendations?: any[];
  analysis?: any;
}

interface EnhancedAdvisorChatProps {
  student?: StudentProfile;
  className?: string;
}

const EnhancedAdvisorChat = ({ student, className }: EnhancedAdvisorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI academic advisor. I can help you with course recommendations, schedule planning, career guidance, and academic performance analysis. What would you like to discuss?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = [
    { text: "What courses should I take next quarter?", type: "course-recommendation", icon: BookOpen },
    { text: "How can I improve my GPA?", type: "performance-analysis", icon: TrendingUp },
    { text: "What if I change my major?", type: "what-if", icon: Lightbulb },
    { text: "Plan my graduation timeline", type: "career-guidance", icon: Calendar },
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message: string, queryType: string = 'course-recommendation') => {
    if (!message.trim() || !student) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const query: AdvisorQuery = {
        question: message,
        type: queryType as any,
        context: {
          studentProfile: student,
          currentSchedule: [],
          specificCourses: [],
          targetGPA: student.preferences?.gpaGoal || 3.5,
          careerGoals: []
        }
      };

      const response = await advisorService.query(query);

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          queryType,
          recommendations: response.data.recommendations,
          analysis: response.data.analysis
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get advisor response');
      }
    } catch (error) {
      console.error('Advisor query error:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getFallbackResponse(message, queryType),
        timestamp: new Date(),
        queryType
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (question: string, type: string): string => {
    const responses = {
      'course-recommendation': `Based on your academic progress, I'd recommend focusing on core courses for your major. Consider taking prerequisite courses early to unlock advanced options. Would you like me to suggest specific courses for next quarter?`,
      'performance-analysis': `To improve your academic performance, consider: 1) Balancing course difficulty across quarters, 2) Utilizing office hours and study groups, 3) Taking courses that align with your strengths. Your current GPA trajectory looks promising!`,
      'what-if': `Major changes can significantly impact your graduation timeline and course requirements. I'd recommend meeting with an academic counselor to discuss the implications. Would you like me to analyze specific scenarios?`,
      'career-guidance': `For career planning, focus on building both technical and soft skills through coursework and extracurriculars. Consider internships and networking opportunities in your field of interest.`
    };

    return responses[type as keyof typeof responses] || "I'm here to help with your academic planning. Could you provide more specific details about what you'd like to discuss?";
  };

  const handleQuickSuggestion = (suggestion: typeof quickSuggestions[0]) => {
    handleSendMessage(suggestion.text, suggestion.type);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {/* Render recommendations if available */}
          {message.recommendations && message.recommendations.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-muted-foreground">Recommended courses:</p>
              {message.recommendations.slice(0, 3).map((rec: any, index: number) => (
                <Card key={index} className="p-2 bg-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{rec.course?.code || `Course ${index + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{rec.reason}</p>
                    </div>
                    <Badge variant={rec.priority === 'HIGH' ? 'destructive' : rec.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-1">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Academic Advisor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map(renderMessage)}
            
            {isLoading && (
              <div className="flex gap-3 justify-start mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 py-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-auto py-2"
                    onClick={() => handleQuickSuggestion(suggestion)}
                    disabled={isLoading || !student}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {suggestion.text}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={student ? "Ask me anything about your academic plan..." : "Please complete your profile first..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
              disabled={isLoading || !student}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isLoading || !student}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {!student && (
            <p className="text-xs text-muted-foreground mt-2">
              Complete your academic profile to get personalized advice
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAdvisorChat;
