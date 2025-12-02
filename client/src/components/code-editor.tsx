
import { useState, useEffect, useRef } from "react";
import { Play, Code, Sparkles, Zap, FileCode, Palette, Braces, Settings, RotateCcw, Maximize2, Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  onRunCode: (html: string, css: string, js: string) => void;
  isRunning?: boolean;
}

export default function CodeEditor({ onRunCode, isRunning = false }: CodeEditorProps) {
  const [html, setHtml] = useState(localStorage.getItem('webpreview_html') || `
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>3D Button</title>
    <!--Google Fonts-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div class="center">
      <button type="button">
        <div class="top">Click Me!</div>
        <div class="bottom"></div>
      </button>
    </div>
  </body>
</html>`);

  const [css, setCss] = useState(localStorage.getItem('webpreview_css') || `
body {
        width: 100%;
        height: 100vh;
        margin: 0;
        padding: 0;
        background: rgb(83, 143, 55);
      }
      .center {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      button {
        width: 140px;
        height: 50px;
        position: relative;
        background: none;
        outline: none;
        border: none;
        padding: 0;
        margin: 0;
      }
      .top {
        width: 100%;
        height: 100%;
        background: rgb(255, 255, 238);
        font-family: poppins;
        font-size: 16px;
        color: rgb(36, 38, 34);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 7mm;
        outline: 2px solid rgb(36, 38, 34);
        transition: 0.2s;
        position: relative;
        overflow: hidden;
      }
      .bottom {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgb(229, 229, 199);
        top: 10px;
        left: 0;
        border-radius: 7mm;
        outline: 2px solid rgb(36, 38, 34);
        z-index: -1;
      }
      .bottom::before {
        position: absolute;
        content: "";
        width: 2px;
        height: 9px;
        background: rgb(36, 38, 34);
        bottom: 0;
        left: 15%;
      }
      .bottom::after {
        position: absolute;
        content: "";
        width: 2px;
        height: 9px;
        background: rgb(36, 38, 34);
        bottom: 0;
        left: 85%;
      }
      button:active .top {
        transform: translateY(10px);
      }
      button::before {
        position: absolute;
        content: "";
        width: calc(100% + 2px);
        height: 100%;
        background: rgb(140, 140, 140);
        top: 14px;
        left: -1px;
        border-radius: 7mm;
        outline: 2px solid rgb(36, 38, 34);
        z-index: -1;
      }
      .top::before {
        position: absolute;
        content: "";
        width: 15px;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        transform: skewX(30deg);
        left: -20px;
        transition: 0.25s;
      }
      button:active .top::before {
        left: calc(100% + 20px);
      }`);

  const [js, setJs] = useState(localStorage.getItem('webpreview_js') || `function showMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = '🎉 Welcome to WebPreview Pro! Your code is running perfectly.';
    messageDiv.style.display = 'block';
    
    // Add some animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.5s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 100);
}

console.log('🚀 JavaScript loaded successfully! Welcome to WebPreview Pro');`);

  const [consoleLogs, setConsoleLogs] = useState<Array<{type: string, message: string, timestamp: string}>>([]);
  const [showConsole, setShowConsole] = useState(false);

  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const cssRef = useRef<HTMLTextAreaElement>(null);
  const jsRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textareas based on content
  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, 300) + 'px';
  };

  // Format HTML code
  const formatHTML = (code: string) => {
    const formatted = code
      .replace(/></g, '>\n<')
      .replace(/^\s*\n/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .split('\n')
      .map((line, index, array) => {
        let indent = 0;
        for (let i = 0; i < index; i++) {
          const prevLine = array[i];
          if (prevLine.includes('<') && !prevLine.includes('</') && !prevLine.includes('/>')) {
            indent++;
          }
          if (prevLine.includes('</')) {
            indent--;
          }
        }
        if (line.includes('</')) {
          indent--;
        }
        return '  '.repeat(Math.max(0, indent)) + line.trim();
      })
      .join('\n');
    return formatted;
  };

  // Format CSS code
  const formatCSS = (code: string) => {
    return code
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/;/g, ';\n  ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/  \n/g, '\n')
      .trim();
  };

  // Format JavaScript code
  const formatJS = (code: string) => {
    return code
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/;/g, ';\n  ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/  \n/g, '\n')
      .trim();
  };

  const handleFormatCode = (type: 'html' | 'css' | 'js') => {
    switch (type) {
      case 'html':
        setHtml(formatHTML(html));
        break;
      case 'css':
        setCss(formatCSS(css));
        break;
      case 'js':
        setJs(formatJS(js));
        break;
    }
  };

  // Save to localStorage whenever content changes
  useEffect(() => {
    localStorage.setItem('webpreview_html', html);
    if (htmlRef.current) autoResize(htmlRef.current);
  }, [html]);

  useEffect(() => {
    localStorage.setItem('webpreview_css', css);
    if (cssRef.current) autoResize(cssRef.current);
  }, [css]);

  useEffect(() => {
    localStorage.setItem('webpreview_js', js);
    if (jsRef.current) autoResize(jsRef.current);
  }, [js]);

  const handleRunCode = () => {
    // Clear previous console logs
    setConsoleLogs([]);
    onRunCode(html, css, js);
  };

  const clearConsole = () => {
    setConsoleLogs([]);
  };

  // Listen for console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console-log') {
        const timestamp = new Date().toLocaleTimeString();
        
        // Prevent duplicate console logs by checking if this message already exists
        setConsoleLogs(prev => {
          const newLog = {
            type: event.data.level || 'log',
            message: event.data.message,
            timestamp
          };
          
          // Check if this exact message already exists to prevent duplicates
          const exists = prev.some(log => 
            log.type === newLog.type && 
            log.message === newLog.message &&
            log.timestamp === newLog.timestamp
          );
          
          if (!exists) {
            return [...prev, newLog];
          }
          return prev;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-run code when content changes (debounced) - only after initial load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (html.trim() || css.trim() || js.trim()) {
        // Clear console logs before auto-running to prevent accumulation
        setConsoleLogs([]);
        onRunCode(html, css, js);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [html, css, js]);

  return (
    <div className="h-full flex flex-col premium-code-editor premium-glass-container">
      {/* Premium Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10 bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-xl">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="relative p-2 lg:p-3 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-xl shadow-lg backdrop-blur-sm border border-white/10">
            <FileCode className="w-5 h-5 lg:w-6 lg:h-6 text-white drop-shadow-lg" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl blur-md"></div>
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-black text-white tracking-tight premium-gradient-text">
              Code Studio
            </h3>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            className="premium-run-button"
            data-testid="run-code-button"
          >
            {isRunning ? (
              <>
                <div className="premium-spinner mr-2 lg:mr-3" />
                <span className="font-bold text-sm lg:text-base">Executing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="font-bold text-sm lg:text-base">Run Code</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Premium Code Tabs */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900/20 via-gray-800/20 to-gray-900/20 backdrop-blur-md">
        <Tabs defaultValue="html" className="flex-1 flex flex-col">
          <TabsList className="premium-tab-header">
            <TabsTrigger 
              value="html" 
              className="premium-tab group"
            >
              <FileCode className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 text-orange-400" />
              <span className="relative z-10 text-xs lg:text-sm">HTML</span>
            </TabsTrigger>
            <TabsTrigger 
              value="css" 
              className="premium-tab group"
            >
              <Palette className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 text-blue-400" />
              <span className="relative z-10 text-xs lg:text-sm">CSS</span>
            </TabsTrigger>
            <TabsTrigger 
              value="js" 
              className="premium-tab group"
            >
              <Braces className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 text-yellow-400" />
              <span className="relative z-10 text-xs lg:text-sm">JavaScript</span>
            </TabsTrigger>
            <TabsTrigger 
              value="console" 
              className="premium-tab group"
            >
              <Terminal className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 text-green-400" />
              <span className="relative z-10 text-xs lg:text-sm">Console</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="html" className="flex-1 m-0 p-0 flex flex-col">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-900/20 to-gray-800/20 border-b border-white/5">
              <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-400">
                <FileCode className="w-3 h-3 lg:w-4 lg:h-4 text-orange-400" />
                <span className="font-medium">HTML Structure</span>
              </div>
              <Button
                onClick={() => handleFormatCode('html')}
                variant="ghost"
                size="sm"
                className="premium-format-btn"
              >
                <Settings className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="text-xs lg:text-sm">Format</span>
              </Button>
            </div>
            <textarea
              ref={htmlRef}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="premium-textarea html-editor"
              placeholder="<!-- Start building something amazing with HTML... -->"
              spellCheck={false}
              style={{ minHeight: '400px' }}
            />
          </TabsContent>

          <TabsContent value="css" className="flex-1 m-0 p-0 flex flex-col">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-900/20 to-gray-800/20 border-b border-white/5">
              <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-400">
                <Palette className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
                <span className="font-medium">CSS Styling</span>
              </div>
              <Button
                onClick={() => handleFormatCode('css')}
                variant="ghost"
                size="sm"
                className="premium-format-btn"
              >
                <Settings className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="text-xs lg:text-sm">Format</span>
              </Button>
            </div>
            <textarea
              ref={cssRef}
              value={css}
              onChange={(e) => setCss(e.target.value)}
              className="premium-textarea css-editor"
              placeholder="/* Create stunning styles with CSS... */"
              spellCheck={false}
              style={{ minHeight: '400px' }}
            />
          </TabsContent>

          <TabsContent value="js" className="flex-1 m-0 p-0 flex flex-col">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-900/20 to-gray-800/20 border-b border-white/5">
              <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-400">
                <Braces className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400" />
                <span className="font-medium">JavaScript Logic</span>
              </div>
              <Button
                onClick={() => handleFormatCode('js')}
                variant="ghost"
                size="sm"
                className="premium-format-btn"
              >
                <Settings className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="text-xs lg:text-sm">Format</span>
              </Button>
            </div>
            <textarea
              ref={jsRef}
              value={js}
              onChange={(e) => setJs(e.target.value)}
              className="premium-textarea js-editor"
              placeholder="// Add powerful functionality with JavaScript..."
              spellCheck={false}
              style={{ minHeight: '400px' }}
            />
          </TabsContent>

          <TabsContent value="console" className="flex-1 m-0 p-0 flex flex-col">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-gray-900/20 to-gray-800/20 border-b border-white/5">
              <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-400">
                <Terminal className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
                <span className="font-medium">JavaScript Console</span>
              </div>
              <Button
                onClick={clearConsole}
                variant="ghost"
                size="sm"
                className="premium-format-btn"
              >
                <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="text-xs lg:text-sm">Clear</span>
              </Button>
            </div>
            <div className="flex-1 p-3 lg:p-4 bg-gradient-to-br from-gray-900/95 to-gray-800/95 overflow-auto min-h-[300px] lg:min-h-[400px]">
              <div className="font-mono text-xs lg:text-sm text-gray-300 space-y-1">
                {consoleLogs.length === 0 ? (
                  <div className="text-gray-500 italic opacity-70 text-xs lg:text-sm">
                    Console output will appear here when you run JavaScript code...
                  </div>
                ) : (
                  consoleLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-2 lg:space-x-3 py-1 border-b border-gray-700/30">
                      <span className="text-xs text-gray-500 min-w-[50px] lg:min-w-[60px]">{log.timestamp}</span>
                      <span className={`text-xs font-bold ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'warn' ? 'text-yellow-400' : 
                        'text-blue-400'
                      }`}>
                        {log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : '📝'}
                      </span>
                      <span className="text-gray-200 flex-1 break-words text-xs lg:text-sm">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
