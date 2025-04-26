
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface ContentEditorProps {
  title?: string;
  initialContent?: string;
  onSave: (content: string) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ title = "Content Editor", initialContent = "", onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(true);
  
  // Apply initialContent when it changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  
  // Save content when it changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(content);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [content, onSave]);
  
  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className={`px-3 py-1 text-sm rounded-md ${isEditing ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            Edit
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`px-3 py-1 text-sm rounded-md ${!isEditing ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            Preview
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <Textarea
          value={content}
          onChange={handleContentChange}
          className="w-full p-3 min-h-[300px]"
          placeholder="Enter content here... You can use markdown formatting."
        />
      ) : (
        <div className="prose max-w-none p-4 border rounded-md min-h-[300px] bg-white">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
};

export default ContentEditor;
