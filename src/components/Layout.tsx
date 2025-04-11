
import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import NoteView from "./NoteView";
import { useNotes } from "@/context/NoteContext";
import { importMarkdownFile, importBackup } from "@/utils/exportUtils";
import { toast } from "sonner";

const Layout: React.FC = () => {
  const { createNote } = useNotes();
  
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      
      if (!e.dataTransfer) return;
      
      try {
        const files = e.dataTransfer.files;
        
        if (files.length === 0) return;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          if (file.type === "text/markdown" || file.name.endsWith(".md")) {
            const noteData = await importMarkdownFile(file);
            createNote(null, noteData);
            toast.success(`Imported: ${noteData.title}`);
          } else if (i === 0 && (file.type === "application/json" || file.name.endsWith(".json"))) {
            // Only try to import the first JSON file as a backup
            try {
              toast.info("Backup file detected. Note: Import from backup coming soon.");
              // This will be implemented in the future
            } catch (error) {
              toast.error("Invalid backup file format");
            }
          } else {
            toast.error(`Unsupported file: ${file.name}`);
          }
        }
      } catch (error) {
        console.error("File drop error:", error);
        toast.error("Failed to process dropped files");
      }
    };
    
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
    
    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [createNote]);
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-[300px] border-r h-full overflow-hidden">
        <Sidebar />
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <NoteView />
      </div>
    </div>
  );
};

export default Layout;
