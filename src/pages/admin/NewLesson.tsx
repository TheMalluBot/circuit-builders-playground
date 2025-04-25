
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { lessons } from '@/data/lessonData';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  duration: z.string().min(1, {
    message: "Please provide an estimated duration.",
  }),
  category: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NewLesson = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "beginner",
      duration: "30 min",
      category: "beginner",
      prerequisites: [],
    },
  });
  
  const onSubmit = (values: FormValues) => {
    // In a real app, we would save to a database
    toast.success("Lesson created successfully!");
    // Navigate to the full lesson editor with the new lesson ID
    // For now we'll just use a placeholder ID
    navigate("/admin/lessons/new-lesson-id/edit");
  };
  
  const handleImageUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Image uploaded successfully!");
    }, 1500);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/lessons")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Lesson</h1>
          <p className="text-muted-foreground">
            Fill in the basic information to create a new lesson
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter lesson title" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed as the main title of your lesson.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe what students will learn in this lesson" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A short summary that will appear in lesson listings.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the appropriate skill level for this lesson.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 30 min" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long it will take to complete this lesson.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Basics</SelectItem>
                            <SelectItem value="intermediate">Components</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the category that best fits this lesson.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" className="w-full md:w-auto">
                      Create Lesson & Continue
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Featured Image</h3>
              <div className="bg-slate-100 rounded-md h-40 flex items-center justify-center mb-4">
                <div className="text-center p-4">
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleImageUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended size: 1200 x 800px, max 2MB
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Prerequisites</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select any lessons that should be completed before this one.
              </p>
              <div className="space-y-2">
                {lessons.slice(0, 3).map((lesson) => (
                  <div key={lesson.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`prereq-${lesson.id}`}
                      className="mr-2"
                    />
                    <label htmlFor={`prereq-${lesson.id}`} className="text-sm">
                      {lesson.title}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewLesson;
