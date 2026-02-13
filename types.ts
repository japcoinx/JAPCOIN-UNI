

export interface NFT {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Legendary' | 'Artifact';
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number; // timestamp
}

export interface JapDriveFile {
  id: string;
  name: string;
  type: 'pdf' | 'img' | 'doc' | 'zip' | 'cert';
  size: string;
  cid: string; // IPFS Content Identifier
  uploadedAt: number;
  encrypted: boolean;
}

export type SubscriptionTier = 'STANDARD' | 'PREMIUM' | 'CERTIFIED';

export interface User {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  japBalance: number;
  stakedJap: number; // New: Staked amount
  completedCourses: number[];
  japId?: string; // Decentralized Identifier (DID)
  isVerified?: boolean; // KYC/Humanity Check status
  avatar?: string;
  coverImage?: string;
  headline?: string;
  location?: string;
  bio?: string;
  dateJoined: number; // New: Timestamp
  referralCode: string; // New: Custom code
  referralCount: number; // New: Track successful invites
  nfts: NFT[];
  achievements: Achievement[];
  subscriptionTier: SubscriptionTier;
  appsCreated?: number; // Track App Builder usage
  websitesCreated?: number; // Track Website Builder usage
  ebooksCreated?: number; // Track Ebook Creator usage (Limit 3/mo)
  musicCreated?: number; // Track Music Generator usage (Limit 5/mo)
  
  // AI Mentor Metrics
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  failedQuizCount?: number;
  tradingRiskScore?: number; // 0-100
}

export interface Module {
  id: number;
  title: string;
  content: string; // Supports basic text/markdown
  duration: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  reward: number;
  duration: string;
  image: string;
  progress?: number;
  modules: Module[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Job {
  id: string;
  title: string;
  type: 'Bounty' | 'Part-Time' | 'Ambassador' | 'Core Team';
  category: 'Development' | 'Marketing' | 'Content' | 'Community';
  reward: string; // e.g., "500 JAP / task" or "5000 JAP / mo"
  description: string;
  requirements: string[];
}

export enum Page {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  TUTOR = 'TUTOR',
  LEARNING = 'LEARNING',
  PROFILE = 'PROFILE',
  JAP_ID = 'JAP_ID',
  JAP_DRIVE = 'JAP_DRIVE',
  PRICING = 'PRICING',
  CAREERS = 'CAREERS',
  AI_LAB = 'AI_LAB',
  CAMPUS = 'CAMPUS'
}
