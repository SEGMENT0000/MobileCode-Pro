import { Trash2, Folder, FileText, Image, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/file-utils";

interface FileTreeProps {
  files: Map<string, any>;
  onClear: () => void;
}

export default function FileTree({ files, onClear }: FileTreeProps) {
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, any> = {
      'html': <Code className="w-4 h-4 text-orange-400" />,
      'css': <Code className="w-4 h-4 text-blue-400" />,
      'js': <Code className="w-4 h-4 text-yellow-400" />,
      'json': <FileText className="w-4 h-4 text-green-400" />,
      'md': <FileText className="w-4 h-4 text-gray-400" />,
      'jpg': <Image className="w-4 h-4 text-purple-400" />,
      'jpeg': <Image className="w-4 h-4 text-purple-400" />,
      'png': <Image className="w-4 h-4 text-purple-400" />,
      'gif': <Image className="w-4 h-4 text-purple-400" />,
      'svg': <Image className="w-4 h-4 text-purple-400" />,
      'woff': <FileText className="w-4 h-4 text-gray-400" />,
      'woff2': <FileText className="w-4 h-4 text-gray-400" />,
      'ttf': <FileText className="w-4 h-4 text-gray-400" />
    };
    return iconMap[ext || ''] || <FileText className="w-4 h-4 text-text-secondary" />;
  };

  const buildFileTree = () => {
    const tree: any = {};
    
    for (const [path, file] of Array.from(files.entries())) {
      const parts = path.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i === parts.length - 1) {
          // File
          current[part] = file;
        } else {
          // Directory
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }
    
    return tree;
  };

  const renderFileTree = (tree: any, depth = 0): React.ReactNode[] => {
    return Object.entries(tree).map(([name, item]) => {
      const isFile = item && typeof item === 'object' && (item as any).name;
      
      return (
        <div key={name} className="file-tree-item">
          <div 
            className="flex items-center space-x-2 py-2 px-3 rounded-lg cursor-pointer"
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
          >
            {isFile ? (
              <>
                {getFileIcon((item as any).name)}
                <span className="text-sm">{name}</span>
                <span className="text-xs text-text-tertiary ml-auto">
                  {formatBytes((item as any).size)}
                </span>
              </>
            ) : (
              <>
                <Folder className="w-4 h-4 text-text-secondary" />
                <span className="text-sm">{name}</span>
              </>
            )}
          </div>
          {!isFile && (
            <div>
              {renderFileTree(item, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const totalSize = Array.from(files.values()).reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="glassmorphic rounded-xl p-6" data-testid="file-tree">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Project Files</h3>
        <Button
          onClick={onClear}
          variant="ghost"
          size="sm"
          className="text-text-secondary hover:text-white"
          data-testid="button-clear-files"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {renderFileTree(buildFileTree())}
      </div>
      <div className="mt-4 pt-4 border-t border-glass-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {files.size} files
          </span>
          <span className="text-text-secondary">
            {formatBytes(totalSize)}
          </span>
        </div>
      </div>
    </div>
  );
}
