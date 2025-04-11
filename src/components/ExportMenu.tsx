
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/context/NoteContext";
import { exportToPdf, exportToMarkdown, exportAllToZip, exportBackup, importMarkdownFile, importBackup } from "@/utils/exportUtils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilePdf, FileJson, FileDown, FileUp, Database, FileZip, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ExportMenu = () => {
  const { notes, folders, tags, currentNote, createNote } = useNotes();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const markdownPreviewRef = useRef<string>("#markdown-preview");

  const handlePdfExport = async () => {
    try {
      if (!currentNote) {
        toast.error("No note selected to export");
        return;
      }
      
      await exportToPdf(currentNote, tags, markdownPreviewRef.current);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleMarkdownExport = () => {
    try {
      if (!currentNote) {
        toast.error("No note selected to export");
        return;
      }
      
      exportToMarkdown(currentNote, tags);
      toast.success("Markdown file exported successfully");
    } catch (error) {
      console.error("Markdown export error:", error);
      toast.error("Failed to export markdown");
    }
  };

  const handleExportAllNotes = () => {
    try {
      if (notes.length === 0) {
        toast.error("No notes to export");
        return;
      }
      
      exportAllToZip(notes, tags);
      toast.success("All notes exported as ZIP");
    } catch (error) {
      console.error("Export all notes error:", error);
      toast.error("Failed to export notes");
    }
  };

  const handleBackupExport = () => {
    try {
      exportBackup(notes, folders, tags);
      toast.success("Backup created successfully");
    } catch (error) {
      console.error("Backup error:", error);
      toast.error("Failed to create backup");
    }
  };

  const handleMarkdownImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "text/markdown" && !file.name.endsWith(".md")) {
          toast.error(`${file.name} is not a markdown file`);
          continue;
        }
        
        const noteData = await importMarkdownFile(file);
        createNote(null, noteData);
        toast.success(`Imported: ${noteData.title}`);
      }
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setImportDialogOpen(false);
    } catch (error) {
      console.error("Import markdown error:", error);
      toast.error("Failed to import markdown file");
    }
  };

  const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        toast.error("Please select a valid JSON backup file");
        return;
      }
      
      // Show a confirmation dialog here if needed
      toast.info("Importing backup, please wait...");
      
      const { notes: importedNotes, folders: importedFolders, tags: importedTags } = await importBackup(file);
      
      // TODO: Implement the restore function in NoteContext
      // restoreFromBackup(importedNotes, importedFolders, importedTags);
      toast.success("Backup imported successfully. Note: Restoring from backup is not fully implemented yet.");
      
      // Reset the input
      if (backupInputRef.current) {
        backupInputRef.current.value = "";
      }
      setBackupDialogOpen(false);
    } catch (error) {
      console.error("Import backup error:", error);
      toast.error("Failed to import backup");
    }
  };

  // Handle file drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
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
            const { notes: importedNotes, folders: importedFolders, tags: importedTags } = await importBackup(file);
            // TODO: Implement the restore function in NoteContext
            // restoreFromBackup(importedNotes, importedFolders, importedTags);
            toast.success("Backup file detected. Note: Restoring from backup is not fully implemented yet.");
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <FileDown className="h-4 w-4" />
            <span className="sr-only">Export Options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePdfExport} disabled={!currentNote}>
            <FilePdf className="mr-2 h-4 w-4" />
            Export Current Note as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMarkdownExport} disabled={!currentNote}>
            <FileText className="mr-2 h-4 w-4" />
            Export Current Note as Markdown
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportAllNotes}>
            <FileZip className="mr-2 h-4 w-4" />
            Export All Notes as ZIP
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBackupExport}>
            <Database className="mr-2 h-4 w-4" />
            Create Backup
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Import Markdown Files
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBackupDialogOpen(true)}>
            <FileJson className="mr-2 h-4 w-4" />
            Restore from Backup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        ref={fileInputRef}
        accept=".md,text/markdown"
        multiple
        style={{ display: "none" }}
        onChange={handleMarkdownImport}
      />

      <input
        type="file"
        ref={backupInputRef}
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleBackupImport}
      />

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Markdown Files</DialogTitle>
            <DialogDescription>
              Upload markdown files (.md) to import them as notes. You can also drag and drop files directly onto the app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="markdownFiles">Select files</Label>
              <Input
                id="markdownFiles"
                type="file"
                accept=".md,text/markdown"
                multiple
                onChange={handleMarkdownImport}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="default"
            >
              Choose Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
            <DialogDescription>
              Import a backup file (.json) to restore your notes, folders, and tags.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="backupFile">Select backup file</Label>
              <Input
                id="backupFile"
                type="file"
                accept=".json,application/json"
                onChange={handleBackupImport}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => backupInputRef.current?.click()}
              variant="default"
            >
              Choose File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportMenu;
