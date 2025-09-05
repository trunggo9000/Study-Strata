import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  recommendations?: CourseRecommendation[];
}

interface CourseRecommendation {
  courseId: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  quarter: string;
}

interface AcademicInsight {
  type: 'progress' | 'warning' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  actionable?: boolean;
  action?: string;
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  timeline: string;
  courses: string[];
  milestones: string[];
  created: Date;
}

interface AIAdvisorProps {
  studentId?: string;
  currentSchedule?: any[];
  onCourseRecommendation?: (courseId: string) => void;
  onScheduleUpdate?: (plan: StudyPlan) => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  studentId,
  currentSchedule = [],
  onCourseRecommendation,
  onScheduleUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [insights, setInsights] = useState<AcademicInsight[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const mockInsights: AcademicInsight[] = [
    {
      type: 'progress',
      title: 'On Track for Graduation',
      description: 'You\'re progressing well towards your Computer Science degree. 65% complete with major requirements.',
      actionable: false
    },
    {
      type: 'warning',
      title: 'Prerequisites Gap',
      description: 'You need to complete CS70 before taking advanced AI courses next year.',
      actionable: true,
      action: 'Schedule CS70 for Fall 2024'
    },
    {
      type: 'opportunity',
      title: 'Research Opportunity',
      description: 'Based on your interest in AI, consider joining Prof. Smith\'s machine learning research group.',
      actionable: true,
      action: 'Apply for research position'
    },
    {
      type: 'achievement',
      title: 'Strong Foundation',
      description: 'Excellent performance in core CS courses. Average GPA: 3.8 in major courses.',
      actionable: false
    }
  ];

  const mockStudyPlans: StudyPlan[] = [
    {
      id: '1',
      title: 'AI Specialization Track',
      description: 'Optimized path for artificial intelligence and machine learning focus',
      timeline: '4 semesters',
      courses: ['CS188', 'CS189', 'CS285', 'CS294'],
      milestones: ['Complete core AI courses', 'Research project', 'Industry internship'],
      created: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Early Graduation Plan',
      description: 'Accelerated timeline to graduate in 3.5 years',
      timeline: '7 semesters',
      courses: ['CS61A', 'CS61B', 'CS70', 'CS188', 'CS189'],
      milestones: ['Summer courses', 'Overload quarters', 'Thesis completion'],
      created: new Date('2024-02-01')
    }
  ];

  useEffect(() => {
    setInsights(mockInsights);
    setStudyPlans(mockStudyPlans);
    
    // Welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI Academic Advisor. I can help you with course planning, degree requirements, and academic guidance. What would you like to discuss today?',
      timestamp: new Date(),
      suggestions: [
        'Plan my next semester',
        'Check degree progress',
        'Recommend electives',
        'Find research opportunities'
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    let content = '';
    let recommendations: CourseRecommendation[] = [];
    let suggestions: string[] = [];

    if (input.includes('plan') || input.includes('semester') || input.includes('schedule')) {
      content = 'Based on your current progress and interests, I recommend focusing on core CS courses next semester. You should prioritize CS61B (Data Structures) and consider adding CS70 (Discrete Math) to stay on track for advanced courses.';
      recommendations = [
        {
          courseId: 'CS61B',
          title: 'Data Structures',
          reason: 'Essential prerequisite for advanced CS courses',
          priority: 'high',
          quarter: 'Fall 2024'
        },
        {
          courseId: 'CS70',
          title: 'Discrete Mathematics and Probability Theory',
          reason: 'Required for theoretical CS courses',
          priority: 'high',
          quarter: 'Fall 2024'
        }
      ];
      suggestions = ['Show detailed course sequence', 'Check for conflicts', 'Alternative options'];
    } else if (input.includes('progress') || input.includes('degree') || input.includes('graduation')) {
      content = 'You\'ve completed 65% of your major requirements and are on track to graduate in Spring 2026. You need 45 more units in major courses and should complete your capstone project by Fall 2025.';
      suggestions = ['View detailed progress report', 'Plan remaining courses', 'Graduation timeline'];
    } else if (input.includes('elective') || input.includes('recommend')) {
      content = 'Based on your strong performance in programming courses and interest in AI, I recommend CS188 (Intro to AI) or CS186 (Database Systems). Both align well with current industry trends and your academic strengths.';
      recommendations = [
        {
          courseId: 'CS188',
          title: 'Introduction to Artificial Intelligence',
          reason: 'Matches your AI interests and has high industry relevance',
          priority: 'high',
          quarter: 'Spring 2025'
        },
        {
          courseId: 'CS186',
          title: 'Introduction to Database Systems',
          reason: 'Valuable for software engineering roles',
          priority: 'medium',
          quarter: 'Spring 2025'
        }
      ];
      suggestions = ['Compare course details', 'Check prerequisites', 'See career outcomes'];
    } else if (input.includes('research') || input.includes('opportunity')) {
      content = 'There are several research opportunities that match your profile. Prof. Johnson\'s NLP lab is accepting undergraduates, and the robotics lab has openings for students with strong programming backgrounds. I can help you prepare applications.';
      suggestions = ['View research positions', 'Application tips', 'Faculty contacts'];
    } else {
      content = 'I can help you with course planning, degree progress tracking, research opportunities, and academic guidance. What specific area would you like to explore?';
      suggestions = [
        'Plan next semester courses',
        'Check graduation requirements',
        'Find research opportunities',
        'Career guidance'
      ];
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'progress': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'achievement': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'progress': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
      case 'achievement': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Study Plans</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Course Recommendations */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Recommended Courses:</p>
                          {message.recommendations.map((rec, index) => (
                            <Card key={index} className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-sm">{rec.courseId}</h4>
                                    <Badge className={getPriorityColor(rec.priority)}>
                                      {rec.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{rec.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
                                  <p className="text-xs text-gray-400 mt-1">Suggested: {rec.quarter}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => onCourseRecommendation?.(rec.courseId)}
                                  className="ml-2"
                                >
                                  Add
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about courses, degree requirements, or academic planning..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!inputMessage.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="flex-1 mt-0">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Academic Insights</h3>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid gap-4">
              {insights.map((insight, index) => (
                <Card key={index} className={getInsightColor(insight.type)}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        {insight.actionable && insight.action && (
                          <Button variant="outline" size="sm" className="mt-2">
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Degree Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Major Requirements</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>General Education</span>
                    <span>80%</span>
                  </div>
                  <Progress value={80} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total Units</span>
                    <span>120/180</span>
                  </div>
                  <Progress value={67} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="flex-1 mt-0">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Study Plans</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>

            <div className="grid gap-4">
              {studyPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{plan.timeline}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Courses</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.courses.map((course) => (
                          <Badge key={course} variant="secondary">{course}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Milestones</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {plan.milestones.map((milestone, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Created {plan.created.toLocaleDateString()}
                      </span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button size="sm" onClick={() => onScheduleUpdate?.(plan)}>
                          Apply Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
