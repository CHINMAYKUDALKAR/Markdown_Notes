import React, { useState, useRef, useEffect } from "react";
import { useNotes } from "@/context/NoteContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Search, PlusCircle, Edit, Trash2, Hash, Plus, X, ChevronRight, MoreHorizontal, BookOpen, CheckCircle, Clock, Pin, PinOff } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

const tagColors = [
  'note.purple',
  'note.lightPurple',
  'note.softGreen',
  'note.softYellow',
  'note.softOrange',
  'note.softPurple',
  'note.softPink',
  'note.softBlue',
];

const tagSchema = z.object({
  name: z.string().min(2, {
    message: "Tag name must be at least 2 characters.",
  }),
  color: z.string().min(4, {
    message: "Color must be selected.",
  }),
});

const Sidebar: React.FC = () => {
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    tags,
    createTag,
    updateTag,
    deleteTag,
    currentNote,
    setCurrentNote,
  } = useNotes();

  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false);
  const [isEditTagDialogOpen, setIsEditTagDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEditing = (noteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingNoteId(noteId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, noteId: string) => {
    if (e.key === 'Enter') {
      setEditingNoteId(null);
    } else if (e.key === 'Escape') {
      setEditingNoteId(null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, noteId: string) => {
    const newTitle = e.target.value;
    updateNote(noteId, { title: newTitle });
  };

  useEffect(() => {
    if (editingNoteId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNoteId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editInputRef.current && !editInputRef.current.contains(e.target as Node)) {
        setEditingNoteId(null);
      }
    };

    if (editingNoteId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingNoteId]);

  const getNoteDisplayTitle = (note: { title: string; content: string }) => {
    if (note.title && note.title !== "Untitled Note") {
      return note.title;
    }
    
    const firstLine = note.content
      .split('\n')[0]
      .replace(/^#+\s+/, '')
      .trim();
      
    return firstLine || "Untitled Note";
  };

  const newTagForm = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      color: tagColors[0],
    },
  });

  const editTagForm = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      color: tagColors[0],
    },
  });

  const handleCreateTag = (values: z.infer<typeof tagSchema>) => {
    createTag({
      name: values.name,
      color: values.color,
    });
    setIsNewTagDialogOpen(false);
  };

  const handleUpdateTag = (values: z.infer<typeof tagSchema>) => {
    if (!selectedTag) return;
    updateTag(selectedTag, {
      name: values.name,
      color: values.color,
    });
    setIsEditTagDialogOpen(false);
    setSelectedTag(null);
  };

  const handleDeleteTag = () => {
    if (!selectedTag) return;
    deleteTag(selectedTag);
    setIsEditTagDialogOpen(false);
    setSelectedTag(null);
  };

  const handleEditTag = (tagId: string) => {
    const tag = tags.find((tag) => tag.id === tagId);
    if (!tag) return;

    editTagForm.reset({
      name: tag.name,
      color: tag.color,
    });

    setSelectedTag(tagId);
    setIsEditTagDialogOpen(true);
  };

  const handleCreateNote = () => {
    createNote();
  };

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNoteToDelete(noteId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
        <h1 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
          <BookOpen size={18} />
          <span>Markdown Notes</span>
        </h1>
        <ThemeToggle />
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <p className="text-sm font-medium pb-2">Notes</p>
        <Separator className="pb-4" />

        {filteredNotes.length > 0 ? (
          <motion.div className="flex flex-col space-y-2">
            {filteredNotes.map((note, index) => {
              const isNewlyCreated = index === 0 && note.createdAt === note.updatedAt;
              return (
                <div 
                  key={note.id} 
                  className="relative flex items-center group"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start rounded-md truncate pr-16",
                      currentNote?.id === note.id
                        ? "bg-secondary hover:bg-secondary text-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setCurrentNote(note)}
                    onDoubleClick={(e) => handleStartEditing(note.id, e)}
                  >
                    {editingNoteId === note.id ? (
                      <input
                        ref={editInputRef}
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
                        value={note.title}
                        onChange={(e) => handleTitleChange(e, note.id)}
                        onKeyDown={(e) => handleKeyDown(e, note.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{getNoteDisplayTitle(note)}</span>
                    )}
                  </Button>
                  
                  <div className="absolute right-0 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                      onClick={(e) => handleStartEditing(note.id, e)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center text-muted-foreground">
            No notes found.
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={handleCreateNote}
          >
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="mr-2"
            >
              <PlusCircle className="h-4 w-4" />
            </motion.div>
            New Note
          </Button>
        </motion.div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium">Tags</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNewTagDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-md truncate"
                  style={{ color: tag.color }}
                  onClick={() => handleEditTag(tag.id)}
                >
                  <Hash className="mr-2 h-4 w-4" />
                  {tag.name}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No tags found.
            </div>
          )}
        </div>
      </div>

      <Dialog open={isNewTagDialogOpen} onOpenChange={setIsNewTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to categorize your notes.
            </DialogDescription>
          </DialogHeader>
          <Form {...newTagForm}>
            <form
              onSubmit={newTagForm.handleSubmit(handleCreateTag)}
              className="space-y-4"
            >
              <FormField
                control={newTagForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Tag" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newTagForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tagColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div
                              className="h-3 w-3 rounded-full mr-2 inline-block"
                              style={{ backgroundColor: `var(--${color})` }}
                            />
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditTagDialogOpen}
        onOpenChange={setIsEditTagDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Edit or delete the selected tag.
            </DialogDescription>
          </DialogHeader>
          <Form {...editTagForm}>
            <form
              onSubmit={editTagForm.handleSubmit(handleUpdateTag)}
              className="space-y-4"
            >
              <FormField
                control={editTagForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Tag" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editTagForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tagColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div
                              className="h-3 w-3 rounded-full mr-2 inline-block"
                              style={{ backgroundColor: `var(--${color})` }}
                            />
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteTag}
                  className="mr-2"
                >
                  Delete
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNote} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sidebar;
