
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini, generateSpeech } from '../services/geminiService';
import Button from './Button';

interface AITutorProps {
  embedded?: boolean;
  context?: string;
  title?: string;
}

const AITutor: React.FC<AITutorProps> = ({ embedded = false, context, title }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: context 
        ? `Hello! I'm JapSensei. I see you're studying "${title}". Ask me anything about this module! I can speak your language.`
        : "Greetings, student. I am JapSensei. How can I assist you with your blockchain studies today? I can answer in any language.",
      timestamp: Date.now()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio Context
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
      return () => {
          if (audioSourceRef.current) {
              audioSourceRef.current.stop();
          }
          if (audioContextRef.current) {
              audioContextRef.current.close();
          }
      }
  }, []);

  // Notify user when context changes in embedded mode
  useEffect(() => {
    if (embedded && title && messages.length > 0) {
      // Don't duplicate if the last message is already about this context
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg.text.includes(title)) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: `Context switched to: "${title}". I'm ready to answer questions about this topic.`,
            timestamp: Date.now()
          }]);
      }
    }
  }, [title, embedded]);

  const playAudio = async (text: string) => {
      if (isSpeaking) {
          audioSourceRef.current?.stop();
          setIsSpeaking(false);
          return;
      }

      try {
          setIsSpeaking(true);
          const audioBuffer = await generateSpeech(text);
          if (audioBuffer) {
              if (!audioContextRef.current) {
                  audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
              }
              
              // Decode PCM data manually or use decodeAudioData if format is supported by browser (Gemini sends raw PCM often, but lets try browser decode for the TTS preview model which might send WAV container)
              // Note: Gemini 2.5 TTS sends raw PCM usually.
              // Simple WAV header injection or Raw playback:
              
              // Let's assume the helper `decodeAudioData` is needed.
              // For simplicity in this demo, we try standard decode. If fails, we might need PCM handling.
              // The service returns ArrayBuffer.
              
              const ctx = audioContextRef.current;
              // RAW PCM Decoding for 24kHz mono (Standard for Gemini)
              const float32Array = new Float32Array(audioBuffer);
              const audioBufferNode = ctx.createBuffer(1, float32Array.length / 2, 24000);
              const channelData = audioBufferNode.getChannelData(0);
              
              // Simple Byte to Float conversion (assuming 16-bit PCM)
              const view = new DataView(audioBuffer);
              const len = audioBuffer.byteLength / 2;
              for (let i = 0; i < len; i++) {
                  const int16 = view.getInt16(i * 2, true); // Little endian
                  channelData[i] = int16 / 32768.0;
              }

              const source = ctx.createBufferSource();
              source.buffer = audioBufferNode;
              source.connect(ctx.destination);
              source.onended = () => setIsSpeaking(false);
              source.start();
              audioSourceRef.current = source;
          } else {
              setIsSpeaking(false);
          }
      } catch (e) {
          console.error("Audio playback failed", e);
          setIsSpeaking(false);
      }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Construct context-aware system instruction if available
      let systemInstruction = undefined;
      if (context && title) {
        systemInstruction = `You are JapSensei, an expert AI Tutor at Japcoin University.
The student is currently viewing a specific module titled "${title}".
Here is the content of the module:
---
${context}
---
Your goal is to help the student understand THIS specific content. 
Answer their questions based on the provided module content. 
If the answer isn't in the content, use your general blockchain knowledge to explain, but mention that it goes beyond the current module.
Keep answers concise, encouraging, and easy to understand.`;
      }

      // Pass user profile for personalization
      const responseText = await sendMessageToGemini(userMsg.text, history, systemInstruction, {
          learningStyle: 'Analogy-based', // Randomize or set from user prefs
          language: 'Auto-Detect'
      });

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);
      
      if (autoSpeak) {
          playAudio(responseText);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerClass = embedded 
    ? "flex flex-col h-full bg-jap-card" 
    : "flex flex-col h-[calc(100vh-140px)] bg-jap-card border border-white/10 rounded-xl overflow-hidden shadow-2xl";

  return (
    <div className={containerClass}>
      <div className="bg-jap-subtle p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></div>
          <h2 className="text-lg font-bold text-white">JapSensei <span className="hidden sm:inline text-jap-gold text-sm font-normal ml-2">AI Tutor</span></h2>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${autoSpeak ? 'bg-jap-gold text-black' : 'bg-black/40 text-gray-400'}`}
                title="Auto-Speak Answers"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                {autoSpeak ? 'Voice ON' : 'Voice OFF'}
            </button>
            <button 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setMessages([{
                    id: Date.now().toString(),
                    role: 'model',
                    text: "Chat cleared. How can I help?",
                    timestamp: Date.now()
                }])}
            >
                Clear
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-jap-dark/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 relative group ${
                msg.role === 'user' 
                  ? 'bg-jap-gold text-black rounded-tr-none' 
                  : 'bg-jap-subtle text-gray-100 border border-white/5 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              
              {/* Play Button for individual messages */}
              {msg.role === 'model' && (
                  <button 
                    onClick={() => playAudio(msg.text)}
                    className="absolute -right-8 top-2 text-gray-500 hover:text-jap-gold p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Read Aloud"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </button>
              )}

              <div className={`text-[10px] mt-1 opacity-60 ${msg.role === 'user' ? 'text-black' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-jap-subtle rounded-2xl rounded-tl-none px-4 py-3 border border-white/5">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-jap-card border-t border-white/10 shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={embedded ? "Ask about this module..." : "Ask in any language..."}
            className="flex-1 bg-jap-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-jap-gold transition-colors placeholder-gray-600 text-sm"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading} className="px-4 py-2 text-xs">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
