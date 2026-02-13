import React, { useEffect, useState } from 'react';

// --- VISUAL: BLOCKCHAIN STRUCTURE ---
export const VisualBlockchain = () => {
  return (
    <div className="my-8 p-6 bg-jap-subtle/30 rounded-xl border border-jap-gold/20 flex flex-col items-center">
      <h4 className="text-jap-gold text-xs font-bold tracking-widest uppercase mb-6">Figure 1.1: Immutable Ledger Structure</h4>
      <div className="flex items-center space-x-2 overflow-x-auto w-full justify-center py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center animate-pulse-slow" style={{ animationDelay: `${i * 0.5}s` }}>
            <div className="w-24 h-24 bg-jap-card border-2 border-jap-gold rounded-lg flex flex-col p-2 relative shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <div className="text-[8px] text-gray-500 mb-1">Hash: 0x7A...</div>
              <div className="text-[8px] text-jap-gold mb-2">Prev: 0x3B...</div>
              <div className="flex-1 bg-black/50 rounded flex items-center justify-center">
                <div className="text-[10px] text-gray-300 text-center">
                  Tx: Alice<br/>↓<br/>Bob
                </div>
              </div>
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-jap-dark border border-jap-gold rounded-full flex items-center justify-center text-[10px] text-white font-bold z-10">
                #{100 + i}
              </div>
            </div>
            {i < 3 && (
              <div className="h-1 w-8 bg-gradient-to-r from-jap-gold to-jap-card mx-1 rounded-full relative">
                <div className="absolute -top-1 left-1/2 w-2 h-2 border-r-2 border-b-2 border-jap-gold transform -rotate-45"></div>
              </div>
            )}
          </div>
        ))}
        <div className="w-24 h-24 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center opacity-50">
           <span className="text-xs text-gray-500 animate-pulse">Mining...</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center max-w-md">
        Each block contains the "fingerprint" (Hash) of the previous block. If you change Block #101, the fingerprint changes, and the chain breaks. This creates <span className="text-white font-bold">Immutability</span>.
      </p>
    </div>
  );
};

// --- VISUAL: CONSENSUS MECHANISM ---
export const VisualConsensus = () => {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-8 p-6 bg-jap-subtle/30 rounded-xl border border-jap-gold/20 flex flex-col items-center">
       <h4 className="text-jap-gold text-xs font-bold tracking-widest uppercase mb-6">Figure 1.2: Distributed Consensus</h4>
       <div className="relative w-64 h-64">
         {/* Center Ledger */}
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-24 bg-white/5 border border-white/20 rounded z-10 flex items-center justify-center">
            <svg className="w-8 h-8 text-jap-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
         </div>
         
         {/* Orbiting Nodes */}
         {[0, 1, 2, 3, 4].map((i) => {
           const angle = (i * 72) * (Math.PI / 180);
           const radius = 100;
           const x = Math.cos(angle) * radius + 128 - 20; // center offset
           const y = Math.sin(angle) * radius + 128 - 20;
           const isActive = i === activeNode;

           return (
             <div 
                key={i}
                className={`absolute w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${isActive ? 'bg-jap-gold border-white scale-110 shadow-[0_0_20px_#D4AF37]' : 'bg-jap-card border-gray-600'}`}
                style={{ left: x, top: y }}
             >
                <span className={`text-[10px] font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}>N{i+1}</span>
                {/* Connection Line to Center */}
                <div 
                  className={`absolute top-1/2 left-1/2 h-[1px] bg-jap-gold origin-left transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  style={{ 
                    width: radius - 20, 
                    transform: `rotate(${angle + 180}rad) translate(10px, 0)` // Reverse angle to point to center
                  }}
                />
             </div>
           )
         })}
       </div>
       <p className="text-xs text-gray-400 mt-4 text-center max-w-md">
         Nodes constantly synchronize. When Node {activeNode + 1} proposes a valid block, all other nodes verify and update their local copy of the ledger.
       </p>
    </div>
  );
};

// --- VISUAL: CANDLESTICK CHART ---
export const VisualCandlestick = () => {
  return (
    <div className="my-8 p-6 bg-black rounded-xl border border-white/10 flex flex-col items-center">
       <h4 className="text-jap-gold text-xs font-bold tracking-widest uppercase mb-4">Figure 3.1: Market Psychology (Candlesticks)</h4>
       <div className="flex items-end justify-center space-x-8 h-48 w-full max-w-md border-b border-l border-gray-700 p-4 relative">
          
          {/* Bearish Candle */}
          <div className="flex flex-col items-center group relative">
             <div className="w-[1px] h-32 bg-gray-500 absolute top-2"></div> {/* Wick */}
             <div className="w-8 h-20 bg-red-500 z-10 mt-6 relative border border-red-400">
                <span className="absolute -left-12 top-0 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100">Open: $105</span>
                <span className="absolute -left-12 bottom-0 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100">Close: $95</span>
             </div> 
             <div className="mt-2 text-[10px] text-red-400 font-bold">Sellers Won</div>
          </div>

          {/* Doji */}
          <div className="flex flex-col items-center group">
             <div className="w-[1px] h-24 bg-gray-500 absolute top-10"></div>
             <div className="w-8 h-1 bg-gray-300 z-10 mt-20 border border-white"></div>
             <div className="mt-8 text-[10px] text-gray-400 font-bold">Indecision</div>
          </div>

          {/* Bullish Hammer */}
          <div className="flex flex-col items-center group relative">
             <div className="w-[1px] h-32 bg-gray-500 absolute top-6"></div>
             <div className="w-8 h-8 bg-green-500 z-10 mt-6 relative border border-green-400">
                <span className="absolute -right-12 top-0 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100">Close: $110</span>
                <span className="absolute -right-12 bottom-0 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100">Open: $102</span>
             </div>
             <div className="mt-14 text-[10px] text-green-400 font-bold">Buyers Rebound</div>
          </div>

       </div>
       <div className="w-full flex justify-between text-[9px] text-gray-500 mt-2 max-w-md px-4">
          <span>Time: 09:00</span>
          <span>Time: 10:00</span>
          <span>Time: 11:00</span>
       </div>
    </div>
  );
};

// --- VISUAL: LIQUIDITY POOL ---
export const VisualLiquidityPool = () => {
  return (
    <div className="my-8 p-6 bg-jap-card rounded-xl border border-jap-gold/20 flex flex-col items-center">
       <h4 className="text-jap-gold text-xs font-bold tracking-widest uppercase mb-6">Figure 2.1: Automated Market Maker (AMM)</h4>
       
       <div className="relative w-64 h-40">
          {/* The Pool Container */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-blue-900/20 border-b-4 border-blue-500 rounded-b-3xl rounded-t-lg backdrop-blur-sm flex items-center justify-center overflow-hidden">
             <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-blue-600/40 to-transparent animate-pulse-slow"></div>
             <div className="text-center z-10">
                <div className="text-white font-bold text-lg">ETH / JAP</div>
                <div className="text-[10px] text-blue-300">Pool Constant (k)</div>
             </div>
          </div>

          {/* Tokens Flowing In */}
          <div className="absolute -top-4 left-10 flex flex-col items-center animate-bounce">
             <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-400 flex items-center justify-center text-[8px] text-white">ETH</div>
             <div className="h-8 w-[1px] border-l border-dashed border-white"></div>
          </div>
          
          <div className="absolute -top-4 right-10 flex flex-col items-center animate-bounce" style={{ animationDelay: '0.5s' }}>
             <div className="w-8 h-8 rounded-full bg-jap-gold border border-white flex items-center justify-center text-[8px] text-black font-bold">JAP</div>
             <div className="h-8 w-[1px] border-l border-dashed border-jap-gold"></div>
          </div>

          {/* LP Token Out */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
             <div className="h-8 w-[1px] border-l border-dashed border-green-500"></div>
             <div className="px-3 py-1 bg-green-900/50 border border-green-500 rounded text-[10px] text-green-400">
                LP Tokens Earned
             </div>
          </div>
       </div>
       <p className="text-xs text-gray-400 mt-10 text-center max-w-md">
          Traders swap against the "bucket". Providers earn fees proportional to their share of the bucket.
       </p>
    </div>
  );
};

// --- VISUAL: ORDER BOOK ---
export const VisualOrderBook = () => {
    return (
        <div className="my-8 p-6 bg-black rounded-xl border border-white/10 flex flex-col items-center">
             <h4 className="text-jap-gold text-xs font-bold tracking-widest uppercase mb-4">Figure 1.3: The Order Book</h4>
             <div className="flex w-full max-w-sm text-xs font-mono">
                 <div className="flex-1 bg-red-900/10 p-2 border-r border-white/10">
                     <div className="text-red-500 font-bold mb-2 text-center border-b border-red-500/20 pb-1">ASK (Sellers)</div>
                     {[1.05, 1.04, 1.03, 1.02].map((p, i) => (
                         <div key={i} className="flex justify-between py-1 px-2 hover:bg-red-500/10 cursor-pointer">
                             <span className="text-red-400">${p.toFixed(2)}</span>
                             <span className="text-gray-500">{(Math.random() * 100).toFixed(0)} JAP</span>
                         </div>
                     ))}
                 </div>
                 <div className="flex-1 bg-green-900/10 p-2">
                     <div className="text-green-500 font-bold mb-2 text-center border-b border-green-500/20 pb-1">BID (Buyers)</div>
                     {[1.01, 1.00, 0.99, 0.98].map((p, i) => (
                         <div key={i} className="flex justify-between py-1 px-2 hover:bg-green-500/10 cursor-pointer">
                             <span className="text-green-400">${p.toFixed(2)}</span>
                             <span className="text-gray-500">{(Math.random() * 100).toFixed(0)} JAP</span>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="mt-2 text-center">
                 <div className="text-white text-lg font-bold">$1.015</div>
                 <div className="text-[10px] text-gray-500">Spread (Gap between buyers and sellers)</div>
             </div>
        </div>
    )
}

// --- VISUAL: JAP-ID (DID) ---
export const VisualDID = () => {
  return (
    <div className="my-8 p-6 bg-jap-card/50 rounded-xl border border-blue-500/30 flex flex-col items-center relative overflow-hidden">
       {/* Decorative BG */}
       <div className="absolute inset-0 bg-blue-900/5 pointer-events-none"></div>

       <h4 className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-8 z-10">Figure 4.1: The Identity Triangle</h4>
       
       <div className="relative w-80 h-48 z-10">
          {/* Top: Issuer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="w-12 h-12 bg-jap-card border border-white rounded-lg flex items-center justify-center">
               <span className="text-xs">🏛️</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 uppercase">Issuer (Uni)</div>
          </div>

          {/* Bottom Left: Holder */}
          <div className="absolute bottom-0 left-0 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-900 border border-blue-500 rounded-full flex items-center justify-center">
               <span className="text-xs">👤</span>
            </div>
            <div className="text-[10px] text-blue-400 mt-1 uppercase">Holder (You)</div>
          </div>

          {/* Bottom Right: Verifier */}
          <div className="absolute bottom-0 right-0 flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center">
               <span className="text-xs">🏢</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 uppercase">Verifier (Job)</div>
          </div>

          {/* Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
             {/* Issuer -> Holder */}
             <path d="M125 45 L 40 140" stroke="currentColor" className="text-green-500/50" strokeWidth="2" strokeDasharray="4"/>
             <text x="50" y="90" fill="gray" fontSize="8">Issues Credential</text>
             
             {/* Holder -> Verifier */}
             <path d="M 60 165 L 260 165" stroke="currentColor" className="text-blue-500" strokeWidth="2" />
             <text x="120" y="160" fill="gray" fontSize="8">Presents Proof</text>

             {/* Verifier -> Ledger (Implicit trust, no direct line usually, but lets show trust anchor) */}
          </svg>
       </div>

       <div className="mt-8 p-3 bg-blue-900/20 border border-blue-500/30 rounded w-full max-w-sm">
          <div className="text-[10px] text-blue-300 font-mono mb-1">YOUR WALLET (JAP-ID)</div>
          <div className="flex items-center space-x-2">
             <div className="h-8 w-8 bg-jap-gold/20 rounded flex items-center justify-center text-jap-gold">🏅</div>
             <div>
                <div className="text-xs text-white">Degree: Bachelor of Blockchain</div>
                <div className="text-[8px] text-green-400">Verified by Japcoin University</div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- VISUAL: REENTRANCY ATTACK ---
export const VisualReentrancy = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-8 p-6 bg-red-900/10 rounded-xl border border-red-500/30 flex flex-col items-center">
       <h4 className="text-red-400 text-xs font-bold tracking-widest uppercase mb-6">Figure 2.1: The Reentrancy Loop</h4>
       
       <div className="flex justify-between w-full max-w-md relative h-40">
          {/* Attacker Contract */}
          <div className="w-32 bg-gray-800 border-2 border-red-500 rounded-lg p-3 flex flex-col justify-between z-10">
             <div className="text-center border-b border-gray-600 pb-1 mb-1">
                <span className="text-red-400 font-bold text-xs">Malicious Contract</span>
             </div>
             <div className="text-[9px] font-mono text-gray-300">
                function receive() &#123;<br/>
                &nbsp;&nbsp;<span className={step === 2 || step === 3 ? "bg-red-500/50 text-white" : ""}>Bank.withdraw();</span><br/>
                &#125;
             </div>
          </div>

          {/* Victim Contract */}
          <div className="w-32 bg-gray-800 border-2 border-blue-500 rounded-lg p-3 flex flex-col justify-between z-10">
             <div className="text-center border-b border-gray-600 pb-1 mb-1">
                <span className="text-blue-400 font-bold text-xs">Bank Contract</span>
             </div>
             <div className="text-[9px] font-mono text-gray-300">
                function withdraw() &#123;<br/>
                &nbsp;&nbsp;<span className={step === 0 ? "bg-blue-500/50 text-white" : ""}>checkBalance();</span><br/>
                &nbsp;&nbsp;<span className={step === 1 ? "bg-yellow-500/50 text-black" : ""}>msg.sender.call();</span><br/>
                &nbsp;&nbsp;<span className="opacity-50 line-through">balance -= amount;</span><br/>
                &#125;
             </div>
          </div>
          
          {/* Flow Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             {/* 1. Attack Call */}
             <path d="M 130 30 L 220 30" stroke={step === 0 ? "#EF4444" : "#374151"} strokeWidth="2" />
             
             {/* 2. Sending Ether */}
             <path d="M 220 70 L 130 70" stroke={step === 1 ? "#EAB308" : "#374151"} strokeWidth="2" strokeDasharray="5,5" />
             
             {/* 3. Re-enter */}
             <path d="M 130 110 L 220 110" stroke={step === 2 ? "#EF4444" : "#374151"} strokeWidth="2" />
          </svg>

          {/* Step Labels */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-2 py-1 rounded border border-gray-700 text-[10px] text-white">
             {step === 0 && "1. Call Withdraw"}
             {step === 1 && "2. Send ETH"}
             {step === 2 && "3. Fallback Triggered"}
             {step === 3 && "4. Re-enter Withdraw!"}
             {step === 4 && "5. Loop continues..."}
          </div>
       </div>

       <p className="text-xs text-gray-400 mt-6 text-center max-w-md">
          The bank sends money <span className="text-red-400 font-bold">before</span> updating the balance. The attacker uses this gap to call withdraw again, draining the vault.
       </p>
    </div>
  );
};