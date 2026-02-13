
import React, { useState } from 'react';
import { Page, User } from '../types';
import Button from './Button';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onOpenAuth: () => void;
  user: User;
  isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onSearch, searchQuery, onOpenAuth, user, isLoggedIn }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItemClass = (page: Page) => 
    `cursor-pointer px-3 py-2 text-sm font-medium transition-colors ${
      currentPage === page ? 'text-jap-gold' : 'text-gray-300 hover:text-white'
    }`;

  const mobileNavItemClass = (page: Page) => 
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      currentPage === page ? 'bg-jap-gold/10 text-jap-gold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
    }`;

  const handleMobileNavigate = (page: Page) => {
    setIsMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <nav className="sticky top-0 z-50 bg-jap-black/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Slogan */}
          <div className="flex items-center cursor-pointer flex-shrink-0 group" onClick={() => onNavigate(Page.HOME)}>
            <div className="h-10 w-10 mr-3 transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">
                    <path d="M100 220C150 190 180 140 180 90V40L100 10L20 40V90C20 140 50 190 100 220Z" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="8"/>
                    <path d="M100 10L160 35L100 60L40 35L100 10Z" fill="#D4AF37"/>
                    <text x="100" y="145" fontSize="80" fontWeight="bold" textAnchor="middle" fill="#D4AF37" fontFamily="serif">J</text>
                </svg>
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Japcoin <span className="text-jap-gold">University</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-jap-gold/80 mt-1.5 font-bold group-hover:text-jap-gold transition-colors duration-300">
                Learn • Earn • Build
              </span>
            </div>
          </div>

          {/* Desktop Nav & Search */}
          <div className="hidden md:flex flex-1 items-center justify-between ml-10 mr-10">
            <div className="flex items-baseline space-x-6">
              <button onClick={() => onNavigate(Page.HOME)} className={navItemClass(Page.HOME)}>Home</button>
              <button onClick={() => onNavigate(Page.COURSES)} className={navItemClass(Page.COURSES)}>Courses</button>
              <button onClick={() => onNavigate(Page.CAMPUS)} className={navItemClass(Page.CAMPUS)}>Campus</button>
              <button onClick={() => onNavigate(Page.AI_LAB)} className={navItemClass(Page.AI_LAB)}>JAP-AI Lab</button>
              
              {isLoggedIn && (
                <>
                  <button onClick={() => onNavigate(Page.DASHBOARD)} className={navItemClass(Page.DASHBOARD)}>Dashboard</button>
                  <button onClick={() => onNavigate(Page.JAP_ID)} className={navItemClass(Page.JAP_ID)}>ID</button>
                  <button onClick={() => onNavigate(Page.JAP_DRIVE)} className={navItemClass(Page.JAP_DRIVE)}>Drive</button>
                </>
              )}
              
              <button onClick={() => onNavigate(Page.CAREERS)} className={navItemClass(Page.CAREERS)}>Careers</button>
              <button onClick={() => onNavigate(Page.TUTOR)} className={navItemClass(Page.TUTOR)}>AI Tutor</button>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="relative max-w-xs w-full ml-4 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500 group-focus-within:text-jap-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-8 py-1.5 border border-white/10 rounded-full leading-5 bg-jap-subtle/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-jap-card focus:border-jap-gold focus:ring-1 focus:ring-jap-gold sm:text-sm transition-all duration-200"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Auth / User Status (Desktop) */}
          <div className="hidden md:block flex-shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                 {/* Upgrade Button for Standard Users */}
                 {user.subscriptionTier === 'STANDARD' && (
                    <button 
                      onClick={() => onNavigate(Page.PRICING)}
                      className="text-xs font-bold bg-gradient-to-r from-jap-gold to-yellow-600 text-black px-3 py-1 rounded animate-pulse hover:animate-none"
                    >
                      Upgrade
                    </button>
                 )}

                 <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate(Page.PROFILE)}>
                    <div className="text-right mr-2">
                      <div className="text-xs text-gray-400">Balance</div>
                      <div className="text-sm font-bold text-jap-gold">{user.japBalance.toLocaleString()} JAP</div>
                    </div>
                    
                    <div className="relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="h-9 w-9 rounded-full object-cover border border-white/10 ring-1 ring-white/5" />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-b from-jap-subtle to-black border border-white/10 flex items-center justify-center text-sm text-white font-medium shadow-inner ring-1 ring-white/5">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        {user.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-jap-black rounded-full p-[1px]">
                            <svg className="w-4 h-4 text-jap-gold" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm4.45 6.45l-3.25 3.25a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.72-2.72a.75.75 0 011.06 1.06z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                    </div>
                 </div>
              </div>
            ) : (
              <Button onClick={onOpenAuth} variant="primary" className="text-xs px-4 py-2">
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-jap-subtle p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-jap-card border-b border-white/10">
          <div className="px-4 pt-4 pb-4 space-y-3">
             {/* Mobile Search */}
             <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-jap-gold"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
             </div>

             <div className="border-t border-white/10 my-2 pt-2">
                 <button onClick={() => handleMobileNavigate(Page.HOME)} className={mobileNavItemClass(Page.HOME)}>Home</button>
                 <button onClick={() => handleMobileNavigate(Page.COURSES)} className={mobileNavItemClass(Page.COURSES)}>Courses</button>
                 <button onClick={() => handleMobileNavigate(Page.CAMPUS)} className={mobileNavItemClass(Page.CAMPUS)}>Campus</button>
                 <button onClick={() => handleMobileNavigate(Page.AI_LAB)} className={mobileNavItemClass(Page.AI_LAB)}>JAP-AI Lab</button>
                 <button onClick={() => handleMobileNavigate(Page.CAREERS)} className={mobileNavItemClass(Page.CAREERS)}>Careers</button>
                 <button onClick={() => handleMobileNavigate(Page.TUTOR)} className={mobileNavItemClass(Page.TUTOR)}>AI Tutor</button>
                 
                 {isLoggedIn && (
                   <>
                     <button onClick={() => handleMobileNavigate(Page.DASHBOARD)} className={mobileNavItemClass(Page.DASHBOARD)}>Dashboard</button>
                     <button onClick={() => handleMobileNavigate(Page.JAP_ID)} className={mobileNavItemClass(Page.JAP_ID)}>ID Passport</button>
                     <button onClick={() => handleMobileNavigate(Page.JAP_DRIVE)} className={mobileNavItemClass(Page.JAP_DRIVE)}>Drive</button>
                     <button onClick={() => handleMobileNavigate(Page.PROFILE)} className={mobileNavItemClass(Page.PROFILE)}>My Profile</button>
                   </>
                 )}
             </div>

             <div className="pt-2 border-t border-white/10">
                {isLoggedIn ? (
                     <div className="flex items-center justify-between px-3 py-2">
                         <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full bg-jap-gold text-black flex items-center justify-center font-bold mr-3">
                                 {user.name.charAt(0)}
                             </div>
                             <div className="text-sm text-white">
                                 <div>{user.name}</div>
                                 <div className="text-jap-gold">{user.japBalance.toLocaleString()} JAP</div>
                             </div>
                         </div>
                     </div>
                ) : (
                     <Button fullWidth onClick={() => { setIsMobileMenuOpen(false); onOpenAuth(); }}>Sign In</Button>
                )}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
