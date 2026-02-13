
import React, { useState, useEffect } from 'react';
import { Course, Module } from '../types';
import Button from './Button';
import AITutor from './AITutor';
import { generateTutorVideo, enrichModuleContent, EnrichmentData } from '../services/geminiService';
import { 
  VisualBlockchain, 
  VisualConsensus, 
  VisualCandlestick, 
  VisualOrderBook, 
  VisualLiquidityPool,
  VisualDID,
  VisualReentrancy
} from './Visuals';

interface CourseViewerProps {
  course: Course;
  onBack: () => void;
  onComplete: () => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ course, onBack, onComplete }) => {
  const [activeModule, setActiveModule] = useState<Module>(course.modules[0]);
  const [videoPlaylist, setVideoPlaylist] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showTutor, setShowTutor] = useState(false);
  
  // Enrichment State
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // Reset video and enrichment when module changes
  useEffect(() => {
    setVideoPlaylist([]);
    setCurrentVideoIndex(0);
    setGenerationError(null);
    setIsGenerating(false);
    setEnrichmentData(null);
    setQuizAnswer(null);
  }, [activeModule]);

  const handleGenerateVideo = async () => {
    setGenerationError(null);
    setIsGenerating(true);

    try {
      // Check for API Key selection (Required for Veo)
      const win = window as any;
      if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
        }
      }

      const urls = await generateTutorVideo(activeModule.title, activeModule.content);
      if (urls && urls.length > 0) {
        setVideoPlaylist(urls);
        setCurrentVideoIndex(0);
      } else {
        setGenerationError("Failed to generate video chain. Please try again.");
      }
    } catch (error: any) {
      if (error.message === "API_KEY_ERROR") {
         // Reset key and prompt again
         const win = window as any;
         if (win.aistudio) {
           await win.aistudio.openSelectKey();
           setGenerationError("API Key invalid or expired. Please select a valid key and try again.");
         }
      } else {
        setGenerationError("Video generation failed. Ensure you have a paid API key selected.");
      }
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnrichContent = async () => {
      setIsEnriching(true);
      try {
          const data = await enrichModuleContent(activeModule.title, activeModule.content);
          if (data) {
              setEnrichmentData(data);
          }
      } catch (e) {
          console.error("Enrichment error", e);
      } finally {
          setIsEnriching(false);
      }
  };

  const renderContentWithVisuals = (content: string) => {
    // Regex to split content by [VISUAL: TYPE] tags
    const parts = content.split(/(\[VISUAL: [A-Z_]+\])/g);

    return parts.map((part, index) => {
      if (part === '[VISUAL: BLOCKCHAIN]') return <VisualBlockchain key={index} />;
      if (part === '[VISUAL: CONSENSUS]') return <VisualConsensus key={index} />;
      if (part === '[VISUAL: CANDLESTICK]') return <VisualCandlestick key={index} />;
      if (part === '[VISUAL: ORDER_BOOK]') return <VisualOrderBook key={index} />;
      if (part === '[VISUAL: LIQUIDITY_POOL]') return <VisualLiquidityPool key={index} />;
      if (part === '[VISUAL: DID]') return <VisualDID key={index} />;
      if (part === '[VISUAL: REENTRANCY]') return <VisualReentrancy key={index} />;
      
      return (
        <div key={index} className="whitespace-pre-wrap text-gray-300 text-lg leading-relaxed font-light">
          {part}
        </div>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-jap-black">
      {/* Sidebar - Module List */}
      <div className="w-80 bg-jap-card border-r border-white/10 flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </button>
          <h2 className="text-lg font-bold text-white leading-tight">{course.title}</h2>
          <div className="mt-2 text-xs text-jap-gold font-medium">
            Reward: {course.reward} JAP
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {course.modules.map((module, index) => (
            <div 
              key={module.id}
              onClick={() => setActiveModule(module)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                activeModule.id === module.id 
                  ? 'bg-jap-gold/10 border-l-4 border-l-jap-gold' 
                  : 'hover:bg-white/5 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium uppercase ${activeModule.id === module.id ? 'text-jap-gold' : 'text-gray-500'}`}>
                  Module {index + 1}
                </span>
                <span className="text-xs text-gray-600">{module.duration}</span>
              </div>
              <h3 className={`text-sm font-medium ${activeModule.id === module.id ? 'text-white' : 'text-gray-300'}`}>
                {module.title}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-jap-black overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
            <div className="max-w-3xl mx-auto">
              {/* Content Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 border-b border-white/10 pb-4 gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {activeModule.title}
                  </h1>
                  <div className="flex gap-2">
                      <Button 
                        variant={showTutor ? "primary" : "outline"} 
                        className="text-xs shrink-0 py-2"
                        onClick={() => setShowTutor(!showTutor)}
                      >
                        {showTutor ? 'Hide Tutor' : 'Ask AI Tutor'}
                      </Button>
                      <Button
                        variant="secondary"
                        className="text-xs shrink-0 py-2 border border-jap-gold/30"
                        onClick={handleEnrichContent}
                        disabled={isEnriching || !!enrichmentData}
                      >
                        {isEnriching ? (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-jap-gold rounded-full animate-bounce"></span>
                                Enriching...
                            </span>
                        ) : enrichmentData ? 'Enriched' : '✨ AI Enrich'}
                      </Button>
                  </div>
              </div>

              {/* AI Video Tutor Section */}
              <div className="mb-8 rounded-xl overflow-hidden bg-black border border-jap-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <div className="p-4 bg-jap-card/50 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-jap-gold font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    JAP Tutor (Veo 4K Deep Dive)
                  </h3>
                  {videoPlaylist.length > 0 && (
                    <button 
                      onClick={handleGenerateVideo} 
                      className="text-xs text-gray-400 hover:text-white underline"
                      disabled={isGenerating}
                    >
                      Regenerate
                    </button>
                  )}
                </div>
                
                <div className="aspect-video bg-black flex items-center justify-center relative">
                  {isGenerating ? (
                    <div className="text-center p-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-jap-gold mb-4"></div>
                        <p className="text-gray-300 text-sm animate-pulse">Generating YouTube-style Deep Dive...</p>
                        <p className="text-gray-500 text-xs mt-2">Creating script, chunking, and stitching 4K clips.</p>
                    </div>
                  ) : videoPlaylist.length > 0 ? (
                    <div className="w-full h-full relative group">
                        <video 
                          key={videoPlaylist[currentVideoIndex]}
                          controls 
                          autoPlay 
                          className="w-full h-full object-contain"
                          src={videoPlaylist[currentVideoIndex]}
                          onEnded={() => {
                              if (currentVideoIndex < videoPlaylist.length - 1) {
                                  setCurrentVideoIndex(prev => prev + 1);
                              }
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                        
                        {/* Playlist Overlay Info */}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-xs font-bold flex items-center gap-2 border border-white/10 pointer-events-none">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Part {currentVideoIndex + 1} of {videoPlaylist.length}
                        </div>

                        {/* Playlist Navigation */}
                        {videoPlaylist.length > 1 && (
                            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {videoPlaylist.map((_, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentVideoIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentVideoIndex ? 'bg-jap-gold scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center p-12">
                      <p className="text-gray-400 mb-4">Visualize this concept with a Deep Dive AI video.</p>
                      <Button onClick={handleGenerateVideo}>
                        Generate 4K Deep Dive Lesson
                      </Button>
                      {generationError && (
                        <p className="text-red-400 text-xs mt-4">{generationError}</p>
                      )}
                      <p className="text-gray-600 text-[10px] mt-4 max-w-xs mx-auto">
                        Powered by Google Veo & Quantum Engine. Creates a multi-part explanation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="prose prose-invert prose-gold max-w-none">
                {renderContentWithVisuals(activeModule.content)}
              </div>

              {/* Enrichment Section */}
              {enrichmentData && (
                  <div className="mt-12 space-y-8 border-t border-white/10 pt-8 animate-fade-in">
                      <h3 className="text-xl font-bold text-jap-gold uppercase tracking-widest flex items-center gap-2">
                          <span className="text-2xl">✨</span> AI Enrichment Zone
                      </h3>

                      {/* Summary Card */}
                      <div className="bg-jap-card/50 border border-jap-gold/20 rounded-xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-jap-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                          <h4 className="text-sm font-bold text-white uppercase mb-2">Key Takeaway</h4>
                          <p className="text-gray-300 italic">"{enrichmentData.keyTakeaway}"</p>
                      </div>

                      {/* Interactive Quiz */}
                      {enrichmentData.quiz && (
                          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                              <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                      <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">QUIZ</span>
                                      Check Understanding
                                  </h4>
                              </div>
                              
                              <p className="text-lg font-medium text-white mb-6">{enrichmentData.quiz.question}</p>
                              
                              <div className="grid gap-3">
                                  {enrichmentData.quiz.options.map((opt, i) => {
                                      let btnClass = "bg-jap-card border-white/10 hover:bg-white/5 text-gray-300";
                                      if (quizAnswer !== null) {
                                          if (i === enrichmentData.quiz?.correctIndex) btnClass = "bg-green-900/40 border-green-500 text-green-400";
                                          else if (i === quizAnswer) btnClass = "bg-red-900/40 border-red-500 text-red-400";
                                          else btnClass = "bg-jap-card border-white/10 opacity-50";
                                      }

                                      return (
                                          <button
                                              key={i}
                                              onClick={() => setQuizAnswer(i)}
                                              disabled={quizAnswer !== null}
                                              className={`w-full text-left p-4 rounded-lg border transition-all ${btnClass}`}
                                          >
                                              <span className="font-mono text-xs opacity-50 mr-3">{String.fromCharCode(65+i)}.</span>
                                              {opt}
                                          </button>
                                      );
                                  })}
                              </div>
                              
                              {quizAnswer !== null && (
                                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg text-sm text-gray-300 border-l-2 border-jap-gold animate-slide-in">
                                      <span className="text-jap-gold font-bold">Explanation: </span>
                                      {enrichmentData.quiz.explanation}
                                  </div>
                              )}
                          </div>
                      )}

                      {/* Code Snippet */}
                      {enrichmentData.codeSnippet && (
                          <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                              <div className="bg-[#252526] px-4 py-2 flex items-center justify-between border-b border-black">
                                  <span className="text-xs text-gray-400 font-mono">{enrichmentData.codeSnippet.language}</span>
                                  <div className="flex gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                  </div>
                              </div>
                              <div className="p-4 overflow-x-auto">
                                  <pre className="font-mono text-sm text-blue-300 whitespace-pre">
                                      <code>{enrichmentData.codeSnippet.code}</code>
                                  </pre>
                              </div>
                              <div className="bg-[#252526] px-4 py-3 border-t border-black">
                                  <p className="text-xs text-gray-500">{enrichmentData.codeSnippet.description}</p>
                              </div>
                          </div>
                      )}
                  </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="bg-jap-card border-t border-white/10 p-4 shrink-0">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Module {course.modules.findIndex(m => m.id === activeModule.id) + 1} of {course.modules.length}
              </div>
              <div className="flex space-x-4">
                <Button onClick={onComplete}>
                    Complete Course
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tutor Panel */}
        {showTutor && (
           <div className="w-80 lg:w-96 border-l border-white/10 bg-jap-card shrink-0 shadow-2xl z-20 transition-all duration-300">
              <AITutor 
                  embedded 
                  context={activeModule.content} 
                  title={activeModule.title} 
              />
           </div>
        )}
      </div>
    </div>
  );
};

export default CourseViewer;
