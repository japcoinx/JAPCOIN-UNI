import React from 'react';
import { User } from '../types';
import Button from './Button';

interface JapIdPageProps {
  user: User;
}

const JapIdPage: React.FC<JapIdPageProps> = ({ user }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">JAP-ID Identity Manager</h1>
        <p className="text-gray-400">Manage your Decentralized Identity (DID), credentials, and privacy settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: The Passport Visual */}
        <div className="flex flex-col items-center">
            <div className="relative group perspective-1000 w-full max-w-md h-64">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-jap-black to-gray-900 rounded-xl border border-white/10 shadow-2xl transform transition-transform duration-700 hover:rotate-y-12 hover:rotate-x-12 preserve-3d overflow-hidden">
                {/* Holographic Layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30 pointer-events-none" style={{ backgroundSize: '200% 200%'}}></div>
                <div className="absolute top-0 right-0 p-32 bg-jap-gold/10 blur-3xl rounded-full"></div>

                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-jap-gold rounded flex items-center justify-center text-black font-bold">JU</div>
                        <span className="text-jap-gold font-bold tracking-widest uppercase text-sm">Official Passport</span>
                    </div>
                    <div className="bg-green-900/80 border border-green-500/50 text-green-400 text-[10px] px-2 py-1 rounded uppercase font-bold">
                        Verified
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-lg bg-gray-800 border-2 border-jap-gold/50 overflow-hidden relative">
                         {user.avatar ? (
                             <img src={user.avatar} className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600">?</div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Citizen Name</div>
                        <div className="text-xl font-mono text-white mb-2">{user.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">DID</div>
                        <div className="text-xs font-mono text-jap-gold/80">{user.japId || 'did:jap:pending...'}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                     <div className="font-mono text-[10px] text-gray-600">
                        ISS: JAPCOIN UNIVERSITY<br/>
                        EXP: NEVER (PERMANENT)
                     </div>
                     <div className="w-8 h-8 bg-white p-0.5">
                        <div className="w-full h-full bg-black flex flex-wrap content-start">
                            {[...Array(25)].map((_,i) => <div key={i} className={`w-1 h-1 m-[1px] ${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}></div>)}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
                <Button>Share Identity</Button>
                <Button variant="outline">Update Metadata</Button>
            </div>
        </div>

        {/* Right Column: Credentials List */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Verifiable Credentials (VCs)</h3>
            
            <div className="bg-jap-card rounded-lg p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-white font-medium">KYC Verification</h4>
                        <p className="text-xs text-gray-500">Issued by Synaps • Expires 2028</p>
                    </div>
                </div>
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-500/30">Active</span>
            </div>

            <div className="bg-jap-card rounded-lg p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-jap-gold/10 flex items-center justify-center text-jap-gold">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Blockchain Fundamentals Degree</h4>
                        <p className="text-xs text-gray-500">Issued by Japcoin University • Permanent</p>
                    </div>
                </div>
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-500/30">Verified</span>
            </div>

            <div className="bg-jap-card rounded-lg p-4 border border-white/5 flex items-center justify-between opacity-50">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Solidity Expert Certification</h4>
                        <p className="text-xs text-gray-500">Pending Completion</p>
                    </div>
                </div>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-600">Pending</span>
            </div>

             {/* Mock Access Log */}
             <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Identity Access Log</h4>
                <ul className="space-y-2 text-xs font-mono text-gray-500">
                    <li className="flex justify-between">
                        <span>[2026-05-12 14:30]</span>
                        <span>Request by Japcoin DEX</span>
                        <span className="text-green-500">ALLOWED</span>
                    </li>
                    <li className="flex justify-between">
                        <span>[2026-05-10 09:15]</span>
                        <span>Request by Unknown App</span>
                        <span className="text-red-500">DENIED</span>
                    </li>
                     <li className="flex justify-between">
                        <span>[2026-05-01 11:00]</span>
                        <span>Request by Japcoin University</span>
                        <span className="text-green-500">ALLOWED</span>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JapIdPage;