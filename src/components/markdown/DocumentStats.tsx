
import React from "react";
import { Clock, FileText, TextQuote } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { History } from "lucide-react";
import HistoryPanel from "./HistoryPanel";

interface DocumentStatsProps {
  wordCount: number;
  charCount: number;
  readingTime: number;
  history: { timestamp: string; content: string }[];
  showHistoryPanel: boolean;
  setShowHistoryPanel: (show: boolean) => void;
  onRestoreHistory: (content: string) => void;
}

const DocumentStats: React.FC<DocumentStatsProps> = ({
  wordCount,
  charCount,
  readingTime,
  history,
  showHistoryPanel,
  setShowHistoryPanel,
  onRestoreHistory,
}) => {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2 px-2">
      <div className="flex items-center gap-1">
        <FileText className="h-3 w-3" />
        <span>{wordCount} words</span>
      </div>
      <div className="flex items-center gap-1">
        <TextQuote className="h-3 w-3" />
        <span>{charCount} characters</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{readingTime} min read</span>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <History className="h-3 w-3" />
                  <span>History</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <HistoryPanel 
                  history={history}
                  onRestoreHistory={onRestoreHistory}
                  onClose={() => setShowHistoryPanel(false)}
                />
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>View edit history</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DocumentStats;
