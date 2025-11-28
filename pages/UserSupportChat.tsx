

import React, { useState, useEffect, useRef } from 'react';
import { User, ChatSession } from '../types';
import { mockStore } from '../services/mockStore';

interface UserSupportChatProps {
    user: User;
    onBack: () => void;
}

export const UserSupportChat: React.FC<UserSupportChatProps> = ({ user, onBack }) => {
    const [session, setSession] = useState<ChatSession>(mockStore.getChatSession(user.id));
    const [message, setMessage] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setSession(mockStore.getChatSession(user.id));
        }, 3000);
        return () => clearInterval(interval);
    }, [user.id]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        mockStore.sendChatMessage(user.id, message, false);
        setMessage('');
        setSession(mockStore.getChatSession(user.id));
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
            <header className="bg-white p-4 border-b border-gray-200 flex items-center gap-3 shadow-sm sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-500 p-1">←</button>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                    🎧
                </div>
                <div>
                    <h1 className="font-bold text-gray-900">Support Team</h1>
                    <p className="text-xs text-green-600 font-bold">● Online</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {session.messages.map(msg => (
                    <div key={msg.id} className={`flex ${!msg.isSupport ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm ${
                                !msg.isSupport 
                                ? 'bg-black text-white rounded-tr-none' 
                                : 'bg-white text-gray-900 rounded-tl-none'
                            }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${!msg.isSupport ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:border-black text-gray-900"
                />
                <button type="submit" className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow hover:bg-gray-800">
                    ➤
                </button>
            </form>
        </div>
    );
};
