

import { useState } from "react";
import { Monitor, Tablet, Smartphone, RotateCcw, Eye, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewStats {
  filesCount: number;
  totalSize: number;
  processingTime: number;
}

interface PreviewContainerProps {
  previewHtml: string | null;
  isLoading: boolean;
  error: string | null;
  stats: PreviewStats | null;
  onRefresh: () => void;
  viewportMode: 'mobile' | 'tablet' | 'desktop';
  onViewportChange: (mode: 'mobile' | 'tablet' | 'desktop') => void;
}

export default function PreviewContainer({
  previewHtml,
  isLoading,
  error,
  stats,
  onRefresh,
  viewportMode,
  onViewportChange
}: PreviewContainerProps) {
  const getViewportDimensions = () => {
    switch (viewportMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const dimensions = getViewportDimensions();

  return (
    <div className="h-full flex flex-col premium-preview-container premium-glass-container">
      {/* Premium Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10 bg-gradient-to-r from-gray-900/30 to-gray-800/30 backdrop-blur-xl">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="relative p-2 lg:p-3 bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-xl shadow-lg backdrop-blur-sm border border-white/10">
            <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-white drop-shadow-lg" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-xl blur-md"></div>
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-black text-white tracking-tight premium-gradient-text">
              Live Preview
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Premium Viewport Controls */}
          <div className="premium-viewport-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewportChange('desktop')}
              className={`premium-viewport-btn ${
                viewportMode === 'desktop' ? 'active' : ''
              }`}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewportChange('tablet')}
              className={`premium-viewport-btn ${
                viewportMode === 'tablet' ? 'active' : ''
              }`}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewportChange('mobile')}
              className={`premium-viewport-btn ${
                viewportMode === 'mobile' ? 'active' : ''
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="premium-viewport-btn hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-blue-500/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Premium Preview Content */}
      <div className="flex-1 p-2 lg:p-4 bg-gradient-to-br from-gray-900/10 via-gray-800/10 to-gray-900/10 backdrop-blur-md overflow-auto">
        <div className="h-full flex items-center justify-center">
          {isLoading ? (
            <div className="text-center p-6 lg:p-8 glassmorphic rounded-2xl">
              <div className="premium-spinner mx-auto mb-4 lg:mb-6"></div>
              <p className="text-white font-semibold text-base lg:text-lg">Rendering...</p>
              <p className="text-gray-400 text-sm mt-2">Compiling your masterpiece</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-300 p-6 lg:p-8 bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-2xl border border-red-500/30 backdrop-blur-md">
              <p className="font-bold text-base lg:text-lg">Error Detected</p>
              <p className="text-sm mt-2 text-red-200">{error}</p>
            </div>
          ) : previewHtml ? (
            <div 
              className="bg-white border-2 border-white/20 rounded-2xl shadow-2xl overflow-hidden mx-auto transition-all duration-500"
              style={{
                width: viewportMode === 'desktop' ? '100%' : Math.min(parseInt(dimensions.width), window.innerWidth - 40) + 'px',
                height: viewportMode === 'desktop' ? '100%' : Math.min(parseInt(dimensions.height), window.innerHeight - 200) + 'px',
                maxWidth: '100%',
                maxHeight: '100%',
                minHeight: viewportMode === 'desktop' ? '400px' : '300px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0 rounded-2xl"
                sandbox="allow-scripts allow-same-origin"
                title="Premium Live Preview"
              />
            </div>
          ) : (
            <div className="text-center text-gray-300 p-6 lg:p-8 glassmorphic rounded-2xl">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
                <Eye className="w-6 h-6 lg:w-8 lg:h-8 text-gray-300" />
              </div>
              <p className="font-bold text-base lg:text-lg mb-2">Ready to Create</p>
              <p className="text-gray-400 text-sm">Your code will appear here instantly</p>
            </div>
          )}
        </div>
      </div>

      {/* Premium Stats Footer */}
      {stats && (
        <div className="p-3 lg:p-4 border-t border-white/10 bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-md">
          <div className="flex justify-between text-xs text-gray-300 font-semibold tracking-wide">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span>{stats.filesCount} files</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>{(stats.totalSize / 1024).toFixed(1)} KB</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span>{stats.processingTime}ms</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

