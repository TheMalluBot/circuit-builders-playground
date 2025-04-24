
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentEditor } from '@/components/interactive';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const ContentEditorPage = () => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('beginner');
  const [content, setContent] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  
  const handleSave = () => {
    // In a real app, this would save to a database
    toast.success("Lesson content saved successfully!");
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Editor</h1>
          <p className="text-muted-foreground">
            Create and edit lesson content with rich formatting
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={previewMode ? "outline" : "default"}
            onClick={() => setPreviewMode(false)}
          >
            Edit
          </Button>
          <Button 
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(true)}
          >
            Preview
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {previewMode ? (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">{title || "Untitled Lesson"}</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <ContentEditor
              title="Lesson Content"
              initialContent={content}
              onSave={(newContent) => setContent(newContent)}
            />
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter lesson title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSave} className="w-full">
                    Publish Lesson
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Formatting Tips</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Use <strong>**bold**</strong> for bold text</li>
                <li>Use <em>*italic*</em> for italic text</li>
                <li>Create lists with - or 1. prefixes</li>
                <li>Insert images with ![description](url)</li>
                <li>Create headings with # symbols</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentEditorPage;
