
import React from 'react';
import { motion } from 'framer-motion';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Trash, FileEdit, Tag as TagIcon } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';

interface AnimatedNoteProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const AnimatedNote: React.FC<AnimatedNoteProps> = ({ note, isActive, onClick, onDelete }) => {
  const { tags } = useNotes();
  
  const noteTags = note.tags
    .map(tagId => tags.find(tag => tag.id === tagId))
    .filter(Boolean);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "p-2 rounded-md mb-1 cursor-pointer group relative",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="overflow-hidden">
          <h3 className="font-medium truncate">{note.title || "Untitled Note"}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {new Date(note.updatedAt).toLocaleDateString()}
          </p>
          {noteTags.length > 0 && (
            <div className="flex items-center mt-1 space-x-1">
              <TagIcon className="w-3 h-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1 max-w-[180px]">
                {noteTags.map(tag => tag && (
                  <div 
                    key={tag.id} 
                    className="text-xs px-1 rounded-sm" 
                    style={{ backgroundColor: tag.color, color: '#333' }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}>
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedNote;
