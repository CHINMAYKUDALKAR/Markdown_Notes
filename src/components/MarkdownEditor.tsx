
import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useNotes } from "@/context/NoteContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Clock, FileText } from "lucide-react";
import { toast } from "sonner";

const MarkdownEditor: React.FC = () => {
  const { currentNote, updateNote } = useNotes();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Calculate word count and reading time
  useEffect(() => {
    if (currentNote) {
      const text = currentNote.content || "";
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      // Average reading speed: 200 words per minute
      setReadingTime(Math.ceil(words / 200));
    }
  }, [currentNote?.content]);

  useEffect(() => {
    // Auto-focus the textarea when a note is loaded
    if (currentNote && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { content: e.target.value });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!currentNote) return;
    
    // Only proceed if ctrl or cmd key is pressed
    if (!(e.ctrlKey || e.metaKey)) return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentNote.content.substring(start, end);
    
    let newContent = currentNote.content;
    let newCursorPos = end;
    
    switch (e.key) {
      case 'b': // Bold
        e.preventDefault();
        newContent = 
          currentNote.content.substring(0, start) +
          `**${selectedText}**` +
          currentNote.content.substring(end);
        newCursorPos = end + 4;
        updateNote(currentNote.id, { content: newContent });
        toast.success("Text formatted as bold");
        break;
        
      case 'i': // Italic
        e.preventDefault();
        newContent = 
          currentNote.content.substring(0, start) +
          `*${selectedText}*` +
          currentNote.content.substring(end);
        newCursorPos = end + 2;
        updateNote(currentNote.id, { content: newContent });
        toast.success("Text formatted as italic");
        break;
        
      case 'k': // Link
        e.preventDefault();
        newContent = 
          currentNote.content.substring(0, start) +
          `[${selectedText}](url)` +
          currentNote.content.substring(end);
        newCursorPos = end + 7;
        updateNote(currentNote.id, { content: newContent });
        toast.success("Link inserted");
        break;
        
      case '1': // Heading 1
      case '2': // Heading 2
      case '3': // Heading 3
        e.preventDefault();
        const level = e.key;
        const prefix = '#'.repeat(parseInt(level));
        
        // Check if we're at the start of a line
        const lineStart = currentNote.content.lastIndexOf('\n', start - 1) + 1;
        const beforeLine = currentNote.content.substring(0, lineStart);
        const afterLine = currentNote.content.substring(lineStart);
        
        newContent = `${beforeLine}${prefix} ${afterLine}`;
        updateNote(currentNote.id, { content: newContent });
        toast.success(`Heading ${level} added`);
        break;
    }
    
    // Set cursor position after update
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
      }
    }, 0);
  };

  // If no note is selected, show placeholder
  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a note or create a new one to get started
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title input */}
      <Textarea
        value={currentNote.title}
        onChange={handleTitleChange}
        className="text-2xl font-bold border-none resize-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 mb-4"
        placeholder="Untitled"
        rows={1}
      />

      {/* Word count and reading time */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2 px-2">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{readingTime} min read</span>
        </div>
      </div>

      {/* Editor tabs */}
      <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent py-0">
          <TabsTrigger value="edit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Preview
          </TabsTrigger>
        </TabsList>
        
        {/* Edit mode */}
        <TabsContent value="edit" className="flex-1 overflow-auto p-0 m-0 data-[state=active]:flex">
          <Textarea
            ref={textareaRef}
            value={currentNote.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-none h-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-base leading-relaxed"
            placeholder="Start writing..."
          />
        </TabsContent>
        
        {/* Preview mode */}
        <TabsContent value="preview" className="flex-1 overflow-auto p-0 pt-4 m-0">
          <div className={cn("markdown-editor px-2")}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !match ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      // @ts-ignore - The type definition for style is incorrect
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
              }}
            >
              {currentNote.content}
            </ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>

      {/* Keyboard shortcuts help */}
      <div className="border-t text-xs py-2 px-2 text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
        <span>Shortcuts: </span>
        <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+B</kbd> Bold</span>
        <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+I</kbd> Italic</span>
        <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+K</kbd> Link</span>
        <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+1-3</kbd> Headings</span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
