
import React, { useState, useEffect, useRef } from "react";
import { useNotes } from "@/context/NoteContext";
import { useTheme } from "@/context/ThemeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Import extracted components
import DocumentStats from "./markdown/DocumentStats";
import MarkdownInput from "./markdown/MarkdownInput";
import MarkdownPreview from "./markdown/MarkdownPreview";
import KeyboardShortcuts from "./markdown/KeyboardShortcuts";
import ExportMenu from "./ExportMenu";
import { LoaderCircle, Save } from "lucide-react";

const SyncingAnimation = () => (
  <motion.div
    className="flex items-center gap-1 text-xs text-muted-foreground"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    >
      <LoaderCircle className="h-3 w-3" />
    </motion.div>
    <span className="flex items-center">
      Syncing
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.3, 0.7, 1] }}
      >.</motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.3, 0.7, 1], delay: 0.2 }}
      >.</motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.3, 0.7, 1], delay: 0.4 }}
      >.</motion.span>
    </span>
  </motion.div>
);

const SavedIndicator = () => (
  <motion.div
    className="flex items-center gap-1 text-xs text-green-500"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
  >
    <Save className="h-3 w-3" />
    <span>Saved</span>
  </motion.div>
);

const MarkdownEditor: React.FC = () => {
  const { currentNote, updateNote } = useNotes();
  const { theme } = useTheme();
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [history, setHistory] = useState<{ timestamp: string; content: string }[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    triggerSyncIndicator();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { content: e.target.value });
    triggerSyncIndicator();
  };
  
  const triggerSyncIndicator = () => {
    setIsSyncing(true);
    setIsSaved(false);
    
    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    // Set a new timeout to hide the sync indicator after 1 second
    syncTimeoutRef.current = setTimeout(() => {
      setIsSyncing(false);
      setIsSaved(true);
      
      // Hide saved indicator after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    }, 1000);
  };
  
  const handleRestoreHistory = (content: string) => {
    if (!currentNote) return;
    updateNote(currentNote.id, { content });
    triggerSyncIndicator();
  };

  useEffect(() => {
    // Clean up timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  if (!currentNote) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center h-full text-muted-foreground"
      >
        Select a note or create a new one to get started
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="flex justify-between items-center mb-4">
        <Textarea
          value={currentNote.title}
          onChange={handleTitleChange}
          className="text-2xl font-bold border-none resize-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-grow"
          placeholder="Untitled"
          rows={1}
        />
        <div className="flex items-center gap-2 min-w-[100px] justify-end">
          <AnimatePresence mode="wait">
            {isSyncing && <SyncingAnimation key="syncing" />}
            {!isSyncing && isSaved && <SavedIndicator key="saved" />}
          </AnimatePresence>
          <ExportMenu />
        </div>
      </div>

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
          <div id="markdown-preview">
            <MarkdownPreview 
              content={currentNote.content}
              theme={theme}
            />
          </div>
        </TabsContent>
      </Tabs>

      <KeyboardShortcuts />
    </motion.div>
  );
};

export default MarkdownEditor;
