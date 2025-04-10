
import React, { useState, useEffect } from "react";
import { useNotes } from "@/context/NoteContext";
import { useTheme } from "@/context/ThemeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Import extracted components
import DocumentStats from "./markdown/DocumentStats";
import MarkdownInput from "./markdown/MarkdownInput";
import MarkdownPreview from "./markdown/MarkdownPreview";
import KeyboardShortcuts from "./markdown/KeyboardShortcuts";

const MarkdownEditor: React.FC = () => {
  const { currentNote, updateNote } = useNotes();
  const { theme } = useTheme();
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [history, setHistory] = useState<{ timestamp: string; content: string }[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  useEffect(() => {
    if (currentNote) {
      const text = currentNote.content || "";
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const chars = text.length;
      
      setWordCount(words);
      setCharCount(chars);
      setReadingTime(Math.ceil(words / 200));
      
      const lastHistoryItem = history[0];
      if (!lastHistoryItem || Math.abs(lastHistoryItem.content.length - text.length) > 20) {
        setHistory(prev => [{
          timestamp: new Date().toISOString(),
          content: text
        }, ...prev.slice(0, 9)]);
      }
    }
  }, [currentNote?.content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { content: e.target.value });
  };
  
  const handleRestoreHistory = (content: string) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { content });
  };

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a note or create a new one to get started
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Textarea
        value={currentNote.title}
        onChange={handleTitleChange}
        className="text-2xl font-bold border-none resize-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 mb-4"
        placeholder="Untitled"
        rows={1}
      />

      <DocumentStats 
        wordCount={wordCount}
        charCount={charCount}
        readingTime={readingTime}
        history={history}
        showHistoryPanel={showHistoryPanel}
        setShowHistoryPanel={setShowHistoryPanel}
        onRestoreHistory={handleRestoreHistory}
      />

      <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent py-0">
          <TabsTrigger value="edit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="flex-1 overflow-auto p-0 m-0 data-[state=active]:flex">
          <MarkdownInput 
            content={currentNote.content}
            onContentChange={handleContentChange}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 overflow-auto p-0 pt-4 m-0">
          <MarkdownPreview 
            content={currentNote.content}
            theme={theme}
          />
        </TabsContent>
      </Tabs>

      <KeyboardShortcuts />
    </div>
  );
};

export default MarkdownEditor;
