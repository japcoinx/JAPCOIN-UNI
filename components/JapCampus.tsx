import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import Button from './Button';
import { JAP_REWARDS_CONTRACT_CODE, JAP_DRIVE_MESSAGES_CONTRACT_CODE, JAP_CAMPUS_REWARDS_CONTRACT_CODE, JAP_CAMPUS_BADGES_CONTRACT_CODE, JAP_MENTOR_REGISTRY_CONTRACT_CODE, JAP_USAGE_TRACKER_CONTRACT_CODE, JAP_STICKER_NFT_CONTRACT_CODE, JAP_CONTRACT_ADDRESS } from '../constants';
import { generateImage } from '../services/geminiService';

interface JapCampusProps {
  user: User;
  onUpdateUser?: (user: User) => void;
  initialMeetingId?: string;
}

interface Message {
  id: string;
  sender: string;
  senderWallet?: string; // For identifying unique senders in P2P
  recipient?: string; // Added for DM logic
  avatar: string;
  content: string;
  timestamp: number;
  isRewardTrigger?: boolean;
  isBadgeTrigger?: boolean;
  contentHash?: string;
  isDm?: boolean;
  encrypted?: boolean; // New: E2EE flag
  isViewOnce?: boolean; // New: Disappearing message flag
  viewed?: boolean;     // New: Has it been opened?
  attachment?: {
      name: string;
      type: 'image' | 'file' | 'audio';
      url: string;
      encrypted: boolean;
      duration?: number;
  };
}

interface OnlineMember {
    id: string;
    name: string;
    walletAddress: string; // Required for P2P routing
    role: string; // 'Bot', 'Admin', 'Student'
    tier?: 'STANDARD' | 'PREMIUM' | 'CERTIFIED';
    avatar?: string;
    color?: string; // Text color class for special roles
    status: 'online' | 'busy' | 'away' | 'offline';
}

// Integrated ChatPreview Interface from backend
interface ChatPreview {
  user: string;
  lastMessage: string;
  unread: boolean;
  unreadCount: number; // Added count
  memberDetails?: OnlineMember; // Enriched data for UI
  isTyping?: boolean; // New: Typing status for inbox
}

interface CallParticipant {
    id: string;
    name: string;
    avatar: string;
    isMuted: boolean; // Their mic status (signaled from them)
    isVideoOff: boolean;
    isSpeaking: boolean;
    stream?: MediaStream; // In a real app, this would be the WebRTC remote stream
    isLocallyMuted?: boolean; // If I muted them for myself
}

type CallStatus = 'IDLE' | 'OUTGOING' | 'INCOMING' | 'CONNECTED';
type CallType = 'AUDIO' | 'VIDEO';

const CHANNELS = [
  { id: 'general', name: 'General Lounge', icon: '#' },
  { id: 'smart-contracts', name: 'Smart Contracts', icon: '{}' },
  { id: 'security-audits', name: 'Blockchain Security Audits', icon: '🔒' },
  { id: 'layer-2', name: 'L2 Scaling Solutions', icon: '🔗' },
  { id: 'trading-signals', name: 'Trading Signals', icon: '📈' },
  { id: 'governance', name: 'Governance DAO', icon: '⚖️' },
  { id: 'off-topic', name: 'Off Topic', icon: '☕' },
];

const MOCK_ONLINE_MEMBERS: OnlineMember[] = [
    { id: 'bot', name: 'JapSensei', walletAddress: '0xAI...BOT', role: 'Bot • Validator', color: 'text-jap-gold', avatar: 'AI', status: 'online' },
    { id: 'admin', name: 'Deployer', walletAddress: '0xDeployer...1', role: 'Admin', color: 'text-blue-400', avatar: 'D', status: 'busy' },
    { id: 'u2', name: 'Alice_DeFi', walletAddress: '0xAlice...2', role: 'Student', tier: 'CERTIFIED', status: 'online' },
    { id: 'u3', name: 'Bob_Builder', walletAddress: '0xBob...3', role: 'Student', tier: 'PREMIUM', status: 'away' },
    { id: 'u4', name: 'Charlie_Hodl', walletAddress: '0xCharlie...4', role: 'Student', tier: 'STANDARD', status: 'online' },
    { id: 'u5', name: 'Dave_Degen', walletAddress: '0xDave...5', role: 'Student', tier: 'STANDARD', status: 'online' },
];

const COMMON_EMOJIS = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
    "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
    "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
    "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓",
    "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄",
    "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵",
    "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠",
    "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽",
    "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀",
    "😿", "𘘾", "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏",
    "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️",
    "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲",
    "🤝", "🙏", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂",
    "🦻", "👃", "🫀", "🫁", "🧠", "🦷", "🦴", "👀", "👁", "👅",
    "👄", "🚀", "💎", "🌕", "📉", "📈", "🐂", "🐻", "💸", "💰",
    "💳", "🔥", "💯", "✨", "🎉", "🔒", "🔑", "🛡️", "📜", "⚖️"
];

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Mock Encryption Service for Visuals
const mockEncrypt = (text: string) => {
    // In a real app, this would use SubtleCrypto with the recipient's public key
    return `🔒[ENC]${btoa(text)}`;
};

const mockDecrypt = (text: string) => {
    if (text.startsWith('🔒[ENC]')) {
        return atob(text.replace('🔒[ENC]', ''));
    }
    return text;
};

// AI Sticker Modal Component
const AIStickerModal: React.FC<{ onGenerate: (prompt: string, style: string) => Promise<void>; onClose: () => void }> = ({ onGenerate, onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("futuristic");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
      if(!prompt.trim()) return;
      setLoading(true);
      await onGenerate(prompt, style);
      setLoading(false);
      onClose();
  }

  return (
    <div className="absolute bottom-14 left-0 z-50 w-72 p-4 bg-black/90 backdrop-blur-xl rounded-2xl border border-jap-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-fade-in">
      <div className="flex justify-between items-center mb-3">
          <h3 className="text-jap-gold font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI Sticker Studio
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>
      <input
        className="w-full p-3 rounded-lg bg-gray-900 border border-white/10 text-white text-xs focus:border-jap-gold outline-none mb-3 placeholder-gray-600"
        placeholder="Describe your sticker..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        autoFocus
      />
      <div className="grid grid-cols-3 gap-2 mb-3">
        {['Futuristic', 'Anime', 'Meme'].map(s => (
            <button
                key={s}
                onClick={() => setStyle(s.toLowerCase())}
                className={`text-[10px] py-1.5 rounded border transition-all ${style === s.toLowerCase() ? 'bg-jap-gold text-black border-jap-gold font-bold' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
            >
                {s}
            </button>
        ))}
      </div>
      <button
        className="w-full bg-gradient-to-r from-jap-gold to-yellow-600 text-black font-bold p-2.5 rounded-lg text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3 w-3 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generating...
            </span>
        ) : 'Generate Sticker ✨'}
      </button>
    </div>
  );
}

const WS_URL = 'ws://localhost:9090'; // P2P Relay Server

const JapCampus: React.FC<JapCampusProps> = ({ user, onUpdateUser, initialMeetingId }) => {
  // State from previous context
  const [activeChannel, setActiveChannel] = useState('general');
  const [activeDmUser, setActiveDmUser] = useState<OnlineMember | null>(null);
  const [openDms, setOpenDms] = useState<OnlineMember[]>([]); 
  const [inbox, setInbox] = useState<ChatPreview[]>([]); 
  const [viewMode, setViewMode] = useState<'CHANNEL' | 'DM' | 'PROTOCOL'>('CHANNEL');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [pinnedChannelIds, setPinnedChannelIds] = useState<Set<string>>(new Set());
  const [pinnedDmIds, setPinnedDmIds] = useState<Set<string>>(new Set());

  const [lastRead, setLastRead] = useState<Record<string, number>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const lastTypingSentRef = useRef<number>(0);
  
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAction, setWalletAction] = useState<'STAKE' | 'UNSTAKE'>('STAKE');
  const [stakeAmount, setStakeAmount] = useState('');

  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [isViewOnceMode, setIsViewOnceMode] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null); 

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const [activeProtocolCode, setActiveProtocolCode] = useState<'REWARDS' | 'STORAGE' | 'CAMPUS' | 'BADGES' | 'MENTOR' | 'USAGE'>('REWARDS');
  
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');

  // Call State
  const [callStatus, setCallStatus] = useState<CallStatus>('IDLE');
  const [callType, setCallType] = useState<CallType>('VIDEO');
  const [incomingCallInfo, setIncomingCallInfo] = useState<{ user: OnlineMember, type: CallType } | null>(null);
  const [isGroupCall, setIsGroupCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Satoshi (AI Bot)',
      avatar: 'https://ui-avatars.com/api/?name=Satoshi&background=random',
      content: 'Welcome to JAP Campus! This is a decentralized messaging protocol. Every helpful contribution earns you JAP tokens.',
      timestamp: Date.now() - 100000,
      contentHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
    },
    {
        id: '2',
        sender: 'Vitalik_Fan',
        avatar: 'https://ui-avatars.com/api/?name=Vitalik&background=random',
        content: 'Has anyone checked the new Governance proposal?',
        timestamp: Date.now() - 50000,
        contentHash: 'QmZ4tDuvesjQkDDP1mXWo6ucoXoypizjW3WknFiJnKLwHC'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // Handle Initial Meeting ID (Deep link join)
  useEffect(() => {
      if (initialMeetingId && callStatus === 'IDLE') {
          joinMeeting(initialMeetingId);
      }
  }, [initialMeetingId]);

  // Bind local stream to video element when it changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus, isScreenSharing]);

  // Cleanup stream on unmount
  useEffect(() => {
      return () => {
          if (localStream) {
              localStream.getTracks().forEach(track => track.stop());
          }
      };
  }, []);

  // Simulate Incoming Messages for Unread Notifications
  useEffect(() => {
    const interval = setInterval(() => {
        // Pick a random user to send a message
        const randomUser = MOCK_ONLINE_MEMBERS[Math.floor(Math.random() * MOCK_ONLINE_MEMBERS.length)];
        
        // Don't notify if it's me or the person I'm currently talking to
        if (randomUser.id !== user.id && activeDmUser?.id !== randomUser.id) {
            setUnreadCounts(prev => ({
                ...prev,
                [randomUser.id]: (prev[randomUser.id] || 0) + 1
            }));
        }
    }, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, [activeDmUser, user.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');
    
    // Encrypt content if it's a DM
    const isDm = viewMode === 'DM';
    const contentToStore = isDm ? mockEncrypt(currentInput) : currentInput;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: user.name,
      recipient: isDm && activeDmUser ? activeDmUser.name : undefined,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`,
      content: contentToStore,
      timestamp: Date.now(),
      isDm: isDm,
      encrypted: isDm, // Flag as encrypted
      isViewOnce: isViewOnceMode,
      viewed: false
    };
    setMessages(prev => [...prev, newMessage]);
    setIsViewOnceMode(false);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Implementation placeholder
  };
  
  const startRecording = async () => { setIsRecording(true); };
  const cancelRecording = () => { setIsRecording(false); };
  const sendVoiceNote = () => { setIsRecording(false); };
  const handleStickerGenerate = async (p: string, s: string) => { };
  
  // Start a new group meeting
  const createMeeting = () => {
      const newId = `meet-${Math.floor(10000 + Math.random() * 90000)}`;
      setMeetingId(newId);
      window.location.hash = `meet/${newId}`; // Update URL so user can copy it
      startCall('VIDEO', true, newId);
  };

  const joinMeeting = (id: string) => {
      setMeetingId(id);
      startCall('VIDEO', true, id);
  };

  const startCall = async (t: CallType, g: boolean, mId?: string) => {
      setCallStatus('CONNECTED');
      setCallType(t);
      setIsGroupCall(g);
      if(mId) setMeetingId(mId);

      try {
          // Request camera access
          const constraints = t === 'VIDEO' ? { video: true, audio: true } : { audio: true, video: false };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setLocalStream(stream);
          setCallParticipants([{id: user.id, name: user.name, avatar: user.avatar || '', isMuted: false, isVideoOff: t === 'AUDIO', isSpeaking: false, stream: stream}]);
          
          // Simulate other users joining
          if (g) {
              // Group Logic (Wait for users)
              setTimeout(() => {
                  setCallParticipants(prev => [ ...prev, {id: 'mock1', name: 'Alice_DeFi', avatar: '', isMuted: false, isVideoOff: false, isSpeaking: false} ]);
              }, 2000);
          } else if (activeDmUser) {
              // P2P Logic (Direct connect to selected user)
              console.log(`[WebRTC] Initiating P2P Signaling with ${activeDmUser.walletAddress}...`);
              setTimeout(() => {
                  setCallParticipants(prev => [ 
                      ...prev, 
                      {
                          id: activeDmUser.id, 
                          name: activeDmUser.name, 
                          avatar: activeDmUser.avatar || '', 
                          isMuted: false, 
                          isVideoOff: t === 'AUDIO', // Match caller
                          isSpeaking: false
                      } 
                  ]);
              }, 1500); // Simulate network delay/answer
          }

      } catch (e) {
          console.error("Camera access denied or unavailable", e);
          // Allow starting without camera if denied
          setCallParticipants([{id: user.id, name: user.name, avatar: user.avatar || '', isMuted: false, isVideoOff: true, isSpeaking: false}]);
      }
  };

  const acceptCall = async () => {};
  const rejectCall = () => { setCallStatus('IDLE'); };
  
  const endCall = () => { 
      setCallStatus('IDLE'); 
      if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
      }
      setIsScreenSharing(false);
      setCallParticipants([]); 
      setMeetingId(null);
      window.location.hash = 'campus';
  };

  const toggleMute = () => { setIsMuted(!isMuted); };
  const toggleVideo = () => { setIsCameraOff(!isCameraOff); };
  
  const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // Stop sharing
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            setIsScreenSharing(false);
            // Revert to camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                setCallParticipants(prev => prev.map(p => p.id === user.id ? { ...p, stream } : p));
            } catch (e) { console.error("Failed to revert to camera", e); }
        } else {
            // Start sharing
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setLocalStream(stream);
                setIsScreenSharing(true);
                setCallParticipants(prev => prev.map(p => p.id === user.id ? { ...p, stream } : p));
                
                // Handle user clicking "Stop sharing" on browser native UI
                stream.getVideoTracks()[0].onended = () => {
                     setIsScreenSharing(false);
                     // Re-acquire camera
                     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(camStream => {
                         setLocalStream(camStream);
                         setCallParticipants(prev => prev.map(p => p.id === user.id ? { ...p, stream: camStream } : p));
                     }).catch(e => console.error(e));
                };
            } catch (e) { console.error("Screen share failed/cancelled", e); }
        }
  };

  const copyMeetingLink = () => {
      if (meetingId) {
          const url = `https://japcoin.co.uk/#meet/${meetingId}`;
          navigator.clipboard.writeText(url);
          alert("Meeting link copied to clipboard!");
      }
  };

  const handleSwitchToDm = (member: OnlineMember) => {
      setViewMode('DM');
      setActiveDmUser(member);
      setIsMobileMenuOpen(false); // Close mobile drawer
      // Clear unread for this user
      setUnreadCounts(prev => ({
          ...prev,
          [member.id]: 0
      }));
  };

  const handleSwitchToChannel = (channelId: string) => {
      setViewMode('CHANNEL');
      setActiveChannel(channelId);
      setActiveDmUser(null);
      setIsMobileMenuOpen(false); // Close mobile drawer
  };

  const toggleRemoteMute = (id: string) => {};
  const handleStake = () => {};
  const handleFollowToggle = (id: string) => {};
  const togglePinChannel = (e: any, id: string) => {};
  const togglePinDm = (e: any, id: string) => {};
  const handleCloseViewOnce = () => setViewingMessage(null);
  const getContractCode = () => '';
  const renderProtocolTab = () => null;

  const renderCallInterface = () => {
    const isP2P = !isGroupCall && callParticipants.length <= 2;

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-fade-in">
            {/* Call Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-800 p-2 rounded-full border border-white/10">
                        {callType === 'VIDEO' ? (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            End-to-End Encrypted {isP2P ? 'P2P' : 'Group'} Call
                            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        </h3>
                        {meetingId ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <span>ID: {meetingId}</span>
                                <button onClick={copyMeetingLink} className="text-jap-gold hover:underline flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    Copy Link
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">Secure Line with {activeDmUser?.name}</p>
                        )}
                    </div>
                </div>
                <div className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-mono animate-pulse border border-red-500/20">
                    LIVE
                </div>
            </div>

            {/* Video Grid - Adaptive Layout */}
            <div className={`flex-1 p-4 flex items-center justify-center ${
                isP2P ? 'flex-col sm:flex-row gap-4' : 
                callParticipants.length <= 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'
            }`}>
                
                {/* For P2P, Make Remote Larger */}
                {isP2P ? (
                    <>
                        {/* Remote (Big) */}
                        {callParticipants.filter(p => p.id !== user.id).map(participant => (
                            <div key={participant.id} className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center w-full max-w-4xl flex-1 h-full max-h-[80vh]">
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-full bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-indigo-400">
                                        {participant.name.charAt(0)}
                                    </div>
                                    <p className="text-white font-bold text-xl">{participant.name}</p>
                                    <p className="text-gray-400 text-sm mt-1">{callType === 'AUDIO' ? 'Audio Connected' : 'Camera Off'}</p>
                                </div>
                                
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <div className="text-white text-sm font-bold bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                                        {participant.name}
                                    </div>
                                    {participant.isMuted && <div className="bg-red-600 p-1.5 rounded-lg text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg></div>}
                                </div>
                            </div>
                        ))}
                        
                        {/* Local (Small PIP style if P2P video) */}
                        <div className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/20 group transition-all ${callType === 'AUDIO' ? 'hidden' : 'w-32 h-48 sm:w-48 sm:h-32 absolute top-20 right-4 sm:static sm:h-auto sm:aspect-video'}`}>
                            {localStream ? (
                                <video 
                                    ref={localVideoRef} 
                                    autoPlay 
                                    muted 
                                    playsInline 
                                    className="w-full h-full object-cover transition-transform duration-300" 
                                    style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white border-2 border-gray-600">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 text-white text-[10px] font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-md">You</div>
                        </div>
                    </>
                ) : (
                    // Group Layout
                    callParticipants.map(participant => (
                        <div key={participant.id} className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video shadow-2xl border border-white/10 flex items-center justify-center h-full">
                             {participant.id === user.id && localStream ? (
                                 <video 
                                    ref={localVideoRef} 
                                    autoPlay 
                                    muted 
                                    playsInline 
                                    className="w-full h-full object-cover transition-transform duration-300" 
                                    style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
                                 />
                             ) : (
                                 <div className="text-center">
                                     <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 ${participant.id === user.id ? 'bg-gray-700 border-gray-500' : 'bg-indigo-600 border-indigo-400'}`}>
                                         {participant.name.charAt(0)}
                                     </div>
                                     <p className="text-white font-bold">{participant.name}</p>
                                 </div>
                             )}
                             
                             <div className="absolute bottom-4 left-4 text-white text-sm font-bold bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                                {participant.id === user.id ? 'You' : participant.name}
                             </div>
                        </div>
                    ))
                )}
                
                {/* Waiting State if empty call */}
                {callParticipants.length === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
                            <div className="w-16 h-16 border-4 border-jap-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white font-bold text-lg mb-2">Calling...</p>
                            <p className="text-gray-400 text-sm">Waiting for peer to connect.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Call Controls */}
            <div className="p-8 pb-12 flex justify-center gap-6 items-center bg-gradient-to-t from-black via-black/80 to-transparent">
                <button onClick={toggleMute} className={`p-4 rounded-full transition-all border border-white/10 ${isMuted ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {isMuted ? (
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                    ) : (
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    )}
                </button>
                
                <button onClick={toggleVideo} className={`p-4 rounded-full transition-all border border-white/10 ${isCameraOff ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {isCameraOff ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                </button>

                <button 
                    onClick={toggleScreenShare} 
                    className={`p-4 rounded-full transition-all border border-white/10 ${isScreenSharing ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-110 border-transparent' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title="Share Screen"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>

                <button onClick={endCall} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transform hover:scale-110 transition-all border border-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
  };

  // Re-filtered lists for render
  const pinnedChannels = CHANNELS.filter(c => pinnedChannelIds.has(c.id));
  const unpinnedChannels = CHANNELS.filter(c => !pinnedChannelIds.has(c.id));
  const pinnedDms = inbox.filter(chat => pinnedDmIds.has(chat.user));
  const unpinnedDms = inbox.filter(chat => !pinnedDmIds.has(chat.user));
  const totalUnread = inbox.reduce((acc, curr) => acc + curr.unreadCount, 0);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-black overflow-hidden relative">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out shrink-0
        md:translate-x-0 md:static md:w-64 md:flex
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Header */}
        <div className="md:hidden p-4 flex justify-between items-center border-b border-white/10">
            <h3 className="text-white font-bold">Menu</h3>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Channels */}
        <div className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Campus Channels</h3>
            <div className="space-y-1">
                {CHANNELS.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => handleSwitchToChannel(channel.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all ${activeChannel === channel.id && viewMode === 'CHANNEL' ? 'bg-jap-gold text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <span className="mr-3 opacity-70">{channel.icon}</span>
                        {channel.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Direct Messages */}
        <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Direct Messages</h3>
                <span className="bg-white/10 text-[10px] px-1.5 py-0.5 rounded text-gray-400">{MOCK_ONLINE_MEMBERS.length - 1}</span>
            </div>
            <div className="space-y-1">
                {MOCK_ONLINE_MEMBERS.filter(m => m.id !== user.id).map(member => (
                    <button
                        key={member.id}
                        onClick={() => handleSwitchToDm(member)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group ${activeDmUser?.id === member.id && viewMode === 'DM' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <div className="flex items-center">
                            <div className="relative mr-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                                    {member.avatar && member.avatar.length > 2 ? <img src={member.avatar} alt={member.name} /> : member.name.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${member.status === 'online' ? 'bg-green-500' : member.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            </div>
                            <div className="text-left">
                                <div className={`font-medium ${activeDmUser?.id === member.id ? 'text-white' : 'group-hover:text-white'}`}>{member.name}</div>
                                <div className="text-[10px] opacity-60">{member.role}</div>
                            </div>
                        </div>
                        
                        {unreadCounts[member.id] > 0 && (
                            <div className="bg-red-600 text-white text-[10px] font-bold px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full animate-bounce">
                                {unreadCounts[member.id]}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      {viewMode === 'PROTOCOL' ? renderProtocolTab() : (
          <div className="flex-1 flex flex-col bg-[#121212] relative min-w-0">
            {(callStatus === 'CONNECTED' || callStatus === 'OUTGOING' || callStatus === 'INCOMING') && renderCallInterface()}

            <div className="h-14 border-b border-white/10 flex items-center px-4 md:px-6 justify-between bg-[#151515]">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden text-gray-400 hover:text-white p-1 -ml-1"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        {/* Unread Indicator on Menu Icon */}
                        {(Object.values(unreadCounts) as number[]).reduce((a, b) => a + b, 0) > 0 && (
                            <div className="absolute top-3 left-7 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#151515]"></div>
                        )}
                    </button>

                    <div className="flex items-center gap-2 truncate">
                        <span className="text-gray-400 text-xl">{viewMode === 'CHANNEL' ? '#' : '@'}</span>
                        <span className="font-bold text-white truncate">
                            {viewMode === 'CHANNEL' ? CHANNELS.find(c => c.id === activeChannel)?.name : activeDmUser?.name}
                        </span>
                    </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-3">
                    {/* P2P Call Buttons (Visible in DM) */}
                    {viewMode === 'DM' && activeDmUser && (
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5 mr-2">
                            <button 
                                onClick={() => startCall('AUDIO', false)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Voice Call (P2P Encrypted)"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </button>
                            <button 
                                onClick={() => startCall('VIDEO', false)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Video Call (P2P Encrypted)"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                    )}

                    {/* Meeting Creator Button (Visible in Channel) */}
                    {viewMode === 'CHANNEL' && (
                        <Button variant="primary" className="text-xs py-1.5 px-3 flex items-center gap-2 whitespace-nowrap shrink-0" onClick={createMeeting}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            <span className="hidden sm:inline">New Meeting</span>
                            <span className="sm:hidden">Meet</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {viewMode === 'DM' && activeDmUser && (
                    <div className="flex flex-col items-center justify-center pb-8 border-b border-white/5 mb-6 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-jap-gold/30 mb-4 overflow-hidden relative">
                            <img 
                                src={activeDmUser.avatar || `https://ui-avatars.com/api/?name=${activeDmUser.name}&background=random`} 
                                className="w-full h-full object-cover"
                                alt={activeDmUser.name}
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{activeDmUser.name}</h3>
                        <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                            This is the beginning of your encrypted direct message history with <span className="text-white font-bold">{activeDmUser.name}</span>.
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3 bg-green-900/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 text-xs font-mono">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            🔒 End-to-End Encrypted
                        </div>
                    </div>
                )}

                {messages.filter(m => {
                    if (viewMode === 'CHANNEL') return !m.isDm; // Public messages
                    if (viewMode === 'DM' && activeDmUser) {
                        // Show DMs between me and selected user
                        return m.isDm && (
                            (m.sender === user.name && m.recipient === activeDmUser.name) ||
                            (m.sender === activeDmUser.name && m.recipient === user.name)
                        );
                    }
                    return false;
                }).map((msg) => (
                    <div key={msg.id} className="flex gap-4 group">
                        <div className="flex-shrink-0 pt-1">
                            <img src={msg.avatar} className="w-10 h-10 rounded-full bg-gray-700 object-cover" alt={msg.sender} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`font-bold text-sm hover:underline cursor-pointer ${
                                    msg.sender === 'JapSensei' ? 'text-jap-gold' : 
                                    msg.sender === user.name ? 'text-green-400' : 'text-white'
                                }`}>
                                    {msg.sender}
                                </span>
                                {msg.sender === 'JapSensei' && <span className="bg-jap-gold text-black text-[10px] px-1 rounded font-bold">BOT</span>}
                                {msg.encrypted && <span className="text-[10px] text-gray-500" title="Encrypted">🔒</span>}
                                <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            
                            {msg.isViewOnce ? (
                                <button 
                                    onClick={() => setViewingMessage(msg)}
                                    disabled={msg.viewed}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${msg.viewed ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-jap-gold animate-pulse"></span>
                                    {msg.viewed ? 'Opened' : 'View Once Message'}
                                </button>
                            ) : msg.attachment ? (
                                <div className="mt-1">
                                    {/* Attachment UI Placeholder */}
                                    <div className="bg-gray-800 p-3 rounded-lg border border-white/10 inline-block">
                                        {msg.attachment.type === 'image' ? 'Image Attachment' : 'File Attachment'}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.encrypted ? mockDecrypt(msg.content) : msg.content}
                                </p>
                            )}

                            {/* Rewards/Badges */}
                            {(msg.isRewardTrigger || msg.isBadgeTrigger) && (
                                <div className="mt-2 flex gap-2">
                                    {msg.isRewardTrigger && (
                                        <div className="inline-flex items-center bg-jap-gold/10 text-jap-gold text-[10px] px-2 py-0.5 rounded border border-jap-gold/20">
                                            <span className="mr-1">💰</span> +5 JAP Earned
                                        </div>
                                    )}
                                    {msg.isBadgeTrigger && (
                                        <div className="inline-flex items-center bg-purple-900/30 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-500/30">
                                            <span className="mr-1">🏅</span> Thought Leader Badge
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#151515] border-t border-white/10 relative">
                {/* Emoji Picker Placeholder */}
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 bg-gray-800 border border-white/10 rounded-lg p-2 shadow-xl grid grid-cols-8 gap-1 w-64 h-48 overflow-y-auto z-20">
                        {COMMON_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }} className="hover:bg-white/10 p-1 rounded text-lg">
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sticker Modal */}
                {showStickerModal && (
                    <AIStickerModal onGenerate={handleStickerGenerate} onClose={() => setShowStickerModal(false)} />
                )}

                {/* Uploads */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                />

                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <div className="flex-1 bg-[#1e1e1e] rounded-xl flex items-center px-2 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                        
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                // Typing indicator logic
                            }}
                            placeholder={viewMode === 'CHANNEL' ? `Message #${activeChannel}` : `Message @${activeDmUser?.name}`}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none px-2 min-w-0"
                        />
                        
                        <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => setShowStickerModal(!showStickerModal)} className="p-1.5 text-gray-400 hover:text-jap-gold transition-colors hidden sm:block" title="AI Sticker">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 text-gray-400 hover:text-yellow-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                            {/* View Once Toggle */}
                            <button 
                                type="button" 
                                onClick={() => setIsViewOnceMode(!isViewOnceMode)} 
                                className={`p-1.5 transition-colors rounded ${isViewOnceMode ? 'text-red-500 bg-red-900/20' : 'text-gray-400 hover:text-red-400'}`}
                                title="View Once Message"
                            >
                                <span className="text-xs font-bold border border-current rounded-full w-5 h-5 flex items-center justify-center">1</span>
                            </button>
                        </div>
                    </div>

                    {input.trim() ? (
                        <button type="submit" className="p-3 bg-jap-gold hover:bg-yellow-500 rounded-full text-black transition-colors shadow-lg shrink-0">
                            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onMouseDown={startRecording} 
                            onMouseUp={sendVoiceNote}
                            onMouseLeave={cancelRecording}
                            className={`p-3 rounded-full transition-all shadow-lg shrink-0 ${isRecording ? 'bg-red-600 text-white animate-pulse scale-110' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {isRecording ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            )}
                        </button>
                    )}
                </form>
                {isRecording && (
                    <div className="absolute -top-12 left-0 right-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                            Recording... {formatDuration(recordingDuration)}
                        </div>
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

export default JapCampus;