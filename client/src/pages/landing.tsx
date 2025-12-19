import { Link } from "wouter";
import { ArrowRight, Sparkles, Zap, Shield, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function LandingPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // Store files in session storage for the editor to pick up
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const fileName = file.name;

                if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
                    sessionStorage.setItem('uploaded_html', content);
                    sessionStorage.setItem('uploaded_html_name', fileName);
                } else if (fileName.endsWith('.css')) {
                    sessionStorage.setItem('uploaded_css', content);
                    sessionStorage.setItem('uploaded_css_name', fileName);
                } else if (fileName.endsWith('.js')) {
                    sessionStorage.setItem('uploaded_js', content);
                    sessionStorage.setItem('uploaded_js_name', fileName);
                }
            };
            reader.readAsText(file);
        });

        // Navigate to editor after upload
        setTimeout(() => {
            window.location.href = '/editor';
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-950/50 border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg"></div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            MobileCode Pro
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <Link href="/editor">
                            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-6 shadow-lg shadow-emerald-500/20">
                                Open Editor
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Content */}
                <div className="relative max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Professional Web Development Environment</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Code Anywhere,
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient bg-300%">
                            Build Everywhere
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto">
                        A powerful, browser-based code editor with real-time preview.
                        Built for developers who demand <span className="text-emerald-400 font-semibold">professional tools</span> on any device.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link href="/editor">
                            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg shadow-2xl shadow-emerald-500/30 group">
                                Start Coding Now
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                        <Button
                            size="lg"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-8 py-6 text-lg"
                        >
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Import Project
                            </span>
                        </Button>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mt-20">
                        <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
                                <p className="text-slate-400">
                                    Powered by Monaco Editor - the same technology used in VS Code. Get instant syntax highlighting and IntelliSense.
                                </p>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Live Preview</h3>
                                <p className="text-slate-400">
                                    See your changes instantly with our real-time preview. No refresh needed. Build and iterate faster than ever.
                                </p>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Shield className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">100% Secure</h3>
                                <p className="text-slate-400">
                                    All your code stays in your browser. No servers, no uploads, no tracking. Your projects, your privacy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative border-t border-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-slate-500">
                    <p>&copy; 2024 MobileCode Pro. Built with passion.</p>
                    <div className="flex items-center space-x-6">
                        <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Docs</a>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-300\\% {
          background-size: 300% 300%;
        }
      `}</style>
        </div>
    );
}
