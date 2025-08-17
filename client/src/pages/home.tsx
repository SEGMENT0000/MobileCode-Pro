
import { Code2, ExternalLink, Play, Smartphone, Upload, Zap, Shield, Layers, ArrowRight, Sparkles, Star, Monitor } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useProject } from "@/hooks/use-project";

export default function Home() {
  const [, setLocation] = useLocation();
  const { addFiles } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsProcessingUpload(true);
      try {
        await addFiles(files);
        // Navigate to editor after successful upload
        setLocation('/editor');
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsProcessingUpload(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark text-text-primary font-system overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 hero-gradient opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/2 via-transparent to-transparent rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className="relative glassmorphic border-b border-glass-border backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-lg flex items-center justify-center shadow-lg">
                <Code2 className="text-dark text-sm" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                MobileCode Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-text-secondary hover:text-white transition-colors duration-300"
                onClick={() => window.open('https://portfolioxayush.vercel.app', '_blank')}
                data-testid="link-portfolio"
              >
                <span className="text-sm font-medium">Made by AYUSH</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-center pt-16 sm:pt-24 pb-16 sm:pb-20 px-4">
        <div className="relative max-w-6xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 glassmorphic px-6 py-3 rounded-full mb-8 border border-white/30 shadow-2xl hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span className="text-sm font-semibold text-white tracking-wide">CODE WITHOUT LIMITS</span>
            <Star className="w-4 h-4 text-white fill-current animate-pulse delay-500" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 sm:mb-8 leading-[0.9] tracking-tighter">
            Code on your{" "}
            <span className="premium-gradient-text inline-flex items-center gap-3 sm:gap-4 relative">
              <Smartphone className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-bounce" />
              phone
              <div className="absolute -inset-4 bg-white/5 rounded-2xl blur-xl animate-pulse"></div>
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Dont have pc or laptop ? No problem. Start your coding journey from any device - 
            <span className="text-white font-bold"> phone, tablet, or low-end device</span>. 
            Professional Code editor experience with instant live preview.
          </p>

          <div className="glassmorphic rounded-2xl p-6 mb-12 border border-white/20 backdrop-blur-xl max-w-3xl mx-auto">
            <p className="text-white/80 text-base sm:text-lg leading-relaxed">
              <span className="text-white font-bold">Perfect for beginners:</span> No downloads, no setup, no expensive hardware needed. 
              Just open, code, and see results instantly. Build websites, learn HTML/CSS/JS, and start your tech career today.
            </p>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center mb-16">
            <Link href="/editor">
              <Button 
                size="lg"
                className="group w-full sm:w-auto bg-gradient-to-r from-white via-gray-100 to-white text-black font-black py-6 px-12 rounded-2xl premium-button-hover text-xl shadow-2xl border-0 relative overflow-hidden transform hover:scale-105 transition-all duration-300"
                data-testid="button-start-coding"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-white to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center text-black font-black tracking-wide">
                  <Play className="w-6 h-6 mr-4" />
                  Start Coding Now
                  <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            
            <Button 
              variant="outline"
              size="lg"
              className="group w-full sm:w-auto glassmorphic border-2 border-white/40 font-black py-6 px-12 rounded-2xl premium-button-hover text-xl text-white hover:text-white hover:bg-white/20 shadow-2xl backdrop-blur-xl transform hover:scale-105 transition-all duration-300"
              onClick={handleUploadClick}
              disabled={isProcessingUpload}
              data-testid="button-upload-project"
            >
              <span className="flex items-center font-black tracking-wide">
                <Upload className={`w-6 h-6 mr-4 ${isProcessingUpload ? 'animate-bounce' : ''}`} />
                {isProcessingUpload ? 'Processing...' : 'Upload Project'}
                <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".html,.css,.js,.jsx,.ts,.tsx,.json,.md,.txt,.png,.jpg,.jpeg,.gif,.svg,.ico,.woff,.woff2,.ttf,.otf,.zip"
            />
          </div>
          
          {/* Premium Stats Grid - Fixed Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="glassmorphic rounded-2xl p-6 border border-white/20 shadow-2xl backdrop-blur-xl hover:scale-105 transition-all duration-300 group">
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">0ms</div>
              <div className="text-sm font-medium text-white/70 uppercase tracking-widest">Setup Time</div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-white/40 to-white/60 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="glassmorphic rounded-2xl p-6 border border-white/20 shadow-2xl backdrop-blur-xl hover:scale-105 transition-all duration-300 group">
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">&lt;2s</div>
              <div className="text-sm font-medium text-white/70 uppercase tracking-widest">Preview Speed</div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-white/50 to-white/70 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
            <div className="glassmorphic rounded-2xl p-6 border border-white/20 shadow-2xl backdrop-blur-xl hover:scale-105 transition-all duration-300 group">
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-sm font-medium text-white/70 uppercase tracking-widest">Mobile Ready</div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-white/60 to-white/80 rounded-full animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight">
              Built for{" "}
              <span className="premium-gradient-text relative">
                everyone
                <div className="absolute -inset-2 bg-white/5 rounded-2xl blur-xl animate-pulse"></div>
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
              Whether you're on a smartphone, tablet, or budget laptop - code like a pro with zero barriers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="group glassmorphic rounded-3xl p-8 lg:p-10 text-center border border-white/20 shadow-2xl backdrop-blur-xl hover:scale-105 hover:border-white/40 transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 text-white">Lightning Fast</h3>
              <p className="text-white/80 leading-relaxed text-lg font-medium">
                Instant code execution and preview. No lag, no waiting - just pure speed optimized for mobile devices.
              </p>
            </div>

            <div className="group glassmorphic rounded-3xl p-8 lg:p-10 text-center border border-white/20 shadow-2xl backdrop-blur-xl hover:scale-105 hover:border-white/40 transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 text-white">Mobile First</h3>
              <p className="text-white/80 leading-relaxed text-lg font-medium">
                Touch-optimized interface designed specifically for coding on phones and tablets with professional results.
              </p>
            </div>

            <div className="group glassmorphic rounded-3xl p-8 lg:p-10 text-center border border-white/20 shadow-2xl backdrop-blur-xl hover:scale-105 hover:border-white/40 transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-300">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-6 text-white">Live Preview</h3>
              <p className="text-white/80 leading-relaxed text-lg font-medium">
                See your HTML, CSS, and JavaScript come to life instantly with real-time preview and debugging tools.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
