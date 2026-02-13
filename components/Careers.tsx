
import React, { useState } from 'react';
import { JOBS } from '../constants';
import Button from './Button';

const Careers: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Bounty' | 'Core'>('All');

  const filteredJobs = JOBS.filter(job => {
    if (filter === 'All') return true;
    if (filter === 'Bounty') return job.type === 'Bounty';
    if (filter === 'Core') return job.type !== 'Bounty';
    return true;
  });

  const handleApply = (jobTitle: string) => {
    const message = `To apply for ${jobTitle}:\n\n1. Join our Discord.\n2. Open a ticket in #career-applications.\n3. Submit your portfolio/github.\n\nPayments are processed weekly in JAP via Ethereum.`;
    alert(message);
    window.open("https://discord.gg/gqGpaa8fXR", "_blank");
  };

  return (
    <div className="min-h-screen bg-jap-black">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-jap-card to-jap-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                Work for Web3. <span className="text-jap-gold">Get Paid in JAP.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                Japcoin University isn't just a school—it's an economy. Contribute your skills, earn crypto, and help build the premier decentralized education platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}>
                    View Openings
                </Button>
                <Button variant="outline" onClick={() => window.open('https://github.com/japcoinx?tab=repositories', '_blank')}>
                    GitHub Repo
                </Button>
            </div>
            
            {/* Priority Access Badge */}
            <div className="mt-8 inline-flex items-center rounded-full bg-jap-gold/10 px-4 py-1 text-xs font-medium text-jap-gold ring-1 ring-inset ring-jap-gold/20 animate-pulse">
                🚀 Certified Tier Students get Priority Job Offers
            </div>
        </div>
      </div>

      {/* Stats / Value Prop */}
      <div className="border-y border-white/5 bg-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                 <div>
                     <div className="text-3xl font-bold text-jap-gold">100% Crypto</div>
                     <div className="text-sm text-gray-400 mt-1">Payments in JAP (Ethereum)</div>
                 </div>
                 <div>
                     <div className="text-3xl font-bold text-white">Global</div>
                     <div className="text-sm text-gray-400 mt-1">Remote & Async Work</div>
                 </div>
                 <div>
                     <div className="text-3xl font-bold text-white">Open Source</div>
                     <div className="text-sm text-gray-400 mt-1">Build Your Portfolio</div>
                 </div>
             </div>
        </div>
      </div>

      {/* Job Board */}
      <div id="jobs" className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Open Positions</h2>
            <div className="mt-4 sm:mt-0 flex space-x-2 bg-jap-card p-1 rounded-lg border border-white/10">
                {(['All', 'Bounty', 'Core'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === f ? 'bg-jap-gold text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {f === 'Core' ? 'Positions' : f === 'Bounty' ? 'Micro-Tasks' : 'All Jobs'}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid gap-6">
            {filteredJobs.map((job) => (
                <div key={job.id} className="bg-jap-card rounded-xl border border-white/10 p-6 sm:p-8 hover:border-jap-gold/50 transition-all group relative overflow-hidden">
                    {job.category === 'Development' && (
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                             <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                         </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                                    job.type === 'Bounty' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/30' : 
                                    job.type === 'Ambassador' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30' :
                                    'bg-green-900/50 text-green-400 border border-green-500/30'
                                }`}>
                                    {job.type}
                                </span>
                                <span className="text-xs text-gray-500 uppercase">{job.category}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">{job.title}</h3>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                             <div className="text-2xl font-bold text-jap-gold">{job.reward}</div>
                             <div className="text-xs text-gray-500">Estimated Compensation</div>
                        </div>
                    </div>

                    <p className="text-gray-300 mb-6 max-w-3xl relative z-10">
                        {job.description}
                    </p>

                    <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 list-disc pl-4">
                            {job.requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                            ))}
                        </ul>
                        <Button onClick={() => handleApply(job.title)} className="shrink-0 w-full md:w-auto">
                            Apply for Role
                        </Button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Careers;
