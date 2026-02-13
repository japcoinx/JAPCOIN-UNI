
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { streamAgentMission, generateImage, generateCoursePlan, generateLessonScript, generateQuiz, generateLongVideoChain, chunkScript, runSwarmArchitecture, generateEbookStructure, generateChapterContent, EbookPlan } from '../services/geminiService';
import { User } from '../types';

interface AIAgentLabProps {
    user: User;
    onUsage?: (type: 'APP' | 'WEBSITE' | 'EBOOK') => void;
}

type AgentMode = 'RESEARCH' | 'CREATIVE' | 'CODING' | 'APP_BUILDER' | 'COURSE_STUDIO' | 'SWARM' | 'EBOOK_CREATOR';
type CourseStep = 'INPUT' | 'PLANNING' | 'SCRIPTING' | 'CHUNKING' | 'FILMING' | 'QUIZ' | 'COMPLETE';
type EbookStep = 'CONFIG' | 'OUTLINING' | 'WRITING' | 'DESIGNING' | 'PUBLISHED';

interface Deployment {
    id: string;
    name: string;
    url: string;
    customDomain?: string;
    status: 'deploying' | 'dns-check' | 'live';
    timestamp: number;
    dnsRecords?: { type: string; name: string; value: string; status: 'pending' | 'verified' }[];
}

interface EbookData extends EbookPlan {
    author: string;
    genre: string;
    coverUrl?: string;
    chapterContent: string[];
    link?: string;
}

const AIAgentLab: React.FC<AIAgentLabProps> = ({ user, onUsage }) => {
  const [mode, setMode] = useState<AgentMode>('RESEARCH');
  const [mission, setMission] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedAppCode, setGeneratedAppCode] = useState<string | null>(null);
  const [showAppPreview, setShowAppPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // App Builder Advanced State
  const [previewMode, setPreviewMode] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showDeploymentsList, setShowDeploymentsList] = useState(false);
  const [deployConfig, setDeployConfig] = useState({ name: '', customDomain: '', useDomain: false });
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);
  
  // Course Studio State
  const [courseStep, setCourseStep] = useState<CourseStep>('INPUT');
  const [courseLevel, setCourseLevel] = useState('Beginner');
  const [videoDuration, setVideoDuration] = useState(20); 
  const [courseData, setCourseData] = useState<any>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  // Swarm State
  const [swarmActiveSquads, setSwarmActiveSquads] = useState<string[]>([]);

  // Ebook Creator State
  const [ebookStep, setEbookStep] = useState<EbookStep>('CONFIG');
  const [ebookConfig, setEbookConfig] = useState({ topic: '', genre: 'Business', author: user.name });
  const [ebookData, setEbookData] = useState<EbookData | null>(null);
  const [currentChapterGenIndex, setCurrentChapterGenIndex] = useState(0);

  // Terminal auto-scroll
  const logsEndRef = useRef<HTMLDivElement>(null);
  const resultEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Only scroll result if we are actively adding to it
    if (isRunning && mode !== 'COURSE_STUDIO' && mode !== 'EBOOK_CREATOR') {
        resultEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result, isRunning, mode]);

  const checkApiKey = async () => {
    const win = window as any;
    if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
                await win.aistudio.openSelectKey();
                return true;
            } catch (e) {
                console.error("Key selection failed", e);
                setError("API Key selection failed.");
                return false;
            }
        }
    }
    return true;
  }

  const handleRunMission = async () => {
    if (!mission.trim()) return;

    // Access Control check
    if (mode !== 'RESEARCH') {
        if (user.subscriptionTier === 'STANDARD') {
            setError("Access Denied: This advanced module is restricted to PREMIUM and CERTIFIED students.");
            return;
        }
    }

    // Limit Check for Premium Users
    if (user.subscriptionTier === 'PREMIUM') {
        if (mode === 'APP_BUILDER' && (user.appsCreated || 0) >= 2) {
            setError("Premium Limit Reached: You have created 2/2 Apps. Upgrade to Certified for unlimited app creation.");
            return;
        }
        if (mode === 'CODING' && (user.websitesCreated || 0) >= 2) {
            setError("Premium Limit Reached: You have created 2/2 Websites. Upgrade to Certified for unlimited access.");
            return;
        }
    }

    if (!(await checkApiKey())) return;

    setIsRunning(true);
    setError(null);
    setResult('');
    setGeneratedImageUrl(null);
    setSwarmActiveSquads([]);
    
    // For App Builder, show preview pane instantly
    if (mode === 'APP_BUILDER') {
        setShowAppPreview(true);
        setGeneratedAppCode(""); // Initialize empty
    } else {
        setShowAppPreview(false);
        setGeneratedAppCode(null);
    }
    
    setActiveDeploymentId(null);
    setLogs([`> Initializing JAP-AGI [Module: ${mode}]...`]);

    try {
        if (mode === 'CREATIVE') {
            setLogs(prev => [...prev, "> Connecting to Google Sycamore Quantum Processor..."]);
            setLogs(prev => [...prev, "> Allocating TPU v5p Pods for Image Synthesis..."]);
            setLogs(prev => [...prev, `> Processing Prompt: "${mission}"`]);
            
            const imageUrl = await generateImage(mission);
            
            if (imageUrl) {
                setGeneratedImageUrl(imageUrl);
                setLogs(prev => [...prev, "> Image rendered successfully via Quantum Link."]);
                setResult("Image generation complete. See display panel.");
            } else {
                throw new Error("Failed to generate image.");
            }
        } else if (mode === 'COURSE_STUDIO') {
            await handleRunCourseStudio();
        } else if (mode === 'EBOOK_CREATOR') {
            // Handled separately
        } else if (mode === 'SWARM') {
            setLogs(prev => [...prev, "> [JAP-AI GENERAL] Order Received. Initializing Swarm Protocol..."]);
            setLogs(prev => [...prev, "> [JAP-AI GENERAL] Mobilizing 1000 Specialized Agents..."]);
            
            const finalReport = await runSwarmArchitecture(mission, (log) => {
                setLogs(prev => [...prev, log]);
                // Basic visualization parsing
                if (log.includes("[SQUAD")) {
                    const squadName = log.match(/\[SQUAD (.*?)\]/)?.[1];
                    if (squadName && !swarmActiveSquads.includes(squadName)) {
                        setSwarmActiveSquads(prev => [...prev, squadName]);
                    }
                }
            });
            setResult(finalReport);
            setLogs(prev => [...prev, "> [JAP-AI GENERAL] Mission Accomplished. Swarm Disengaged."]);
            setSwarmActiveSquads([]);

        } else {
            // Track Usage for App/Web Builder
            if (mode === 'APP_BUILDER' && onUsage) onUsage('APP');
            if (mode === 'CODING' && onUsage) onUsage('WEBSITE');

            // Research, Coding, or App Builder Mode (Streaming text)
            let fullBuffer = "";
            setLogs(prev => [...prev, "> Establishing Quantum Uplink to Gemini 1.5 Ultra..."]);
            await streamAgentMission(mission, (chunk) => {
                fullBuffer += chunk;
                
                let splitTag = '[RESULT]';
                if (mode === 'CODING') splitTag = '[CODE]';
                if (mode === 'APP_BUILDER') splitTag = '[APP_CODE]';

                if (mode === 'APP_BUILDER') {
                    const appCodeMatch = fullBuffer.match(/\[APP_CODE\]([\s\S]*?)(\[\/APP_CODE\]|$)/);
                    if (appCodeMatch && appCodeMatch[1]) {
                        setGeneratedAppCode(appCodeMatch[1]);
                    }
                }
                
                const resultSplit = fullBuffer.split(splitTag);
                if (resultSplit.length > 1) {
                    const logPart = resultSplit[0];
                    let resultPart = resultSplit.slice(1).join(splitTag);
                    if (mode === 'APP_BUILDER') {
                        resultPart = resultPart.replace('[/APP_CODE]', '');
                    }
                    const lines = logPart.split('\n').filter(l => l.trim().length > 0);
                    setLogs(lines);
                    setResult(resultPart.trim());
                } else {
                    const lines = fullBuffer.split('\n').filter(l => l.trim().length > 0);
                    setLogs(lines);
                }
            }, mode as any);
            setLogs(prev => [...prev, "> Mission Protocol Complete."]);
        }
    } catch (err) {
        console.error(err);
        setError("Agent connection interrupted or failed. Please verify API Key.");
        setLogs(prev => [...prev, "> CRITICAL ERROR: PROCESS FAILED"]);
    } finally {
        setIsRunning(false);
    }
  };

  const handleStartDeploy = () => {
      // Pre-fill name from mission
      const suggestedName = mission.split(' ').slice(0,2).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
      setDeployConfig({ name: suggestedName, customDomain: '', useDomain: false });
      setShowDeployModal(true);
  };

  const executeDeployment = () => {
      const id = Date.now().toString();
      const isCustom = deployConfig.useDomain && deployConfig.customDomain;
      const finalName = deployConfig.name || 'untitled-app';
      const url = isCustom 
          ? `https://${deployConfig.customDomain}`
          : `https://${finalName}.jap-app.net`;
      
      const newDeployment: Deployment = {
          id,
          name: finalName,
          url,
          customDomain: isCustom ? deployConfig.customDomain : undefined,
          status: 'deploying',
          timestamp: Date.now(),
          dnsRecords: isCustom ? [
              { type: 'A', name: '@', value: '76.76.21.21', status: 'pending' },
              { type: 'CNAME', name: 'www', value: 'ingress.jap-net.io', status: 'pending' }
          ] : undefined
      };

      setDeployments(prev => [newDeployment, ...prev]);
      setActiveDeploymentId(id);
      setShowDeployModal(false);
      
      // Simulate Deployment Process
      setTimeout(() => {
          setDeployments(prev => prev.map(d => {
              if (d.id === id) {
                  return { ...d, status: d.customDomain ? 'dns-check' : 'live' };
              }
              return d;
          }));
      }, 3000);
  };

  const verifyDns = (id: string) => {
      // Simulate verification delay
      const tempId = setTimeout(() => {
          setDeployments(prev => prev.map(d => {
              if (d.id === id) {
                  return { 
                      ...d, 
                      status: 'live',
                      dnsRecords: d.dnsRecords?.map(r => ({...r, status: 'verified'}))
                  };
              }
              return d;
          }));
          alert("DNS Records Verified! Your custom domain is now live.");
      }, 2000);
  };

  const getActiveDeployment = () => deployments.find(d => d.id === activeDeploymentId);

  const handleRunCourseStudio = async () => {
      setCourseStep('PLANNING');
      setLogs(["> Initializing JAP-AI Quantum Video Engine..."]);
      setLogs(prev => [...prev, "> Handshaking with Google Quantum Data Center... [OK]"]);
      setVideoPlaylist([]);
      setCurrentVideoIndex(0);
      
      try {
          // 1. Planning
          setLogs(prev => [...prev, `> [Planner Core] Designing ${videoDuration}m High-Fidelity Curriculum...`]);
          const plan = await generateCoursePlan(mission, courseLevel, videoDuration);
          setCourseData(plan);
          setLogs(prev => [...prev, `> [Planner Core] Blueprint compiled: ${plan.modules.length} modules.`]);
          
          const firstModule = plan.modules[0]?.title || mission;

          // 2. Scripting
          setCourseStep('SCRIPTING');
          setLogs(prev => [...prev, `> [Script Neural Net] Generating ultra-detailed lecture content...`]);
          const script = await generateLessonScript(firstModule, plan.title, `${videoDuration} minutes`);
          setGeneratedScript(script);
          setLogs(prev => [...prev, "> [Script Neural Net] Content generated. Optimizing for visual flow."]);

          // 3. Chunking
          setCourseStep('CHUNKING');
          setLogs(prev => [...prev, "> [Quantum Splitter] Bypassing temporal limits via chunking..."]);
          const chunks = await chunkScript(script);
          setLogs(prev => [...prev, `> [Quantum Splitter] Distributed content into ${chunks.length} rendering jobs.`]);

          // 4. Filming
          setCourseStep('FILMING');
          setLogs(prev => [...prev, `> [Veo Quantum Queue] Initiating parallel rendering sequence...`]);
          
          const videos = await generateLongVideoChain(firstModule, chunks, (status) => {
              setLogs(prev => [...prev, `${status}`]);
          });

          if (videos.length > 0) {
              setVideoPlaylist(videos);
              setLogs(prev => [...prev, `> [Veo Quantum Queue] Stitching complete. ${videos.length} segments ready.`]);
          } else {
              setLogs(prev => [...prev, "> [System] Critical Error: Render failed."]);
          }

          // 5. Quiz
          setCourseStep('QUIZ');
          setLogs(prev => [...prev, "> [Logic Core] Formulating assessment..."]);
          const quiz = await generateQuiz(firstModule);
          setGeneratedQuiz(quiz);
          setLogs(prev => [...prev, "> [Logic Core] Quiz ready."]);

          // 6. Complete
          setCourseStep('COMPLETE');
          setLogs(prev => [...prev, "> [System] Publishing to JAP-Net... Success."]);

      } catch (e: any) {
          console.error(e);
          if (e.message === 'API_KEY_ERROR') {
             setError("API Key invalid. Please re-select key.");
             await checkApiKey();
          } else {
             setError("Course generation failed. Please try again.");
          }
          setCourseStep('INPUT');
      } finally {
          setIsRunning(false);
      }
  }

  const handleRunEbookCreator = async () => {
      // Access Check handled in UI (Lock Screen)
      if (!(await checkApiKey())) return;

      if ((user.ebooksCreated || 0) >= 3) {
          alert("Monthly Ebook limit reached (3/3). Wait for reset.");
          return;
      }

      setIsRunning(true);
      setEbookStep('OUTLINING');
      setLogs(["> [Author Core] Initializing Literary Engine..."]);
      
      try {
          // 1. Structure
          setLogs(prev => [...prev, `> [Author Core] Drafting Bestseller Outline for "${ebookConfig.topic}"...`]);
          const plan = await generateEbookStructure(ebookConfig.topic, ebookConfig.genre, ebookConfig.author);
          
          if (!plan) throw new Error("Failed to generate plan");
          
          setEbookData({
              ...plan,
              author: ebookConfig.author,
              genre: ebookConfig.genre,
              chapterContent: []
          });
          
          setLogs(prev => [...prev, `> [Author Core] Title generated: "${plan.title}"`]);
          setLogs(prev => [...prev, `> [Author Core] Structure: ${plan.chapters.length} chapters defined.`]);

          // 2. Cover Design (Parallel)
          setEbookStep('DESIGNING');
          setLogs(prev => [...prev, "> [Art Director] Commissioning cover art..."]);
          const coverPrompt = `Professional book cover for a ${ebookConfig.genre} book titled "${plan.title}". Minimalist, high contrast, typography-led, award-winning design style. No text.`;
          const coverUrl = await generateImage(coverPrompt);
          if (coverUrl) {
              setEbookData(prev => prev ? ({ ...prev, coverUrl }) : null);
              setLogs(prev => [...prev, "> [Art Director] Cover rendered successfully."]);
          }

          // 3. Writing Chapters (Sequential)
          setEbookStep('WRITING');
          const contents: string[] = [];
          for (let i = 0; i < plan.chapters.length; i++) {
              setCurrentChapterGenIndex(i);
              setLogs(prev => [...prev, `> [Ghostwriter] Writing Chapter ${i+1}: ${plan.chapters[i].title}...`]);
              const content = await generateChapterContent(plan.title, plan.chapters[i].title, ebookConfig.genre);
              contents.push(content);
              // Update state progressively
              setEbookData(prev => prev ? ({ ...prev, chapterContent: [...contents] }) : null);
          }

          // 4. Publish
          setEbookStep('PUBLISHED');
          const link = `japcoin.co.uk/ebooks/${plan.title.toLowerCase().replace(/\s/g, '-')}-${Math.floor(Math.random()*1000)}`;
          setEbookData(prev => prev ? ({ ...prev, link }) : null);
          setLogs(prev => [...prev, `> [Publisher] Book compiled. ISBN assigned. Link active.`]);
          
          if (onUsage) onUsage('EBOOK');

      } catch (e) {
          console.error(e);
          setError("Ebook generation failed.");
          setEbookStep('CONFIG');
      } finally {
          setIsRunning(false);
      }
  };

  // --- RENDER HELPERS ---

  const renderEbookStudio = () => {
      // CERTIFIED CHECK
      if (user.subscriptionTier !== 'CERTIFIED') {
          return (
             <div className="flex-1 flex items-center justify-center bg-jap-card rounded-2xl border border-white/10 h-full relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-10"></div>
                 <div className="text-center p-8 bg-black/80 backdrop-blur-xl border border-jap-gold rounded-xl shadow-2xl max-w-md relative z-10">
                        <div className="w-16 h-16 bg-jap-gold rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-[0_0_20px_#D4AF37]">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">E-Book Creator Locked</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Publish unlimited "New York Times Bestseller" quality books with JAP AI. 
                            <br/><span className="text-jap-gold font-bold">Exclusive to Certified Tier.</span>
                        </p>
                        <Button onClick={() => window.location.hash = 'pricing'} className="w-full">Upgrade to Certified</Button>
                 </div>
             </div>
          );
      }

      if (ebookStep === 'CONFIG') {
          return (
              <div className="bg-jap-card rounded-2xl p-8 border border-jap-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] h-full flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-full max-w-lg space-y-8 relative z-10">
                      <div className="text-center">
                          <h2 className="text-4xl font-serif text-white tracking-tight">AI Book Studio</h2>
                          <p className="text-jap-gold text-xs font-sans uppercase tracking-[0.2em] mt-2">Certified Authoring Tool</p>
                          <p className="text-gray-400 text-sm mt-4 font-serif italic">
                              "Write a book in minutes. Publish to the world."
                          </p>
                          <p className="text-xs text-gray-500 mt-2"> Monthly Limit: {(user.ebooksCreated || 0)}/3 Used</p>
                      </div>

                      <div className="space-y-5 bg-black/60 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-2xl">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Book Topic / Premise</label>
                              <input 
                                  type="text" 
                                  value={ebookConfig.topic}
                                  onChange={(e) => setEbookConfig({...ebookConfig, topic: e.target.value})}
                                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-jap-gold outline-none"
                                  placeholder="e.g. How to achieve financial freedom using DeFi"
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Genre</label>
                                  <select 
                                      value={ebookConfig.genre} 
                                      onChange={(e) => setEbookConfig({...ebookConfig, genre: e.target.value})}
                                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-jap-gold outline-none appearance-none"
                                  >
                                      <option value="Business">Business</option>
                                      <option value="Personal Growth">Personal Growth</option>
                                      <option value="Technology">Technology</option>
                                      <option value="Sci-Fi">Sci-Fi</option>
                                      <option value="Romance">Romance</option>
                                      <option value="Comic">Comic / Graphic Novel</option>
                                      <option value="Religious">Religious / Spiritual</option>
                                      <option value="Biography">Biography</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Author Name</label>
                                  <input 
                                      type="text" 
                                      value={ebookConfig.author}
                                      onChange={(e) => setEbookConfig({...ebookConfig, author: e.target.value})}
                                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-jap-gold outline-none"
                                  />
                              </div>
                          </div>
                          
                          <Button 
                              fullWidth 
                              onClick={handleRunEbookCreator}
                              disabled={!ebookConfig.topic.trim()}
                              className="mt-6 font-serif text-lg bg-white text-black hover:bg-gray-200 border-none"
                          >
                              Start Writing
                          </Button>
                      </div>
                  </div>
              </div>
          );
      }

      if (ebookStep === 'PUBLISHED' && ebookData) {
          return (
              <div className="bg-[#f5f5f0] text-black rounded-2xl h-full flex flex-col lg:flex-row overflow-hidden font-serif">
                  {/* Left: Marketing / Download */}
                  <div className="w-full lg:w-1/3 bg-white border-r border-gray-200 p-8 flex flex-col justify-between shadow-xl z-10">
                      <div>
                          <div className="mb-6">
                              <span className="bg-black text-white text-[10px] px-2 py-1 rounded uppercase tracking-widest font-sans font-bold">#1 New Release</span>
                          </div>
                          <h1 className="text-4xl font-bold leading-tight mb-2">{ebookData.title}</h1>
                          <h2 className="text-xl text-gray-600 mb-4 italic">{ebookData.subtitle}</h2>
                          <div className="w-12 h-1 bg-jap-gold mb-6"></div>
                          <p className="text-sm font-sans font-bold text-jap-gold uppercase tracking-wide mb-6">{ebookData.marketingHeadline}</p>
                          <p className="text-gray-700 leading-relaxed text-sm mb-8">{ebookData.summary}</p>
                          
                          <div className="flex flex-col gap-3">
                              <a href={ebookData.link} target="_blank" className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 rounded text-sm font-sans font-bold hover:bg-gray-800 transition-colors">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  Download PDF
                              </a>
                              <div className="text-center text-[10px] text-gray-400 font-sans">{ebookData.link}</div>
                          </div>
                      </div>
                      <div className="text-center mt-8">
                          <p className="text-xs text-gray-400 font-sans uppercase">Written by</p>
                          <p className="font-bold">{ebookData.author}</p>
                      </div>
                  </div>

                  {/* Right: Reader Preview */}
                  <div className="flex-1 bg-[#f5f5f0] overflow-y-auto p-8 lg:p-16 custom-scrollbar">
                      {/* 3D Book Visual */}
                      <div className="flex justify-center mb-16 perspective-1000">
                          <div className="relative w-48 h-72 shadow-2xl transform transition-transform hover:rotate-y-[-10deg] duration-500 preserve-3d">
                              {ebookData.coverUrl ? (
                                  <img src={ebookData.coverUrl} className="w-full h-full object-cover rounded-r-sm" alt="Cover" />
                              ) : (
                                  <div className="w-full h-full bg-black flex items-center justify-center text-white text-center p-4">
                                      {ebookData.title}
                                  </div>
                              )}
                              {/* Book Spine Effect */}
                              <div className="absolute top-0 left-0 w-4 h-full bg-gray-900 transform -translate-x-full origin-right skew-y-6 opacity-80"></div>
                          </div>
                      </div>

                      <div className="max-w-2xl mx-auto space-y-12">
                          <div className="text-center py-12 border-b border-gray-300">
                              <h2 className="text-3xl font-bold mb-4">Table of Contents</h2>
                              <ul className="space-y-2 text-sm text-gray-600">
                                  {ebookData.chapters.map((c, i) => (
                                      <li key={i} className="flex justify-between">
                                          <span>{i+1}. {c.title}</span>
                                          <span className="border-b border-dotted border-gray-400 flex-1 mx-2 relative top-[-4px]"></span>
                                          <span>{10 + (i*15)}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>

                          {ebookData.chapterContent.map((content, i) => (
                              <div key={i} className="prose prose-serif prose-lg max-w-none">
                                  <h3 className="text-2xl font-bold mb-6">{ebookData.chapters[i].title}</h3>
                                  <div className="text-gray-800 whitespace-pre-wrap leading-loose text-justify text-base font-serif">
                                      {content}
                                  </div>
                                  <div className="flex justify-center py-8">
                                      <span className="text-gray-400 text-xl">***</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          );
      }

      // Processing State for Ebook
      return (
          <div className="bg-black rounded-2xl p-8 border border-white/10 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className="w-24 h-32 border border-white/20 bg-gray-900 rounded mb-8 relative shadow-[0_0_30px_rgba(212,175,55,0.2)] animate-pulse">
                    <div className="absolute bottom-4 left-0 right-0 h-1 bg-jap-gold w-1/2 mx-auto"></div>
                </div>

                <h3 className="text-2xl font-serif text-white mb-2">Writing your Masterpiece...</h3>
                <p className="text-jap-gold text-xs font-mono uppercase tracking-widest mb-8 animate-pulse">
                    {ebookStep === 'OUTLINING' && "Structuring Narrative Arc"}
                    {ebookStep === 'DESIGNING' && "Designing Cover Art"}
                    {ebookStep === 'WRITING' && `Drafting Chapter ${currentChapterGenIndex + 1}`}
                </p>

                <div className="w-64 bg-gray-900 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-progress"></div>
                </div>
          </div>
      );
  }

  const renderCourseStudio = () => (
      <div className="bg-jap-card rounded-2xl p-8 border border-white/10 h-full flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-purple-600/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full">
              <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Quantum Video Course Studio</h2>
                  <p className="text-gray-400 text-sm mt-2">Generate full video curriculums with AI Avatars.</p>
              </div>

              {courseStep === 'INPUT' && (
                  <div className="space-y-6 max-w-md mx-auto w-full">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course Topic</label>
                          <input 
                              type="text" 
                              value={mission}
                              onChange={(e) => setMission(e.target.value)}
                              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-jap-gold outline-none"
                              placeholder="e.g. Advanced DeFi Strategies"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label>
                              <select 
                                  value={courseLevel} 
                                  onChange={(e) => setCourseLevel(e.target.value)}
                                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-jap-gold outline-none appearance-none"
                              >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Mins)</label>
                              <select 
                                  value={videoDuration} 
                                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-jap-gold outline-none appearance-none"
                              >
                                  <option value={15}>15 Minutes</option>
                                  <option value={30}>30 Minutes</option>
                                  <option value={45}>45 Minutes</option>
                                  <option value={60}>60 Minutes</option>
                              </select>
                          </div>
                      </div>
                      <Button fullWidth onClick={handleRunCourseStudio} disabled={!mission.trim()}>
                          Generate Course
                      </Button>
                  </div>
              )}

              {(courseStep !== 'INPUT' && courseStep !== 'COMPLETE') && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-jap-gold/30 flex items-center justify-center animate-spin-slow">
                                <div className="w-20 h-20 rounded-full border-4 border-t-jap-gold border-r-jap-gold border-b-transparent border-l-transparent animate-spin"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-white">
                                {courseStep === 'PLANNING' && '1/5'}
                                {courseStep === 'SCRIPTING' && '2/5'}
                                {courseStep === 'CHUNKING' && '3/5'}
                                {courseStep === 'FILMING' && '4/5'}
                                {courseStep === 'QUIZ' && '5/5'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {courseStep === 'PLANNING' && "Designing Curriculum..."}
                                {courseStep === 'SCRIPTING' && "Writing Lecture Scripts..."}
                                {courseStep === 'CHUNKING' && "Optimizing for Video..."}
                                {courseStep === 'FILMING' && "Rendering AI Avatar..."}
                                {courseStep === 'QUIZ' && "Generating Assessments..."}
                            </h3>
                            <p className="text-jap-gold text-xs font-mono animate-pulse">
                                Accessing Quantum Nodes...
                            </p>
                        </div>
                   </div>
              )}

              {courseStep === 'COMPLETE' && (
                  <div className="flex-1 flex flex-col">
                      <div className="bg-black/40 rounded-xl border border-white/10 p-4 mb-4 flex-1 overflow-hidden relative group">
                          {videoPlaylist.length > 0 ? (
                               <video 
                                    src={videoPlaylist[currentVideoIndex]} 
                                    controls 
                                    className="w-full h-full object-contain"
                                    onEnded={() => {
                                        if (currentVideoIndex < videoPlaylist.length - 1) {
                                            setCurrentVideoIndex(prev => prev + 1);
                                        }
                                    }}
                               />
                          ) : (
                               <div className="flex items-center justify-center h-full text-gray-500">
                                   Video rendering failed or pending.
                               </div>
                          )}
                      </div>
                      <div className="flex justify-between items-center">
                          <div className="text-white font-bold">{courseData?.title || mission}</div>
                          <Button onClick={() => setCourseStep('INPUT')} className="py-1 px-3 text-xs">Create New</Button>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  const activeDeployment = getActiveDeployment();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col">
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Japcoin <span className="text-jap-gold">AI Agent Lab</span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
                Deploy JAP-AGI to perform autonomous research, generate assets, and build code.
            </p>
        </div>

        {/* Module Selector */}
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button 
                onClick={() => setMode('RESEARCH')}
                className={`px-6 py-3 rounded-lg border font-bold text-sm transition-all whitespace-nowrap ${mode === 'RESEARCH' ? 'bg-jap-gold text-black border-jap-gold shadow-lg scale-105' : 'bg-jap-card text-gray-400 border-white/10 hover:border-white/30'}`}
            >
                🔬 Autonomous Research
            </button>
            <button 
                onClick={() => setMode('SWARM')}
                className={`px-6 py-3 rounded-lg border font-bold text-sm transition-all whitespace-nowrap flex items-center ${mode === 'SWARM' ? 'bg-gradient-to-r from-red-600 to-red-900 text-white border-red-600 shadow-lg scale-105' : 'bg-jap-card text-gray-400 border-white/10 hover:border-white/30'}`}
            >
                🤖 Swarm Intelligence {user.subscriptionTier === 'STANDARD' && <span className="ml-2 text-[10px] bg-black/30 px-1 rounded">PRO</span>}
            </button>
            <button 
                onClick={() => setMode('EBOOK_CREATOR')}
                className={`px-6 py-3 rounded-lg border font-bold text-sm transition-all whitespace-nowrap flex items-center ${mode === 'EBOOK_CREATOR' ? 'bg-white text-black border-white shadow-[0_0_15px_white] scale-105' : 'bg-jap-card text-gray-400 border-white/10 hover:border-white/30'}`}
            >
                📖 E-Book Creator <span className="ml-2 text-[10px] bg-black text-jap-gold px-1.5 rounded border border-jap-gold">CERTIFIED</span>
            </button>
            <button 
                onClick={() => setMode('COURSE_STUDIO')}
                className={`px-6 py-3 rounded-lg border font-bold text-sm transition-all whitespace-nowrap flex items-center ${mode === 'COURSE_STUDIO' ? 'bg-gradient-to-r from-jap-gold to-yellow-500 text-black border-transparent shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' : 'bg-jap-card text-gray-400 border-white/10 hover:border-white/30'}`}
            >
                🚀 Quantum Video Engine {user.subscriptionTier === 'STANDARD' && <span className="ml-2 text-[10px] bg-black/30 px-1 rounded text-white">PRO</span>}
            </button>
            <button 
                onClick={() => setMode('APP_BUILDER')}
                className={`px-6 py-3 rounded-lg border font-bold text-sm transition-all whitespace-nowrap flex flex-col items-center justify-center ${mode === 'APP_BUILDER' ? 'bg-pink-600 text-white border-pink-600 shadow-lg scale-105' : 'bg-jap-card text-gray-400 border-white/10 hover:border-white/30'}`}
            >
                <div className="flex items-center gap-1">
                    <span>📱 App Builder</span>
                    {user.subscriptionTier === 'STANDARD' && <span className="text-[10px] bg-black/30 px-1 rounded">PRO</span>}
                </div>
                {user.subscriptionTier === 'PREMIUM' && <span className="text-[9px] mt-0.5 opacity-80">{user.appsCreated || 0}/2 Used</span>}
            </button>
            <button 
                onClick={() => setMode('CODING')}
                className={`px-6 py-3 rounded-lg border font-bold text-sm transition-all whitespace-nowrap flex flex-col items-center justify-center ${mode === 'CODING' ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' : 'bg-jap-card text-gray-400 border-white/10 hover:border-white/30'}`}
            >
                <div className="flex items-center gap-1">
                    <span>💻 Website Builder</span>
                    {user.subscriptionTier === 'STANDARD' && <span className="text-[10px] bg-black/30 px-1 rounded">PRO</span>}
                </div>
                {user.subscriptionTier === 'PREMIUM' && <span className="text-[9px] mt-0.5 opacity-80">{user.websitesCreated || 0}/2 Used</span>}
            </button>
            <button 
                onClick={() => setMode('CREATIVE')}
                className={`px-6 py-3 rounded-lg border font-bold text-sm transition-all whitespace-nowrap flex items-center ${mode === 'CREATIVE' ? 'bg-purple-500 text-white border-purple-500 shadow-lg scale-105' : 'bg-jap-card text-gray-400 border-white/10 hover:border-white/30'}`}
            >
                🎨 Logo Builder {user.subscriptionTier === 'STANDARD' && <span className="ml-2 text-[10px] bg-black/30 px-1 rounded">PRO</span>}
            </button>
        </div>

        {/* Mission Input Control (Hidden for Studio Modes) */}
        {mode !== 'COURSE_STUDIO' && mode !== 'EBOOK_CREATOR' && (
            <div className="bg-jap-card rounded-2xl p-1 border border-white/10 shadow-2xl mb-8 relative">
                {/* Lock Overlay if Pro feature and User is Standard */}
                {mode !== 'RESEARCH' && user.subscriptionTier === 'STANDARD' && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <div className="text-center p-8 bg-jap-card border border-jap-gold rounded-xl shadow-2xl max-w-md">
                            <div className="w-12 h-12 bg-jap-gold rounded-full flex items-center justify-center mx-auto mb-4 text-black">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Premium Feature Locked</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Upgrade to Premium or Certified to access the {mode === 'CREATIVE' ? 'Creative Studio' : mode === 'APP_BUILDER' ? 'App Generator' : mode === 'SWARM' ? 'Swarm Intelligence' : 'Web Architect'} module.
                            </p>
                            <Button onClick={() => window.location.hash = 'pricing'}>Upgrade Plan</Button>
                        </div>
                    </div>
                )}

                <div className="bg-jap-black/50 rounded-xl p-6">
                    <label className="block text-jap-gold text-xs font-bold uppercase tracking-widest mb-3">
                        {mode === 'RESEARCH' && "Define Research Mission"}
                        {mode === 'SWARM' && "Command the Swarm (1000 Agents)"}
                        {mode === 'CREATIVE' && "Describe Logo or Image"}
                        {mode === 'CODING' && "Describe Website or DApp"}
                        {mode === 'APP_BUILDER' && "Describe App (e.g., 'Crypto Portfolio Calculator')"}
                    </label>
                    <div className="relative">
                        <textarea 
                            value={mission}
                            onChange={(e) => setMission(e.target.value)}
                            placeholder={
                                mode === 'RESEARCH' ? "e.g. Analyze Ethereum Layer 2 scaling..." :
                                mode === 'SWARM' ? "e.g. Conduct a comprehensive global market analysis of Tokenized Real World Assets, covering regulations in 10 countries..." :
                                mode === 'CREATIVE' ? "e.g. A futuristic golden lion logo for a crypto exchange..." :
                                mode === 'APP_BUILDER' ? "e.g. Create a Pomodoro timer with a cyberpunk aesthetic and task list..." :
                                "e.g. Create a landing page for an NFT marketplace..."
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white placeholder-gray-600 focus:outline-none focus:border-jap-gold/50 focus:ring-1 focus:ring-jap-gold/50 font-mono text-sm h-32 resize-none transition-all"
                            disabled={isRunning}
                        />
                        <div className="absolute bottom-4 right-4">
                            <Button 
                                onClick={handleRunMission} 
                                disabled={isRunning || !mission.trim() || (mode !== 'RESEARCH' && user.subscriptionTier === 'STANDARD')}
                                className={isRunning ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                {isRunning ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Execute
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* EBOOK CREATOR RENDER */}
        {mode === 'EBOOK_CREATOR' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-[700px]">
                {/* Left Log (only show when running) */}
                {isRunning && (
                    <div className="lg:col-span-1 bg-black rounded-xl border border-white/10 flex flex-col shadow-inner overflow-hidden relative">
                        <div className="bg-gray-900 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400">PUBLISHING_LOGS</span>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2">
                            {logs.map((log, i) => (
                                <div key={i} className={`break-words ${log.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{log}</div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                )}
                {/* Main Studio Area */}
                <div className={`${isRunning ? 'lg:col-span-2' : 'lg:col-span-3'} h-full`}>
                    {renderEbookStudio()}
                </div>
            </div>
        ) : mode === 'COURSE_STUDIO' && user.subscriptionTier === 'STANDARD' ? (
             <div className="flex-1 flex items-center justify-center bg-jap-card rounded-2xl border border-white/10">
                 <div className="text-center p-8 bg-black/40 border border-jap-gold rounded-xl shadow-2xl max-w-md">
                        <div className="w-12 h-12 bg-jap-gold rounded-full flex items-center justify-center mx-auto mb-4 text-black">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Quantum Video Engine Locked</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            This advanced module generates full video courses using Quantum AI Avatars. Please upgrade to Premium.
                        </p>
                        <Button onClick={() => window.location.hash = 'pricing'}>Upgrade Plan</Button>
                 </div>
             </div>
        ) : (
             /* Main Content Area */
             mode === 'COURSE_STUDIO' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Left: Terminal Log (Always visible for agent status) */}
                     <div className="lg:col-span-1 bg-black rounded-xl border border-white/10 flex flex-col h-[600px] shadow-inner overflow-hidden relative">
                         <div className="bg-gray-900 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400">QUANTUM_LOGS</span>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"></div>
                            </div>
                         </div>
                         <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2">
                             {logs.map((log, i) => (
                                 <div key={i} className={`break-words ${log.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{log}</div>
                             ))}
                             <div ref={logsEndRef} />
                         </div>
                     </div>
                     {/* Right: Studio Interface */}
                     <div className="lg:col-span-2 h-[600px]">
                         {renderCourseStudio()}
                     </div>
                </div>
             ) : (
                /* Original Dual Pane Output */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Left: Terminal / Logs */}
                    <div className="lg:col-span-1 bg-black rounded-xl border border-white/10 flex flex-col h-[500px] lg:h-auto shadow-inner overflow-hidden relative">
                        <div className="bg-gray-900 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400">TERMINAL_OUTPUT</span>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 relative">
                             {/* Scanline effect */}
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
                             
                             {logs.length === 0 && !isRunning && (
                                 <div className="text-gray-600 mt-4 italic text-center">
                                     > Awaiting command...
                                 </div>
                             )}

                             {logs.map((log, i) => {
                                 let colorClass = "text-green-500";
                                 if (log.includes("[THOUGHT]")) colorClass = "text-blue-400";
                                 if (log.includes("[ACTION]")) colorClass = "text-yellow-400";
                                 if (log.includes("[PLAN]")) colorClass = "text-purple-400";
                                 if (log.includes("[ERROR]")) colorClass = "text-red-500";
                                 if (log.includes("[JAP-AI GENERAL]")) colorClass = "text-jap-gold font-bold";

                                 return (
                                     <div key={i} className={`${colorClass} break-words`}>
                                         {log}
                                     </div>
                                 );
                             })}
                             <div ref={logsEndRef} />
                        </div>
                    </div>

                    {/* Right: Final Output / Preview */}
                    <div className="lg:col-span-2 bg-jap-card rounded-xl border border-white/10 flex flex-col h-[500px] lg:h-auto shadow-lg relative">
                        <div className="bg-jap-card border-b border-white/5 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-jap-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    {mode === 'CREATIVE' ? 'Studio Canvas' : mode === 'APP_BUILDER' ? 'Live App Environment' : mode === 'SWARM' ? 'War Room' : 'Agent Report'}
                                </h3>
                                {/* App Builder Toggle */}
                                {mode === 'APP_BUILDER' && generatedAppCode && (
                                    <div className="flex bg-black/40 rounded p-1">
                                        <button 
                                            onClick={() => setShowAppPreview(false)}
                                            className={`px-3 py-1 text-xs rounded transition-colors ${!showAppPreview ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Code
                                        </button>
                                        <button 
                                            onClick={() => setShowAppPreview(true)}
                                            className={`px-3 py-1 text-xs rounded transition-colors ${showAppPreview ? 'bg-pink-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Live Preview
                                        </button>
                                    </div>
                                )}
                            </div>
                            {isRunning && (
                                 <div className="flex items-center gap-2">
                                     <span className="relative flex h-3 w-3">
                                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jap-gold opacity-75"></span>
                                       <span className="relative inline-flex rounded-full h-3 w-3 bg-jap-gold"></span>
                                     </span>
                                     <span className="text-xs text-jap-gold font-bold">PROCESSING</span>
                                 </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden relative bg-jap-subtle/20">
                            {error ? (
                                <div className="h-full flex items-center justify-center text-red-400 flex-col p-6 text-center">
                                    <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p>{error}</p>
                                </div>
                            ) : mode === 'SWARM' && isRunning ? (
                                // Swarm Visualization Overlay
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8 space-y-8">
                                    {/* The General */}
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-jap-gold rounded-full flex items-center justify-center shadow-[0_0_50px_#D4AF37] relative z-10 animate-pulse">
                                            <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        </div>
                                        <div className="text-jap-gold text-xs font-bold text-center mt-2 tracking-widest uppercase">General</div>
                                    </div>

                                    {/* Connection Lines (Simulated) */}
                                    <div className="w-1 h-12 bg-gradient-to-b from-jap-gold to-transparent"></div>

                                    {/* The Swarm Grid */}
                                    <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
                                        {/* Dynamic Squads */}
                                        {swarmActiveSquads.map((squad, i) => (
                                            <div key={i} className="flex flex-col items-center animate-slide-in">
                                                <div className="w-12 h-12 bg-blue-900/50 border border-blue-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-blue-500/20 animate-ping"></div>
                                                    <span className="relative z-10 text-xs font-bold text-blue-300">SQD-{i+1}</span>
                                                </div>
                                                <div className="text-blue-400 text-[10px] mt-2 font-mono">{squad}</div>
                                                <div className="text-gray-500 text-[9px] mt-1">Deploying...</div>
                                            </div>
                                        ))}
                                        
                                        {/* Filler Drones */}
                                        {[1,2,3].map(i => (
                                            <div key={`d-${i}`} className="flex flex-col items-center opacity-30">
                                                <div className="w-8 h-8 bg-gray-800 rounded-full border border-gray-600"></div>
                                                <div className="text-[8px] mt-1 text-gray-600">Drone Unit</div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="text-gray-400 text-xs font-mono animate-pulse">
                                        Synchronizing Neural Links...
                                    </div>
                                </div>
                            ) : !result && !generatedImageUrl && !generatedAppCode && !isRunning && generatedAppCode === null ? (
                                <div className="h-full flex items-center justify-center text-gray-600 flex-col p-6 text-center">
                                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    <p>Agent is offline. Select a module to begin.</p>
                                </div>
                            ) : (
                                <>
                                    {/* App Builder Live Preview */}
                                    {mode === 'APP_BUILDER' && showAppPreview ? (
                                        <div className="flex flex-col h-full bg-gray-900 overflow-hidden relative">
                                            {/* Browser Toolbar */}
                                            <div className="bg-gray-800 border-b border-white/10 p-2 flex items-center justify-between shrink-0 relative z-30">
                                                <div className="flex items-center gap-3 w-full">
                                                     <div className="flex gap-1.5 shrink-0 ml-1">
                                                         <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                                         <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                                                         <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                                                     </div>
                                                     <div className="flex-1 bg-black/50 rounded-md px-3 py-1.5 flex items-center text-xs font-mono text-gray-400 border border-white/5 max-w-lg mx-auto overflow-hidden">
                                                         <svg className="w-3 h-3 mr-2 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                         <span className="truncate">
                                                             {activeDeployment ? activeDeployment.url : `localhost:3000/${mission.substring(0, 15).replace(/\s/g,'-').toLowerCase()}...`}
                                                         </span>
                                                     </div>
                                                     <div className="flex items-center gap-2 shrink-0">
                                                         <button onClick={() => setPreviewMode('DESKTOP')} className={`p-1.5 rounded transition-colors ${previewMode === 'DESKTOP' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`} title="Desktop View">
                                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                         </button>
                                                         <button onClick={() => setPreviewMode('MOBILE')} className={`p-1.5 rounded transition-colors ${previewMode === 'MOBILE' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`} title="Mobile View">
                                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                         </button>
                                                         <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                                                         
                                                         <button 
                                                            onClick={() => setShowDeploymentsList(!showDeploymentsList)}
                                                            className={`p-1.5 rounded transition-colors relative ${showDeploymentsList ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                                                            title="Deployment History"
                                                         >
                                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                             {deployments.length > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>}
                                                         </button>

                                                         <Button 
                                                            variant={activeDeployment ? "outline" : "primary"} 
                                                            className={`py-1 px-3 text-[10px] h-8 ${activeDeployment ? 'border-green-500 text-green-500 bg-green-500/10' : ''}`}
                                                            onClick={handleStartDeploy}
                                                         >
                                                            Deploy App
                                                         </Button>
                                                     </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 relative flex justify-center bg-[#121212] overflow-auto py-4">
                                                {generatedAppCode ? (
                                                    <iframe 
                                                        srcDoc={generatedAppCode}
                                                        title="Live App Preview"
                                                        className={`transition-all duration-500 bg-black shadow-2xl ${
                                                            previewMode === 'MOBILE' 
                                                            ? 'w-[375px] h-[667px] rounded-[30px] border-[8px] border-gray-800 ring-1 ring-white/10 my-auto' 
                                                            : 'w-full h-full border-none'
                                                        }`}
                                                        sandbox="allow-scripts allow-modals allow-forms"
                                                    />
                                                ) : (
                                                    // Placeholder / Booting Screen inside the browser frame
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                                        <div className="w-16 h-16 border-4 border-jap-gold/30 border-t-jap-gold rounded-full animate-spin mb-6"></div>
                                                        <p className="text-xs uppercase tracking-widest font-bold text-jap-gold">Initializing Environment</p>
                                                        <p className="text-[10px] text-gray-600 mt-2 font-mono">Waiting for JAP-BUILDER stream...</p>
                                                    </div>
                                                )}
                                                
                                                {/* DNS Check Overlay */}
                                                {activeDeployment && activeDeployment.status === 'dns-check' && (
                                                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 animate-fade-in">
                                                        <div className="bg-jap-card border border-jap-gold/30 rounded-xl p-8 max-w-lg w-full shadow-2xl">
                                                            <div className="text-center mb-6">
                                                                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                                                                    <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                                </div>
                                                                <h3 className="text-xl font-bold text-white">DNS Configuration Required</h3>
                                                                <p className="text-gray-400 text-sm mt-2">
                                                                    Your app is built, but your domain <b>{activeDeployment.customDomain}</b> needs to be pointed to JAP-Net servers.
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3 bg-black/50 p-4 rounded-lg border border-white/5 mb-6">
                                                                {activeDeployment.dnsRecords?.map((record, i) => (
                                                                    <div key={i} className="flex justify-between items-center text-xs font-mono border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                                                        <div className="flex gap-4">
                                                                            <span className="text-gray-500 w-12">{record.type}</span>
                                                                            <span className="text-white">{record.name}</span>
                                                                        </div>
                                                                        <span className="text-jap-gold">{record.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <Button variant="outline" fullWidth onClick={() => setActiveDeploymentId(null)}>Later</Button>
                                                                <Button fullWidth onClick={() => verifyDns(activeDeployment.id)}>Verify DNS Records</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Deployment Modal */}
                                                {showDeployModal && (
                                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fade-in">
                                                        <div className="bg-jap-card w-full max-w-md rounded-xl border border-white/10 shadow-2xl p-6">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <h3 className="text-lg font-bold text-white">Deploy to JAP-Net</h3>
                                                                <button onClick={() => setShowDeployModal(false)} className="text-gray-500 hover:text-white">✕</button>
                                                            </div>
                                                            
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Project Name</label>
                                                                    <div className="flex bg-black/50 border border-white/10 rounded-lg overflow-hidden">
                                                                        <input 
                                                                            type="text" 
                                                                            value={deployConfig.name}
                                                                            onChange={(e) => setDeployConfig({...deployConfig, name: e.target.value})}
                                                                            className="flex-1 bg-transparent px-3 py-2 text-white outline-none text-sm font-mono"
                                                                            placeholder="my-cool-app"
                                                                        />
                                                                        <div className="bg-white/5 px-3 py-2 text-gray-500 text-xs border-l border-white/10 flex items-center">
                                                                            .jap-app.net
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="pt-2">
                                                                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={deployConfig.useDomain}
                                                                            onChange={(e) => setDeployConfig({...deployConfig, useDomain: e.target.checked})}
                                                                            className="rounded border-gray-600 bg-black text-jap-gold focus:ring-0"
                                                                        />
                                                                        <span className="text-sm font-bold text-white">Use Custom Domain</span>
                                                                        <span className="text-[10px] bg-jap-gold text-black px-1.5 rounded font-bold">PRO</span>
                                                                    </label>
                                                                    
                                                                    {deployConfig.useDomain && (
                                                                        <input 
                                                                            type="text"
                                                                            value={deployConfig.customDomain}
                                                                            onChange={(e) => setDeployConfig({...deployConfig, customDomain: e.target.value})}
                                                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none text-sm font-mono focus:border-jap-gold"
                                                                            placeholder="www.yourdomain.com"
                                                                        />
                                                                    )}
                                                                </div>

                                                                <Button fullWidth onClick={executeDeployment} className="mt-4">
                                                                    Ship It 🚀
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Deployments List Panel */}
                                                {showDeploymentsList && (
                                                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-gray-900 border-l border-white/10 shadow-2xl z-20 animate-slide-in p-4 flex flex-col">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Deployments</h3>
                                                            <button onClick={() => setShowDeploymentsList(false)} className="text-gray-500 hover:text-white">✕</button>
                                                        </div>
                                                        <div className="space-y-2 flex-1 overflow-y-auto">
                                                            {deployments.length === 0 ? (
                                                                <p className="text-gray-600 text-xs italic text-center py-4">No deployments yet.</p>
                                                            ) : (
                                                                deployments.map(dep => (
                                                                    <div 
                                                                        key={dep.id} 
                                                                        onClick={() => setActiveDeploymentId(dep.id)}
                                                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${activeDeploymentId === dep.id ? 'bg-jap-gold/10 border-jap-gold' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                                                                    >
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="font-bold text-white text-xs truncate max-w-[120px]">{dep.name}</span>
                                                                            {dep.status === 'live' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></div>}
                                                                            {dep.status === 'dns-check' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>}
                                                                            {dep.status === 'deploying' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>}
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-500 truncate font-mono">{dep.url.replace('https://', '')}</div>
                                                                        <div className="text-[9px] text-gray-600 mt-2 text-right">{new Date(dep.timestamp).toLocaleTimeString()}</div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 overflow-y-auto h-full prose prose-invert prose-gold max-w-none text-sm">
                                            {/* Image Display */}
                                            {generatedImageUrl && (
                                                <div className="flex justify-center mb-6">
                                                    <div className="relative group">
                                                        <img src={generatedImageUrl} alt="Generated Asset" className="rounded-lg shadow-2xl border border-white/10 max-w-full h-auto" />
                                                        <a 
                                                            href={generatedImageUrl} 
                                                            download="jap-agi-asset.png"
                                                            className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-jap-gold hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            Download Asset
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Text/Code Display */}
                                            {result.split('\n').map((line, idx) => {
                                                if (line.startsWith('# ')) return <h1 key={idx} className="text-2xl font-bold text-white mb-4 mt-6">{line.replace('# ', '')}</h1>;
                                                if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold text-jap-gold mb-3 mt-5">{line.replace('## ', '')}</h2>;
                                                if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold text-white mb-2 mt-4">{line.replace('### ', '')}</h3>;
                                                if (line.startsWith('- ')) return <li key={idx} className="ml-4 list-disc text-gray-300">{line.replace('- ', '')}</li>;
                                                if (line.startsWith('```')) return <div key={idx} className="my-2 p-3 bg-black rounded border border-white/10 font-mono text-xs text-blue-400 overflow-x-auto whitespace-pre">{line.replace(/```/g, '')}</div>; 
                                                return <p key={idx} className="mb-2 text-gray-300 leading-relaxed">{line}</p>;
                                            })}
                                            <div ref={resultEndRef} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
             )
        )}
    </div>
  );
}

export default AIAgentLab;
