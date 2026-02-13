
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CourseCard from './components/CourseCard';
import Button from './components/Button';
import AITutor from './components/AITutor';
import CourseViewer from './components/CourseViewer';
import AuthModal from './components/AuthModal';
import Profile from './components/Profile';
import JapIdPage from './components/JapIdPage';
import JapDrive from './components/JapDrive';
import Pricing from './components/Pricing';
import Careers from './components/Careers';
import AIAgentLab from './components/AIAgentLab';
import JapCampus from './components/JapCampus';
import JapcoinPayModal from './components/JapcoinPayModal';
import { Page, User, SubscriptionTier } from './types';
import { MOCK_USER, COURSES } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [user, setUser] = useState<User>(MOCK_USER);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default to guest
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  
  // Meeting State
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [showGuestJoinModal, setShowGuestJoinModal] = useState(false);
  const [guestName, setGuestName] = useState('');

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingUpgradeTier, setPendingUpgradeTier] = useState<SubscriptionTier | null>(null);

  // Hash router simulation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash === 'dashboard') {
        if(isLoggedIn) setCurrentPage(Page.DASHBOARD);
        else window.location.hash = ''; // Redirect to home if not logged in
      } else if (hash === 'profile') {
        if(isLoggedIn) setCurrentPage(Page.PROFILE);
        else window.location.hash = '';
      } else if (hash === 'jap-id') {
        // Access Control: ID is Premium or Certified
        if(isLoggedIn) {
             if (user.subscriptionTier === 'PREMIUM' || user.subscriptionTier === 'CERTIFIED') {
                 setCurrentPage(Page.JAP_ID);
             } else {
                 alert("JAP-ID Verification is available for Premium and Certified tiers. Please upgrade.");
                 setCurrentPage(Page.PRICING);
             }
        } else window.location.hash = '';
      } else if (hash === 'drive') {
        // Access Control: Drive is Certified Only
        if(isLoggedIn) {
            if (user.subscriptionTier === 'CERTIFIED') {
                setCurrentPage(Page.JAP_DRIVE);
            } else {
                alert("JAP Drive is exclusive to the Certified tier. Please upgrade to access.");
                setCurrentPage(Page.PRICING);
            }
        } else window.location.hash = '';
      } else if (hash === 'pricing') {
        setCurrentPage(Page.PRICING);
      } else if (hash === 'courses') {
        setCurrentPage(Page.COURSES);
      } else if (hash === 'careers') {
        setCurrentPage(Page.CAREERS);
      } else if (hash === 'tutor') {
        setCurrentPage(Page.TUTOR);
      } else if (hash === 'ai-lab') {
        setCurrentPage(Page.AI_LAB);
      } else if (hash === 'campus') {
        setCurrentPage(Page.CAMPUS);
      } else if (hash.startsWith('meet/')) {
        // MEETING ROUTE
        const meetingId = hash.split('/')[1];
        setActiveMeetingId(meetingId);
        setCurrentPage(Page.CAMPUS);
        
        // If not logged in, force guest flow
        if (!isLoggedIn) {
            setShowGuestJoinModal(true);
        }
      } else if (hash.startsWith('learning-')) {
        const id = parseInt(hash.split('-')[1]);
        if (!isNaN(id)) {
          setActiveCourseId(id);
          setCurrentPage(Page.LEARNING);
        } else {
          setCurrentPage(Page.COURSES);
        }
      } else {
        setCurrentPage(Page.HOME);
        setActiveMeetingId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoggedIn, user.subscriptionTier]);

  const navigate = (page: Page) => {
    setSearchQuery(''); // Clear search on navigation
    let hash = '';
    switch (page) {
      case Page.DASHBOARD: hash = 'dashboard'; break;
      case Page.PROFILE: hash = 'profile'; break;
      case Page.JAP_ID: hash = 'jap-id'; break;
      case Page.JAP_DRIVE: hash = 'drive'; break;
      case Page.COURSES: hash = 'courses'; break;
      case Page.CAREERS: hash = 'careers'; break;
      case Page.TUTOR: hash = 'tutor'; break;
      case Page.AI_LAB: hash = 'ai-lab'; break;
      case Page.CAMPUS: hash = 'campus'; break;
      case Page.PRICING: hash = 'pricing'; break;
      case Page.LEARNING: 
        if(activeCourseId) hash = `learning-${activeCourseId}`;
        else hash = 'courses';
        break;
      default: hash = '';
    }
    window.location.hash = hash;
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate(Page.DASHBOARD);
  };

  const handleGuestJoin = (e: React.FormEvent) => {
      e.preventDefault();
      if(!guestName.trim()) return;
      
      // Create temporary guest user
      const guestUser: User = {
          ...MOCK_USER,
          id: `guest-${Date.now()}`,
          name: guestName,
          avatar: `https://ui-avatars.com/api/?name=${guestName}&background=random`,
          subscriptionTier: 'STANDARD',
          japBalance: 0,
          isVerified: false
      };
      
      setUser(guestUser);
      setIsLoggedIn(true); // Treat as logged in for the session
      setShowGuestJoinModal(false);
      // Already on CAMPUS page due to route
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate(Page.HOME);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && currentPage !== Page.COURSES) {
      window.location.hash = 'courses';
    }
  };

  const handleStartCourse = (id: number) => {
    if (!isLoggedIn) {
        setShowAuthModal(true);
        return;
    }

    // Access Control: Standard limit
    if (user.subscriptionTier === 'STANDARD') {
        // Check if course is already completed or if they are under limit
        const isCompleted = user.completedCourses.includes(id);
        const activeCount = user.completedCourses.length + (activeCourseId && activeCourseId !== id ? 1 : 0);
        
        if (!isCompleted && activeCount >= 3) {
            alert("Standard Plan is limited to 3 courses. Upgrade to access more content.");
            navigate(Page.PRICING);
            return;
        }
    }

    setActiveCourseId(id);
    window.location.hash = `learning-${id}`;
  };

  const handleCompleteCourse = () => {
    // In a real app, verify all modules are done
    if (activeCourseId && !user.completedCourses.includes(activeCourseId)) {
      const course = COURSES.find(c => c.id === activeCourseId);
      if (course) {
          setUser(prev => ({
              ...prev,
              japBalance: prev.japBalance + course.reward,
              completedCourses: [...prev.completedCourses, activeCourseId]
          }));
          alert(`Congratulations! You earned ${course.reward} JAP.`);
      }
    }
    navigate(Page.DASHBOARD);
  };

  const handleUpgradeRequest = (tier: SubscriptionTier) => {
      if (tier === 'STANDARD') {
           // Downgrade case
           if(confirm('Switch to Standard (Free)?')) {
               setUser(prev => ({ ...prev, subscriptionTier: tier }));
               navigate(Page.DASHBOARD);
           }
      } else {
           // Paid tiers -> Open Modal
           setPendingUpgradeTier(tier);
           setShowPaymentModal(true);
      }
  };

  const handlePaymentConfirm = (method: string) => {
      if (!pendingUpgradeTier) return;
      
      let bonus = 0;
      if (pendingUpgradeTier === 'PREMIUM') bonus = 5000;
      if (pendingUpgradeTier === 'CERTIFIED') bonus = 20000;
      
      setUser(prev => ({
          ...prev,
          subscriptionTier: pendingUpgradeTier,
          japBalance: prev.japBalance + bonus
      }));
      
      const newTier = pendingUpgradeTier;
      setPendingUpgradeTier(null);
      setShowPaymentModal(false);

      alert(`Payment successful via ${method}! Welcome to ${newTier} tier. ${bonus} JAP bonus added to your wallet.`);
      navigate(Page.DASHBOARD);
  };

  const handleAiUsage = (type: 'APP' | 'WEBSITE') => {
      setUser(prev => ({
          ...prev,
          appsCreated: type === 'APP' ? (prev.appsCreated || 0) + 1 : prev.appsCreated,
          websitesCreated: type === 'WEBSITE' ? (prev.websitesCreated || 0) + 1 : prev.websitesCreated
      }));
  };

  const renderHome = () => (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          
          {/* Main Branding Header - Animated */}
          <div className="mb-12 animate-slide-in">
             <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-jap-gold via-white to-jap-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
               JAPCOIN UNIVERSITY
             </h1>
             <p className="text-jap-gold font-bold tracking-[0.5em] uppercase mt-4 text-lg border-l-4 border-jap-gold pl-4 ml-1">
               Mint Your Future
             </p>
          </div>

          <div className="mt-8">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-jap-gold/10 px-3 py-1 text-sm font-semibold leading-6 text-jap-gold ring-1 ring-inset ring-jap-gold/20">
                New Season Live
              </span>
            </a>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Learn Web3. <br/>
            <span className="text-jap-gold">Earn JAP.</span> <br/>
            Build the Future.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Japcoin University is the premier decentralized education platform. Master Solidity, DeFi, and Trading while earning real crypto rewards for every milestone.
          </p>
          <div className="mt-10 flex flex-col items-start gap-y-6">
             <div className="flex items-center gap-x-6">
                <Button onClick={() => navigate(Page.COURSES)}>Start Masterclass</Button>
                <Button variant="outline" onClick={() => navigate(Page.TUTOR)}>Chat with AI Tutor</Button>
             </div>
             <div className="flex items-center gap-x-6">
                <Button 
                   className="!bg-green-500 !text-black !font-bold hover:!bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all border-none"
                   onClick={() => navigate(Page.AI_LAB)}
                >
                   Create Apps & Websites using JAP-AI
                </Button>
                <Button variant="secondary" onClick={() => navigate(Page.PRICING)}>
                   University Plans
                </Button>
             </div>
          </div>
        </div>
        
        {/* Animated Logo and Slogan Section */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="relative flex flex-col items-center justify-center p-10">
                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-jap-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                {/* Logo SVG */}
                <svg className="w-80 h-80 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)] animate-float" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="goldGradient" x1="50" y1="50" x2="150" y2="150" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#D4AF37" />
                        <stop offset="0.5" stopColor="#F4C430" />
                        <stop offset="1" stopColor="#D4AF37" />
                        </linearGradient>
                    </defs>

                    {/* Laurel Wreath Left */}
                    <path d="M40 140C40 140 20 100 50 60" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M40 140C40 140 30 160 50 170" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
                    {/* Laurel Wreath Right */}
                    <path d="M160 140C160 140 180 100 150 60" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M160 140C160 140 170 160 150 170" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
                    
                    {/* Shield */}
                    <path d="M100 220C150 190 180 140 180 90V40L100 10L20 40V90C20 140 50 190 100 220Z" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="3"/>
                    
                    {/* Inner Circuit Details */}
                    <circle cx="100" cy="100" r="50" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 2" opacity="0.5"/>
                    <circle cx="100" cy="100" r="60" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3"/>
                    
                    {/* Graduation Cap */}
                    <path d="M100 10L160 35L100 60L40 35L100 10Z" fill="#D4AF37"/>
                    <path d="M160 35V65" stroke="#D4AF37" strokeWidth="2"/>
                    <circle cx="160" cy="65" r="3" fill="#D4AF37"/>

                    {/* Letter J */}
                    <text x="100" y="130" fontSize="80" fontWeight="bold" textAnchor="middle" fill="url(#goldGradient)" fontFamily="serif">J</text>
                </svg>

                {/* Slogan */}
                <div className="mt-8 text-center relative z-10">
                     <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-jap-gold via-white to-jap-gold tracking-widest uppercase" style={{ fontFamily: 'serif' }}>
                        Mint Your Future
                     </h2>
                     <p className="text-jap-gold/60 text-sm mt-2 font-mono tracking-wider">
                        EST. 2026 • BLOCKCHAIN GENESIS
                     </p>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="border-y border-white/5 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
            <div className="grid grid-cols-1 gap-y-8 gap-x-8 text-center sm:grid-cols-3">
                <div className="flex flex-col gap-y-2">
                    <dt className="text-sm leading-6 text-gray-400">Total Value Earned</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">$1.2M+</dd>
                </div>
                <div className="flex flex-col gap-y-2">
                    <dt className="text-sm leading-6 text-gray-400">Active Students</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">4,000+</dd>
                </div>
                <div className="flex flex-col gap-y-2">
                    <dt className="text-sm leading-6 text-gray-400">Courses Completed</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">12,500+</dd>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => {
    const filteredCourses = COURSES.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
              <h2 className="text-3xl font-bold text-white">Available Courses</h2>
              {searchQuery ? (
                <p className="text-jap-gold mt-2">Search results for: "{searchQuery}"</p>
              ) : (
                <p className="text-gray-400 mt-2">Expand your knowledge and your wallet.</p>
              )}
          </div>
        </div>
        
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onEnroll={handleStartCourse} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-jap-card/50 rounded-xl border border-white/5">
            <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">No courses found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search terms.</p>
            <Button variant="outline" className="mt-6" onClick={() => handleSearch('')}>Clear Search</Button>
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Student Dashboard</h2>
        <div className="text-sm bg-jap-card border border-white/10 px-4 py-2 rounded-full flex items-center">
            <span className="text-gray-400 mr-2">Plan:</span>
            <span className="text-jap-gold font-bold">{user.subscriptionTier}</span>
            {user.subscriptionTier === 'STANDARD' && (
                <button 
                  onClick={() => navigate(Page.PRICING)}
                  className="ml-3 text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
                >
                  Upgrade
                </button>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Wallet Widget */}
        <div className="bg-gradient-to-br from-jap-card to-black p-6 rounded-xl border border-jap-gold/20 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-24 h-24 text-jap-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.72 2.13-1.71 0-1.22-1.18-1.54-2.81-1.82l-.63-.11c-2.01-.35-3.52-1.14-3.52-3.12 0-1.72 1.35-2.83 3.11-3.26V4h2.67v1.9c1.67.35 2.94 1.49 3.09 3.25h-1.92c-.11-.78-1.11-1.52-2.31-1.52-1.21 0-1.95.74-1.95 1.63 0 1.05 1.09 1.42 2.62 1.69l.65.11c1.93.34 3.71 1.15 3.71 3.28 0 1.77-1.37 2.92-3.18 3.25z"/></svg>
            </div>
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Earnings</h3>
            <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-jap-gold">{user.japBalance.toLocaleString()}</span>
                <span className="ml-2 text-xl text-gray-400">JAP</span>
            </div>
            <div className="mt-4">
                <Button variant="outline" className="text-xs py-2 px-3">View History</Button>
            </div>
        </div>

        {/* JAP-ID Digital Passport Widget */}
        <div className="relative group perspective-1000 lg:col-span-1 cursor-pointer" onClick={() => navigate(Page.JAP_ID)}>
          <div className="bg-gradient-to-r from-gray-900 via-jap-black to-gray-900 p-6 rounded-xl border border-white/10 relative overflow-hidden hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 transform hover:-translate-y-1">
            {/* Holographic sheen effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundSize: '200% 200%'}}></div>
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-jap-gold text-sm font-bold uppercase tracking-widest flex items-center">
                 <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                 </svg>
                 JAP-ID Passport
              </h3>
              {user.isVerified ? (
                <span className="bg-green-900/50 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/30 uppercase font-bold tracking-wider">Verified</span>
              ) : (
                <span className="bg-red-900/50 text-red-400 text-[10px] px-2 py-1 rounded border border-red-500/30 uppercase font-bold tracking-wider">Unverified</span>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Student Name</div>
                <div className="text-white font-mono text-sm">{user.name}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Decentralized ID (DID)</div>
                <div className="text-gray-300 font-mono text-xs truncate opacity-70 group-hover:opacity-100 transition-opacity">
                  {user.japId || 'Minting required...'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
               <div className="h-8 w-8 bg-white p-0.5 rounded-sm">
                 {/* QR Code Simulation */}
                 <div className="w-full h-full bg-black flex flex-wrap content-start">
                    {[...Array(16)].map((_,i) => <div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}></div>)}
                 </div>
               </div>
               <div className="text-[10px] text-jap-gold text-right">
                 ISSUER: JAPCOIN UNIVERSITY<br/>
                 VALID: PERMANENT
               </div>
            </div>
            
            {/* Lock Overlay for Standard */}
            {user.subscriptionTier === 'STANDARD' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-black border border-jap-gold/50 px-3 py-1 rounded-full flex items-center text-jap-gold text-xs font-bold shadow-lg">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        PREMIUM
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Progress Widget */}
        <div className="bg-jap-card p-6 rounded-xl border border-white/5 lg:col-span-1">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Course Progress</h3>
            <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Completed</span>
                    <span className="text-jap-gold font-bold">{user.completedCourses.length} / 4</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-jap-gold h-2 rounded-full" style={{ width: `${(user.completedCourses.length / 4) * 100}%` }}></div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    {user.subscriptionTier === 'STANDARD' && user.completedCourses.length >= 3 
                        ? "You've reached the Standard plan limit. Upgrade to continue."
                        : "Keep going! Master the blockchain."
                    }
                </p>
            </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-6">Enrolled Courses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSES.filter(c => c.progress !== undefined).map(course => (
              <CourseCard key={course.id} course={course} onEnroll={handleStartCourse} />
          ))}
      </div>
    </div>
  );

  const renderTutor = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">AI Crypto Tutor</h2>
            <p className="text-gray-400">Powered by Google Gemini. Ask anything about the blockchain.</p>
        </div>
        <AITutor />
    </div>
  );

  const renderLearning = () => {
    const course = COURSES.find(c => c.id === activeCourseId);
    if (!course) return <div>Course not found</div>;

    return (
      <CourseViewer 
        course={course} 
        onBack={() => navigate(Page.COURSES)} 
        onComplete={handleCompleteCourse}
      />
    );
  };

  return (
    <div className="min-h-screen bg-jap-black text-gray-100 font-sans selection:bg-jap-gold selection:text-black">
      {/* Hide navbar on learning mode for immersion */}
      {currentPage !== Page.LEARNING && (
        <Navbar 
            currentPage={currentPage} 
            onNavigate={navigate} 
            onSearch={handleSearch} 
            searchQuery={searchQuery}
            onOpenAuth={() => setShowAuthModal(true)}
            user={user} 
            isLoggedIn={isLoggedIn}
        />
      )}
      
      <main className="fade-in">
        {currentPage === Page.HOME && renderHome()}
        {currentPage === Page.DASHBOARD && renderDashboard()}
        {currentPage === Page.PROFILE && <Profile user={user} onUpdateUser={setUser} onLogout={handleLogout} />}
        {currentPage === Page.JAP_ID && <JapIdPage user={user} />}
        {currentPage === Page.JAP_DRIVE && <JapDrive />}
        {currentPage === Page.COURSES && renderCourses()}
        {currentPage === Page.TUTOR && renderTutor()}
        {currentPage === Page.AI_LAB && <AIAgentLab user={user} onUsage={handleAiUsage} />}
        {currentPage === Page.CAMPUS && (
            <JapCampus 
                user={user} 
                onUpdateUser={setUser} 
                initialMeetingId={activeMeetingId || undefined}
            />
        )}
        {currentPage === Page.PRICING && <Pricing currentTier={user.subscriptionTier} onUpgrade={handleUpgradeRequest} />}
        {currentPage === Page.CAREERS && <Careers />}
        {currentPage === Page.LEARNING && renderLearning()}
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      {/* Guest Join Modal */}
      {showGuestJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
              <div className="bg-jap-card border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-jap-gold rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <h2 className="text-2xl font-bold text-white">Join Meeting</h2>
                      <p className="text-gray-400 text-sm mt-1">Enter your name to join the call.</p>
                  </div>
                  <form onSubmit={handleGuestJoin}>
                      <input 
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Your Name (e.g. Guest123)"
                          className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-jap-gold outline-none mb-4"
                          autoFocus
                      />
                      <Button fullWidth type="submit" disabled={!guestName.trim()}>Join Now</Button>
                  </form>
              </div>
          </div>
      )}

      {/* Japcoin Pay Modal */}
      <JapcoinPayModal 
         isOpen={showPaymentModal}
         tier={pendingUpgradeTier}
         onClose={() => setShowPaymentModal(false)}
         onConfirm={handlePaymentConfirm}
      />

      {currentPage !== Page.LEARNING && (
        <footer className="bg-jap-black border-t border-white/5 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <p>© 2026 Japcoin University. All rights reserved.</p>
                <a href="mailto:admin@japcoin.co.uk" className="text-jap-gold hover:text-white transition-colors font-medium mt-1 inline-block">
                  admin@japcoin.co.uk
                </a>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-3 max-w-3xl">
                  <a href="https://japcoin.net" target="_blank" rel="noopener noreferrer" className="hover:text-jap-gold transition-colors">Japcoin Web3</a>
                  <a href="https://www.japcoinx.com" target="_blank" rel="noopener noreferrer" className="hover:text-jap-gold transition-colors">Exchange</a>
                  <button onClick={() => navigate(Page.CAREERS)} className="hover:text-jap-gold transition-colors">Careers</button>
                  
                  <span className="hidden sm:inline text-gray-700">|</span>
                  
                  <a href="https://facebook.com/japcoinx" target="_blank" rel="noopener noreferrer" className="hover:text-jap-gold transition-colors">Facebook</a>
                  <a href="https://Instagram.com/japcoinx" target="_blank" rel="noopener noreferrer" className="hover:text-jap-gold transition-colors">Instagram</a>
                  <a href="https://discord.gg/gqGpaa8fXR" target="_blank" rel="noopener noreferrer" className="hover:text-jap-gold transition-colors">Discord</a>
                  <a href="https://t.me/japcoincrypto" target="_blank" rel="noopener noreferrer" className="hover:text-jap-gold transition-colors">Telegram</a>
                  
                  <span className="hidden sm:inline text-gray-700">|</span>
                  
                  <a href="#" className="hover:text-jap-gold transition-colors">Terms</a>
                  <a href="#" className="hover:text-jap-gold transition-colors">Privacy</a>
              </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
