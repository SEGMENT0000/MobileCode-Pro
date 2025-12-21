import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Upload } from "lucide-react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const rotateX = useTransform(scrollY, [0, 500], [20, 0]);
  const scale = useTransform(scrollY, [0, 500], [0.9, 1]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileName = file.name;
        if (fileName.endsWith('.html') || fileName.endsWith('.htm')) sessionStorage.setItem('uploaded_html', content);
        else if (fileName.endsWith('.css')) sessionStorage.setItem('uploaded_css', content);
        else if (fileName.endsWith('.js')) sessionStorage.setItem('uploaded_js', content);
      };
      reader.readAsText(file);
    });
    setTimeout(() => window.location.href = '/editor', 500);
  };

  return (
    <div ref={containerRef} className="min-h-[150vh] bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />

      {/* Navbar: STRICTLY MINIMAL */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
        <div className="font-bold text-lg tracking-tight">MobileCode Pro</div>
      </nav>

      <main className="relative z-10 pt-40 px-6 pb-20 max-w-7xl mx-auto text-center perspective-[2000px]">

        {/* Hero Text */}
        <motion.div style={{ opacity }} className="relative z-20 mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Code without limits.
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            The lightweight, high-performance editor that runs entirely in your browser.
            No setup. No bloat. Just code.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/editor">
              <Button className="h-12 px-8 rounded-full bg-white text-black hover:bg-neutral-200 transition-all font-medium text-base">
                Start Coding <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>

            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,.css,.js"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-12 px-8 rounded-full border border-white/10 hover:bg-white/5 transition-all font-medium text-base flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Open File
            </button>
          </div>
        </motion.div>

        {/* The Interface: 3D Tilting Preview */}
        <motion.div
          style={{ rotateX, scale }}
          className="relative mx-auto rounded-xl bg-[#050505] border border-white/10 shadow-2xl overflow-hidden aspect-[16/10] max-w-5xl group"
        >
          {/* Header */}
          <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
            </div>
            <div className="text-xs text-neutral-500 font-mono">index.html</div>
            <div className="w-16" />
          </div>

          {/* Editor Content */}
          <div className="flex h-full text-left font-mono text-sm p-8 text-neutral-400">
            <div className="w-12 text-neutral-700 select-none flex flex-col gap-1">
              {Array.from({ length: 20 }).map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <div className="flex-1 select-none opacity-80 flex flex-col gap-1">
              <div><span className="text-blue-400">&lt;!DOCTYPE</span> html&gt;</div>
              <div><span className="text-blue-400">&lt;html</span> <span className="text-purple-400">lang</span>=<span className="text-green-400">"en"</span>&gt;</div>
              <div>  <span className="text-blue-400">&lt;head&gt;</span></div>
              <div>    <span className="text-blue-400">&lt;meta</span> <span className="text-purple-400">charset</span>=<span className="text-green-400">"UTF-8"</span> /&gt;</div>
              <div>    <span className="text-blue-400">&lt;title&gt;</span>MobileCode Pro<span className="text-blue-400">&lt;/title&gt;</span></div>
              <div>    <span className="text-gray-500">&lt;!-- The editor loads instantly --&gt;</span></div>
              <div>  <span className="text-blue-400">&lt;head&gt;</span></div>
              <div>  <span className="text-blue-400">&lt;body&gt;</span></div>
              <div>    <span className="text-blue-400">&lt;div</span> <span className="text-purple-400">id</span>=<span className="text-green-400">"root"</span>&gt;</div>
              <div>      <span className="text-white">To define the future, you must build it.</span></div>
              <div>    <span className="text-blue-400">&lt;/div&gt;</span></div>
              <div className="animate-pulse">    <span className="w-2 h-4 bg-white inline-block align-middle" /></div>
              <div>  <span className="text-blue-400">&lt;/body&gt;</span></div>
              <div><span className="text-blue-400">&lt;/html&gt;</span></div>
            </div>
          </div>

          {/* Overlay Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

        </motion.div>
      </main>
    </div>
  );
}
