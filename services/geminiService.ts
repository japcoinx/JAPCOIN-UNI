
import { GoogleGenAI, Type } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from '../constants';

// Initialize the client safely
const getClient = () => {
  if (process.env.API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return null;
};

// --- CORE CHAT & TRANSLATION ---

export const sendMessageToGemini = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  systemInstruction?: string,
  studentProfile?: { language?: string; learningStyle?: string } // New: Personalization
): Promise<string> => {
  const client = getClient();
  
  if (!client) {
    return "Error: API Key is missing. Please configure the environment.";
  }

  // Dynamic System Instruction for Personalization & Translation
  const baseInstruction = systemInstruction || AI_SYSTEM_INSTRUCTION;
  const adaptiveInstruction = `
    ${baseInstruction}
    
    CRITICAL INSTRUCTIONS:
    1. **Language Detection**: Detect the language of the user's message. YOU MUST RESPOND IN THE EXACT SAME LANGUAGE.
    2. **Personalization**: This specific student learns best via "${studentProfile?.learningStyle || 'mixed methods'}". Adapt your explanation style accordingly (e.g., use more analogies for visual learners, more code for developers).
    3. **Uniqueness**: Never give a canned response. Tackle the answer from a unique angle (e.g., economic, technical, or philosophical) to spark specific insight for this user.
  `;

  try {
    const chat = client.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: adaptiveInstruction,
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I'm having trouble connecting to the neural network right now. Please try again later.";
  }
};

// --- TEXT TO SPEECH (VOICE) ---

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");

    try {
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text }] },
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore' is authoritative but friendly
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            // Convert Base64 to ArrayBuffer
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }
        return null;
    } catch (error) {
        console.error("TTS Error:", error);
        return null;
    }
};

// --- SWARM INTELLIGENCE (GENERAL & AGENTS) ---

interface SwarmPlan {
    squads: { name: string; mission: string }[];
    strategy: string;
}

export const runSwarmArchitecture = async (
    objective: string,
    onLog: (log: string) => void
): Promise<string> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");

    // 1. THE GENERAL (JAP-AI) PLANS
    onLog("[JAP-AI GENERAL] Analyzing objective. Mobilizing 1000 units...");
    
    const strategyPrompt = `You are JAP-AI, the Supreme General of a digital army of AI agents.
    Objective: "${objective}"
    
    Devise a strategy to answer this using 3 specialized Elite Squads (representing your 1000 agents).
    Return JSON:
    {
      "strategy": "Brief overview of the battle plan",
      "squads": [
        { "name": "Alpha (Data)", "mission": "Specific data retrieval task" },
        { "name": "Bravo (Analysis)", "mission": "Specific analysis task" },
        { "name": "Charlie (Synthesis)", "mission": "Specific synthesis/formatting task" }
      ]
    }`;

    let plan: SwarmPlan;
    try {
        const strategyResp = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: strategyPrompt,
            config: { responseMimeType: 'application/json' }
        });
        plan = JSON.parse(strategyResp.text || "{}");
        onLog(`[JAP-AI GENERAL] Strategy Formulated: ${plan.strategy}`);
    } catch (e) {
        return "Command Uplink Failed. Aborting Mission.";
    }

    // 2. THE SOLDIERS (AGENTS) EXECUTE
    const agentResults: string[] = [];
    
    // Execute squads in parallel (Simulation of massive scale)
    const squadPromises = plan.squads.map(async (squad) => {
        onLog(`[SQUAD ${squad.name}] Deployed. Executing: ${squad.mission}...`);
        
        // Simulating the work of hundreds of agents in this squad
        const agentPrompt = `You are the Commander of ${squad.name} Squad.
        Your orders: ${squad.mission}.
        Context: The user wants to know about "${objective}".
        Execute orders and report back with high-density information.`;

        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: agentPrompt
        });
        
        const result = response.text || "Mission Failed";
        onLog(`[SQUAD ${squad.name}] Mission Accomplished. Uploading intel.`);
        return `REPORT FROM ${squad.name}:\n${result}`;
    });

    const squadReports = await Promise.all(squadPromises);

    // 3. THE GENERAL SYNTHESIZES
    onLog("[JAP-AI GENERAL] Aggregating field reports from all units...");
    
    const finalPrompt = `You are JAP-AI General. 
    You have received reports from your squads regarding: "${objective}".
    
    REPORTS:
    ${squadReports.join('\n---\n')}
    
    Produce a final, authoritative Master Briefing for the user. 
    Tone: Authoritative, precise, comprehensive.
    Structure: Executive Summary, Deep Dive, Strategic Outlook.`;

    const finalResp = await client.models.generateContent({
        model: 'gemini-3-pro-preview', // Use Pro for final synthesis
        contents: finalPrompt
    });

    return finalResp.text || "Synthesis failed.";
};

// ... (Existing exports: streamAgentMission, generateImage, generateCoursePlan, etc. remain unchanged below)

export const streamAgentMission = async (
    mission: string,
    onChunk: (text: string) => void,
    mode: 'RESEARCH' | 'CODING' | 'APP_BUILDER' | 'SWARM' | 'EBOOK_CREATOR' | 'MUSIC_STUDIO' = 'RESEARCH'
): Promise<void> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");

    let systemPrompt = '';

    if (mode === 'SWARM') {
        systemPrompt = `You are JAP-AI General. Describe the deployment of your agent army to solve: "${mission}". Use military/cybernetic terminology.`;
    } else if (mode === 'CODING') {
        systemPrompt = `You are JAP-DEV, an elite Full Stack Web3 Developer AI linked to Google Quantum Processors.
        Your goal is to write clean, production-ready code for the user's request.
        
        Format your response with:
        [LOG] Analyzing requirements...
        [PLAN] {Brief architectural plan}
        [CODE]
        {The code content}
        [EXPLANATION]
        {Brief explanation}
        `;
    } else if (mode === 'APP_BUILDER') {
        systemPrompt = `You are JAP-BUILDER, an expert AI Software Architect linked to Google Quantum Processors.
        Your goal is to build a robust, complex Single Page Application (SPA) inside a single HTML file.

        ARCHITECTURAL STACK:
        - React 18 (via CDN)
        - ReactDOM 18 (via CDN)
        - Babel (via CDN for JSX compilation)
        - Tailwind CSS (via CDN for styling)
        - FontAwesome (for icons)

        RULES:
        1. OUTPUT: A SINGLE HTML file containing everything.
        2. STRUCTURE: Use functional React components with Hooks (useState, useEffect, useReducer, useMemo).
        3. DESIGN: "Premium Dark Mode" (Black/Gold/Dark Gray). Modern UI/UX. Use the color palette: #0A0A0A (bg), #D4AF37 (gold/accent), #1E1E1E (cards).
        4. COMPLEXITY: Support nested components and state management. Avoid trivial "Hello World" apps. Build the FULL requested feature set.
        5. RESPONSIVENESS: Ensure the app looks perfect on both Mobile (375px) and Desktop (1920px) viewports. Use Tailwind's responsive prefixes (sm:, md:, lg:).
        6. WRAPPING: Wrap the raw HTML code strictly inside [APP_CODE] and [/APP_CODE] tags.
        
        Response Structure:
        [LOG] Initializing quantum build environment...
        [PLAN] {Brief architectural plan of components and state}
        [APP_CODE]
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            colors: {
                                jap: { gold: '#D4AF37', black: '#0A0A0A', card: '#1E1E1E' }
                            }
                        }
                    }
                }
            </script>
            <style>
                body { background-color: #0A0A0A; color: #ffffff; font-family: sans-serif; }
            </style>
        </head>
        <body>
            <div id="root"></div>
            <script type="text/babel">
                const { useState, useEffect, useMemo, useRef } = React;

                // ... COMPONENTS ...

                const App = () => {
                    return (
                        <div className="min-h-screen bg-jap-black text-white p-4">
                           {/* ... */}
                        </div>
                    );
                };

                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(<App />);
            </script>
        </body>
        </html>
        [/APP_CODE]
        [LOG] Deployment successful. Live preview ready.
        `;
    } else if (mode === 'RESEARCH') {
        systemPrompt = `You are JAP-AGI, a sophisticated autonomous research agent for Japcoin University connected to Quantum Nodes.
        Your goal is to execute the user's mission with high intelligence and precision.
        
        Use this EXACT format for your response:
        
        [LOG] Initializing autonomous protocols...
        [LOG] Connecting to blockchain nodes...
        [THOUGHT] {Describe your reasoning process here}
        [ACTION] {Describe the specific action you are simulating}
        [LOG] Data retrieved successfully.
        
        ... (Repeat thoughts/actions as needed) ...

        [RESULT]
        {The final detailed answer/report in Markdown format}
        `;
    } else if (mode === 'MUSIC_STUDIO') {
        systemPrompt = `You are JAP-PRODUCER, a world-class AI Music Architect.
        Your goal is to simulate the creation of a high-quality music track.
        Use "Studio Log" style output.
        Describe the process of composing, mixing, and mastering in real-time logs.
        Format:
        [LOG] Analyzing genre requirements...
        [LOG] Setting tempo to {BPM}...
        [LOG] Generating drum pattern...
        [LOG] Synthesizing bassline...
        ...
        [RESULT] Track Complete.
        `;
    }

    try {
        const response = await client.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: mission,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7, 
            }
        });

        for await (const chunk of response) {
            if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error) {
        console.error("Agent Stream Error:", error);
        throw error;
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  const client = getClient();
  if (!client) throw new Error("API Key missing");

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

// --- EBOOK GENERATOR ---

export interface EbookPlan {
    title: string;
    subtitle: string;
    marketingHeadline: string;
    summary: string;
    chapters: { title: string; desc: string }[];
}

export const generateEbookStructure = async (topic: string, genre: string, author: string): Promise<EbookPlan | null> => {
    const client = getClient();
    if (!client) return null;

    const prompt = `You are a New York Times Bestselling Editor.
    Create a structure for a world-class book.
    Topic: ${topic}
    Genre: ${genre}
    Author: ${author}

    Generate a catchy, marketable Title and Subtitle.
    Write a 1-sentence Marketing Headline.
    Create a table of contents with 5 high-impact chapters.

    Return JSON: {
        "title": "Main Title",
        "subtitle": "Compelling Subtitle",
        "marketingHeadline": "The hook",
        "summary": "Brief synopsis",
        "chapters": [
            { "title": "Chapter 1 Name", "desc": "What happens" },
            ...
        ]
    }`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Ebook Plan Error", e);
        return null;
    }
};

export const generateChapterContent = async (bookTitle: string, chapterTitle: string, genre: string): Promise<string> => {
    const client = getClient();
    if (!client) return "Error generating chapter.";

    const prompt = `Write the full content for the chapter "${chapterTitle}" of the book "${bookTitle}" (Genre: ${genre}).
    Style: Professional, Engaging, "New York Times Bestseller" quality.
    Formatting: Use Markdown. Use bolding for emphasis. Keep paragraphs readable.
    Length: Comprehensive but concise for a summary edition.`;

    const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });

    return response.text || "";
}

// --- MUSIC GENERATOR (CONCEPT) ---

export interface MusicConcept {
    title: string;
    bpm: number;
    key: string;
    stems: string[];
    description: string;
}

export const generateMusicConcept = async (genre: string, mood: string, promptText: string): Promise<MusicConcept | null> => {
    const client = getClient();
    if (!client) return null;

    const prompt = `You are a Platinum Music Producer.
    Create a detailed concept for a new ${genre} track.
    Mood: ${mood}
    User Prompt: ${promptText}

    Return valid JSON:
    {
        "title": "Creative Track Name",
        "bpm": 128,
        "key": "C Minor",
        "stems": ["Drum Loop", "Bassline", "Synth Lead", "Atmosphere"],
        "description": "A brief description of the sonic texture and vibe."
    }`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Music Concept Error", e);
        return null;
    }
}

// --- COURSE GENERATOR ---

export const generateCoursePlan = async (topic: string, level: string, durationMinutes: number = 45): Promise<any> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");

    const prompt = `Create a structured long-form course plan for a Masterclass video course titled "${topic}" for ${level} level students.
    The course should be designed to cover ${durationMinutes} minutes of content.
    Return ONLY valid JSON in the following format:
    {
      "title": "Course Title",
      "description": "Detailed description of the masterclass",
      "modules": [
        {
          "title": "Module 1 Title",
          "learning_objective": "What they will learn"
        },
        {
          "title": "Module 2 Title",
          "learning_objective": "What they will learn"
        }
      ]
    }`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        return {
            title: topic,
            description: "AI generated curriculum.",
            modules: [{ title: "Deep Dive", learning_objective: "Advanced concepts." }]
        };
    }
};

export const generateLessonScript = async (moduleTitle: string, topic: string, targetDuration: string = '15 minutes'): Promise<string> => {
     const client = getClient();
    if (!client) throw new Error("API Key missing");

    const prompt = `Write a comprehensive, long-form YouTube-style lecture script for a ${targetDuration} video segment about "${moduleTitle}" in the course "${topic}".
    Format it as a speaking script for an AI Avatar. 
    Use a professional, engaging, and educational tone (Synthesia style).
    `;

    const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });

    return response.text || "Script generation failed.";
}

export const generateQuiz = async (moduleTitle: string): Promise<any> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");

    const prompt = `Create a multiple choice question for "${moduleTitle}". JSON: { "question": "", "options": ["A", "B", "C", "D"], "correct": 0 }`;

    try {
         const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        return { question: "Key takeaway?", options: ["A", "B", "C", "D"], correct: 0 };
    }
}

// --- CONTENT ENRICHMENT ---

export interface EnrichmentData {
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  codeSnippet?: {
    language: string;
    code: string;
    description: string;
  };
  keyTakeaway: string;
}

export const enrichModuleContent = async (title: string, content: string): Promise<EnrichmentData | null> => {
  const client = getClient();
  if (!client) return null;

  const prompt = `Analyze the following educational module titled "${title}".
  Content: "${content.substring(0, 2000)}..."

  Generate enrichment data in valid JSON format with these fields:
  1. "quiz": A multiple choice question relevant to the text. fields: "question" (string), "options" (array of 4 strings), "correctIndex" (0-3), "explanation" (string).
  2. "codeSnippet": IF the content is technical (blockchain, coding, math, finance formulas), provide a relevant code snippet or formula. fields: "language" (e.g. Solidity, Python, Math), "code" (string), "description" (string). If not relevant, set to null.
  3. "keyTakeaway": A one-sentence summary of the most critical concept.

  Return ONLY the JSON.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Enrichment failed", e);
    return null;
  }
}

// --- QUANTUM VIDEO ENGINE (CHUNKING & STITCHING) ---

export const chunkScript = async (script: string): Promise<string[]> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");

    const prompt = `You are a Quantum Video Director. 
    Split this script into logical video chapters for generation.
    Return JSON array of strings.
    SCRIPT: ${script.substring(0, 5000)}...`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const chunks = JSON.parse(response.text || "[]");
        return Array.isArray(chunks) && chunks.length > 0 ? chunks : [script];
    } catch (e) {
        return [script];
    }
};

/**
 * Enhanced generation chain using "Quantum" speed polling and retry logic.
 */
export const generateLongVideoChain = async (
    topic: string, 
    scriptChunks: string[], 
    onProgress: (status: string) => void
): Promise<string[]> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");
    
    const videoUrls: string[] = [];
    const activeChunks = scriptChunks.slice(0, 5); // Allow up to 5 chunks for longer videos

    for (let i = 0; i < activeChunks.length; i++) {
        onProgress(`[Quantum Node ${i+1}] Processing Chapter ${i + 1}/${activeChunks.length}...`);
        
        // UPGRADED PROMPT FOR HIGH FIDELITY / YOUTUBER STYLE
        const chunkPrompt = `Hyper-realistic 4K YouTube-style educational video.
        Subject: A professional, charismatic AI Tutor named JapSensei explaining "${topic}".
        Action: Speaking directly to camera, expressive face, hand gestures, blinking, slight head nods.
        Setting: Modern futuristic podcast studio, depth of field, neon accents (Gold/Black).
        Script Context for this segment: "${activeChunks[i].substring(0, 400)}..."
        Shot: Medium close-up, high detail, 85mm lens.
        Lighting: Cinematic studio quality, rim lighting, soft fill.
        Mood: Engaging, intelligent, friendly.`;

        let retries = 0;
        let success = false;
        const maxRetries = 3;

        while (!success && retries <= maxRetries) {
            try {
                // Using the Pro model for best quality
                let operation = await client.models.generateVideos({
                    model: 'veo-3.1-generate-preview',
                    prompt: chunkPrompt,
                    config: {
                        numberOfVideos: 1,
                        resolution: '1080p',
                        aspectRatio: '16:9'
                    }
                });

                // "Quantum" speed polling - start fast, then back off
                let delay = 5000; // Increased initial polling delay slightly
                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    operation = await client.operations.getVideosOperation({ operation: operation });
                    delay = Math.min(delay * 1.5, 10000); // Cap at 10s
                }

                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink && process.env.API_KEY) {
                    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    if (!videoResponse.ok) throw new Error("Video fetch failed");
                    const videoBlob = await videoResponse.blob();
                    videoUrls.push(URL.createObjectURL(videoBlob));
                    onProgress(`[Quantum Node ${i+1}] Rendering Complete.`);
                    success = true;
                } else {
                    throw new Error("No download link returned.");
                }
            } catch (err: any) {
                // Handle Rate Limits (429)
                if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.status === 429) {
                    retries++;
                    if (retries > maxRetries) {
                        console.error(`Failed to generate chunk ${i} after retries`, err);
                        onProgress(`[Quantum Node ${i+1}] Resource Exhausted. Skipping segment.`);
                        break;
                    }
                    const waitTime = retries * 15000; // 15s, 30s, 45s wait
                    onProgress(`[Quantum Node ${i+1}] High Traffic (429). Cooling down for ${waitTime/1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    console.error(`Failed to generate chunk ${i}`, err);
                    onProgress(`[Quantum Node ${i+1}] Error: ${err.message}. Rerouting...`);
                    break; // Non-retriable error, move to next chunk
                }
            }
        }
        
        // Safety buffer between chunks to allow quota refill
        if (i < activeChunks.length - 1) {
             await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    return videoUrls;
};

// Updated Tutor Video function to support "Deep Dive" (multiple chunks)
export const generateTutorVideo = async (title: string, contentSnippet: string): Promise<string[]> => {
    const client = getClient();
    if (!client) throw new Error("API Key missing");

    try {
        // 1. Generate a concise YouTube-style script first to ensure flow
        const scriptPrompt = `You are a YouTube Educator. Write a 2-minute engaging script explaining "${title}" based on this content: "${contentSnippet.substring(0, 500)}...".
        Keep it punchy, conversational, and split it into 3 distinct parts (Intro, Core Concept, Summary).
        Return ONLY the script text, no markdown formatting.`;
        
        const scriptResp = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: scriptPrompt
        });
        const fullScript = scriptResp.text || contentSnippet;

        // 2. Chunk it
        const chunks = await chunkScript(fullScript);
        
        // 3. Generate Chain (simulating long video via playlist)
        // We reuse the robust chain generator
        const videoUrls = await generateLongVideoChain(title, chunks, (status) => console.log(status));
        
        return videoUrls;
    } catch (error) {
         console.error("Deep Dive Gen Error", error);
         throw error;
    }
};

// For backward compatibility (if needed by other components, though we updated CourseViewer)
export const generateAvatarVideo = async (topic: string): Promise<string | null> => {
    const urls = await generateLongVideoChain(topic, [topic], () => {});
    return urls[0] || null;
}
