import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Bot, User, Lightbulb, BookOpen, Target } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "advisor";
  timestamp: Date;
  type?: "suggestion" | "warning" | "info";
}

const AdvisorChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Academic Advisor. I've analyzed your profile and I'm ready to help you plan your academic journey. Feel free to ask me about course recommendations, degree requirements, or schedule planning!",
      sender: "advisor",
      timestamp: new Date(),
      type: "info"
    },
    {
      id: "2", 
      content: "Based on your Computer Science major and sophomore year status, I recommend taking CS33 next quarter as it's a prerequisite for many upper-division courses. Would you like me to suggest some complementary courses?",
      sender: "advisor",
      timestamp: new Date(),
      type: "suggestion"
    }
  ]);
  
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
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const advisorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAdvisorResponse(inputMessage),
        sender: "advisor", 
        timestamp: new Date(),
        type: "info"
      };
      
      setMessages(prev => [...prev, advisorResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const getAdvisorResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("schedule") || input.includes("plan")) {
      return "Great question about scheduling! For your current academic level, I recommend balancing core requirements with electives. Let me suggest a schedule that includes CS33 (prerequisite for advanced courses), Math 33A (essential for CS theory), and a GE course to maintain balance.";
    } else if (input.includes("difficult") || input.includes("hard")) {
      return "I understand your concern about course difficulty. Based on grade distributions, CS33 has a moderate difficulty level. I recommend pairing it with an easier GE course this quarter. Would you like me to suggest some complementary lighter courses?";
    } else if (input.includes("graduate") || input.includes("grad")) {
      return "For graduate school preparation, focus on maintaining a strong GPA while gaining research experience. Consider taking advanced electives in your area of interest and connecting with professors for research opportunities.";
    } else if (input.includes("prerequisite") || input.includes("prereq")) {
      return "Let me check the prerequisite chains for you. CS33 is crucial as it unlocks CS111, CS118, and other upper-division courses. Math 33A opens up CS180 (Algorithms) and machine learning courses. Planning these early is wise!";
    } else {
      return "That's an interesting question! Based on your academic profile and goals, I'd recommend focusing on building a strong foundation in your core subjects while exploring areas that align with your career interests. Is there a specific aspect of your academic planning you'd like to dive deeper into?";
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
      <CardHeader className="bg-gradient-primary text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Academic Advisor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
              {message.sender === "advisor" && (
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.sender === "user" ? "order-1" : ""}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  } animate-fade-in`}
                >
                  {message.sender === "advisor" && message.type && (
                    <div className="flex items-center gap-2 mb-2 text-sm opacity-80">
                      {getMessageIcon(message.type)}
                      <span className="capitalize">{message.type}</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {message.sender === "user" && (
                <Avatar className="h-8 w-8 bg-secondary">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg animate-pulse">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick suggestions */}
        <div className="p-4 border-t bg-muted/50">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSuggestion(suggestion.action)}
                className="whitespace-nowrap flex items-center gap-2"
              >
                <suggestion.icon className="h-3 w-3" />
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about courses, requirements, or planning..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvisorChat;