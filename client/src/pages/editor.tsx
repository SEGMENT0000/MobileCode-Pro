import { useState, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
  ArrowLeft, Files, Search, GitBranch, Settings, Play, ChevronRight, ChevronDown,
  FileCode, Folder, FolderOpen, X, Monitor, Smartphone, Tablet, RefreshCw,
  Terminal, AlertTriangle, Check, Circle, Plus, Eye, EyeOff, ZoomIn, ZoomOut,
  WrapText, Save, Download, Upload, Copy, Maximize2, Minimize2, SplitSquareVertical,
  SplitSquareHorizontal, Pin, RotateCcw, Menu, Code2, FileText, FilePlus, Bug,
  Package, Moon, Sun, Palette, Type, Command, Cpu, Database, Globe, Mail
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CodeRunner } from "@/lib/code-runner";
import { useIsMobile } from "@/hooks/use-mobile";

interface FileTab {
  id: string;
  name: string;
  language: 'html' | 'css' | 'javascript';
  content: string;
  modified: boolean;
  isPinned: boolean;
}

type ActivePanel = 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'settings' | null;
type Theme = 'dark' | 'light' | 'high-contrast';

export default function EditorPage() {
  const monacoInstance = useMonaco();
  const [files, setFiles] = useState<FileTab[]>([
    {
      id: 'html-1',
      name: 'index.html',
      language: 'html',
      content: localStorage.getItem('html') || '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Amazing Web App</title>\n</head>\n<body>\n  <div class="container">\n    <h1>Welcome to the Future</h1>\n    <p>Start building something incredible!</p>\n    <button onclick="handleClick()">Click Me</button>\n  </div>\n</body>\n</html>',
      modified: false,
      isPinned: false
    },
    {
      id: 'css-1',
      name: 'styles.css',
      language: 'css',
      content: localStorage.getItem('css') || '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.container {\n  background: white;\n  padding: 3rem;\n  border-radius: 1.5rem;\n  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);\n  text-align: center;\n  animation: fadeIn 0.5s ease;\n}\n\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to { opacity: 1; transform: translateY(0); }\n}',
      modified: false,
      isPinned: false
    },
    {
      id: 'js-1',
      name: 'script.js',
      language: 'javascript',
      content: localStorage.getItem('js') || 'function handleClick() {\n  console.log("Button clicked!");\n  alert("Hello from JavaScript!");\n}\n\nconsole.log("App initialized successfully");',
      modified: false,
      isPinned: false
    }
  ]);

  const [openTabs, setOpenTabs] = useState<string[]>(['html-1']);
  const [activeFileId, setActiveFileId] = useState('html-1');
  const [codePreviewHtml, setCodePreviewHtml] = useState<string | null>(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [viewportMode, setViewportMode] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [consoleLogs, setConsoleLogs] = useState<Array<{ level: string; message: string; timestamp: string }>>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>('explorer');
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [splitView, setSplitView] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [showMinimap, setShowMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off');
  const [fontSize, setFontSize] = useState(14);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [quickOpenSearch, setQuickOpenSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ fileId: string, line: number, text: string }>>([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'html' | 'css' | 'javascript'>('html');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [activeTerminalTab, setActiveTerminalTab] = useState<'console' | 'terminal' | 'problems' | 'output'>('terminal');
  const [gitBranch, setGitBranch] = useState('main');
  const [gitChanges, setGitChanges] = useState<number>(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMobile = useIsMobile();
  const editorRefs = useRef<Map<string, any>>(new Map());

  const getActiveFile = () => files.find(f => f.id === activeFileId) || files[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowQuickOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNewFileDialog(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSplitView(!splitView);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setActivePanel('search');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setActivePanel(activePanel === 'explorer' ? null : 'explorer');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setShowTerminal(!showTerminal);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [splitView, files, activePanel, showTerminal]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const html = files.find(f => f.language === 'html')?.content || '';
      const css = files.find(f => f.language === 'css')?.content || '';
      const js = files.find(f => f.language === 'javascript')?.content || '';
      handleRunCode(html, css, js);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [files]);

  useEffect(() => {
    files.forEach(f => {
      localStorage.setItem(f.language, f.content);
    });
    setGitChanges(files.filter(f => f.modified).length);
  }, [files]);

  useEffect(() => {
    if (monacoInstance) {
      monacoInstance.editor.setTheme(theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'hc-black');
    }
  }, [theme, monacoInstance]);

  const handleRunCode = (htmlCode: string, cssCode: string, jsCode: string) => {
    setIsCodeRunning(true);
    try {
      const preview = CodeRunner.generatePreview(htmlCode, cssCode, jsCode);
      setCodePreviewHtml(preview);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setTimeout(() => setIsCodeRunning(false), 200);
    }
  };

  const handleEditorMount = (editor: any, fileId: string) => {
    editorRefs.current.set(fileId, editor);
    editor.updateOptions({
      fontSize,
      minimap: { enabled: showMinimap },
      lineNumbers: 'on',
      renderWhitespace: showWhitespace ? 'all' : 'none',
      wordWrap,
      rulers: [80, 120],
      bracketPairColorization: { enabled: true },
      guides: { indentation: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      folding: true,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true }
    });
  };

  const handleFileChange = (fileId: string, value: string | undefined) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, content: value || '', modified: true } : f
    ));
  };

  const handleSave = () => {
    setFiles(prev => prev.map(f => ({ ...f, modified: false })));
  };

  const handleFormat = () => {
    const editor = editorRefs.current.get(activeFileId);
    if (editor) editor.getAction('editor.action.formatDocument')?.run();
  };

  const handleNewFile = () => {
    if (!newFileName) return;
    const ext = newFileType === 'html' ? '.html' : newFileType === 'css' ? '.css' : '.js';
    const newFile: FileTab = {
      id: `${newFileType}-${Date.now()}`,
      name: newFileName + ext,
      language: newFileType,
      content: '',
      modified: false,
      isPinned: false
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setShowNewFileDialog(false);
    setNewFileName('');
  };

  const handleCloseTab = (fileId: string) => {
    setOpenTabs(prev => prev.filter(id => id !== fileId));
    if (activeFileId === fileId) {
      const index = openTabs.indexOf(fileId);
      const nextTab = openTabs[index + 1] || openTabs[index - 1];
      if (nextTab) setActiveFileId(nextTab);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setOpenTabs(prev => prev.filter(id => id !== fileId));
    if (activeFileId === fileId) {
      const remainingFile = files.find(f => f.id !== fileId);
      if (remainingFile) {
        setActiveFileId(remainingFile.id);
      } else {
        setActiveFileId('');
      }
    }
  };

  const handleOpenFile = (fileId: string) => {
    if (!openTabs.includes(fileId)) {
      setOpenTabs(prev => [...prev, fileId]);
    }
    setActiveFileId(fileId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(uploadedFile => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileName = uploadedFile.name;
        let language: 'html' | 'css' | 'javascript' = 'html';

        if (fileName.endsWith('.html') || fileName.endsWith('.htm')) language = 'html';
        else if (fileName.endsWith('.css')) language = 'css';
        else if (fileName.endsWith('.js')) language = 'javascript';
        else return; // Skip unsupported files

        const newFile: FileTab = {
          id: `${language}-${Date.now()}-${Math.random()}`,
          name: fileName,
          language,
          content,
          modified: false,
          isPinned: false
        };

        setFiles(prev => [...prev, newFile]);
        setOpenTabs(prev => [...prev, newFile.id]);
        setActiveFileId(newFile.id);
      };
      reader.readAsText(uploadedFile);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowUploadDialog(false);
  };

  const handlePinFile = (fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, isPinned: !f.isPinned } : f
    ));
  };

  const handleDownload = () => {
    const file = getActiveFile();
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = () => {
    const results: Array<{ fileId: string, line: number, text: string }> = [];
    files.forEach(file => {
      const lines = file.content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ fileId: file.id, line: index + 1, text: line.trim() });
        }
      });
    });
    setSearchResults(results);
  };

  const handleReplace = () => {
    files.forEach(file => {
      const newContent = file.content.replaceAll(searchQuery, replaceQuery);
      if (newContent !== file.content) {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, content: newContent, modified: true } : f
        ));
      }
    });
    handleSearch();
  };

  const handleTerminalCommand = () => {
    if (!terminalInput.trim()) return;

    const command = terminalInput.trim();
    setTerminalHistory(prev => [...prev, `$ ${command}`]);

    // Simulate command execution
    if (command === 'clear') {
      setTerminalHistory([]);
    } else if (command === 'help') {
      setTerminalHistory(prev => [...prev, 'Available commands: clear, help, ls, pwd, date']);
    } else if (command === 'ls') {
      setTerminalHistory(prev => [...prev, files.map(f => f.name).join('  ')]);
    } else if (command === 'pwd') {
      setTerminalHistory(prev => [...prev, '/workspace/my-project']);
    } else if (command === 'date') {
      setTerminalHistory(prev => [...prev, new Date().toString()]);
    } else {
      setTerminalHistory(prev => [...prev, `Command not found: ${command}`]);
    }

    setTerminalInput('');
  };

  const commands = [
    { id: 'new', label: 'New File', action: () => setShowNewFileDialog(true) },
    { id: 'save', label: 'Save', action: handleSave },
    { id: 'format', label: 'Format Document', action: handleFormat },
    { id: 'download', label: 'Download File', action: handleDownload },
    { id: 'split', label: 'Toggle Split View', action: () => setSplitView(!splitView) },
    { id: 'minimap', label: 'Toggle Minimap', action: () => setShowMinimap(!showMinimap) },
    { id: 'wrap', label: 'Toggle Word Wrap', action: () => setWordWrap(w => w === 'on' ? 'off' : 'on') },
    { id: 'whitespace', label: 'Toggle Whitespace', action: () => setShowWhitespace(!showWhitespace) },
    { id: 'zoom-in', label: 'Zoom In', action: () => setFontSize(s => Math.min(s + 2, 32)) },
    { id: 'zoom-out', label: 'Zoom Out', action: () => setFontSize(s => Math.max(s - 2, 8)) },
    { id: 'terminal', label: 'Toggle Terminal', action: () => setShowTerminal(!showTerminal) },
    { id: 'sidebar', label: 'Toggle Sidebar', action: () => setActivePanel(activePanel ? null : 'explorer') },
    { id: 'preview', label: 'Toggle Preview', action: () => setShowPreview(!showPreview) },
    { id: 'theme-dark', label: 'Theme: Dark', action: () => setTheme('dark') },
    { id: 'theme-light', label: 'Theme: Light', action: () => setTheme('light') },
    { id: 'theme-hc', label: 'Theme: High Contrast', action: () => setTheme('high-contrast') },
  ];

  const filteredCommands = commands.filter(c =>
    c.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const getBgColor = () => theme === 'light' ? '#f3f3f3' : theme === 'dark' ? '#1e1e1e' : '#000000';
  const getTextColor = () => theme === 'light' ? '#000000' : '#cccccc';
  const getSidebarBg = () => theme === 'light' ? '#e8e8e8' : theme === 'dark' ? '#252526' : '#000000';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: getBgColor(), color: getTextColor() }}>
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg w-full max-w-2xl">
            <input
              type="text"
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              placeholder="Type a command..."
              className="w-full px-4 py-3 bg-[#3c3c3c] text-white outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setShowCommandPalette(false); setCommandSearch(''); }
                if (e.key === 'Enter' && filteredCommands[0]) {
                  filteredCommands[0].action();
                  setShowCommandPalette(false);
                  setCommandSearch('');
                }
              }}
            />
            <div className="max-h-96 overflow-auto">
              {filteredCommands.map(cmd => (
                <div
                  key={cmd.id}
                  onClick={() => { cmd.action(); setShowCommandPalette(false); setCommandSearch(''); }}
                  className="px-4 py-2 hover:bg-[#094771] cursor-pointer text-sm text-white"
                >
                  {cmd.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showQuickOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg w-full max-w-2xl">
            <input
              type="text"
              value={quickOpenSearch}
              onChange={(e) => setQuickOpenSearch(e.target.value)}
              placeholder="Go to File..."
              className="w-full px-4 py-3 bg-[#3c3c3c] text-white outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setShowQuickOpen(false); setQuickOpenSearch(''); }
              }}
            />
            <div className="max-h-96 overflow-auto">
              {files.filter(f => f.name.toLowerCase().includes(quickOpenSearch.toLowerCase())).map(file => (
                <div
                  key={file.id}
                  onClick={() => { setActiveFileId(file.id); setShowQuickOpen(false); setQuickOpenSearch(''); }}
                  className="px-4 py-2 hover:bg-[#094771] cursor-pointer text-sm flex items-center text-white"
                >
                  <FileCode className="w-4 h-4 mr-2" />
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg mb-4">Upload Files</h3>
            <p className="text-[#cccccc] text-sm mb-4">Upload HTML, CSS, or JavaScript files</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,.css,.js"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded font-semibold"
              >
                Choose Files
              </button>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="File name..."
              className="w-full px-4 py-2 bg-[#3c3c3c] text-white outline-none rounded mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNewFile()}
            />
            <div className="flex gap-2 mb-4">
              <button onClick={() => setNewFileType('html')} className={`px-4 py-2 rounded ${newFileType === 'html' ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-white'}`}>HTML</button>
              <button onClick={() => setNewFileType('css')} className={`px-4 py-2 rounded ${newFileType === 'css' ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-white'}`}>CSS</button>
              <button onClick={() => setNewFileType('javascript')} className={`px-4 py-2 rounded ${newFileType === 'javascript' ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-white'}`}>JavaScript</button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleNewFile} className="px-4 py-2 bg-[#0e639c] rounded flex-1 text-white">Create</button>
              <button onClick={() => { setShowNewFileDialog(false); setNewFileName(''); }} className="px-4 py-2 bg-[#3c3c3c] rounded text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="h-9 bg-[#323233] flex items-center justify-between px-4 border-b border-[#252526]">
        <div className="flex items-center space-x-4">
          <Link href="/"><button className="text-[#cccccc] hover:text-white flex items-center space-x-1.5 text-xs transition-colors"><ArrowLeft className="w-3.5 h-3.5" /><span>Back</span></button></Link>
          <div className="h-4 w-px bg-[#454545]"></div>
          <span className="text-[#cccccc] text-xs font-medium">Visual Studio Code</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => setShowNewFileDialog(true)} className="text-xs px-3 py-1.5 hover:bg-[#3c3c3c] rounded flex items-center text-[#cccccc] transition-colors"><FilePlus className="w-3.5 h-3.5 mr-1.5" />New</button>
          <button onClick={() => setShowUploadDialog(true)} className="text-xs px-3 py-1.5 hover:bg-[#3c3c3c] rounded flex items-center text-[#cccccc] transition-colors"><Upload className="w-3.5 h-3.5 mr-1.5" />Upload</button>
          <button onClick={handleSave} className="text-xs px-3 py-1.5 hover:bg-[#3c3c3c] rounded flex items-center text-[#cccccc] transition-colors"><Save className="w-3.5 h-3.5 mr-1.5" />Save</button>
          <button onClick={handleFormat} className="text-xs px-3 py-1.5 hover:bg-[#3c3c3c] rounded flex items-center text-[#cccccc] transition-colors"><Code2 className="w-3.5 h-3.5 mr-1.5" />Format</button>
          <button onClick={handleDownload} className="text-xs px-3 py-1.5 hover:bg-[#3c3c3c] rounded flex items-center text-[#cccccc] transition-colors"><Download className="w-3.5 h-3.5 mr-1.5" />Download</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-[#252526]">
          <button onClick={() => setActivePanel(activePanel === 'explorer' ? null : 'explorer')} className={`p-3 mb-1 rounded ${activePanel === 'explorer' ? 'text-white bg-[#252526] border-l-2 border-white' : 'text-[#858585] hover:text-white'}`} title="Explorer"><Files className="w-5 h-5" /></button>
          <button onClick={() => setActivePanel(activePanel === 'search' ? null : 'search')} className={`p-3 mb-1 rounded ${activePanel === 'search' ? 'text-white bg-[#252526] border-l-2 border-white' : 'text-[#858585] hover:text-white'}`} title="Search"><Search className="w-5 h-5" /></button>
          <button onClick={() => setActivePanel(activePanel === 'git' ? null : 'git')} className={`p-3 mb-1 rounded relative ${activePanel === 'git' ? 'text-white bg-[#252526] border-l-2 border-white' : 'text-[#858585] hover:text-white'}`} title="Source Control">
            <GitBranch className="w-5 h-5" />
            {gitChanges > 0 && <span className="absolute top-1 right-1 bg-[#0e639c] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{gitChanges}</span>}
          </button>
          <button onClick={() => setActivePanel(activePanel === 'debug' ? null : 'debug')} className={`p-3 mb-1 rounded ${activePanel === 'debug' ? 'text-white bg-[#252526] border-l-2 border-white' : 'text-[#858585] hover:text-white'}`} title="Debug"><Bug className="w-5 h-5" /></button>
          <button onClick={() => setActivePanel(activePanel === 'extensions' ? null : 'extensions')} className={`p-3 mb-1 rounded ${activePanel === 'extensions' ? 'text-white bg-[#252526] border-l-2 border-white' : 'text-[#858585] hover:text-white'}`} title="Extensions"><Package className="w-5 h-5" /></button>
          <div className="flex-1" />
          <button onClick={() => setShowTerminal(!showTerminal)} className={`p-3 mb-1 rounded ${showTerminal ? 'text-white bg-[#252526] border-l-2 border-white' : 'text-[#858585] hover:text-white'}`} title="Toggle Terminal"><Terminal className="w-5 h-5" /></button>
          <button onClick={() => setShowCommandPalette(true)} className="p-3 mb-1 text-[#858585] hover:text-white rounded" title="Command Palette"><Menu className="w-5 h-5" /></button>
          <button onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')} className={`p-3 rounded ${activePanel === 'settings' ? 'text-white bg-[#252526] border-l-2 border-white' : 'text-[#858585] hover:text-white'}`} title="Settings"><Settings className="w-5 h-5" /></button>
        </div>

        {activePanel && (
          <div className="w-80 flex flex-col border-r border-[#1e1e1e]" style={{ background: getSidebarBg() }}>
            {activePanel === 'explorer' && (
              <>
                <div className="px-4 py-2.5 text-[11px] font-semibold text-[#cccccc] uppercase flex items-center justify-between">
                  <span>Explorer</span>
                  <button onClick={() => setShowNewFileDialog(true)} className="text-[#cccccc] hover:text-white p-1 rounded" title="New File">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="px-2">
                    <div onClick={() => setExplorerOpen(!explorerOpen)} className="flex items-center py-1 hover:bg-[#2a2d2e] cursor-pointer text-[13px] rounded">
                      {explorerOpen ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                      <span className="font-semibold text-[#cccccc] uppercase text-[11px]">Workspace</span>
                    </div>
                    {explorerOpen && (
                      <div className="ml-2 mt-1">
                        {files.map(file => {
                          const FileIcon = () => {
                            if (file.language === 'html') return (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#e34c26">
                                <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
                              </svg>
                            );
                            if (file.language === 'css') return (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#264de4">
                                <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm4.09 4.5l.398 4.5h8.02l-.27 3-.896.28-2.81.8-.814-.23-.067-.78H6.19l.13 1.5 4.29 1.21h.001l4.28-1.21.58-6.5H5.59l-.13-1.5h9.98l.13-1.5H5.59z" />
                              </svg>
                            );
                            if (file.language === 'javascript') return (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#f7df1e">
                                <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
                              </svg>
                            );
                            return <FileCode className="w-4 h-4 text-[#cccccc]" />;
                          };
                          return (
                            <div
                              key={file.id}
                              onClick={() => handleOpenFile(file.id)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (window.confirm(`Delete ${file.name}?`)) {
                                  handleDeleteFile(file.id);
                                }
                              }}
                              className={`group flex items-center px-2 py-1 cursor-pointer text-[13px] hover:bg-[#2a2d2e] rounded ${openTabs.includes(file.id) ? 'font-semibold' : ''}`}
                            >
                              <FileIcon />
                              <span className="ml-2 flex-1 text-[#cccccc]">{file.name}</span>
                              {file.modified && <Circle className="w-1.5 h-1.5 ml-2 fill-current text-[#4ec9b0]" />}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete ${file.name}?`)) {
                                    handleDeleteFile(file.id);
                                  }
                                }}
                                className="ml-2 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] rounded transition-opacity"
                                title="Delete"
                              >
                                <X className="w-3 h-3 text-[#858585] hover:text-[#f14c4c]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activePanel === 'search' && (
              <>
                <div className="px-4 py-2 text-[11px] font-semibold text-[#bbbbbb] uppercase">Search</div>
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in files..."
                    className="w-full px-3 py-2 bg-[#3c3c3c] text-white outline-none rounded text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <input
                    type="text"
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    placeholder="Replace with..."
                    className="w-full px-3 py-2 bg-[#3c3c3c] text-white outline-none rounded text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSearch} className="px-3 py-1 bg-[#0e639c] text-white rounded text-sm flex-1">Search</button>
                    <button onClick={handleReplace} className="px-3 py-1 bg-[#3c3c3c] text-white rounded text-sm">Replace All</button>
                  </div>
                  <div className="text-xs text-[#858585] mt-2">{searchResults.length} results</div>
                  <div className="space-y-1 max-h-96 overflow-auto">
                    {searchResults.map((result, idx) => {
                      const file = files.find(f => f.id === result.fileId);
                      return (
                        <div key={idx} onClick={() => setActiveFileId(result.fileId)} className="p-2 bg-[#2a2d2e] rounded cursor-pointer hover:bg-[#094771] text-xs">
                          <div className="text-[#858585]">{file?.name} : Line {result.line}</div>
                          <div className="text-white truncate">{result.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activePanel === 'git' && (
              <>
                <div className="px-4 py-2 text-[11px] font-semibold text-[#bbbbbb] uppercase">Source Control</div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center text-sm">
                    <GitBranch className="w-4 h-4 mr-2" />
                    <span>{gitBranch}</span>
                  </div>
                  <div className="text-xs text-[#858585]">{gitChanges} changed files</div>
                  <div className="space-y-1">
                    {files.filter(f => f.modified).map(file => (
                      <div key={file.id} className="p-2 bg-[#2a2d2e] rounded text-sm flex items-center justify-between">
                        <div className="flex items-center">
                          <FileCode className="w-4 h-4 mr-2 text-[#e37933]" />
                          <span>{file.name}</span>
                        </div>
                        <span className="text-[#858585] text-xs">M</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full px-3 py-2 bg-[#0e639c] text-white rounded text-sm">Commit Changes</button>
                </div>
              </>
            )}

            {activePanel === 'debug' && (
              <>
                <div className="px-4 py-2 text-[11px] font-semibold text-[#bbbbbb] uppercase">Run & Debug</div>
                <div className="p-4 space-y-3">
                  <button className="w-full px-3 py-2 bg-[#388a34] text-white rounded text-sm flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Run Without Debugging
                  </button>
                  <button className="w-full px-3 py-2 bg-[#0e639c] text-white rounded text-sm flex items-center justify-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Start Debugging
                  </button>
                  <div className="text-xs text-[#858585] mt-4">No launch configuration</div>
                </div>
              </>
            )}

            {activePanel === 'extensions' && (
              <>
                <div className="px-4 py-2 text-[11px] font-semibold text-[#bbbbbb] uppercase">Extensions</div>
                <div className="p-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Search extensions..."
                    className="w-full px-3 py-2 bg-[#3c3c3c] text-white outline-none rounded text-sm"
                  />
                  <div className="space-y-2 mt-3">
                    {['Prettier', 'ESLint', 'Live Server', 'GitLens'].map((ext, idx) => (
                      <div key={idx} className="p-3 bg-[#2a2d2e] rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{ext}</span>
                          <button className="px-2 py-1 bg-[#0e639c] text-white rounded text-xs">Install</button>
                        </div>
                        <div className="text-xs text-[#858585]">Popular extension for {ext.toLowerCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activePanel === 'settings' && (
              <>
                <div className="px-4 py-3 text-[11px] font-semibold text-[#cccccc] uppercase border-b border-[#1e1e1e]">Settings</div>
                <div className="p-4 space-y-6 overflow-auto">
                  <div>
                    <label className="text-sm block mb-3 text-[#cccccc] font-medium">Editor Theme</label>
                    <div className="flex gap-2">
                      <button onClick={() => setTheme('dark')} className={`flex-1 px-3 py-2.5 rounded text-sm flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-[#0e639c] text-white shadow-md' : 'bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4c4c4c]'}`}>
                        <Moon className="w-4 h-4 mr-1.5" />Dark
                      </button>
                      <button onClick={() => setTheme('light')} className={`flex-1 px-3 py-2.5 rounded text-sm flex items-center justify-center transition-all ${theme === 'light' ? 'bg-[#0e639c] text-white shadow-md' : 'bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4c4c4c]'}`}>
                        <Sun className="w-4 h-4 mr-1.5" />Light
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-[#3c3c3c] pt-4">
                    <label className="text-sm block mb-3 text-[#cccccc] font-medium">Font Size: <span className="text-[#0e639c]">{fontSize}px</span></label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setFontSize(s => Math.max(s - 2, 8))} className="px-3 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded transition-colors"><ZoomOut className="w-4 h-4" /></button>
                      <input type="range" min="8" max="32" step="2" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1" />
                      <button onClick={() => setFontSize(s => Math.min(s + 2, 32))} className="px-3 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded transition-colors"><ZoomIn className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="border-t border-[#3c3c3c] pt-4 space-y-3">
                    <label className="text-sm block mb-3 text-[#cccccc] font-medium">Editor Options</label>
                    <label className="flex items-center justify-between text-sm text-[#cccccc] hover:bg-[#2a2d2e] p-2 rounded cursor-pointer">
                      <span>Show Minimap</span>
                      <input type="checkbox" checked={showMinimap} onChange={(e) => setShowMinimap(e.target.checked)} className="w-4 h-4" />
                    </label>
                    <label className="flex items-center justify-between text-sm text-[#cccccc] hover:bg-[#2a2d2e] p-2 rounded cursor-pointer">
                      <span>Word Wrap</span>
                      <input type="checkbox" checked={wordWrap === 'on'} onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')} className="w-4 h-4" />
                    </label>
                    <label className="flex items-center justify-between text-sm text-[#cccccc] hover:bg-[#2a2d2e] p-2 rounded cursor-pointer">
                      <span>Show Whitespace</span>
                      <input type="checkbox" checked={showWhitespace} onChange={(e) => setShowWhitespace(e.target.checked)} className="w-4 h-4" />
                    </label>
                    <label className="flex items-center justify-between text-sm text-[#cccccc] hover:bg-[#2a2d2e] p-2 rounded cursor-pointer">
                      <span>Auto Save</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </label>
                  </div>
                  <div className="border-t border-[#3c3c3c] pt-4">
                    <button onClick={() => { if (window.confirm('Reset all settings to default?')) { setTheme('dark'); setFontSize(14); setShowMinimap(true); setWordWrap('off'); setShowWhitespace(false); } }} className="w-full px-4 py-2.5 bg-[#3c3c3c] hover:bg-[#f14c4c] text-white rounded transition-colors">
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-9 bg-[#252526] flex items-center justify-between border-b border-[#1e1e1e]">
            <div className="flex items-center overflow-x-auto">
              {openTabs.map(fileId => {
                const file = files.find(f => f.id === fileId);
                if (!file) return null;
                const FileIcon = () => {
                  if (file.language === 'html') return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#e34c26">
                      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
                    </svg>
                  );
                  if (file.language === 'css') return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#264de4">
                      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm4.09 4.5l.398 4.5h8.02l-.27 3-.896.28-2.81.8-.814-.23-.067-.78H6.19l.13 1.5 4.29 1.21h.001l4.28-1.21.58-6.5H5.59l-.13-1.5h9.98l.13-1.5H5.59z" />
                    </svg>
                  );
                  if (file.language === 'javascript') return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#f7df1e">
                      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
                    </svg>
                  );
                  return <FileCode className="w-4 h-4" />;
                };
                return (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`h-9 flex items-center px-3 cursor-pointer border-r border-[#1e1e1e] ${activeFileId === file.id
                      ? 'bg-[#1e1e1e] text-white'
                      : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]'
                      }`}
                  >
                    <FileIcon />
                    <span className="text-[13px] ml-2">{file.name}</span>
                    {file.modified && <Circle className="w-1.5 h-1.5 ml-2 fill-current text-white" />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(file.id);
                      }}
                      className="ml-2 p-0.5 hover:bg-[#3c3c3c] rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center px-2 space-x-1">
              <button
                onClick={() => setSplitView(!splitView)}
                className={`p-1.5 rounded ${splitView ? 'bg-[#0e639c]' : 'hover:bg-[#3c3c3c]'}`}
                title="Split Editor"
              >
                <SplitSquareVertical className="w-4 h-4 text-[#cccccc]" />
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-1.5 rounded ${showPreview ? 'bg-[#0e639c]' : 'hover:bg-[#3c3c3c]'}`}
                title="Toggle Preview"
              >
                {showPreview ? <Eye className="w-4 h-4 text-[#cccccc]" /> : <EyeOff className="w-4 h-4 text-[#cccccc]" />}
              </button>
              <Button onClick={handleSave} className="h-7 px-3 bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs">
                <Play className="w-3 h-3 mr-1" />Run
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* CODE EDITOR - Always show unless preview is fullscreen */}
            <div className={`${!showPreview || splitView ? (splitView ? 'w-1/2' : 'w-full') : 'hidden'} flex flex-col border-r border-[#252526]`}>
              <div className="h-6 flex items-center px-3 text-xs text-[#969696] border-b" style={{ background: getSidebarBg() }}>
                <Folder className="w-3 h-3 mr-1" />
                <span>my-project</span>
                <ChevronRight className="w-3 h-3 mx-1" />
                <span style={{ color: getTextColor() }}>{getActiveFile().name}</span>
              </div>
              <div className="flex-1">
                {files.length === 0 ? (
                  <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
                    <div className="text-center max-w-2xl px-8">
                      <div className="mb-8">
                        <Code2 className="w-24 h-24 mx-auto text-[#007acc] mb-6" />
                        <h1 className="text-4xl font-bold text-white mb-4">Welcome to VS Code Editor</h1>
                        <p className="text-[#858585] text-lg mb-8">Start by creating a new file or uploading your project files</p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setShowNewFileDialog(true)}
                          className="px-6 py-3 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded-lg font-semibold flex items-center transition-colors"
                        >
                          <FilePlus className="w-5 h-5 mr-2" />
                          Create New File
                        </button>
                        <button
                          onClick={() => setShowUploadDialog(true)}
                          className="px-6 py-3 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white rounded-lg font-semibold flex items-center transition-colors"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Files
                        </button>
                      </div>
                      <div className="mt-12 grid grid-cols-3 gap-6 text-left">
                        <div className="p-4 bg-[#252526] rounded-lg border border-[#3c3c3c]">
                          <Files className="w-6 h-6 text-[#007acc] mb-2" />
                          <h3 className="text-white font-semibold mb-1">File Explorer</h3>
                          <p className="text-[#858585] text-sm">Manage your project files</p>
                        </div>
                        <div className="p-4 bg-[#252526] rounded-lg border border-[#3c3c3c]">
                          <Terminal className="w-6 h-6 text-[#007acc] mb-2" />
                          <h3 className="text-white font-semibold mb-1">Integrated Terminal</h3>
                          <p className="text-[#858585] text-sm">Run commands directly</p>
                        </div>
                        <div className="p-4 bg-[#252526] rounded-lg border border-[#3c3c3c]">
                          <Eye className="w-6 h-6 text-[#007acc] mb-2" />
                          <h3 className="text-white font-semibold mb-1">Live Preview</h3>
                          <p className="text-[#858585] text-sm">See changes instantly</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  files.map(file => (
                    <div key={file.id} className={activeFileId === file.id ? 'h-full' : 'hidden'}>
                      <Editor
                        height="100%"
                        language={file.language}
                        value={file.content}
                        onChange={(value) => handleFileChange(file.id, value)}
                        theme={theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'hc-black'}
                        onMount={(editor) => handleEditorMount(editor, file.id)}
                        options={{ automaticLayout: true }}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* TERMINAL PANEL - Bottom of editor */}
              {showTerminal && (
                <div className="h-48 bg-[#1e1e1e] border-t border-[#252526] flex flex-col">
                  <div className="h-8 bg-[#252526] flex items-center justify-between px-3">
                    <div className="flex items-center space-x-3 text-xs">
                      <button onClick={() => setActiveTerminalTab('terminal')} className={`pb-1 ${activeTerminalTab === 'terminal' ? 'text-white border-b-2 border-[#007acc]' : 'text-[#858585] hover:text-white'}`}>TERMINAL</button>
                      <button onClick={() => setActiveTerminalTab('problems')} className={`pb-1 ${activeTerminalTab === 'problems' ? 'text-white border-b-2 border-[#007acc]' : 'text-[#858585] hover:text-white'}`}>PROBLEMS</button>
                      <button onClick={() => setActiveTerminalTab('output')} className={`pb-1 ${activeTerminalTab === 'output' ? 'text-white border-b-2 border-[#007acc]' : 'text-[#858585] hover:text-white'}`}>OUTPUT</button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setTerminalHistory([])} className="text-[#858585] hover:text-white" title="Clear"><RotateCcw className="w-3 h-3" /></button>
                      <button onClick={() => setShowTerminal(false)} className="text-[#858585] hover:text-white"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-2 text-xs font-mono">
                    {activeTerminalTab === 'terminal' && (
                      <div>
                        {terminalHistory.map((line, idx) => (
                          <div key={idx} className="text-[#cccccc] mb-1">{line}</div>
                        ))}
                        <div className="flex items-center mt-2">
                          <span className="text-[#4ec9b0] mr-2">$</span>
                          <input
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTerminalCommand()}
                            className="flex-1 bg-transparent text-white outline-none"
                            placeholder="Type command (help, ls, pwd, clear, date)..."
                          />
                        </div>
                      </div>
                    )}
                    {activeTerminalTab === 'problems' && (
                      <div className="text-[#858585] italic">No problems detected in workspace</div>
                    )}
                    {activeTerminalTab === 'output' && (
                      <div className="text-[#858585] italic">Build output will appear here...</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* LIVE PREVIEW */}
            {showPreview && (
              <div className={`${splitView ? 'w-1/2' : 'w-full'} flex flex-col`} style={{ background: getBgColor() }}>
                <div className="h-9 bg-[#252526] flex items-center justify-between px-3 border-b border-[#1e1e1e]">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-[#858585]" />
                    <span className="text-[13px] text-white">Live Preview</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => setViewportMode('mobile')} className={`p-1.5 rounded ${viewportMode === 'mobile' ? 'bg-[#094771] text-white' : 'text-[#858585]'}`} title="Mobile"><Smartphone className="w-4 h-4" /></button>
                    <button onClick={() => setViewportMode('tablet')} className={`p-1.5 rounded ${viewportMode === 'tablet' ? 'bg-[#094771] text-white' : 'text-[#858585]'}`} title="Tablet"><Tablet className="w-4 h-4" /></button>
                    <button onClick={() => setViewportMode('desktop')} className={`p-1.5 rounded ${viewportMode === 'desktop' ? 'bg-[#094771] text-white' : 'text-[#858585]'}`} title="Desktop"><Monitor className="w-4 h-4" /></button>
                    <button onClick={() => setConsoleLogs([])} className="p-1.5 rounded text-[#858585] hover:text-white" title="Clear Console"><RotateCcw className="w-4 h-4" /></button>
                    <button onClick={() => { const html = files.find(f => f.language === 'html')?.content || ''; const css = files.find(f => f.language === 'css')?.content || ''; const js = files.find(f => f.language === 'javascript')?.content || ''; handleRunCode(html, css, js); }} className="p-1.5 rounded text-[#858585] hover:text-white" title="Refresh"><RefreshCw className={`w-4 h-4 ${isCodeRunning ? 'animate-spin' : ''}`} /></button>
                  </div>
                </div>
                <div className="flex-1 bg-white flex items-center justify-center overflow-hidden">
                  <div className={`h-full bg-white overflow-auto transition-all ${viewportMode === 'mobile' ? 'w-[375px]' : viewportMode === 'tablet' ? 'w-[768px]' : 'w-full'}`}>
                    {codePreviewHtml ? (
                      <iframe srcDoc={codePreviewHtml} className="w-full h-full border-0" sandbox="allow-scripts allow-modals" title="Preview" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-semibold mb-2">Preview Ready</p>
                          <p className="text-sm">Your code will appear here automatically</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PREVIEW CONSOLE - Shows iframe console.log output */}
                <div className="h-40 bg-[#1e1e1e] border-t border-[#252526] flex flex-col">
                  <div className="h-8 bg-[#252526] flex items-center justify-between px-3">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-[#858585]" />
                      <span className="text-xs text-white">Preview Console</span>
                      <span className="text-[10px] text-[#858585]">(iframe output)</span>
                    </div>
                    <button onClick={() => setConsoleLogs([])} className="text-[#858585] hover:text-white" title="Clear Console"><RotateCcw className="w-3 h-3" /></button>
                  </div>
                  <div className="flex-1 overflow-auto p-2 text-xs font-mono">
                    {consoleLogs.length === 0 ? (
                      <div className="text-[#858585] italic">Console output from your preview will appear here...</div>
                    ) : (
                      consoleLogs.map((log, idx) => (
                        <div key={idx} className="flex space-x-2 py-0.5">
                          <span className="text-[#858585] w-16">{log.timestamp}</span>
                          <span className={log.level === 'error' ? 'text-[#f14c4c]' : log.level === 'warn' ? 'text-[#cca700]' : 'text-[#3794ff]'}>[{log.level}]</span>
                          <span className="text-[#cccccc]">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-white text-xs">
        <div className="flex items-center space-x-4">
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : t === 'light' ? 'high-contrast' : 'dark')} className="hover:underline flex items-center">
            {theme === 'dark' ? <Moon className="w-3 h-3 mr-1" /> : theme === 'light' ? <Sun className="w-3 h-3 mr-1" /> : <Palette className="w-3 h-3 mr-1" />}
            {theme}
          </button>
          <button onClick={() => setShowMinimap(!showMinimap)} className="hover:underline">Minimap: {showMinimap ? 'On' : 'Off'}</button>
          <button onClick={() => setWordWrap(w => w === 'on' ? 'off' : 'on')} className="hover:underline">Wrap: {wordWrap}</button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><GitBranch className="w-3 h-3 mr-1" />{gitBranch}</span>
          <span>{getActiveFile().language.toUpperCase()}</span>
          <span>UTF-8</span>
          <span>{files.some(f => f.modified) ? `${gitChanges} Modified` : 'All Saved'}</span>
        </div>
      </div>
    </div>
  );
}
