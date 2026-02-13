
import React, { useState } from 'react';
import Button from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [authMethod, setAuthMethod] = useState<'EMAIL' | 'WALLET'>('EMAIL');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    // Simulate API
    setTimeout(() => {
        setIsConnecting(false);
        onLogin();
        onClose();
    }, 1000);
  };

  const handleWalletConnect = () => {
      setIsConnecting(true);
      // Simulate WalletConnect
      setTimeout(() => {
          setIsConnecting(false);
          onLogin();
          onClose();
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-jap-card w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? 'Join Japcoin University' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-sm">
                Access your dashboard, courses, and wallet.
            </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 rounded-lg p-1 mb-6">
            <button 
                onClick={() => setAuthMethod('EMAIL')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${authMethod === 'EMAIL' ? 'bg-jap-gold text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Email
            </button>
            <button 
                onClick={() => setAuthMethod('WALLET')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${authMethod === 'WALLET' ? 'bg-jap-gold text-black shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Web3 Wallet
            </button>
        </div>

        {authMethod === 'EMAIL' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-jap-gold transition-colors"
                            placeholder="Satoshi Nakamoto"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-jap-gold transition-colors"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-jap-gold transition-colors"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <Button fullWidth type="submit" className="mt-6" disabled={isConnecting}>
                    {isConnecting ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>

                <div className="mt-4 text-center text-sm text-gray-500">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                    <button 
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-jap-gold hover:underline font-medium"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </form>
        ) : (
            <div className="space-y-4 text-center">
                <div className="bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
                    {isConnecting ? (
                        <>
                            <div className="w-16 h-16 border-4 border-jap-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-jap-gold text-sm animate-pulse">Connecting to Wallet...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-blue-500 rounded-2xl mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 8.79a5.95 5.95 0 00-.77-2.61l.55-2.07a1 1 0 00-1.22-1.22l-2.07.55a5.95 5.95 0 00-2.61-.77L13.8 1.1a1 1 0 00-1.93 0l-.57 1.57a5.95 5.95 0 00-2.61.77l-2.07-.55a1 1 0 00-1.22 1.22l.55 2.07c-.36.8-.62 1.68-.77 2.61L1.1 9.42a1 1 0 000 1.93l1.57.57c.15.93.41 1.81.77 2.61l-.55 2.07a1 1 0 001.22 1.22l2.07-.55c.8.36 1.68.62 2.61.77l.57 1.57a1 1 0 001.93 0l.57-1.57c.93-.15 1.81-.41 2.61-.77l2.07.55a1 1 0 001.22-1.22l-.55-2.07c.36-.8.62-1.68.77-2.61l1.57-.57a1 1 0 000-1.93l-1.58-.57zM12 16a4 4 0 110-8 4 4 0 010 8z" /></svg>
                            </div>
                            <h3 className="text-white font-bold mb-1">WalletConnect</h3>
                            <p className="text-gray-500 text-xs mb-6">Scan QR code with your mobile wallet</p>
                            
                            <Button fullWidth onClick={handleWalletConnect}>
                                Connect Wallet
                            </Button>
                        </>
                    )}
                </div>
                <p className="text-[10px] text-gray-500">By connecting, you agree to our Terms of Service.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
