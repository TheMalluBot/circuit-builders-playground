
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Image } from "lucide-react";
import { toast } from "sonner";

interface ContentEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
  title?: string;
}

interface FormValues {
  content: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  initialContent = "",
  onSave,
  readOnly = false,
  title = "Content Editor"
}) => {
  const [content, setContent] = useState(initialContent);
  
  const form = useForm<FormValues>({
    defaultValues: {
      content: initialContent
    }
  });
  
  const insertFormatting = (tag: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let newText = '';
    switch(tag) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'ul':
        newText = `\n- ${selectedText}`;
        break;
      case 'ol':
        newText = `\n1. ${selectedText}`;
        break;
      case 'center':
        newText = `<div style="text-align: center">${selectedText}</div>`;
        break;
      case 'right':
        newText = `<div style="text-align: right">${selectedText}</div>`;
        break;
      case 'image':
        newText = `![Image description](image-url)`;
        break;
      default:
        newText = selectedText;
    }
    
    const updatedContent = beforeText + newText + afterText;
    setContent(updatedContent);
    form.setValue("content", updatedContent);
    
    // Refocus and set selection after the inserted formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        beforeText.length + newText.length,
        beforeText.length + newText.length
      );
    }, 0);
  };
  
  const handleSubmit = (values: FormValues) => {
    if (onSave) {
      onSave(values.content);
      toast.success("Content saved successfully");
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!readOnly && (
              <div className="flex flex-wrap gap-1 mb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('bold')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('italic')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('ul')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('ol')}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('left')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('center')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('right')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => insertFormatting('image')}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      className="min-h-[200px] font-mono"
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormDescription>
                    {readOnly ? 
                      "Content is in read-only mode." :
                      "Use the toolbar above to format your content. Supports markdown."
                    }
                  </FormDescription>
                </FormItem>
              )}
            />
            
            {!readOnly && (
              <Button type="submit">Save Content</Button>
            )}
          </form>
        </Form>
      </CardContent>
      {readOnly && (
        <CardFooter>
          <div className="prose max-w-none w-full">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContentEditor;
