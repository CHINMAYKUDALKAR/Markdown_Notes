
import React, { useRef, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "@/context/ThemeContext";

interface MarkdownInputProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({
  content,
  onContentChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [emojiTriggerPos, setEmojiTriggerPos] = useState<{ top: number; left: number } | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [content]);

  const checkForEmojiTrigger = (text: string, cursorPos: number) => {
    // Look for ":" within the last 20 characters before cursor
    const textBeforeCursor = text.substring(Math.max(0, cursorPos - 20), cursorPos);
    const match = textBeforeCursor.match(/:(?!\s)([^:\s]*)$/);
    
    if (match) {
      // Calculate emoji picker position
      if (textareaRef.current) {
        const textareaRect = textareaRef.current.getBoundingClientRect();
        // Create a temporary element to measure position
        const tempEl = document.createElement('span');
        tempEl.innerText = 'M'; // Use a character with average width
        document.body.appendChild(tempEl);
        const charWidth = tempEl.getBoundingClientRect().width;
        document.body.removeChild(tempEl);
        
        // Estimate the position based on text content
        const textBeforeLine = text.substring(0, cursorPos).split('\n').pop() || '';
        const leftOffset = textBeforeLine.length * charWidth * 0.6;
        
        // Get textarea line height
        const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
        const lines = text.substring(0, cursorPos).split('\n').length;
        
        setEmojiTriggerPos({
          top: textareaRect.top + (lines * lineHeight) - textareaRef.current.scrollTop,
          left: textareaRect.left + leftOffset
        });
      }
      return true;
    }
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    
    // Check for emoji trigger
    if (e.key === ':' && !e.ctrlKey && !e.metaKey) {
      setTimeout(() => {
        const updatedCursorPos = textarea.selectionStart;
        const hasEmojiTrigger = checkForEmojiTrigger(textarea.value, updatedCursorPos);
        setShowEmojiPicker(hasEmojiTrigger);
        setCursorPosition(updatedCursorPos);
      }, 0);
      return;
    }
    
    // Hide emoji picker on escape
    if (e.key === 'Escape' && showEmojiPicker) {
      e.preventDefault();
      setShowEmojiPicker(false);
      return;
    }
    
    if (!(e.ctrlKey || e.metaKey)) {
      // Hide emoji picker when typing space or enter
      if ((e.key === ' ' || e.key === 'Enter') && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
      return;
    }
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent = content;
    let newCursorPos = end;
    
    // Handle keyboard shortcuts for markdown formatting
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e);
    
    // Check for emoji trigger
    const cursorPos = e.target.selectionStart;
    const hasEmojiTrigger = checkForEmojiTrigger(e.target.value, cursorPos);
    setShowEmojiPicker(hasEmojiTrigger);
    setCursorPosition(cursorPos);
  };

  const handleSelectEmoji = (emoji: { native: string }) => {
    if (!textareaRef.current) return;
    
    // Find the start of the emoji trigger
    const text = content;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const triggerMatch = textBeforeCursor.match(/:([^:\s]*)$/);
    
    if (triggerMatch) {
      const start = textBeforeCursor.lastIndexOf(':');
      const newContent = 
        text.substring(0, start) +
        emoji.native +
        text.substring(cursorPosition);
      
      const syntheticEvent = {
        target: { value: newContent },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onContentChange(syntheticEvent);
      
      // Set cursor after the inserted emoji
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + emoji.native.length;
          textareaRef.current.focus();
          textareaRef.current.selectionStart = newCursorPos;
          textareaRef.current.selectionEnd = newCursorPos;
        }
      }, 0);
    }
    
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative w-full h-full">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none border-none h-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-base leading-relaxed"
        placeholder="Start writing..."
      />
      
      {showEmojiPicker && emojiTriggerPos && (
        <div 
          className="absolute z-50"
          style={{
            top: `${emojiTriggerPos.top + 20}px`, 
            left: `${emojiTriggerPos.left}px`
          }}
        >
          <Picker 
            data={data} 
            onEmojiSelect={handleSelectEmoji}
            theme={theme}
            previewPosition="none"
            skinTonePosition="none"
            searchPosition="top"
            set="native"
          />
        </div>
      )}
    </div>
  );
};

export default MarkdownInput;
