

import React, { useState, useEffect } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { mockStore } from '../services/mockStore';

interface SupportDashboardProps {
  onLogout: () => void;
}

export const SupportDashboard: React.FC<SupportDashboardProps> = ({ onLogout }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(mockStore.getAllChatSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Refresh chats periodically
  useEffect(() => {
      const interval = setInterval(() => {
          setSessions(mockStore.getAllChatSessions());
          // If active session, refresh messages
          if (activeSessionId) {
             // In mock store, getting all sessions refreshes the data reference
          }
      }, 3000);
      return () => clearInterval(interval);
  }, [activeSessionId]);

  const activeSession = sessions.find(s => s.userId === activeSessionId);

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyText.trim() || !activeSessionId) return;
      
      mockStore.sendChatMessage(activeSessionId, replyText, true);
      setReplyText('');
      setSessions(mockStore.getAllChatSessions());
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row h-screen overflow-hidden text-gray-900">
      {/* Sidebar List */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
         <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
             <h2 className="font-bold text-lg text-gray-900">Support Chats</h2>
             <button onClick={onLogout} className="text-xs text-red-600 font-bold hover:underline">Log Out</button>
         </div>
         
         <div className="flex-1 overflow-y-auto">
             {sessions.length === 0 && (
                 <p className="text-center text-gray-400 p-8 text-sm">No active chats.</p>
             )}
             {sessions.map(session => (
                 <button 
                    key={session.userId}
                    onClick={() => setActiveSessionId(session.userId)}
                    className={`w-full p-4 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${activeSessionId === session.userId ? 'bg-blue-50' : ''}`}
                 >
                     <img src={session.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full bg-gray-200" alt="User" />
                     <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-1">
                             <p className="font-bold text-sm text-gray-900 truncate">{session.userName}</p>
                             <span className="text-[10px] text-gray-500">{new Date(session.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         <p className="text-xs text-gray-500 truncate">
                             {session.messages[session.messages.length - 1]?.text}
                         </p>
                     </div>
                     {session.unreadCount > 0 && (
                         <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                             {session.unreadCount}
                         </span>
                     )}
                 </button>
             ))}
         </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-gray-100 ${!activeSessionId ? 'hidden md:flex' : 'flex'}`}>
         {activeSession ? (
             <>
                <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm">
                    <button onClick={() => setActiveSessionId(null)} className="md:hidden text-gray-500 pr-2">←</button>
                    <img src={activeSession.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full bg-gray-200" alt="User" />
                    <div>
                        <p className="font-bold text-gray-900">{activeSession.userName}</p>
                        <p className="text-xs text-green-600 font-bold">● Active Now</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeSession.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isSupport ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm ${
                                msg.isSupport 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white text-gray-900 rounded-tl-none'
                            }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.isSupport ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                    <input 
                       type="text" 
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                       placeholder="Type a message..."
                       className="flex-1 p-3 bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 text-gray-900"
                    />
                    <button type="submit" className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700">
                        ➤
                    </button>
                </form>
             </>
         ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                 <span className="text-6xl mb-4">💬</span>
                 <p className="text-sm">Select a chat to start messaging</p>
             </div>
         )}
      </div>
    </div>
  );
};
