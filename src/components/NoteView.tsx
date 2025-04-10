
import React, { useState } from "react";
import { useNotes } from "@/context/NoteContext";
import MarkdownEditor from "./MarkdownEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, Plus, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NoteView: React.FC = () => {
  const { currentNote, tags, updateNote } = useNotes();
  const [open, setOpen] = useState(false);

  if (!currentNote) {
    return null;
  }

  const noteTags = currentNote.tags.map(tagId => 
    tags.find(tag => tag.id === tagId)
  ).filter(Boolean) as Array<{ id: string; name: string; color: string }>;

  const availableTags = tags.filter(tag => !currentNote.tags.includes(tag.id));

  const addTag = (tagId: string) => {
    if (!currentNote) return;
    updateNote(currentNote.id, {
      tags: [...currentNote.tags, tagId]
    });
    setOpen(false);
  };

  const removeTag = (tagId: string) => {
    if (!currentNote) return;
    updateNote(currentNote.id, {
      tags: currentNote.tags.filter(id => id !== tagId)
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tags bar */}
      <div className="py-2 px-4 border-b flex items-center gap-2 overflow-x-auto">
        {noteTags.map(tag => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color, color: '#333' }}
            className="flex items-center gap-1"
          >
            {tag.name}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 p-0 hover:bg-transparent hover:text-primary"
              onClick={() => removeTag(tag.id)}
            >
              <span>×</span>
            </Button>
          </Badge>
        ))}
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 gap-1">
              <TagIcon className="h-3 w-3" />
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {availableTags.map(tag => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => addTag(tag.id)}
                  >
                    <div 
                      className="h-3 w-3 rounded-full mr-2" 
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentNote.tags.includes(tag.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Markdown editor */}
      <ScrollArea className="flex-1 p-4">
        <MarkdownEditor />
      </ScrollArea>
    </div>
  );
};

export default NoteView;
