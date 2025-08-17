import { useState, useCallback } from "react";
import { ProjectProcessor, type ProjectFile } from "@/lib/project-processor";
import { readFile, isWebFile, downloadFile } from "@/lib/file-utils";
import { useToast } from "@/hooks/use-toast";

interface ProjectStats {
  filesCount: number;
  totalSize: number;
  processingTime: number;
}

export const useProject = () => {
  const [files, setFiles] = useState<Map<string, ProjectFile>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePreview = useCallback(async () => {
    if (files.size === 0) return;

    setIsProcessing(true);
    setError(null);
    const startTime = performance.now();

    try {
      const processor = new ProjectProcessor(files);
      const html = await processor.processProject();
      
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      const totalSize = Array.from(files.values()).reduce((sum, file) => sum + file.size, 0);

      setPreviewHtml(html);
      setStats({
        filesCount: files.size,
        totalSize,
        processingTime,
      });

      toast({
        title: "Preview generated successfully",
        description: `Processed in ${processingTime}ms`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate preview';
      setError(message);
      toast({
        title: "Preview generation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [files, toast]);

  const addFiles = useCallback(async (fileList: File[]) => {
    try {
      setError(null);
      const newFiles = new Map<string, ProjectFile>();
      let processedCount = 0;

      // Handle zip files
      for (const file of fileList) {
        if (file.name.endsWith('.zip')) {
          try {
            // For now, show a message about zip support
            toast({
              title: "Zip files detected",
              description: "Please extract and upload individual files for now.",
              variant: "destructive",
            });
            continue;
          } catch (err) {
            console.error('Error processing zip file:', err);
            continue;
          }
        }

        // Skip non-web files
        if (!isWebFile(file.name)) {
          continue;
        }

        try {
          const content = await readFile(file);
          const path = file.webkitRelativePath || file.name;
          
          newFiles.set(path, {
            name: file.name,
            path,
            content,
            type: file.type,
            size: file.size,
          });
          
          processedCount++;
        } catch (err) {
          console.error('Error reading file:', file.name, err);
        }
      }

      if (processedCount === 0) {
        toast({
          title: "No valid files found",
          description: "Please upload HTML, CSS, JS, or image files to get started.",
          variant: "destructive",
        });
        return;
      }

      setFiles(newFiles);
      setPreviewHtml(null);
      setStats(null);

      // Auto-generate preview if we have files
      if (processedCount > 0) {
        setTimeout(() => {
          generatePreview();
        }, 500);
      }

      toast({
        title: "Project uploaded successfully! 🚀",
        description: `Processed ${processedCount} files. Generating preview...`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast, generatePreview]);

  const clearFiles = useCallback(() => {
    setFiles(new Map());
    setPreviewHtml(null);
    setStats(null);
    setError(null);
  }, []);

  const downloadPreview = useCallback(() => {
    if (!previewHtml) return;

    downloadFile(previewHtml, 'preview.html', 'text/html');
    
    toast({
      title: "Preview downloaded",
      description: "The preview HTML file has been saved to your downloads.",
    });
  }, [previewHtml, toast]);

  return {
    files,
    isProcessing,
    previewHtml,
    stats,
    error,
    addFiles,
    clearFiles,
    generatePreview,
    downloadPreview,
  };
};
