
import React, { useState } from 'react';
import Button from './Button';
import { SubscriptionTier } from '../types';

interface JapcoinPayModalProps {
  tier: SubscriptionTier | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
}

const JapcoinPayModal: React.FC<JapcoinPayModalProps> = ({ tier, isOpen, onClose, onConfirm }) => {
  const [method, setMethod] = useState<'CRYPTO' | 'CARD'>('CRYPTO');
  const [cryptoToken, setCryptoToken] = useState<'JAP' | 'USDC' | 'USDT'>('JAP');
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !tier) return null;

  const getPrice = () => {
      if (tier === 'PREMIUM') return '$7.00';
      if (tier === 'CERTIFIED') return '$49.00';
      return '$0.00';
  }

  const handlePay = () => {
    if (method === 'CARD') {
        let url = '';
        if (tier === 'PREMIUM') url = 'https://japcoin.net/products/japcoin-university-pro';
        if (tier === 'CERTIFIED') url = 'https://japcoin.net/products/japcoin-uni-certified';
        
        if (url) {
            window.open(url, '_blank');
            // We do not auto-confirm for external links as payment is asynchronous.
            // In a real app, a webhook would handle the upgrade.
            onClose(); 
        }
        return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onConfirm(cryptoToken);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-jap-card w-full max-w-md rounded-2xl border border-jap-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-jap-black to-jap-card p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-jap-gold flex items-center justify-center text-black font-bold">JP</div>
                <div>
                    <h3 className="text-white font-bold">Japcoin Pay</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Secure Gateway</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="p-6">
            <div className="mb-6 text-center">
                <p className="text-gray-400 text-sm">Upgrading to</p>
                <h2 className="text-2xl font-bold text-white">{tier} Tier</h2>
                <div className="text-3xl font-bold text-jap-gold mt-2">{getPrice()} <span className="text-sm text-gray-500 font-normal">/ month</span></div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6 bg-black/40 p-1 rounded-lg">
                <button 
                    onClick={() => setMethod('CRYPTO')}
                    className={`py-2 rounded-md text-sm font-medium transition-all ${method === 'CRYPTO' ? 'bg-jap-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Crypto / Stablecoins
                </button>
                <button 
                    onClick={() => setMethod('CARD')}
                    className={`py-2 rounded-md text-sm font-medium transition-all ${method === 'CARD' ? 'bg-jap-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Credit Card
                </button>
            </div>

            {/* Method Details */}
            <div className="mb-8 min-h-[120px]">
                {method === 'CRYPTO' ? (
                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 uppercase font-bold">Select Token</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['JAP', 'USDC', 'USDT'] as const).map(token => (
                                <button
                                    key={token}
                                    onClick={() => setCryptoToken(token)}
                                    className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${cryptoToken === token ? 'border-jap-gold bg-jap-gold/10 text-white' : 'border-white/10 bg-black/20 text-gray-500 hover:border-white/30'}`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${token === 'JAP' ? 'bg-jap-gold' : token === 'USDC' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                    <span className="font-bold text-xs">{token}</span>
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-2">
                            Pay with Metamask, WalletConnect, or Japcoin Wallet.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 flex flex-col justify-center items-center h-full py-2">
                        <div className="text-center space-y-2">
                            <svg className="w-12 h-12 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <p className="text-white font-medium">Secure Checkout</p>
                            <p className="text-xs text-gray-400 max-w-[250px] mx-auto">
                                Credit card payments are securely processed via our official checkout partner on Japcoin.net.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-green-500 mt-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Official Secure Link
                        </div>
                    </div>
                )}
            </div>

            <Button fullWidth onClick={handlePay} disabled={processing} className="relative">
                {processing ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    method === 'CARD' ? (
                        <span className="flex items-center justify-center gap-2">
                            Proceed to Checkout <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </span>
                    ) : 'Confirm Payment'
                )}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default JapcoinPayModal;
