
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo, Code, Link } from 'lucide-react';

interface ContentEditorProps {
  title?: string;
  initialContent?: string;
  onSave: (content: string) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ title = "Content Editor", initialContent = "", onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState("edit");
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Apply initialContent when it changes
  useEffect(() => {
    setContent(initialContent);
    // Reset history when initialContent changes
    setHistory([initialContent]);
    setHistoryIndex(0);
  }, [initialContent]);
  
  // Save content when it changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(content);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [content, onSave]);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    
    // Add to history if different from current
    if (newContent !== history[historyIndex]) {
      // Remove any forward history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };
  
  const insertFormatting = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'ulist':
        formattedText = `- ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'olist':
        formattedText = `1. ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'code':
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        cursorOffset = 4;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        cursorOffset = 1;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length === 0) {
        textarea.selectionStart = start + formattedText.length - cursorOffset;
        textarea.selectionEnd = start + formattedText.length - cursorOffset;
      } else {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + formattedText.length;
      }
    }, 0);
  };
  
  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    let html = markdown;
    
    // Convert headers ## Heading -> <h2>Heading</h2>
    html = html.replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>');
    
    // Convert bold **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert unordered lists
    html = html.replace(/- (.*?)(\n|$)/g, '<li>$1</li>');
    
    // Convert ordered lists
    html = html.replace(/\d+\. (.*?)(\n|$)/g, '<li>$1</li>');
    
    // Convert code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert links [text](url) -> <a href="url">text</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Convert paragraphs
    html = html.split('\n\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
    
    return html;
  };
  
  return (
    <div className="w-full rounded-lg border overflow-hidden">
      <div className="bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="h-8 w-8 p-0" 
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between px-4">
              <TabsList className="h-10">
                <TabsTrigger value="edit" className="px-4">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="px-4">Preview</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-1 py-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => insertFormatting('bold')} 
                  disabled={activeTab !== 'edit'}
                  className="h-8 w-8 p-0"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => insertFormatting('italic')} 
                  disabled={activeTab !== 'edit'}
                  className="h-8 w-8 p-0"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => insertFormatting('heading')} 
                  disabled={activeTab !== 'edit'}
                  className="h-8 w-8 p-0"
                  title="Heading"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => insertFormatting('ulist')} 
                  disabled={activeTab !== 'edit'}
                  className="h-8 w-8 p-0"
                  title="Unordered List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => insertFormatting('olist')} 
                  disabled={activeTab !== 'edit'}
                  className="h-8 w-8 p-0"
                  title="Ordered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => insertFormatting('code')} 
                  disabled={activeTab !== 'edit'}
                  className="h-8 w-8 p-0"
                  title="Code Block"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => insertFormatting('link')} 
                  disabled={activeTab !== 'edit'}
                  className="h-8 w-8 p-0"
                  title="Link"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="edit" className="mt-0">
              <Textarea
                value={content}
                onChange={handleContentChange}
                className="w-full p-4 min-h-[300px] rounded-none border-0 focus-visible:ring-0 resize-y"
                placeholder="Enter content here... You can use markdown formatting."
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="prose max-w-none p-4 min-h-[300px] bg-white overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex items-center justify-between p-2 text-xs text-gray-500">
          <div>
            {content.length} characters
          </div>
          <div>
            {content.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
