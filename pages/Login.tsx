

import React, { useState } from 'react';
import { UserRole } from '../types';
import { mockStore } from '../services/mockStore';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'FACE'>('PASSWORD');
  const [isScanning, setIsScanning] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMethod === 'FACE') {
        if (!email) {
            setError("Please enter your email to identify account.");
            return;
        }
        setIsScanning(true);
        setTimeout(() => {
            const result = mockStore.loginWithFace(email);
            setIsScanning(false);
            if (result.success) {
                onLoginSuccess();
            } else {
                setError(result.message || "Face verification failed. Try again.");
            }
        }, 2500);
    } else {
        const result = mockStore.loginWithCredentials(email, password);
        if (result.success) {
            onLoginSuccess();
        } else {
            setError(result.message || "Login failed");
        }
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    mockStore.login(role);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>

      <div className="z-10 w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-black text-white mb-4 shadow-xl">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900">POS Wallet</h1>
          <p className="text-gray-500 font-medium">Secure payments & agent discovery.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xl">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button 
                    onClick={() => { setLoginMethod('PASSWORD'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${loginMethod === 'PASSWORD' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Password
                </button>
                <button 
                    onClick={() => { setLoginMethod('FACE'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${loginMethod === 'FACE' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Face ID
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 mb-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center font-bold">{error}</div>}
                
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">EMAIL ADDRESS</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                        placeholder="john@example.com"
                    />
                </div>

                {loginMethod === 'PASSWORD' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">PASSWORD</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                )}

                {loginMethod === 'FACE' && (
                     <div className="animate-in fade-in slide-in-from-top-2">
                        {!isScanning ? (
                            <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-300 hover:border-blue-500/50 transition-colors">
                                <div className="text-4xl mb-2">👤</div>
                                <p className="text-sm text-gray-900 font-bold mb-1">Position your face</p>
                                <p className="text-[10px] text-gray-500">Ensure good lighting for biometric scan</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-6 text-center relative overflow-hidden h-[120px] flex items-center justify-center border border-blue-500 shadow-inner">
                                <div className="absolute inset-0 bg-blue-50 animate-pulse"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                                
                                <div className="relative z-10">
                                    <div className="text-4xl mb-2 animate-bounce">😐</div>
                                    <p className="text-xs text-blue-600 font-mono tracking-widest font-bold">VERIFYING...</p>
                                </div>
                            </div>
                        )}
                     </div>
                )}

                <button 
                    type="submit" 
                    disabled={isScanning}
                    className={`w-full py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                        isScanning 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-black text-white hover:bg-gray-800 shadow-xl'
                    }`}
                >
                    {isScanning ? 'Processing...' : loginMethod === 'FACE' ? 'Scan Face & Login' : 'Sign In'}
                </button>
            </form>

            <div className="text-center">
                <p className="text-gray-500 text-sm">Don't have an account? <button onClick={onNavigateToRegister} className="text-blue-600 font-bold hover:underline">Sign Up</button></p>
            </div>
        </div>

        {/* Demo Section */}
        <div className="mt-8">
            <p className="text-[10px] text-gray-400 text-center mb-4 uppercase tracking-widest font-bold">Quick Demo Access</p>
            <div className="grid grid-cols-4 gap-2">
                <button onClick={() => handleDemoLogin(UserRole.USER)} className="bg-white p-2 rounded-lg text-xs font-bold hover:bg-gray-50 border border-gray-200 shadow-sm text-gray-700">
                    User
                </button>
                <button onClick={() => handleDemoLogin(UserRole.AGENT)} className="bg-purple-50 p-2 rounded-lg text-xs font-bold hover:bg-purple-100 border border-purple-100 text-purple-700">
                    Agent
                </button>
                <button onClick={() => handleDemoLogin(UserRole.ADMIN)} className="bg-red-50 p-2 rounded-lg text-xs font-bold hover:bg-red-100 border border-red-100 text-red-700">
                    Admin
                </button>
                <button onClick={() => handleDemoLogin(UserRole.SUPPORT)} className="bg-blue-50 p-2 rounded-lg text-xs font-bold hover:bg-blue-100 border border-blue-100 text-blue-700">
                    Support
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
