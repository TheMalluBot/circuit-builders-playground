import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ContentEditor } from '@/components/interactive';
import { lessons, getLessonBySlug, Lesson } from '@/data/lessonData';
import { 
  ArrowLeft, Save, Eye, Plus, ChevronDown, 
  GripVertical, ArrowUp, ArrowDown, X, FileText,
  Film, TestTube, HelpCircle, BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

type SectionType = 'text' | 'simulation' | 'quiz' | 'video' | 'summary';

interface Section {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
}

const LessonEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('beginner');
  const [activeTab, setActiveTab] = useState('content');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  
  useEffect(() => {
    const mockLesson = lessons.find(l => l.id === (id ? parseInt(id) : -1)) || lessons[0];
    
    if (mockLesson) {
      setLesson(mockLesson);
      setTitle(mockLesson.title);
      setDescription(mockLesson.description);
      setDifficulty(mockLesson.difficulty);
      setDuration(mockLesson.duration);
      setCategory(mockLesson.category);
      setStatus(mockLesson.id <= 5 ? 'published' : 'draft');
      
      if (mockLesson.content?.sections) {
        const generatedSections: Section[] = mockLesson.content.sections.map((section, index) => ({
          id: `section-${index}`,
          type: index === 0 ? 'text' : 
                index === mockLesson.content!.sections.length - 1 ? 'summary' : 
                index % 3 === 0 ? 'simulation' : 
                index % 4 === 0 ? 'quiz' : 
                index % 5 === 0 ? 'video' : 'text',
          title: section.title,
          content: section.content,
          order: index
        }));
        setSections(generatedSections);
        if (generatedSections.length > 0) {
          setSelectedSectionId(generatedSections[0].id);
        }
      }
    }
  }, [id]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title && description) {
        setAutoSaveIndicator('Changes saved');
        setTimeout(() => setAutoSaveIndicator(''), 3000);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [title, description, sections]);
  
  const handleSave = () => {
    toast.success("Lesson saved successfully!");
  };
  
  const handlePublish = () => {
    if (status === 'published') {
      setStatus('draft');
      toast.info("Lesson moved to drafts");
    } else {
      setStatus('published');
      toast.success("Lesson published successfully!");
    }
  };
  
  const addSection = (type: SectionType) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: '',
      order: sections.length
    };
    
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };
  
  const deleteSection = (sectionId: string) => {
    const newSections = sections.filter(s => s.id !== sectionId);
    setSections(newSections);
    
    if (selectedSectionId === sectionId && newSections.length > 0) {
      setSelectedSectionId(newSections[0].id);
    } else if (newSections.length === 0) {
      setSelectedSectionId(null);
    }
  };
  
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && sectionIndex === 0) || 
      (direction === 'down' && sectionIndex === sections.length - 1)
    ) {
      return;
    }
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    
    const temp = newSections[targetIndex];
    newSections[targetIndex] = newSections[sectionIndex];
    newSections[sectionIndex] = temp;
    
    newSections.forEach((section, index) => {
      section.order = index;
    });
    
    setSections(newSections);
  };
  
  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, title: newTitle } : section
    ));
  };
  
  const updateSectionContent = (sectionId: string, newContent: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, content: newContent } : section
    ));
  };
  
  const selectedSection = sections.find(s => s.id === selectedSectionId);
  
  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'simulation': return <TestTube className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      case 'video': return <Film className="h-4 w-4" />;
      case 'summary': return <BookOpen className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="relative min-h-[calc(100vh-12rem)] pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/admin/lessons")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Lessons
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title || 'Untitled Lesson'}</h1>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${
                status === 'published' ? 'bg-green-500' : 
                status === 'draft' ? 'bg-amber-500' : 'bg-gray-500'
              }`}></span>
              <p className="text-muted-foreground capitalize">
                {status} {autoSaveIndicator && `• ${autoSaveIndicator}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant={status === 'published' ? "outline" : "default"}
            onClick={handlePublish}
          >
            {status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="bg-white border rounded-lg shadow-sm"
      >
        <div className="p-4 border-b">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="content" className="p-0 m-0">
          <div className="grid grid-cols-4">
            <div className="col-span-1 border-r p-4 h-[calc(100vh-18rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Lesson Structure</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Section
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => addSection('text')}>
                      <FileText className="h-4 w-4 mr-2" /> Text Section
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addSection('simulation')}>
                      <TestTube className="h-4 w-4 mr-2" /> Simulation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addSection('quiz')}>
                      <HelpCircle className="h-4 w-4 mr-2" /> Quiz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addSection('video')}>
                      <Film className="h-4 w-4 mr-2" /> Video
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addSection('summary')}>
                      <BookOpen className="h-4 w-4 mr-2" /> Summary
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {sections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No sections added yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => addSection('text')}
                  >
                    Add First Section
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {sections.map((section) => (
                    <div 
                      key={section.id}
                      className={`flex items-center p-2 rounded-md text-sm ${
                        selectedSectionId === section.id ? 'bg-accent text-accent-foreground' : 
                        'hover:bg-gray-100 cursor-pointer'
                      }`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <div className="mr-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="mr-2">
                        {getSectionIcon(section.type)}
                      </div>
                      <div className="flex-1 truncate">
                        {section.title}
                      </div>
                      <div className="ml-2 flex items-center opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                          onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                          disabled={section.order === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                          onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                          disabled={section.order === sections.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (confirm('Are you sure you want to delete this section?')) {
                              deleteSection(section.id); 
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="col-span-3 p-6 h-[calc(100vh-18rem)] overflow-y-auto">
              {selectedSection ? (
                <div>
                  <div className="mb-4">
                    <Label htmlFor="section-title">Section Title</Label>
                    <Input
                      id="section-title"
                      value={selectedSection.title}
                      onChange={(e) => updateSectionTitle(selectedSection.id, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {selectedSection.type === 'text' && (
                    <ContentEditor
                      title="Section Content"
                      initialContent={selectedSection.content}
                      onSave={(content) => updateSectionContent(selectedSection.id, content)}
                    />
                  )}
                  
                  {selectedSection.type === 'video' && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Video Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="video-source">Video Source</Label>
                          <Select defaultValue="youtube">
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="vimeo">Vimeo</SelectItem>
                              <SelectItem value="upload">Upload Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="video-url">Video URL</Label>
                          <Input id="video-url" placeholder="e.g., https://youtube.com/watch?v=..." />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-time">Start Time (seconds)</Label>
                            <Input id="start-time" type="number" defaultValue="0" />
                          </div>
                          <div>
                            <Label htmlFor="end-time">End Time (seconds, optional)</Label>
                            <Input id="end-time" type="number" />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="video-description">Description</Label>
                          <Textarea id="video-description" placeholder="Describe this video content" />
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Preview</h4>
                        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                          <p className="text-muted-foreground">Video Preview (Enter URL first)</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedSection.type === 'simulation' && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Circuit Simulation Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="simulation-instructions">Instructions for Students</Label>
                          <Textarea 
                            id="simulation-instructions" 
                            placeholder="Provide clear instructions for completing this simulation"
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div>
                          <Label>Available Components</Label>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            {['Resistor', 'LED', 'Battery', 'Switch', 'Capacitor', 'Wire'].map(component => (
                              <div key={component} className="flex items-center">
                                <input type="checkbox" id={`comp-${component}`} className="mr-2" defaultChecked />
                                <Label htmlFor={`comp-${component}`} className="text-sm">{component}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label>Initial Circuit State</Label>
                          <Select defaultValue="empty">
                            <SelectTrigger>
                              <SelectValue placeholder="Select initial state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="empty">Empty Workspace</SelectItem>
                              <SelectItem value="partial">Partially Built</SelectItem>
                              <SelectItem value="complete">Complete Circuit (Demo)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="success-criteria">Success Criteria</Label>
                          <Textarea 
                            id="success-criteria" 
                            placeholder="Define what makes a correct circuit solution"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Circuit Preview</h4>
                        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                          <p className="text-muted-foreground">Circuit Simulator Preview</p>
                          <Button size="sm" className="ml-2">Configure Circuit</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedSection.type === 'quiz' && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Quiz Builder</h3>
                      
                      <div className="space-y-6">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium">Question 1</h4>
                              <Button variant="ghost" size="sm">Remove</Button>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="question-type">Question Type</Label>
                                <Select defaultValue="multiple-choice">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select question type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                    <SelectItem value="true-false">True/False</SelectItem>
                                    <SelectItem value="matching">Matching</SelectItem>
                                    <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="question-text">Question</Label>
                                <Textarea 
                                  id="question-text" 
                                  placeholder="Enter your question here"
                                  defaultValue="What is the formula for calculating resistance in a circuit?"
                                />
                              </div>
                              
                              <div>
                                <Label>Answer Options</Label>
                                <div className="space-y-2 mt-1">
                                  {['R = V/I', 'R = V×I', 'R = I/V', 'R = I²×V'].map((option, index) => (
                                    <div key={index} className="flex items-center">
                                      <input 
                                        type="radio" 
                                        name="correct-answer" 
                                        id={`option-${index}`} 
                                        className="mr-2"
                                        defaultChecked={index === 0}
                                      />
                                      <Input 
                                        defaultValue={option} 
                                        className="flex-1"
                                      />
                                      <Button variant="ghost" size="sm" className="ml-2">
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Plus className="h-4 w-4 mr-1" /> Add Option
                                </Button>
                              </div>
                              
                              <div>
                                <Label htmlFor="explanation">Explanation (Optional)</Label>
                                <Textarea 
                                  id="explanation" 
                                  placeholder="Explain the correct answer"
                                  defaultValue="According to Ohm's Law, resistance (R) equals voltage (V) divided by current (I)."
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Button>
                          <Plus className="h-4 w-4 mr-1" /> Add Question
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedSection.type === 'summary' && (
                    <ContentEditor
                      title="Summary Content"
                      initialContent={selectedSection.content}
                      onSave={(content) => updateSectionContent(selectedSection.id, content)}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="mb-4">Select a section from the sidebar to edit its content</p>
                  <p>or</p>
                  <Button 
                    variant="outline" 
                    onClick={() => addSection('text')} 
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add First Section
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 p-6">
          <h3 className="text-lg font-medium mb-4">Lesson Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium mb-4">Visibility & Access Control</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select defaultValue="public">
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Anyone can access)</SelectItem>
                        <SelectItem value="registered">Registered Users Only</SelectItem>
                        <SelectItem value="specific-groups">Specific User Groups</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Publish Schedule</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label htmlFor="publish-date" className="text-xs">Date</Label>
                        <Input id="publish-date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="publish-time" className="text-xs">Time</Label>
                        <Input id="publish-time" type="time" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Leave blank for immediate publishing
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                    <Input id="expiration" type="date" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium mb-4">Completion Requirements</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require-quiz" 
                        className="mr-2"
                        defaultChecked
                      />
                      <Label htmlFor="require-quiz">Require quiz completion</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="minimum-score">Minimum Quiz Score</Label>
                    <div className="flex items-center">
                      <Input id="minimum-score" type="number" defaultValue="70" className="w-24" />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require-simulation" 
                        className="mr-2"
                        defaultChecked
                      />
                      <Label htmlFor="require-simulation">Require simulation completion</Label>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require-all-sections" 
                        className="mr-2"
                      />
                      <Label htmlFor="require-all-sections">Mark all sections as required</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium mb-4">Related Content</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="next-lessons">Next Lessons</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select next lessons" />
                      </SelectTrigger>
                      <SelectContent>
                        {lessons.slice(0, 5).map(lesson => (
                          <SelectItem key={lesson.id} value={lesson.id.toString()}>
                            {lesson.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Selected Next Lessons</Label>
                    <div className="space-y-2 mt-1">
                      {lessons.slice(1, 3).map(lesson => (
                        <div key={lesson.id} className="flex items-center bg-accent p-2 rounded-md">
                          <span className="flex-1 text-sm">{lesson.title}</span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium mb-4">Certificate & Completion</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="issue-certificate" 
                        className="mr-2"
                        defaultChecked
                      />
                      <Label htmlFor="issue-certificate">Issue completion certificate</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="certificate-text">Certificate Description</Label>
                    <Textarea 
                      id="certificate-text" 
                      placeholder="Description to appear on certificate"
                      defaultValue="Successfully completed the Understanding Circuit Basics lesson demonstrating proficiency in fundamental electronic circuit concepts."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="metadata" className="space-y-6 p-6">
          <h3 className="text-lg font-medium mb-4">Lesson Metadata</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="meta-title">Title</Label>
                <Input 
                  id="meta-title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max 100 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="meta-description">Description</Label>
                <Textarea 
                  id="meta-description" 
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max 300 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="meta-keywords">Keywords</Label>
                <Input 
                  id="meta-keywords" 
                  placeholder="circuit, electronics, ohm's law, resistance"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate with commas
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="meta-difficulty">Difficulty Level</Label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="meta-duration">Estimated Duration</Label>
                <Input 
                  id="meta-duration" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 30 min"
                />
              </div>
              
              <div>
                <Label htmlFor="meta-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Basics</SelectItem>
                    <SelectItem value="intermediate">Components</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="meta-featured">Featured Image</Label>
                <div className="mt-1 border rounded-md p-1">
                  <img 
                    src="/placeholder.svg" 
                    alt="Featured image" 
                    className="h-32 w-full object-cover rounded"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm">Change Image</Button>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium mb-4">Version History</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">Current version</span>
                    <span className="text-muted-foreground ml-2">
                      Updated {format(new Date(), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" disabled>Current</Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">Draft version</span>
                    <span className="text-muted-foreground ml-2">
                      Updated {format(new Date(Date.now() - 86400000), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">Restore</Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">Initial version</span>
                    <span className="text-muted-foreground ml-2">
                      Created {format(new Date(Date.now() - 7 * 86400000), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">Restore</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-muted-foreground">
            {autoSaveIndicator ? autoSaveIndicator : 'All changes saved'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/lessons")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handlePublish}>
            {status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;
