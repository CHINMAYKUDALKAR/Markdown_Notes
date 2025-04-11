
import React from "react";

const KeyboardShortcuts: React.FC = () => {
  return (
    <div className="border-t text-xs py-2 px-2 text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
      <span>Shortcuts: </span>
      <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+B</kbd> Bold</span>
      <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+I</kbd> Italic</span>
      <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+K</kbd> Link</span>
      <span><kbd className="px-1 rounded bg-muted">Ctrl/⌘+1-3</kbd> Headings</span>
      <span><kbd className="px-1 rounded bg-muted">Double-click</kbd> Rename Note</span>
      <span><kbd className="px-1 rounded bg-muted">Delete</kbd> Remove Note</span>
    </div>
  );
};

export default KeyboardShortcuts;
