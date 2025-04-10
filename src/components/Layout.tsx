
import React from "react";
import Sidebar from "./Sidebar";
import NoteView from "./NoteView";
import { Separator } from "@/components/ui/separator";
import { NoteProvider } from "@/context/NoteContext";

const Layout: React.FC = () => {
  return (
    <NoteProvider>
      <div className="flex h-screen">
        <div className="w-72 overflow-hidden">
          <Sidebar />
        </div>
        <Separator orientation="vertical" />
        <div className="flex-1 overflow-hidden">
          <NoteView />
        </div>
      </div>
    </NoteProvider>
  );
};

export default Layout;
