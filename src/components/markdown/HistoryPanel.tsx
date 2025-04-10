
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface HistoryPanelProps {
  history: { timestamp: string; content: string }[];
  onRestoreHistory: (content: string) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onRestoreHistory,
  onClose,
}) => {
  const restoreHistoryItem = (content: string) => {
    onRestoreHistory(content);
    toast.success("Restored from history");
    onClose();
  };

  return (
    <div>
      <div className="p-3 border-b">
        <h3 className="font-medium">Note History</h3>
        <p className="text-xs text-muted-foreground">Recent edit snapshots</p>
      </div>
      <ScrollArea className="h-80">
        <Accordion type="single" collapsible className="w-full">
          {history.length > 0 ? (
            history.map((item, index) => (
              <AccordionItem key={index} value={index.toString()}>
                <AccordionTrigger className="px-4 py-2 text-xs">
                  {new Date(item.timestamp).toLocaleString()}
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="text-xs max-h-20 overflow-auto p-2 bg-muted/30 rounded mb-2">
                    {item.content.substring(0, 200)}
                    {item.content.length > 200 ? '...' : ''}
                  </div>
                  <button
                    className="text-xs text-primary hover:underline w-full text-right"
                    onClick={() => restoreHistoryItem(item.content)}
                  >
                    Restore this version
                  </button>
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              No history available
            </div>
          )}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default HistoryPanel;
