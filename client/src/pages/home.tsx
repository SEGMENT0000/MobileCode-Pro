import { Link } from "wouter";
import { ArrowRight, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

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

    setTimeout(() => {
      window.location.href = '/editor';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(0,0,0,1))]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-75"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                CodeStudio
              </span>
            </div>
            <Link href="/editor">
              <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-6 shadow-2xl">
                Launch Editor
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 min-h-[90vh] flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Professional Development Environment</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
            <span className="block bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
              Build
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              The Future
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            A next-generation code editor in your browser.
            <span className="text-white font-semibold"> No setup, no limits.</span>
            <br />Start building incredible web experiences right now.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Link href="/editor">
              <Button size="lg" className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white border-0 px-10 py-7 text-lg font-bold shadow-2xl shadow-purple-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
                <span className="relative flex items-center">
                  Start Creating
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
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
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-7 text-lg font-bold backdrop-blur-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Files
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Instant Preview",
                desc: "See your changes in real-time. No refresh, no delay.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Smart Editor",
                desc: "VS Code engine with IntelliSense and autocomplete.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "Zero Setup",
                desc: "Start coding immediately. Works on any device.",
                gradient: "from-pink-500 to-rose-500"
              }
            ].map((feature, i) => (
              <div key={i} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300 rounded-2xl`}></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
