
import { GoogleGenAI } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { mockStore } from '../services/mockStore';
import { Transaction, MarketData, User } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm your Payna AI Assistant. I have access to your wallet data and can analyze your spending patterns or market trends. How can I help you today?", sender: 'ai', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const generateFinancialContext = (user: User, transactions: Transaction[], markets: MarketData[]) => {
    const walletText = user.wallets.map(w => `${w.currency}: ${w.balance}`).join(', ');
    const txText = transactions.slice(0, 15).map(t => `- ${t.date}: ${t.type} of ${t.currency} ${t.amount} (${t.description})`).join('\n');
    const marketText = markets.map(m => `${m.currency}: ₦${m.price.toLocaleString()} (${m.trend} ${m.change24h.toFixed(2)}%)`).join('\n');

    return `
      [USER_FINANCIAL_SNAPSHOT]
      User: ${user.name}
      Account ID: ${user.accountNumber}
      KYC Level: ${user.kycLevel}
      Preferred Currency: ${user.preferredCurrency}
      
      [WALLET_HOLDINGS]
      ${walletText}
      
      [LIVE_MARKET_RATES]
      ${marketText}
      
      [RECENT_TRANSACTIONS_LOG]
      ${txText}
    `;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const currentUser = mockStore.getCurrentUser();
      const transactions = mockStore.getTransactions('USER');
      const markets = mockStore.getMarketData();

      if (!currentUser) throw new Error("User session not found");

      const context = generateFinancialContext(currentUser, transactions, markets);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            { text: context },
            { text: `User Question: ${currentInput}` }
        ],
        config: {
          systemInstruction: `
            You are the "Payna AI Core", a high-level financial assistant integrated into the PAYNA POS & Multi-Currency Wallet.
            
            DIRECTIONS:
            1. Use the provided [USER_FINANCIAL_SNAPSHOT] to answer questions about balances, spending, and history.
            2. For spending analysis (e.g. "How much did I spend on X?"), iterate through the [RECENT_TRANSACTIONS_LOG].
            3. For market queries, refer to [LIVE_MARKET_RATES].
            4. Be concise, professional, and data-driven.
            5. If the user asks for a swap recommendation, compare their holdings with market trends.
            6. Do not mention the raw context tags in your response.
            7. Always format currency naturally (e.g., ₦50,000 or $120.50).
          `,
        }
      });

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: response.text || "I processed your request but encountered an empty response. Please try rephrasing.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "I'm having trouble analyzing your data right now. Please check your connection or try again later.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "What is my total net worth?",
    "Analyze my recent spending",
    "How is the BTC market doing?",
    "Can I afford a ₦50k loan?"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-[#1A1A1A] text-[#D4AF37] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all border-2 border-[#D4AF37]"
      >
        {isOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-2xl">⚡</span>}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D4AF37]"></span>
            </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300" style={{ maxHeight: '600px', height: '80vh' }}>
          {/* Header */}
          <div className="bg-[#1A1A1A] p-5 flex items-center gap-4 border-b border-[#D4AF37]/20">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-[#1A1A1A] font-black text-xs shadow-lg">
              AI
            </div>
            <div>
              <h3 className="font-black text-white text-sm tracking-tight">Payna AI Core</h3>
              <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Real-time Analysis Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAF7] no-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed font-semibold shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#1A1A1A] text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.text}
                  <div className={`text-[8px] mt-2 font-bold opacity-30 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length < 3 && !isTyping && (
              <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-[#FAFAF7]">
                  {quickPrompts.map(p => (
                      <button 
                        key={p} 
                        onClick={() => { setInput(p); }}
                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[9px] font-black uppercase tracking-tight text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                      >
                          {p}
                      </button>
                  ))}
              </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your assistant..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-[#1A1A1A] text-[#D4AF37] w-12 h-12 flex items-center justify-center rounded-2xl disabled:opacity-50 hover:bg-black transition-all shadow-lg"
              >
                <span className="text-xl">➤</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
