import React from 'react';
// Removed next/image to fix preview environment error
import { Github, Linkedin, Mail, MapPin, ExternalLink, Download, Database, Layout, Server, Cpu, Camera, Eye, MousePointer2, Brain, MessageSquare, Sparkles } from 'lucide-react';

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
      
      {/* --- NAV / HERO SECTION --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tight text-slate-900">Nomad<span className="text-blue-600">.Dev</span></div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition">About</a>
            <a href="#projects" className="hover:text-blue-600 transition">Projects</a>
            <a href="#skills" className="hover:text-blue-600 transition">Stack</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          </nav>
          <a href="/resume.pdf" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
            <Download size={16} />
            <span>Download CV</span>
          </a>
        </div>
      </header>

      <main>
        {/* --- HERO --- */}
        <section id="about" className="pt-20 pb-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Open to Work in Germany
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Building Scalable <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Microservices</span> & AI Solutions.
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              I am a Full-Stack Developer based in Japan, specializing in <strong>Next.js</strong>, <strong>Ruby on Rails</strong>, and <strong>Applied AI</strong>. 
              I combine academic rigor with practical engineering to build systems that solve real-world logistics, interaction, and cognitive problems.
            </p>
            <div className="flex justify-center gap-4">
              <a href="#contact" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                Contact Me
              </a>
              <a href="https://github.com/nomad1nk" target="_blank" rel="noreferrer" className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition flex items-center gap-2">
                <Github size={20} />
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* --- FEATURED PROJECTS --- */}
        <section id="projects" className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-6 space-y-24">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-8">Featured Projects</h2>

            {/* PROJECT 1: EcoRoute */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900">EcoRoute Optimizer</h3>
                <div className="prose text-slate-600">
                  <p>
                    A sustainable logistics platform that reduces carbon emissions by optimizing delivery routes using real-world physics and traffic data.
                  </p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-start gap-3">
                      <span className="bg-green-100 p-1 rounded text-green-600 mt-1"><CheckIcon /></span>
                      <span><strong>Microservice Architecture:</strong> Decoupled services for Logic (Python), Management (Rails), and UI (Next.js).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-100 p-1 rounded text-green-600 mt-1"><CheckIcon /></span>
                      <span><strong>Real-World Routing:</strong> Integrated OSRM to fetch precise road geometry and traffic-adjusted travel times.</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  <TechBadge icon={Layout} label="Next.js 14" />
                  <TechBadge icon={Server} label="Ruby on Rails" />
                  <TechBadge icon={Cpu} label="Python Flask" />
                  <TechBadge icon={MapPin} label="Leaflet / OSRM" />
                </div>
              </div>
              {/* Updated EcoRoute Image Section */}
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 shadow-xl rotate-1 hover:rotate-0 transition duration-500">
                <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative border border-slate-200">
                   {/* Using a reliable Unsplash placeholder for the demo */}
                   <img 
                     src="/ecoroute.png" 
                     alt="EcoRoute Dashboard Interface" 
                     className="object-cover w-full h-full opacity-90 hover:opacity-100 transition duration-500 hover:scale-105"
                   />
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                     <p className="text-white font-medium text-sm">Live Map Dashboard View</p>
                   </div>
                </div>
              </div>
            </div>

            {/* PROJECT 2: Virtual Mouse */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-slate-100 rounded-2xl p-4 border border-slate-200 shadow-xl -rotate-1 hover:rotate-0 transition duration-500">
                <div className="aspect-video bg-indigo-50 rounded-lg flex items-center justify-center border-2 border-dashed border-indigo-200 overflow-hidden">
                   <img 
                     src="virtualmouse.png" 
                     alt="AI Hand Gesture Recognition" 
                     className="object-cover w-full h-full opacity-90 hover:opacity-100 transition duration-500 hover:scale-105"
                   />
                </div>
              </div>

              <div className="order-1 md:order-2 space-y-6">
                <h3 className="text-3xl font-bold text-slate-900">AI Virtual Mouse & Eye Tracker</h3>
                <div className="prose text-slate-600">
                  <p>
                    A hands-free HCI (Human-Computer Interaction) system enabling touchless control using computer vision to translate gestures into precise cursor actions.
                  </p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-start gap-3">
                      <span className="bg-indigo-100 p-1 rounded text-indigo-600 mt-1"><CheckIcon /></span>
                      <span><strong>Gesture Recognition:</strong> Controls mouse clicks and scrolling via fingertip tracking and eye blinks.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-indigo-100 p-1 rounded text-indigo-600 mt-1"><CheckIcon /></span>
                      <span><strong>Optimized Performance:</strong> Built with OpenCV and MediaPipe for high-FPS real-time processing on standard CPUs.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4">
                  <TechBadge icon={Cpu} label="Python" />
                  <TechBadge icon={Camera} label="OpenCV" />
                  <TechBadge icon={Eye} label="MediaPipe" />
                  <TechBadge icon={MousePointer2} label="PyAutoGUI" />
                </div>

                <div className="pt-4">
                  <a href="https://github.com/Nomad1nk/mouseTrack" target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800">
                    View Code on GitHub <ExternalLink size={16} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* PROJECT 3: MindSync AI (NEW) */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-slate-900">MindSync AI</h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide rounded-full border border-amber-200">In Development</span>
                </div>
                <div className="prose text-slate-600">
                  <p>
                    An empathetic AI companion designed for deep psychological context retention. It utilizes Vector Memory to maintain "perfect sync" with the user's long-term history and emotional state.
                  </p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-start gap-3">
                      <span className="bg-amber-100 p-1 rounded text-amber-600 mt-1"><CheckIcon /></span>
                      <span><strong>RAG Architecture:</strong> Retrieval-Augmented Generation using vector embeddings to recall past conversations accurately.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-amber-100 p-1 rounded text-amber-600 mt-1"><CheckIcon /></span>
                      <span><strong>Emotional Alignment:</strong> System prompts tuned for psychological support modalities (CBT/DBT principles).</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                  <TechBadge icon={Brain} label="LLM / OpenAI" />
                  <TechBadge icon={MessageSquare} label="LangChain" />
                  <TechBadge icon={Database} label="Vector DB" />
                  <TechBadge icon={Sparkles} label="Next.js" />
                </div>
              </div>
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 shadow-xl rotate-1 hover:rotate-0 transition duration-500">
                <div className="aspect-video bg-amber-50 rounded-lg flex items-center justify-center border-2 border-dashed border-amber-200 overflow-hidden">
                   <img 
                     src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000" 
                     alt="AI Chat Interface" 
                     className="object-cover w-full h-full opacity-90 hover:opacity-100 transition duration-500 hover:scale-105"
                   />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- TECH STACK --- */}
        <section id="skills" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Technical Competencies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <SkillCard title="Frontend" skills={["React / Next.js", "TypeScript", "Tailwind CSS", "Leaflet.js"]} />
              <SkillCard title="Backend" skills={["Ruby on Rails", "Python (Flask)", "Node.js", "REST APIs"]} />
              <SkillCard title="Databases" skills={["PostgreSQL", "SQLite", "Redis", "Vector Databases"]} />
              <SkillCard title="DevOps" skills={["Docker", "Git / GitHub", "Vercel", "CI/CD Basics"]} />
            </div>
          </div>
        </section>

        {/* --- FOOTER / CONTACT --- */}
        <footer id="contact" className="bg-slate-900 text-slate-300 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold text-white">Ready to make an impact in Germany.</h2>
            <p className="text-lg text-slate-400">
              I am actively interviewing and can relocate immediately upon graduation/visa approval.
            </p>
            <div className="flex justify-center gap-6">
              <a href="mailto:nomad2nk@yahoo.com" className="flex items-center gap-2 hover:text-white transition">
                <Mail size={20} /> Email
              </a>
              <a href="https://linkedin.com/in/nomad1nk-30630139a" className="flex items-center gap-2 hover:text-white transition">
                <Linkedin size={20} /> LinkedIn
              </a>
              <a href="https://github.com/nomad1nk" className="flex items-center gap-2 hover:text-white transition">
                <Github size={20} /> GitHub
              </a>
            </div>
            <div className="border-t border-slate-800 pt-8 mt-12 text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} Nomad. All rights reserved.</p>
              <p className="mt-2">Imprint (Impressum) | Data Privacy (Datenschutz)</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// --- Helper Components ---

function TechBadge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
      <Icon size={14} />
      {label}
    </span>
  );
}

function SkillCard({ title, skills }: { title: string, skills: string[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
      <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">{title}</h3>
      <ul className="space-y-2">
        {skills.map((skill) => (
          <li key={skill} className="text-sm text-slate-600 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
  )
}