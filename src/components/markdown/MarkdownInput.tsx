
import React, { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MarkdownInputProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({
  content,
  onContentChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent = content;
    let newCursorPos = end;
    
    switch (e.key) {
      case 'b':
        e.preventDefault();
        newContent = 
          content.substring(0, start) +
          `**${selectedText}**` +
          content.substring(end);
        newCursorPos = end + 4;
        
        if (onContentChange) {
          const syntheticEvent = {
            target: { value: newContent },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onContentChange(syntheticEvent);
        }
        toast.success("Text formatted as bold");
        break;
        
      case 'i':
        e.preventDefault();
        newContent = 
          content.substring(0, start) +
          `*${selectedText}*` +
          content.substring(end);
        newCursorPos = end + 2;
        
        if (onContentChange) {
          const syntheticEvent = {
            target: { value: newContent },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onContentChange(syntheticEvent);
        }
        toast.success("Text formatted as italic");
        break;
        
      case 'k':
        e.preventDefault();
        newContent = 
          content.substring(0, start) +
          `[${selectedText}](url)` +
          content.substring(end);
        newCursorPos = end + 7;
        
        if (onContentChange) {
          const syntheticEvent = {
            target: { value: newContent },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onContentChange(syntheticEvent);
        }
        toast.success("Link inserted");
        break;
        
      case '1':
      case '2':
      case '3':
        e.preventDefault();
        const level = e.key;
        const prefix = '#'.repeat(parseInt(level));
        
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        const beforeLine = content.substring(0, lineStart);
        const afterLine = content.substring(lineStart);
        
        newContent = `${beforeLine}${prefix} ${afterLine}`;
        
        if (onContentChange) {
          const syntheticEvent = {
            target: { value: newContent },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onContentChange(syntheticEvent);
        }
        toast.success(`Heading ${level} added`);
        break;
    }
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
      }
    }, 0);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={content}
      onChange={onContentChange}
      onKeyDown={handleKeyDown}
      className="flex-1 resize-none border-none h-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-base leading-relaxed"
      placeholder="Start writing..."
    />
  );
};

export default MarkdownInput;
