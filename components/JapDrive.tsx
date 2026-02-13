import React from 'react';
import { MOCK_DRIVE_FILES } from '../constants';
import Button from './Button';

const JapDrive: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
           <h1 className="text-3xl font-bold text-white flex items-center">
             <span className="text-jap-gold mr-3">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
               </svg>
             </span>
             JAP Drive
           </h1>
           <p className="text-gray-400 mt-2">Decentralized, encrypted storage on IPFS. You own your data.</p>
        </div>
        <div className="mt-4 md:mt-0">
            <Button>+ Upload New File</Button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="bg-jap-card rounded-xl border border-white/10 p-6 mb-8">
         <div className="flex justify-between text-sm mb-2 text-gray-400">
            <span>Storage Used: 450 MB / 5 GB</span>
            <span className="text-green-400 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Connected to 12 IPFS Nodes
            </span>
         </div>
         <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-jap-gold to-yellow-600 h-full w-[9%]"></div>
         </div>
      </div>

      {/* File Explorer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {MOCK_DRIVE_FILES.map((file) => (
             <div key={file.id} className="bg-black/40 border border-white/5 rounded-xl p-4 hover:bg-white/5 hover:border-jap-gold/30 transition-all cursor-pointer group">
                 <div className="flex items-start justify-between mb-4">
                     <div className={`w-10 h-10 rounded flex items-center justify-center text-lg font-bold
                        ${file.type === 'pdf' ? 'bg-red-500/20 text-red-500' : ''}
                        ${file.type === 'img' ? 'bg-purple-500/20 text-purple-500' : ''}
                        ${file.type === 'doc' ? 'bg-blue-500/20 text-blue-500' : ''}
                        ${file.type === 'cert' ? 'bg-jap-gold/20 text-jap-gold' : ''}
                     `}>
                        {file.type.toUpperCase()}
                     </div>
                     {file.encrypted && (
                         <div className="text-gray-500" title="Encrypted">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                             </svg>
                         </div>
                     )}
                 </div>
                 
                 <h3 className="text-gray-200 font-medium text-sm truncate mb-1">{file.name}</h3>
                 <p className="text-xs text-gray-500">{file.size} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                 
                 <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] text-gray-600 font-mono truncate w-20">CID: {file.cid.substring(0,6)}...</span>
                     <button className="text-jap-gold hover:text-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                     </button>
                 </div>
             </div>
         ))}

         {/* Add New Placeholder */}
         <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-jap-gold/50 hover:text-jap-gold transition-colors cursor-pointer min-h-[160px]">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">Upload File</span>
         </div>
      </div>
    </div>
  );
};

export default JapDrive;