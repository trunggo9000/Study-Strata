import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, BookOpen, Clock, Star, Users, ChevronDown, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

interface Course {
  id: string;
  title: string;
  units: number;
  difficulty: number;
  offered: string[];
  tags: string[];
  ge_categories: string[];
  description?: string;
  prerequisites: string[];
  averageRating?: number;
  enrollmentCount?: number;
}

interface SearchFilters {
  query: string;
  difficulty: [number, number];
  units: number[];
  quarters: string[];
  tags: string[];
  hasPrerequisites: boolean | null;
  minRating: number;
  sortBy: 'relevance' | 'difficulty' | 'rating' | 'popularity';
}

interface CourseSearchProps {
  onCourseSelect?: (course: Course) => void;
  selectedCourses?: string[];
  showAddButton?: boolean;
}

const QUARTERS = ['Fall', 'Winter', 'Spring', 'Summer'];
const COMMON_TAGS = [
  'programming', 'theory', 'systems', 'AI', 'machine learning', 
  'math', 'core', 'elective', 'project-based', 'research'
];

export const CourseSearch: React.FC<CourseSearchProps> = ({
  onCourseSelect,
  selectedCourses = [],
  showAddButton = true
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    difficulty: [1, 5],
    units: [],
    quarters: [],
    tags: [],
    hasPrerequisites: null,
    minRating: 0,
    sortBy: 'relevance'
  });

  // Simulated course data
  const mockCourses: Course[] = [
    {
      id: 'CS61A',
      title: 'Structure and Interpretation of Computer Programs',
      units: 4,
      difficulty: 4,
      offered: ['Fall', 'Spring'],
      tags: ['programming', 'theory', 'core'],
      ge_categories: [],
      description: 'Introduction to programming and computer science',
      prerequisites: ['CS1'],
      averageRating: 4.2,
      enrollmentCount: 450
    },
    {
      id: 'CS61B',
      title: 'Data Structures',
      units: 4,
      difficulty: 4,
      offered: ['Fall', 'Winter', 'Spring'],
      tags: ['data structures', 'algorithms', 'core'],
      ge_categories: [],
      description: 'Fundamental data structures and algorithms',
      prerequisites: ['CS61A'],
      averageRating: 4.0,
      enrollmentCount: 380
    },
    {
      id: 'CS188',
      title: 'Introduction to Artificial Intelligence',
      units: 4,
      difficulty: 4,
      offered: ['Fall', 'Spring'],
      tags: ['AI', 'machine learning', 'elective'],
      ge_categories: [],
      description: 'Principles and techniques of artificial intelligence',
      prerequisites: ['CS61B', 'CS70'],
      averageRating: 4.5,
      enrollmentCount: 320
    },
    {
      id: 'CS189',
      title: 'Introduction to Machine Learning',
      units: 4,
      difficulty: 5,
      offered: ['Fall', 'Spring'],
      tags: ['machine learning', 'AI', 'math-heavy'],
      ge_categories: [],
      description: 'Theory and practice of machine learning',
      prerequisites: ['CS61B', 'MATH53', 'MATH54'],
      averageRating: 4.3,
      enrollmentCount: 280
    }
  ];

  useEffect(() => {
    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = courses.filter(course => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesId = course.id.toLowerCase().includes(query);
        const matchesTags = course.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesDescription = course.description?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesId && !matchesTags && !matchesDescription) {
          return false;
        }
      }

      // Difficulty filter
      if (course.difficulty < filters.difficulty[0] || course.difficulty > filters.difficulty[1]) {
        return false;
      }

      // Units filter
      if (filters.units.length > 0 && !filters.units.includes(course.units)) {
        return false;
      }

      // Quarters filter
      if (filters.quarters.length > 0) {
        const hasMatchingQuarter = filters.quarters.some(quarter => 
          course.offered.includes(quarter)
        );
        if (!hasMatchingQuarter) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          course.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Prerequisites filter
      if (filters.hasPrerequisites !== null) {
        const hasPrereqs = course.prerequisites.length > 0;
        if (filters.hasPrerequisites !== hasPrereqs) return false;
      }

      // Rating filter
      if (course.averageRating && course.averageRating < filters.minRating) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'difficulty':
          return a.difficulty - b.difficulty;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'popularity':
          return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
        default:
          return 0; // relevance - would implement proper scoring
      }
    });

    setFilteredCourses(filtered);
  }, [courses, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      difficulty: [1, 5],
      units: [],
      quarters: [],
      tags: [],
      hasPrerequisites: null,
      minRating: 0,
      sortBy: 'relevance'
    });
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    if (difficulty <= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses by name, ID, or description..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.quarters.length > 0 || filters.units.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('tags', filters.tags.filter(t => t !== tag))}
                />
              </Badge>
            ))}
            {filters.quarters.map(quarter => (
              <Badge key={quarter} variant="secondary" className="flex items-center space-x-1">
                <span>{quarter}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('quarters', filters.quarters.filter(q => q !== quarter))}
                />
              </Badge>
            ))}
            {filters.units.map(unit => (
              <Badge key={unit} variant="secondary" className="flex items-center space-x-1">
                <span>{unit} units</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('units', filters.units.filter(u => u !== unit))}
                />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Difficulty Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Slider
                    value={filters.difficulty}
                    onValueChange={(value) => updateFilter('difficulty', value as [number, number])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Easy ({filters.difficulty[0]})</span>
                    <span>Hard ({filters.difficulty[1]})</span>
                  </div>
                </div>

                {/* Units */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Units</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map(unit => (
                      <div key={unit} className="flex items-center space-x-2">
                        <Checkbox
                          id={`unit-${unit}`}
                          checked={filters.units.includes(unit)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('units', [...filters.units, unit]);
                            } else {
                              updateFilter('units', filters.units.filter(u => u !== unit));
                            }
                          }}
                        />
                        <label htmlFor={`unit-${unit}`} className="text-sm">{unit}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quarters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Offered Quarters</label>
                  <div className="flex flex-wrap gap-2">
                    {QUARTERS.map(quarter => (
                      <div key={quarter} className="flex items-center space-x-2">
                        <Checkbox
                          id={`quarter-${quarter}`}
                          checked={filters.quarters.includes(quarter)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('quarters', [...filters.quarters, quarter]);
                            } else {
                              updateFilter('quarters', filters.quarters.filter(q => q !== quarter));
                            }
                          }}
                        />
                        <label htmlFor={`quarter-${quarter}`} className="text-sm">{quarter}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Tags</label>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {COMMON_TAGS.map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter('tags', [...filters.tags, tag]);
                              } else {
                                updateFilter('tags', filters.tags.filter(t => t !== tag));
                              }
                            }}
                          />
                          <label htmlFor={`tag-${tag}`} className="text-sm capitalize">{tag}</label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCourses.map(course => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-semibold">{course.id}</h4>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          Difficulty {course.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{course.units} units</span>
                        </Badge>
                      </div>
                      
                      <h5 className="text-base font-medium text-gray-900">{course.title}</h5>
                      
                      {course.description && (
                        <p className="text-sm text-gray-600">{course.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {course.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <BookOpen className="h-4 w-4" />
                            <span>Offered: {course.offered.join(', ')}</span>
                          </div>
                          {course.enrollmentCount && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{course.enrollmentCount} enrolled</span>
                            </div>
                          )}
                        </div>
                        
                        {course.averageRating && renderStars(course.averageRating)}
                      </div>

                      {course.prerequisites.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Prerequisites: </span>
                          {course.prerequisites.join(', ')}
                        </div>
                      )}
                    </div>

                    {showAddButton && (
                      <div className="ml-4">
                        <Button
                          onClick={() => onCourseSelect?.(course)}
                          disabled={selectedCourses.includes(course.id)}
                          variant={selectedCourses.includes(course.id) ? "secondary" : "default"}
                        >
                          {selectedCourses.includes(course.id) ? 'Added' : 'Add Course'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
