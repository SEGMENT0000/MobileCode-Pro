import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Files, 
  Search, 
  GitBranch, 
  Settings, 
  Play, 
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  FolderOpen,
  X,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Terminal,
  AlertTriangle,
  Check,
  Circle,
  RotateCcw
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CodeRunner } from "@/lib/code-runner";
import { useIsMobile } from "@/hooks/use-mobile";

interface FileTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  language: 'html' | 'css' | 'js';
  modified: boolean;
}

export default function EditorPage() {
  const [html, setHtml] = useState(localStorage.getItem('webpreview_html') || `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>Start coding something amazing!</p>
    <button onclick="showMessage()">Click Me</button>
    <div id="message"></div>
  </div>
</body>
</html>`);

  const [css, setCss] = useState(localStorage.getItem('webpreview_css') || `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
}

h1 {
  color: #1a202c;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

p {
  color: #718096;
  margin-bottom: 1.5rem;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

#message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0fff4;
  border-radius: 0.5rem;
  color: #276749;
  display: none;
}`);

  const [js, setJs] = useState(localStorage.getItem('webpreview_js') || `function showMessage() {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = 'Hello from JavaScript!';
  messageDiv.style.display = 'block';
  
  messageDiv.style.opacity = '0';
  messageDiv.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    messageDiv.style.transition = 'all 0.3s ease';
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  }, 50);
}

console.log('JavaScript loaded successfully!');`);

  const [codePreviewHtml, setCodePreviewHtml] = useState<string | null>(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [viewportMode, setViewportMode] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [consoleLogs, setConsoleLogs] = useState<Array<{ level: string; message: string; timestamp: string }>>([]);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [htmlModified, setHtmlModified] = useState(false);
  const [cssModified, setCssModified] = useState(false);
  const [jsModified, setJsModified] = useState(false);
  
  const isMobile = useIsMobile();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const files: FileTab[] = [
    { id: 'html', name: 'index.html', icon: <FileCode className="w-4 h-4 text-[#e37933]" />, language: 'html', modified: htmlModified },
    { id: 'css', name: 'styles.css', icon: <FileCode className="w-4 h-4 text-[#519aba]" />, language: 'css', modified: cssModified },
    { id: 'js', name: 'script.js', icon: <FileCode className="w-4 h-4 text-[#cbcb41]" />, language: 'js', modified: jsModified },
  ];

  useEffect(() => {
    if (isMobile) {
      setShowMobileWarning(true);
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const savedHtml = localStorage.getItem('webpreview_html');
    const savedCss = localStorage.getItem('webpreview_css');
    const savedJs = localStorage.getItem('webpreview_js');

    if (savedHtml || savedCss || savedJs) {
      handleRunCode(savedHtml || html, savedCss || css, savedJs || js);
    } else {
      handleRunCode(html, css, js);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console-log") {
        const timestamp = new Date().toLocaleTimeString();
        setConsoleLogs((prev) => {
          const newLog = { level: event.data.level, message: event.data.message, timestamp };
          const exists = prev.some(log => log.level === newLog.level && log.message === newLog.message);
          if (!exists) return [...prev, newLog];
          return prev;
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    localStorage.setItem('webpreview_html', html);
  }, [html]);

  useEffect(() => {
    localStorage.setItem('webpreview_css', css);
  }, [css]);

  useEffect(() => {
    localStorage.setItem('webpreview_js', js);
  }, [js]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (html.trim() || css.trim() || js.trim()) {
        setConsoleLogs([]);
        handleRunCode(html, css, js);
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [html, css, js]);

  const handleRunCode = (htmlCode: string, cssCode: string, jsCode: string) => {
    setIsCodeRunning(true);
    try {
      const preview = CodeRunner.generatePreview(htmlCode, cssCode, jsCode);
      setCodePreviewHtml(preview);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setTimeout(() => setIsCodeRunning(false), 200);
    }
  };

  const handleCodeChange = (type: 'html' | 'css' | 'js', value: string) => {
    switch (type) {
      case 'html':
        setHtml(value);
        setHtmlModified(true);
        break;
      case 'css':
        setCss(value);
        setCssModified(true);
        break;
      case 'js':
        setJs(value);
        setJsModified(true);
        break;
    }
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'html': return html;
      case 'css': return css;
      case 'js': return js;
    }
  };

  const getLineNumbers = (code: string) => {
    const lines = code.split('\n');
    return lines.map((_, i) => i + 1);
  };

  const handleSave = () => {
    setHtmlModified(false);
    setCssModified(false);
    setJsModified(false);
    setConsoleLogs([]);
    handleRunCode(html, css, js);
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      {showMobileWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#4d4d00] rounded">
                <AlertTriangle className="w-5 h-5 text-[#cca700]" />
              </div>
              <h3 className="text-base font-semibold text-white">Mobile Device Detected</h3>
            </div>
            <p className="text-[#cccccc] mb-6 text-sm">
              For the best experience, we recommend using a desktop browser. 
              Enable "Desktop site" in your browser menu for better usability.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowMobileWarning(false)}
                className="flex-1 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm py-2"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="h-8 bg-[#323233] flex items-center justify-between px-3 border-b border-[#252526] flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <button className="text-[#cccccc] hover:text-white flex items-center space-x-1 text-xs">
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          </Link>
          <span className="text-[#cccccc] text-xs">MobileCode Pro - Visual Editor</span>
        </div>
        <div className="flex items-center space-x-2">
          {isMobile && (
            <span className="text-xs text-[#858585] flex items-center">
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-[#252526] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-3 mb-1 rounded ${sidebarOpen ? 'text-white border-l-2 border-white bg-[#252526]' : 'text-[#858585] hover:text-white'}`}
            title="Explorer"
          >
            <Files className="w-5 h-5" />
          </button>
          <button className="p-3 mb-1 text-[#858585] hover:text-white rounded" title="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-3 mb-1 text-[#858585] hover:text-white rounded" title="Source Control">
            <GitBranch className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="p-3 text-[#858585] hover:text-white rounded" title="Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {sidebarOpen && (
          <div className="w-60 bg-[#252526] border-r border-[#1e1e1e] flex flex-col flex-shrink-0">
            <div className="px-4 py-2 text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wider">
              Explorer
            </div>
            
            <div className="flex-1 overflow-auto">
              <div 
                className="flex items-center px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[13px]"
                onClick={() => setExplorerOpen(!explorerOpen)}
              >
                {explorerOpen ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                <FolderOpen className="w-4 h-4 mr-2 text-[#dcb67a]" />
                <span className="font-semibold text-[#cccccc]">MY PROJECT</span>
              </div>
              
              {explorerOpen && (
                <div className="ml-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setActiveTab(file.language)}
                      className={`flex items-center px-4 py-1 cursor-pointer text-[13px] ${
                        activeTab === file.language 
                          ? 'bg-[#094771] text-white' 
                          : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                      }`}
                    >
                      {file.icon}
                      <span className="ml-2">{file.name}</span>
                      {file.modified && <Circle className="w-2 h-2 ml-auto fill-current" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-9 bg-[#252526] flex items-end border-b border-[#1e1e1e] overflow-x-auto flex-shrink-0">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveTab(file.language)}
                className={`h-9 flex items-center px-3 cursor-pointer border-r border-[#1e1e1e] min-w-fit ${
                  activeTab === file.language
                    ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]'
                    : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]'
                }`}
              >
                {file.icon}
                <span className="ml-2 text-[13px] whitespace-nowrap">{file.name}</span>
                {file.modified && <Circle className="w-2 h-2 ml-2 fill-current text-white" />}
                <button 
                  className="ml-2 p-0.5 hover:bg-[#3c3c3c] rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            <div className="ml-auto flex items-center px-2">
              <Button
                onClick={handleSave}
                disabled={isCodeRunning}
                className="h-7 px-3 bg-[#388a34] hover:bg-[#369432] text-white text-xs flex items-center"
              >
                {isCodeRunning ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 mr-1" />
                )}
                Run
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0 border-r border-[#252526]">
              <div className="h-6 bg-[#1e1e1e] flex items-center px-3 text-xs text-[#969696] border-b border-[#252526] flex-shrink-0">
                <Folder className="w-3 h-3 mr-1" />
                <span>my-project</span>
                <ChevronRight className="w-3 h-3 mx-1" />
                <span className="text-[#cccccc]">
                  {activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'styles.css' : 'script.js'}
                </span>
              </div>
              
              <div className="flex-1 flex overflow-hidden" ref={editorContainerRef}>
                <div 
                  ref={lineNumbersRef}
                  className="bg-[#1e1e1e] text-[#858585] text-right pr-4 pl-4 pt-2 select-none overflow-hidden flex-shrink-0"
                  style={{ fontFamily: "'Consolas', 'Courier New', monospace", fontSize: '14px', lineHeight: '21px' }}
                >
                  {getLineNumbers(getCurrentCode()).map((num) => (
                    <div key={num} className="h-[21px]">{num}</div>
                  ))}
                </div>
                
                <textarea
                  value={getCurrentCode()}
                  onChange={(e) => handleCodeChange(activeTab, e.target.value)}
                  onScroll={handleEditorScroll}
                  className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-2 resize-none outline-none border-none overflow-auto"
                  spellCheck={false}
                  style={{ 
                    fontFamily: "'Consolas', 'Courier New', monospace", 
                    fontSize: '14px', 
                    lineHeight: '21px',
                    tabSize: 2 
                  }}
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0">
              <div className="h-9 bg-[#252526] flex items-center justify-between px-3 border-b border-[#1e1e1e] flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-[#858585]" />
                  <span className="text-[13px] text-[#cccccc]">Preview</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setViewportMode('mobile')}
                    className={`p-1.5 rounded ${viewportMode === 'mobile' ? 'bg-[#094771] text-white' : 'text-[#858585] hover:text-white hover:bg-[#3c3c3c]'}`}
                    title="Mobile"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewportMode('tablet')}
                    className={`p-1.5 rounded ${viewportMode === 'tablet' ? 'bg-[#094771] text-white' : 'text-[#858585] hover:text-white hover:bg-[#3c3c3c]'}`}
                    title="Tablet"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewportMode('desktop')}
                    className={`p-1.5 rounded ${viewportMode === 'desktop' ? 'bg-[#094771] text-white' : 'text-[#858585] hover:text-white hover:bg-[#3c3c3c]'}`}
                    title="Desktop"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-[#3c3c3c] mx-1" />
                  <button
                    onClick={() => {
                      setConsoleLogs([]);
                      handleRunCode(html, css, js);
                    }}
                    className="p-1.5 rounded text-[#858585] hover:text-white hover:bg-[#3c3c3c]"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCodeRunning ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowTerminal(!showTerminal)}
                    className={`p-1.5 rounded ${showTerminal ? 'bg-[#094771] text-white' : 'text-[#858585] hover:text-white hover:bg-[#3c3c3c]'}`}
                    title="Toggle Console"
                  >
                    <Terminal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white flex items-center justify-center overflow-hidden relative">
                <div 
                  className={`h-full bg-white shadow-lg overflow-hidden transition-all duration-300 ${
                    viewportMode === 'mobile' ? 'w-[375px]' : 
                    viewportMode === 'tablet' ? 'w-[768px]' : 'w-full'
                  }`}
                  style={{ maxHeight: '100%' }}
                >
                  {codePreviewHtml ? (
                    <iframe
                      srcDoc={codePreviewHtml}
                      className="w-full h-full border-0"
                      title="Preview"
                      sandbox="allow-scripts allow-modals"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-[#858585]">
                      <div className="text-center">
                        <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Click Run to see your preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {showTerminal && (
                <div className="h-40 bg-[#1e1e1e] border-t border-[#252526] flex flex-col flex-shrink-0">
                  <div className="h-8 bg-[#252526] flex items-center justify-between px-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-white border-b-2 border-[#007acc] pb-1">CONSOLE</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setConsoleLogs([])}
                        className="text-[#858585] hover:text-white"
                        title="Clear Console"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setShowTerminal(false)}
                        className="text-[#858585] hover:text-white"
                        title="Close"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div 
                    className="flex-1 overflow-auto p-2 text-xs"
                    style={{ fontFamily: "'Consolas', 'Courier New', monospace" }}
                  >
                    {consoleLogs.length === 0 ? (
                      <div className="text-[#858585] italic">Console output will appear here...</div>
                    ) : (
                      consoleLogs.map((log, index) => (
                        <div key={index} className="flex items-start space-x-2 py-0.5">
                          <span className="text-[#858585] w-16 flex-shrink-0">{log.timestamp}</span>
                          <span className={`${
                            log.level === 'error' ? 'text-[#f14c4c]' : 
                            log.level === 'warn' ? 'text-[#cca700]' : 
                            'text-[#3794ff]'
                          }`}>
                            {log.level === 'error' ? '[error]' : log.level === 'warn' ? '[warn]' : '[log]'}
                          </span>
                          <span className="text-[#cccccc] flex-1">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-white text-xs flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <GitBranch className="w-3 h-3 mr-1" />
            main
          </span>
          <span className="flex items-center">
            {(htmlModified || cssModified || jsModified) ? (
              <Circle className="w-2 h-2 mr-1 fill-current" />
            ) : (
              <Check className="w-3 h-3 mr-1" />
            )}
            {(htmlModified || cssModified || jsModified) ? 'Modified' : 'Saved'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            {activeTab === 'html' ? 'HTML' : activeTab === 'css' ? 'CSS' : 'JavaScript'}
          </span>
          <span>UTF-8</span>
          <span>Ln {getCurrentCode().split('\n').length}, Col 1</span>
        </div>
      </div>
    </div>
  );
}
