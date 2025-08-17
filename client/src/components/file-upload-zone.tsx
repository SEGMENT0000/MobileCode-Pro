import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploadZone({ onFilesSelected }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    onFilesSelected(files);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleZoneClick = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <div className="glassmorphic rounded-xl p-8">
      <h2 className="text-2xl font-semibold mb-6">Upload Project</h2>
      
      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed border-glass-border rounded-xl p-12 text-center transition-all duration-200 cursor-pointer hover:border-white/20 ${
          isDragActive ? 'drag-active' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        data-testid="drop-zone"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <Upload className="text-2xl text-text-secondary" />
          </div>
          <div>
            <p className="text-lg font-medium mb-2">Drop your project files here</p>
            <p className="text-text-secondary">
              or <span className="text-white underline">browse to upload</span>
            </p>
          </div>
          <p className="text-sm text-text-tertiary">
            Supports: HTML, CSS, JS, Images, Fonts
          </p>
        </div>
      </div>

      {/* File Input */}
      <input
        id="file-input"
        type="file"
        multiple
        {...({ webkitdirectory: "true" } as any)}
        className="hidden"
        onChange={handleFileSelect}
        data-testid="file-input"
      />
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-6" data-testid="upload-progress">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Uploading files...</span>
            <span className="text-sm">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-dark-secondary rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
