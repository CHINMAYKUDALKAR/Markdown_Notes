
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import NoteView from "./NoteView";
import { NoteProvider } from "@/context/NoteContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <NoteProvider>
      <div className={cn(
        "flex h-screen transition-all duration-300",
        theme === 'dark' ? 'bg-background text-foreground' : ''
      )}>
        <div className={cn(
          "border-r border-border transition-all duration-300 flex-shrink-0",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-72 md:w-80"
        )}>
          <Sidebar />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "absolute bottom-6 z-10 rounded-full shadow-md bg-background border border-border",
            sidebarCollapsed ? "left-4" : "left-[17rem] md:left-[19rem]"
          )}
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
        
        <div className="flex-1 overflow-hidden">
          <NoteView />
        </div>
      </div>
    </NoteProvider>
  );
};

export default Layout;
