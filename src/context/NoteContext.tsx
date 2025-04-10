
import React, { createContext, useContext, useState, useEffect } from "react";
import { Note, Folder, Tag } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface NoteContextType {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  currentNote: Note | null;
  searchQuery: string;
  selectedFolder: string | null;
  selectedTag: string | null;
  
  createNote: (folderId?: string | null) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folderId: string | null) => void;
  setSelectedTag: (tagId: string | null) => void;
  
  createFolder: (name: string, parentId?: string | null) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  
  createTag: (data: Partial<Tag>) => void;
  updateTag: (id: string, data: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
}

const defaultNote: Note = {
  id: "",
  title: "Untitled Note",
  content: "# Hello World\n\nStart writing your note here...",
  folderId: null,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Sample colors for tags
const tagColors = [
  "#F2FCE2", // soft green
  "#FEF7CD", // soft yellow
  "#FEC6A1", // soft orange
  "#E5DEFF", // soft purple
  "#FFDEE2", // soft pink
  "#D3E4FD", // soft blue
];

// Create context
const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Context provider
export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from localStorage or use defaults
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem("folders");
    return saved ? JSON.parse(saved) : [
      { id: "default", name: "Main", parentId: null }
    ];
  });
  
  const [tags, setTags] = useState<Tag[]>(() => {
    const saved = localStorage.getItem("tags");
    return saved ? JSON.parse(saved) : [
      { id: "tag1", name: "Important", color: "#FEC6A1" },
      { id: "tag2", name: "Work", color: "#E5DEFF" },
      { id: "tag3", name: "Personal", color: "#D3E4FD" }
    ];
  });
  
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  
  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);
  
  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags]);

  // Note operations
  const createNote = (folderId: string | null = null) => {
    const newNote: Note = {
      ...defaultNote,
      id: uuidv4(),
      folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote);
    toast.success("New note created");
    return newNote;
  };
  
  const updateNote = (id: string, data: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, ...data, updatedAt: new Date().toISOString() } 
        : note
    );
    
    setNotes(updatedNotes);
    
    // Update current note if it's the one being edited
    if (currentNote && currentNote.id === id) {
      setCurrentNote({ ...currentNote, ...data, updatedAt: new Date().toISOString() });
    }
  };
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
    // Clear current note if it's the one being deleted
    if (currentNote && currentNote.id === id) {
      setCurrentNote(null);
    }
    
    toast.success("Note deleted");
  };
  
  // Folder operations
  const createFolder = (name: string, parentId: string | null = null) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      parentId
    };
    
    setFolders([...folders, newFolder]);
    toast.success(`Folder "${name}" created`);
    return newFolder;
  };
  
  const updateFolder = (id: string, name: string) => {
    setFolders(folders.map(folder => 
      folder.id === id ? { ...folder, name } : folder
    ));
    toast.success(`Folder renamed to "${name}"`);
  };
  
  const deleteFolder = (id: string) => {
    // Move all notes from this folder to null (root)
    const updatedNotes = notes.map(note => 
      note.folderId === id ? { ...note, folderId: null } : note
    );
    
    setNotes(updatedNotes);
    setFolders(folders.filter(folder => folder.id !== id));
    
    // If the deleted folder was selected, clear selection
    if (selectedFolder === id) {
      setSelectedFolder(null);
    }
    
    toast.success("Folder deleted");
  };
  
  // Tag operations
  const createTag = (data: Partial<Tag>) => {
    // Pick a random color if none provided
    const tagColor = data.color || tagColors[Math.floor(Math.random() * tagColors.length)];
    
    const newTag: Tag = {
      id: uuidv4(),
      name: data.name || "New Tag",
      color: tagColor
    };
    
    setTags([...tags, newTag]);
    toast.success(`Tag "${newTag.name}" created`);
    return newTag;
  };
  
  const updateTag = (id: string, data: Partial<Tag>) => {
    setTags(tags.map(tag => 
      tag.id === id ? { ...tag, ...data } : tag
    ));
    toast.success("Tag updated");
  };
  
  const deleteTag = (id: string) => {
    // Remove this tag from all notes
    const updatedNotes = notes.map(note => ({
      ...note,
      tags: note.tags.filter(tagId => tagId !== id)
    }));
    
    setNotes(updatedNotes);
    setTags(tags.filter(tag => tag.id !== id));
    
    // If the deleted tag was selected, clear selection
    if (selectedTag === id) {
      setSelectedTag(null);
    }
    
    toast.success("Tag deleted");
  };
  
  const value = {
    notes,
    folders,
    tags,
    currentNote,
    searchQuery,
    selectedFolder,
    selectedTag,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    setSearchQuery,
    setSelectedFolder,
    setSelectedTag,
    createFolder,
    updateFolder,
    deleteFolder,
    createTag,
    updateTag,
    deleteTag,
  };
  
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};

// Custom hook to use the note context
export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NoteProvider");
  }
  return context;
};
