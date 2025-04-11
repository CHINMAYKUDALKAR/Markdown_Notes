
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
  isNew?: boolean;
}

const AnimatedNote: React.FC<AnimatedNoteProps> = ({ note, isActive, onClick, onDelete, isNew = false }) => {
  const { tags } = useNotes();
  
  const noteTags = note.tags
    .map(tagId => tags.find(tag => tag.id === tagId))
    .filter(Boolean);
  
  const noteVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: isNew ? 300 : 200,
        damping: isNew ? 15 : 20
      }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };
  
  return (
    <motion.div
      variants={noteVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        "p-2 rounded-md mb-1 cursor-pointer group relative",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}
      onClick={onClick}
      layout
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
                  <motion.div 
                    key={tag.id} 
                    className="text-xs px-1 rounded-sm" 
                    style={{ backgroundColor: tag.color, color: '#333' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tag.name}
                  </motion.div>
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
