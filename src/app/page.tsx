import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, MessageSquare, Zap, Shield, LayoutDashboard } from "lucide-react";
import LiquidEther from "@/components/LiquidEther";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Liquid Ether Background */}
      <div className="absolute top-0 left-0 w-full h-[100vh] z-0 opacity-70">
        <LiquidEther
          colors={[ '#5227FF', '#FF9FFC', '#B497CF' ]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={16}
          iterationsPoisson={8}
          resolution={0.25}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex w-full justify-between max-w-7xl mx-auto">
        <div className="font-semibold text-xl tracking-tight animate-fade-in-up text-white flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          BoardVerse AI
        </div>
        <div className="flex gap-4 items-center animate-fade-in-up">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button className="h-9 rounded-full px-5 text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started
            </Button>
          </Link>
        </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center z-10 max-w-5xl mx-auto min-h-screen px-4 pt-20">
        
        {/* Background glow effects (kept for fallback) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-zinc-900/80 border-white/10 mb-8 animate-fade-in-up backdrop-blur-sm text-zinc-300">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
          Now with Real-Time Voice Chat
        </div>
        
        <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight mb-8 animate-fade-in-up-delay-1 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
          Your Workspace. <br className="hidden sm:block"/>
          Unified.
        </h1>
        
        <p className="text-lg sm:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 animate-fade-in-up-delay-2 font-medium leading-relaxed">
          Collaborate visually in real-time, communicate contextually, and manage ideas from a single, calm application designed for modern teams.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up-delay-2 relative z-20">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-semibold bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-1">
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-semibold border-white/10 hover:bg-white/5 text-white transition-all hover:-translate-y-1">
              View Demo
            </Button>
          </Link>
        </div>
        
        {/* Sleek Glassmorphic Mini-Dashboard */}
        <div className="mt-24 w-full max-w-3xl relative animate-fade-in-up-delay-3 group">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
          
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_80px_rgba(99,102,241,0.2)] relative overflow-hidden text-left">
            
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-inner">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg tracking-tight">Project Alpha</h3>
                  <p className="text-zinc-400 text-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    3 users active now
                  </p>
                </div>
              </div>
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg transform transition hover:-translate-y-1 hover:z-10 cursor-default">J</div>
                <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-lg transform transition hover:-translate-y-1 hover:z-10 cursor-default">S</div>
                <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg transform transition hover:-translate-y-1 hover:z-10 cursor-default">A</div>
                <div className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs font-medium text-white shadow-lg">+4</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-end p-5 hover:bg-white/10 transition-colors group/card">
                 <div className="h-2 w-1/2 bg-white/20 rounded-full mb-3 group-hover/card:w-3/4 transition-all duration-500"></div>
                 <div className="h-2 w-3/4 bg-white/10 rounded-full group-hover/card:w-full transition-all duration-500 delay-100"></div>
              </div>
              <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-end p-5 hover:bg-white/10 transition-colors group/card">
                 <div className="h-2 w-2/3 bg-white/20 rounded-full mb-3 group-hover/card:w-full transition-all duration-500"></div>
                 <div className="h-2 w-1/3 bg-white/10 rounded-full group-hover/card:w-1/2 transition-all duration-500 delay-100"></div>
              </div>
              <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex flex-col items-center justify-center hover:bg-indigo-500/20 transition-colors relative overflow-hidden group/ai cursor-pointer">
                 <Sparkles className="h-8 w-8 text-indigo-400 mb-3 group-hover/ai:scale-110 transition-transform duration-500" />
                 <span className="text-sm font-medium text-indigo-300">Generate Ideas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-32 px-4 max-w-7xl mx-auto w-full relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Everything you need to create</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">BoardVerse AI combines the best of whiteboarding, voice chat, and real-time syncing into one seamless platform.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="col-span-1 md:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl p-8 hover:bg-zinc-900/80 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors" />
            <Users className="h-8 w-8 text-indigo-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Real-time Collaboration</h3>
            <p className="text-zinc-400 max-w-md leading-relaxed">Work together with your team on the same infinite canvas. See cursors move, drawings appear, and ideas form instantly with zero latency.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="col-span-1 bg-zinc-900/50 border border-white/5 rounded-3xl p-8 hover:bg-zinc-900/80 transition-colors relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
            <MessageSquare className="h-8 w-8 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Voice Chat</h3>
            <p className="text-zinc-400 leading-relaxed">Built-in WebRTC voice channels. Just click "Join Voice" and talk over your designs without opening Zoom.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="col-span-1 bg-zinc-900/50 border border-white/5 rounded-3xl p-8 hover:bg-zinc-900/80 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-colors" />
            <Zap className="h-8 w-8 text-amber-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-zinc-400 leading-relaxed">Built on Next.js 15 and Supabase, everything loads instantly and auto-saves silently in the background.</p>
          </div>
          
          {/* Feature 4 */}
          <div className="col-span-1 md:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl p-8 hover:bg-zinc-900/80 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full group-hover:bg-rose-500/20 transition-colors" />
            <LayoutDashboard className="h-8 w-8 text-rose-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Organized Workspaces</h3>
            <p className="text-zinc-400 max-w-md leading-relaxed">Create isolated workspaces for different clients or teams. Generate secure invite links and control access with robust Role-Based security.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-4 max-w-7xl mx-auto w-full relative z-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Loved by engineering teams</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">See what developers and designers are saying about BoardVerse AI.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex text-yellow-500 text-lg">★★★★★</div>
            <p className="text-zinc-300 flex-1 italic">"The voice chat integration right inside the canvas completely changed how our remote team handles system design interviews. No more juggling tabs."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-10 w-10 bg-zinc-800 rounded-full" />
              <div>
                <p className="text-white text-sm font-semibold">Sarah Jenkins</p>
                <p className="text-zinc-500 text-xs">Senior Staff Engineer</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex text-yellow-500 text-lg">★★★★★</div>
            <p className="text-zinc-300 flex-1 italic">"We migrated from Miro specifically for the developer experience. The UI is incredibly snappy, and the dark mode is just perfect."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-10 w-10 bg-zinc-800 rounded-full" />
              <div>
                <p className="text-white text-sm font-semibold">David Chen</p>
                <p className="text-zinc-500 text-xs">Product Designer</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex text-yellow-500 text-lg">★★★★★</div>
            <p className="text-zinc-300 flex-1 italic">"Setting up a workspace and inviting external contractors via a simple link took 5 seconds. It just gets out of your way so you can build."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-10 w-10 bg-zinc-800 rounded-full" />
              <div>
                <p className="text-white text-sm font-semibold">Elena Rodriguez</p>
                <p className="text-zinc-500 text-xs">Startup Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-4 w-full relative z-20 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/10 pointer-events-none" />
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Ready to build better?</h2>
        <p className="text-zinc-400 text-xl max-w-xl mx-auto mb-10">Join thousands of teams already using BoardVerse AI to turn ideas into reality.</p>
        <Link href="/signup">
          <Button size="lg" className="rounded-full px-10 h-14 text-base font-semibold bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:-translate-y-1">
            Create Your First Workspace
          </Button>
        </Link>
      </section>

      {/* Actual Footer */}
      <footer className="border-t border-white/10 bg-black py-12 px-6 w-full relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight">BoardVerse AI</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          <p className="text-sm text-zinc-600">© 2026 BoardVerse Inc. All rights reserved.</p>
        </div>
      </footer>
      
    </main>
  );
}
