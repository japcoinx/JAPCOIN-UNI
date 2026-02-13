
import React from 'react';
import Button from './Button';
import { SubscriptionTier } from '../types';

interface PricingProps {
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
}

const Pricing: React.FC<PricingProps> = ({ currentTier, onUpgrade }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Path</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          From curious beginner to certified blockchain architect. Select the plan that fits your ambition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Standard Plan */}
        <div className={`rounded-2xl p-8 border ${currentTier === 'STANDARD' ? 'bg-jap-card/50 border-gray-700' : 'bg-jap-card border-white/5'} flex flex-col`}>
           <div className="mb-4">
             <h3 className="text-xl font-bold text-white">Standard</h3>
             <p className="text-gray-500 text-sm">The Basic Starter</p>
           </div>
           <div className="mb-6">
             <span className="text-4xl font-bold text-white">Free</span>
           </div>
           
           <ul className="space-y-4 mb-8 flex-1">
             <li className="flex items-center text-sm text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Access to 3 Courses Only
             </li>
             <li className="flex items-center text-sm text-gray-300">
               <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               <span className="text-jap-gold font-bold">500 JAP</span> Welcome Bonus
             </li>
             <li className="flex items-center text-sm text-gray-500">
               <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               No JAP-AI App Builder
             </li>
             <li className="flex items-center text-sm text-gray-500">
               <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               No JAP-ID
             </li>
             <li className="flex items-center text-sm text-gray-500">
               <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               No Cloud Storage
             </li>
           </ul>

           <Button 
             variant="outline" 
             fullWidth 
             disabled={currentTier === 'STANDARD'}
             className={currentTier === 'STANDARD' ? 'opacity-50 cursor-not-allowed' : ''}
           >
             {currentTier === 'STANDARD' ? 'Current Plan' : 'Downgrade'}
           </Button>
        </div>

        {/* Premium Plan */}
        <div className={`rounded-2xl p-8 border-2 relative transform md:-translate-y-4 ${currentTier === 'PREMIUM' ? 'bg-jap-card/80 border-jap-gold shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'bg-jap-card border-jap-gold/50'} flex flex-col`}>
           <div className="absolute top-0 right-0 bg-jap-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase">
             Popular
           </div>
           <div className="mb-4">
             <h3 className="text-xl font-bold text-white">Premium</h3>
             <p className="text-jap-gold text-sm">The Serious Builder</p>
           </div>
           <div className="mb-6">
             <span className="text-4xl font-bold text-white">$7</span>
             <span className="text-gray-500">/mo</span>
           </div>
           
           <ul className="space-y-4 mb-8 flex-1">
             <li className="flex items-center text-sm text-white">
               <svg className="w-5 h-5 text-jap-gold mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Access to <span className="font-bold ml-1">ALL Courses</span>
             </li>
             <li className="flex items-center text-sm text-white">
               <svg className="w-5 h-5 text-jap-gold mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Create <span className="font-bold ml-1">Apps & Websites with JAP-AI</span>
             </li>
             <li className="flex items-center text-sm text-white">
               <svg className="w-5 h-5 text-jap-gold mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               <span className="text-jap-gold font-bold mr-1">5,000 JAP</span> Bonus
             </li>
             <li className="flex items-center text-sm text-white">
               <svg className="w-5 h-5 text-jap-gold mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Free <span className="font-bold ml-1">JAP-ID Verification</span>
             </li>
             <li className="flex items-center text-sm text-gray-500">
               <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               No JAP Drive
             </li>
           </ul>

           <Button 
             variant="primary" 
             fullWidth 
             disabled={currentTier === 'PREMIUM' || currentTier === 'CERTIFIED'}
             onClick={() => onUpgrade('PREMIUM')}
           >
             {currentTier === 'PREMIUM' ? 'Current Plan' : (currentTier === 'CERTIFIED' ? 'Included' : 'Get Premium')}
           </Button>
        </div>

        {/* Certified Plan */}
        <div className={`rounded-2xl p-8 border ${currentTier === 'CERTIFIED' ? 'bg-jap-card/80 border-white shadow-2xl' : 'bg-jap-card border-white/5'} flex flex-col`}>
           <div className="mb-4">
             <h3 className="text-xl font-bold text-white">Certified</h3>
             <p className="text-gray-500 text-sm">Professional Access</p>
           </div>
           <div className="mb-6">
             <span className="text-4xl font-bold text-white">$49</span>
             <span className="text-gray-500">/mo</span>
           </div>
           
           <ul className="space-y-4 mb-8 flex-1">
             <li className="flex items-center text-sm text-gray-300">
               <svg className="w-5 h-5 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Everything in Premium
             </li>
             <li className="flex items-center text-sm text-gray-300">
               <svg className="w-5 h-5 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Create <span className="font-bold ml-1 text-jap-gold">Unlimited Apps & Websites</span>
             </li>
             <li className="flex items-center text-sm text-gray-300">
               <svg className="w-5 h-5 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               <span className="text-jap-gold font-bold mr-1">20,000 JAP</span> Bonus
             </li>
             <li className="flex items-center text-sm text-gray-300">
               <svg className="w-5 h-5 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               <span className="font-bold ml-1 text-jap-gold">Free JAP Drive</span> Access
             </li>
             <li className="flex items-center text-sm text-gray-300">
               <svg className="w-5 h-5 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               First Priority for <span className="font-bold ml-1 text-jap-gold">Job Offers</span>
             </li>
           </ul>

           <Button 
             variant={currentTier === 'CERTIFIED' ? 'outline' : 'secondary'} 
             fullWidth 
             disabled={currentTier === 'CERTIFIED'}
             onClick={() => onUpgrade('CERTIFIED')}
           >
             {currentTier === 'CERTIFIED' ? 'Current Plan' : 'Go Certified'}
           </Button>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
