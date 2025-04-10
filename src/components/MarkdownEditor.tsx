
import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useNotes } from "@/context/NoteContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MarkdownEditor: React.FC = () => {
  const { currentNote, updateNote } = useNotes();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    </div>
  );
};

export default MarkdownEditor;
