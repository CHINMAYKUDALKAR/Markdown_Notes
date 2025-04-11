
import React, { useState, useEffect } from "react";
import { useNotes } from "@/context/NoteContext";
import MarkdownEditor from "./MarkdownEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, Plus, Search, Tag as TagIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NoteView: React.FC = () => {
  const { currentNote, tags, updateNote, notes, searchQuery, setSearchQuery } = useNotes();
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{id: string, title: string, content: string, matches: Array<{text: string, position: number}>}>>([]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearchQuery.length > 0) {
      const results = notes.map(note => {
        const titleMatches = note.title.toLowerCase().includes(localSearchQuery.toLowerCase())
          ? [{ text: note.title, position: note.title.toLowerCase().indexOf(localSearchQuery.toLowerCase()) }]
          : [];
          
        const contentMatches = [];
        const lowerCaseContent = note.content.toLowerCase();
        const lowerCaseQuery = localSearchQuery.toLowerCase();
        let position = 0;
        
        while ((position = lowerCaseContent.indexOf(lowerCaseQuery, position)) !== -1) {
          // Get a snippet of content around the match
          const start = Math.max(0, position - 20);
          const end = Math.min(note.content.length, position + localSearchQuery.length + 20);
          const snippet = note.content.substring(start, end);
          
          contentMatches.push({
            text: snippet,
            position: position
          });
          
          position += lowerCaseQuery.length;
          
          // Limit to 3 matches per note
          if (contentMatches.length >= 3) break;
        }
        
        return {
          id: note.id,
          title: note.title,
          content: note.content,
          matches: [...titleMatches, ...contentMatches]
        };
      }).filter(result => result.matches.length > 0);
      
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [localSearchQuery, notes]);

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
    setTagPopoverOpen(false);
  };

  const removeTag = (tagId: string) => {
    if (!currentNote) return;
    updateNote(currentNote.id, {
      tags: currentNote.tags.filter(id => id !== tagId)
    });
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    if (value.length > 0) {
      setShowSearchResults(true);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query || query.length === 0) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
        : part
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top actions bar */}
      <div className="py-2 px-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto flex-1 mr-2">
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
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
              </TooltipTrigger>
              <TooltipContent>Add tag</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Search functionality */}
        <div className="relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowSearchResults(!showSearchResults)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search notes</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {showSearchResults && (
            <div className="absolute right-0 top-full mt-2 w-96 p-2 rounded-md border shadow-md bg-background z-10">
              <Input
                placeholder="Search in notes..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="mb-2"
              />
              {localSearchQuery.length > 0 && (
                <div className="max-h-96 overflow-auto">
                  {searchResults.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2">No results found</div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {searchResults.map(result => (
                        <Button 
                          key={result.id} 
                          variant="ghost" 
                          className="justify-start text-left h-auto py-2"
                          onClick={() => {
                            setShowSearchResults(false);
                          }}
                        >
                          <div className="truncate w-full">
                            <div className="font-medium">
                              {highlightText(result.title, localSearchQuery)}
                            </div>
                            {result.matches.slice(0, 2).map((match, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground mt-1">
                                {"..."}
                                {highlightText(match.text, localSearchQuery)}
                                {"..."}
                              </div>
                            ))}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-5 w-5"
                onClick={() => {
                  setShowSearchResults(false);
                  setLocalSearchQuery("");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Markdown editor */}
      <ScrollArea className="flex-1 p-4">
        <MarkdownEditor />
      </ScrollArea>
    </div>
  );
};

export default NoteView;
