
import React, { useState, useRef } from 'react';
import { User } from '../types';
import Button from './Button';
import { COURSES } from '../constants';

interface ProfileProps {
  user: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editHeadline, setEditHeadline] = useState(user.headline || '');
  const [editLocation, setEditLocation] = useState(user.location || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editAvatar, setEditAvatar] = useState(user.avatar || '');
  const [editCover, setEditCover] = useState(user.coverImage || '');

  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const completedCoursesList = COURSES.filter(c => user.completedCourses.includes(c.id));

  // Referral Calculations
  const MAX_REFERRALS = 200;
  const JAP_PER_5_REFS = 20;
  const referralProgress = user.referralCount % 5;
  const earnedFromReferrals = Math.floor(user.referralCount / 5) * JAP_PER_5_REFS;
  // Updated to official domain
  const inviteLink = `https://japcoin.co.uk/invite/${user.referralCode}`;

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name: editName,
      headline: editHeadline,
      location: editLocation,
      bio: editBio,
      avatar: editAvatar,
      coverImage: editCover
    });
    setIsEditing(false);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(inviteLink);
      alert("Referral link copied to clipboard!");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setFunction: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFunction(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative bg-jap-card w-full max-w-2xl p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div className="space-y-6">
                {/* Hidden File Inputs */}
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  hidden 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={(e) => handleFileSelect(e, setEditCover)}
                />
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  hidden 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={(e) => handleFileSelect(e, setEditAvatar)}
                />

                {/* Visual Image Editors */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cover Image</label>
                    <div 
                      className="h-32 w-full rounded-lg bg-gray-800 border border-white/10 relative overflow-hidden group cursor-pointer"
                      onClick={() => coverInputRef.current?.click()}
                    >
                        {editCover ? (
                          <img src={editCover} alt="Cover Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                            <span className="text-gray-500 text-sm">No Image Set</span>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/60 px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2 group-hover:bg-jap-gold group-hover:text-black transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Upload Cover
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 items-center">
                    <div 
                      className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 relative overflow-hidden group cursor-pointer flex-shrink-0"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                         {editAvatar ? (
                             <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600">?</div>
                         )}
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         </div>
                    </div>
                    <div className="flex-1">
                         <h4 className="text-white font-bold text-sm mb-1">Profile Photo</h4>
                         <p className="text-gray-500 text-xs mb-3">Accepts PNG, JPG or GIF. Recommended size 400x400px.</p>
                         <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => avatarInputRef.current?.click()}>Upload Photo</Button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-jap-gold outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Headline / Status</label>
                    <input type="text" value={editHeadline} onChange={(e) => setEditHeadline(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-jap-gold outline-none" placeholder="e.g. Learning DeFi @ Japcoin" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Location</label>
                    <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-jap-gold outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Bio</label>
                    <textarea rows={4} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-jap-gold outline-none" placeholder="Tell the community about yourself..." />
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Profile</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* INTRO CARD */}
            <div className="bg-jap-card rounded-xl border border-white/10 overflow-hidden relative">
                {/* Cover Image */}
                <div className="h-48 bg-gray-800 relative group">
                    {user.coverImage && (
                        <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    )}
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-full p-2 hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Profile"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                </div>

                <div className="px-6 pb-6 relative">
                    {/* Avatar */}
                    <div className="relative -mt-20 mb-4 inline-block group">
                        <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            alt={user.name} 
                            className="w-40 h-40 rounded-full border-4 border-jap-card object-cover bg-black"
                        />
                         <button 
                            onClick={() => setIsEditing(true)}
                            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                             <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>

                        {user.isVerified && (
                            <div className="absolute bottom-2 right-2 bg-black rounded-full p-1 border border-jap-gold" title="Verified Human">
                                <svg className="w-6 h-6 text-jap-gold" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm4.45 6.45l-3.25 3.25a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.72-2.72a.75.75 0 011.06 1.06z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white leading-tight">{user.name}</h1>
                            <p className="text-white/90 text-sm mt-1">{user.headline || 'Student at Japcoin University'}</p>
                            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {user.location || 'Global'} 
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Joined {new Date(user.dateJoined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <p className="text-jap-gold text-xs font-mono mt-2 opacity-70 bg-jap-gold/5 inline-block px-2 py-1 rounded">{user.walletAddress}</p>
                        </div>
                        <div className="hidden sm:block mt-4 md:mt-0">
                            <div className="text-right">
                                <div className="text-xl font-bold text-white">Japcoin University</div>
                                <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded inline-block mt-1">{user.subscriptionTier} Member</div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Action */}
                    <div className="flex gap-3 mt-6">
                        <Button onClick={() => setIsEditing(true)} className="rounded-full py-1.5 px-6 text-xs">Edit Profile</Button>
                        <Button variant="outline" className="rounded-full py-1.5 px-6 text-xs">Share Profile</Button>
                    </div>
                </div>

                {/* New Stats Row */}
                <div className="grid grid-cols-3 border-t border-white/10 bg-black/20">
                    <div className="p-4 text-center border-r border-white/10">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">JAP Balance</div>
                        <div className="text-xl font-bold text-white">{user.japBalance.toLocaleString()}</div>
                    </div>
                    <div className="p-4 text-center border-r border-white/10">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Staked JAP</div>
                        <div className="text-xl font-bold text-jap-gold">{user.stakedJap.toLocaleString()}</div>
                    </div>
                    <div className="p-4 text-center">
                         <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Referrals</div>
                         <div className="text-xl font-bold text-white">{user.referralCount}</div>
                    </div>
                </div>
            </div>

             {/* REFERRAL HUB */}
             <div className="bg-gradient-to-r from-jap-card to-black rounded-xl border border-jap-gold/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                     <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                    <span className="bg-jap-gold text-black text-xs font-bold px-2 py-0.5 rounded mr-2">EARN JAP</span>
                    Referral Program
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-lg">
                    Invite friends to join Japcoin University. Earn <span className="text-jap-gold font-bold">20 JAP</span> for every 5 successful referrals (Max 200 members).
                </p>

                <div className="bg-black/50 border border-white/10 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="w-full">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Your Unique Invite Link</label>
                        <div className="flex bg-white/5 rounded border border-white/10 p-2 items-center">
                            <input type="text" readOnly value={inviteLink} className="bg-transparent border-none outline-none text-white text-sm flex-1 font-mono" />
                        </div>
                     </div>
                     <Button onClick={copyToClipboard} className="shrink-0">Copy Link</Button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-300">
                        <span>Progress to next reward</span>
                        <span>{user.referralCount} / {MAX_REFERRALS} Max</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-4 relative overflow-hidden">
                        {/* Overall Progress Bar (visual only for effect) */}
                        <div className="bg-white/10 h-full absolute left-0 top-0" style={{ width: `${(user.referralCount / MAX_REFERRALS) * 100}%` }}></div>
                        
                        {/* 5-step progress bar */}
                        <div className="bg-gradient-to-r from-jap-gold to-yellow-500 h-full rounded-full transition-all duration-500 relative" style={{ width: `${(referralProgress / 5) * 100}%` }}>
                             {/* Striped animation */}
                             <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-gray-500">{5 - referralProgress} more invites for 20 JAP reward</p>
                        <p className="text-xs text-jap-gold font-bold">Total Earned: {earnedFromReferrals} JAP</p>
                    </div>
                </div>
            </div>

            {/* ABOUT CARD */}
            <div className="bg-jap-card rounded-xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-white">Bio</h3>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {user.bio || "No biography added yet. Click edit to tell your story."}
                </p>
            </div>

            {/* ASSETS (NFTs) */}
            <div className="bg-jap-card rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">NFT Portfolio</h3>
                {user.nfts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.nfts.map((nft) => (
                            <div key={nft.id} className="border border-white/10 rounded-lg p-3 flex gap-3 hover:bg-white/5 transition-colors group cursor-pointer">
                                <img src={nft.image} className="w-16 h-16 object-cover rounded shadow-lg group-hover:scale-105 transition-transform" alt={nft.name} />
                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-jap-gold transition-colors">{nft.name}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{nft.rarity}</p>
                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 mt-2 inline-block">ERC-721</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No NFTs in wallet.</p>
                )}
            </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
            
             {/* EDUCATION CARD */}
             <div className="bg-jap-card rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Certifications</h3>
                {completedCoursesList.length > 0 ? (
                    <div className="space-y-6">
                        {completedCoursesList.map((course) => (
                            <div key={course.id} className="flex gap-4 group">
                                <div className="w-10 h-10 bg-white/5 rounded flex-shrink-0 flex items-center justify-center">
                                    <img src={course.image} className="w-full h-full object-cover opacity-80 rounded" alt="Logo" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{course.title}</h4>
                                    <p className="text-xs text-white/60">Japcoin University</p>
                                    <div className="mt-1 flex gap-2">
                                        <span className="text-[10px] border border-jap-gold/30 px-1.5 py-0.5 rounded text-jap-gold bg-jap-gold/5">Verified</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No courses completed yet.</p>
                )}
            </div>

            {/* HONORS & AWARDS (Achievements) */}
            <div className="bg-jap-card rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                <ul className="space-y-4">
                    {user.achievements.map((ach) => (
                        <li key={ach.id} className={`flex items-start gap-3 ${!ach.unlockedAt && 'opacity-50 grayscale'}`}>
                            <span className="text-2xl pt-1 bg-white/5 w-10 h-10 flex items-center justify-center rounded-full">{ach.icon}</span>
                            <div>
                                <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                                <p className="text-xs text-gray-400">{ach.description}</p>
                                {ach.unlockedAt && <p className="text-[10px] text-gray-500 mt-1">Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="text-center pt-4">
                <Button variant="outline" fullWidth onClick={onLogout} className="text-xs border-red-900/50 text-red-400 hover:bg-red-900/20">Sign Out</Button>
            </div>

            <footer className="text-center text-[10px] text-gray-600 px-4">
                <p>Japcoin University Corporation © 2026</p>
                <a href="mailto:admin@japcoin.co.uk" className="block text-jap-gold hover:text-white mt-1 transition-colors">admin@japcoin.co.uk</a>
                <p className="mt-1">Accessibility • Privacy Policy • User Agreement</p>
            </footer>

        </div>
      </div>
    </div>
  );
};

export default Profile;
