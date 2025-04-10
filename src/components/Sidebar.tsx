
import React, { useState } from "react";
import { useNotes } from "@/context/NoteContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { 
  ChevronRight, 
  ChevronDown, 
  FolderPlus, 
  Search, 
  FileText, 
  Folder, 
  FolderOpen, 
  Tag, 
  Plus, 
  Trash2,
  Edit,
  X
} from "lucide-react";
import { format } from "date-fns";

const Sidebar: React.FC = () => {
  const { 
    notes, 
    folders, 
    tags, 
    currentNote, 
    searchQuery, 
    selectedFolder, 
    selectedTag,
    createNote, 
    createFolder, 
    updateFolder,
    deleteFolder,
    createTag,
    deleteTag,
    setCurrentNote, 
    setSearchQuery, 
    setSelectedFolder, 
    setSelectedTag, 
    deleteNote
  } = useNotes();

  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isEditingFolder, setIsEditingFolder] = useState<string | null>(null);
  const [editedFolderName, setEditedFolderName] = useState("");

  // Filtered notes based on search, folder and tag selection
  const filteredNotes = notes.filter(note => {
    // Search filter
    const matchesSearch = searchQuery 
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Folder filter
    const matchesFolder = selectedFolder 
      ? note.folderId === selectedFolder
      : true;
    
    // Tag filter
    const matchesTag = selectedTag
      ? note.tags.includes(selectedTag)
      : true;
    
    return matchesSearch && matchesFolder && matchesTag;
  });

  // Handle folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName("");
    }
  };

  // Handle tag creation
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTag(newTagName);
      setNewTagName("");
    }
  };

  // Handle folder rename
  const handleRenameFolder = (folderId: string) => {
    if (editedFolderName.trim()) {
      updateFolder(folderId, editedFolderName);
      setIsEditingFolder(null);
      setEditedFolderName("");
    }
  };

  // Start editing a folder
  const startEditingFolder = (folder: { id: string; name: string }) => {
    setIsEditingFolder(folder.id);
    setEditedFolderName(folder.name);
  };

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Create note button */}
      <div className="px-4 py-2">
        <Button 
          onClick={() => createNote(selectedFolder)} 
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> New Note
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* Folders section */}
        <Collapsible
          open={foldersOpen}
          onOpenChange={setFoldersOpen}
          className="px-4 py-2"
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-2 -ml-2 hover:bg-transparent">
                {foldersOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <span className="text-sm font-medium">Folders</span>
            
            {/* Add folder dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="my-4"
                />
                <DialogFooter>
                  <Button onClick={handleCreateFolder}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <CollapsibleContent className="mt-2 space-y-1">
            {/* All notes option */}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm font-normal",
                !selectedFolder && !selectedTag ? "bg-accent" : ""
              )}
              onClick={() => {
                setSelectedFolder(null);
                setSelectedTag(null);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              All Notes
            </Button>

            {/* Folder list */}
            {folders.map(folder => (
              <div key={folder.id} className="flex items-center group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm font-normal",
                    selectedFolder === folder.id ? "bg-accent" : ""
                  )}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setSelectedTag(null);
                  }}
                >
                  {selectedFolder === folder.id ? (
                    <FolderOpen className="h-4 w-4 mr-2" />
                  ) : (
                    <Folder className="h-4 w-4 mr-2" />
                  )}
                  
                  {isEditingFolder === folder.id ? (
                    <div onClick={(e) => e.stopPropagation()} className="flex-1">
                      <Input
                        value={editedFolderName}
                        onChange={(e) => setEditedFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameFolder(folder.id);
                          } else if (e.key === 'Escape') {
                            setIsEditingFolder(null);
                          }
                        }}
                        autoFocus
                        className="h-7 text-sm py-0"
                      />
                    </div>
                  ) : (
                    folder.name
                  )}
                </Button>
                
                {/* Folder actions */}
                {!isEditingFolder && (
                  <div className="flex opacity-0 group-hover:opacity-100 pr-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingFolder(folder);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Editing controls */}
                {isEditingFolder === folder.id && (
                  <div className="flex pr-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFolder(folder.id);
                      }}
                    >
                      <div className="h-3.5 w-3.5">✓</div>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingFolder(null);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Tags section */}
        <Collapsible
          open={tagsOpen}
          onOpenChange={setTagsOpen}
          className="px-4 py-2"
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-2 -ml-2 hover:bg-transparent">
                {tagsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <span className="text-sm font-medium">Tags</span>
            
            {/* Add tag dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Tag className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="my-4"
                />
                <DialogFooter>
                  <Button onClick={handleCreateTag}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <CollapsibleContent className="mt-2 space-y-1">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm font-normal",
                    selectedTag === tag.id ? "bg-accent" : ""
                  )}
                  onClick={() => {
                    setSelectedTag(tag.id);
                    setSelectedFolder(null);
                  }}
                >
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </Button>
                
                {/* Tag delete button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 pr-2"
                  onClick={() => deleteTag(tag.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Note list */}
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium mb-2">
            {searchQuery 
              ? "Search Results" 
              : selectedFolder 
                ? `${folders.find(f => f.id === selectedFolder)?.name || ""} Notes` 
                : selectedTag 
                  ? `#${tags.find(t => t.id === selectedTag)?.name || ""}` 
                  : "All Notes"}
          </h3>
          
          {filteredNotes.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No notes found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map(note => (
                <div key={note.id} className="flex group items-center">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm font-normal",
                      currentNote?.id === note.id ? "bg-accent" : ""
                    )}
                    onClick={() => setCurrentNote(note)}
                  >
                    <div className="flex flex-col items-start">
                      <span 
                        className={cn(
                          "truncate w-full max-w-[180px]",
                          currentNote?.id === note.id ? "font-medium" : ""
                        )}
                      >
                        {note.title || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.updatedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </Button>
                  
                  {/* Note delete button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 pr-2"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
