
import { Note, Tag } from "@/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import JSZip from "jszip";

// Helper function to sanitize filenames
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[/\\?%*:|"<>]/g, "-").trim();
};

// Export a note as PDF
export const exportToPdf = async (note: Note, tags: Tag[], elementSelector: string): Promise<void> => {
  try {
    // Get the element to convert to PDF
    const element = document.querySelector(elementSelector) as HTMLElement;
    if (!element) {
      throw new Error("Preview element not found");
    }
    
    // Create filename from note title
    const title = note.title || "Untitled Note";
    const filename = `${sanitizeFilename(title)}.pdf`;
    
    // Use html2canvas to capture the rendered markdown
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    });
    
    // Calculate dimensions
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
    });
    
    const imgWidth = 210; // A4 width in mm (portrait)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.setFontSize(16);
    pdf.text(title, 10, 10);
    
    // Add tags if present
    if (note.tags.length > 0) {
      const noteTagNames = note.tags
        .map(tagId => tags.find(t => t.id === tagId)?.name || "")
        .filter(Boolean)
        .join(", ");
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Tags: ${noteTagNames}`, 10, 20);
      pdf.setTextColor(0, 0, 0);
    }
    
    // Add creation/update dates
    pdf.setFontSize(8);
    pdf.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 10, 25);
    pdf.text(`Updated: ${new Date(note.updatedAt).toLocaleDateString()}`, 10, 30);
    
    // Add the markdown content as image
    pdf.addImage(imgData, "PNG", 10, 35, imgWidth - 20, imgHeight);
    
    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};

// Export all notes as a ZIP of markdown files
export const exportAllToZip = (notes: Note[], tags: Tag[]): void => {
  const zip = new JSZip();
  const folder = zip.folder("markdown-notes");
  
  if (!folder) {
    throw new Error("Could not create zip folder");
  }
  
  notes.forEach(note => {
    const title = note.title || "Untitled Note";
    const filename = `${sanitizeFilename(title)}.md`;
    
    // Create markdown content with frontmatter
    let content = "---\n";
    content += `title: ${title}\n`;
    content += `created: ${note.createdAt}\n`;
    content += `updated: ${note.updatedAt}\n`;
    
    if (note.tags.length > 0) {
      const tagNames = note.tags
        .map(tagId => tags.find(t => t.id === tagId)?.name || "")
        .filter(Boolean);
        
      content += `tags: [${tagNames.join(", ")}]\n`;
    }
    
    content += "---\n\n";
    content += note.content;
    
    folder.file(filename, content);
  });
  
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "markdown-notes-export.zip");
  });
};

// Export a single note as a markdown file
export const exportToMarkdown = (note: Note, tags: Tag[]): void => {
  const title = note.title || "Untitled Note";
  const filename = `${sanitizeFilename(title)}.md`;
  
  // Create markdown content with frontmatter
  let content = "---\n";
  content += `title: ${title}\n`;
  content += `created: ${note.createdAt}\n`;
  content += `updated: ${note.updatedAt}\n`;
  
  if (note.tags.length > 0) {
    const tagNames = note.tags
      .map(tagId => tags.find(t => t.id === tagId)?.name || "")
      .filter(Boolean);
      
    content += `tags: [${tagNames.join(", ")}]\n`;
  }
  
  content += "---\n\n";
  content += note.content;
  
  // Create a blob and save the file
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, filename);
};

// Import a markdown file
export const importMarkdownFile = (file: File): Promise<Partial<Note>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        // Basic frontmatter parsing
        let title = file.name.replace(/\.md$/, "");
        let noteContent = content;
        
        // Check for frontmatter
        if (content.startsWith("---")) {
          const endOfFrontmatter = content.indexOf("---", 3);
          
          if (endOfFrontmatter > 0) {
            const frontmatter = content.substring(3, endOfFrontmatter).trim();
            const lines = frontmatter.split("\n");
            
            // Extract title from frontmatter if exists
            const titleLine = lines.find(line => line.startsWith("title:"));
            if (titleLine) {
              title = titleLine.substring(6).trim();
            }
            
            // Extract the content after frontmatter
            noteContent = content.substring(endOfFrontmatter + 3).trim();
          }
        }
        
        resolve({
          title,
          content: noteContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Export backup as JSON
export const exportBackup = (notes: Note[], folders: any[], tags: Tag[]): void => {
  const backup = {
    notes,
    folders,
    tags,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  saveAs(blob, `markdown-notes-backup-${new Date().toISOString().split('T')[0]}.json`);
};

// Import backup from JSON
export const importBackup = (file: File): Promise<{notes: Note[], folders: any[], tags: Tag[]}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backup = JSON.parse(content);
        
        if (!backup.notes || !backup.tags) {
          throw new Error("Invalid backup file format");
        }
        
        resolve({
          notes: backup.notes,
          folders: backup.folders || [],
          tags: backup.tags,
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
