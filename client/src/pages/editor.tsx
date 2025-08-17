import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Monitor, Smartphone } from "lucide-react";
import { Link } from "wouter";
import CodeEditor from "@/components/code-editor";
import PreviewContainer from "@/components/preview-container";
import { CodeRunner } from "@/lib/code-runner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function EditorPage() {
  const [codePreviewHtml, setCodePreviewHtml] = useState<string | null>(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [viewportMode, setViewportMode] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const [consoleLogs, setConsoleLogs] = useState<
    Array<{ level: string; message: string }>
  >([]);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const isMobile = useIsMobile();

  // Show mobile warning on mobile devices
  useEffect(() => {
    if (isMobile) {
      setShowMobileWarning(true);
    }
  }, [isMobile]);

  // Auto-run code on initial load
  useEffect(() => {
    const html = localStorage.getItem("webpreview_html");
    const css = localStorage.getItem("webpreview_css");
    const js = localStorage.getItem("webpreview_js");

    if (html || css || js) {
      handleRunCode(html || "", css || "", js || "");
    }

    // Listen for console messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console-log") {
        // Prevent duplicate console logs by checking if this message already exists
        setConsoleLogs((prev) => {
          const newLog = {
            level: event.data.level,
            message: event.data.message,
          };
          
          // Check if this exact message already exists to prevent duplicates
          const exists = prev.some(log => 
            log.level === newLog.level && log.message === newLog.message
          );
          
          if (!exists) {
            return [...prev, newLog];
          }
          return prev;
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleRunCode = (html: string, css: string, js: string) => {
    setIsCodeRunning(true);
    setConsoleLogs([]); // Clear previous logs

    try {
      const preview = CodeRunner.generatePreview(html, css, js);
      setCodePreviewHtml(preview);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setTimeout(() => setIsCodeRunning(false), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col">
      {/* Mobile Warning Modal */}
      {showMobileWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Mobile Device Detected</h3>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              For the best coding experience, we recommend using desktop mode. 
              If you're using Chrome, tap the three dots menu and select "Desktop site".
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => setShowMobileWarning(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Continue Anyway
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowMobileWarning(false)}
                className="w-full border-white/20 text-white hover:bg-white/10 font-medium py-2 rounded-lg transition-all duration-200"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Header */}
      <header className="border-b border-white/5 bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-lg">
        <div className="max-w-full px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 px-3 py-1.5 rounded-lg text-sm"
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                <span className="font-medium">Back</span>
              </Button>
            </Link>
            
            {/* Mobile indicator */}
            {isMobile && (
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Smartphone className="w-3 h-3" />
                <span>Mobile Mode</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex-1 p-1">
        <div className="premium-editor-layout">
          {/* Code Editor */}
          <div className="flex flex-col">
            <CodeEditor onRunCode={handleRunCode} isRunning={isCodeRunning} />
          </div>

          {/* Live Preview */}
          <div className="flex flex-col">
            <PreviewContainer
              previewHtml={codePreviewHtml}
              isLoading={isCodeRunning}
              error={null}
              stats={
                codePreviewHtml
                  ? {
                      filesCount: 3,
                      totalSize: codePreviewHtml.length,
                      processingTime: 150,
                    }
                  : null
              }
              onRefresh={() => {
                const html = localStorage.getItem("webpreview_html") || "";
                const css = localStorage.getItem("webpreview_css") || "";
                const js = localStorage.getItem("webpreview_js") || "";
                handleRunCode(html, css, js);
              }}
              viewportMode={viewportMode}
              onViewportChange={setViewportMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
