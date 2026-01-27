
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportTicket, ChatMessage, UserRole, User } from '../types';
import { mockStore } from '../services/mockStore';
import { MessageSquare, Send, CheckCircle, User as UserIcon, Shield, Search } from 'lucide-react';

export const SupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockStore.getTickets('ALL'));
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const admin = mockStore.getCurrentUser();

  const activeTicket = tickets.find(t => t.id === activeTicketId);
  const ticketUser = mockStore.getAllUsers().find(u => u.id === activeTicket?.userId);

  useEffect(() => {
    // FIX: Ensure the cleanup function returns void to satisfy React's EffectCallback type.
    const unsub = mockStore.subscribe((ev) => {
      if (ev.type === 'TICKET_NEW' || ev.type === 'TICKET_UPDATE') {
        setTickets(mockStore.getTickets('ALL'));
      }
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeTicketId) return;
    mockStore.sendTicketMessage(activeTicketId, admin!.id, reply, true);
    setReply('');
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Sidebar: Ticket Stream */}
      <aside className="w-96 bg-[#0A0A0A] border-r border-white/5 flex flex-col">
         <div className="p-8 border-b border-white/5">
            <h2 className="text-2xl font-black tracking-tighter mb-1">Support Portal</h2>
            <p className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em]">Active Live Streams</p>
         </div>
         
         <div className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl text-xs outline-none" placeholder="Search Tickets / IDs..." />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto no-scrollbar">
            {tickets.map(ticket => (
               <button 
                 key={ticket.id}
                 onClick={() => setActiveTicketId(ticket.id)}
                 className={`w-full p-6 text-left border-b border-white/5 transition-all hover:bg-white/[0.02] ${activeTicketId === ticket.id ? 'bg-[#10B981]/5 border-l-4 border-l-[#10B981]' : ''}`}
               >
                  <div className="flex justify-between items-start mb-2">
                     <p className={`text-[10px] font-black uppercase tracking-widest ${ticket.status === 'OPEN' ? 'text-orange-500' : 'text-[#10B981]'}`}>{ticket.status}</p>
                     <span className="text-[9px] text-white/20 font-bold">{new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight mb-1 truncate">{ticket.subject}</h4>
                  <p className="text-xs text-white/40 truncate">{ticket.messages[ticket.messages.length-1].text}</p>
               </button>
            ))}
         </div>
      </aside>

      {/* Main: Chat View */}
      <main className="flex-1 flex flex-col relative">
         {activeTicket ? (
            <>
               <header className="p-6 border-b border-white/5 bg-[#0A0A0A]/50 flex justify-between items-center z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center text-[#10B981]">
                        <UserIcon size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black tracking-tighter uppercase">{ticketUser?.name}</h3>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">ID: {ticketUser?.walletNumber}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white/40">LVL {ticketUser?.kycLevel} USER</div>
                     <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-500/20 transition-all">Flag Node</button>
                  </div>
               </header>

               <div className="flex-1 overflow-y-auto p-12 space-y-6 no-scrollbar pb-32">
                  {activeTicket.messages.map((m, idx) => (
                    <div key={m.id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-xl p-6 rounded-[2rem] shadow-xl ${m.isAdmin ? 'bg-[#10B981] text-black rounded-tr-none' : 'bg-[#0A0A0A] border border-white/5 text-white rounded-tl-none'}`}>
                          <p className="text-sm leading-relaxed font-medium">{m.text}</p>
                          <p className={`text-[9px] mt-2 font-black uppercase opacity-40 ${m.isAdmin ? 'text-black' : 'text-white'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>

               <footer className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#050505] to-transparent">
                  <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
                     <input 
                       className="w-full bg-[#0A0A0A] border border-white/10 p-6 pr-24 rounded-[2rem] outline-none focus:border-[#10B981] transition-all font-medium shadow-2xl" 
                       placeholder="Deploy assistance response..." 
                       value={reply}
                       onChange={e => setReply(e.target.value)}
                     />
                     <button 
                       type="submit"
                       className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#10B981] text-black w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#10B981]/20"
                     >
                        <Send size={20} />
                     </button>
                  </form>
               </footer>
            </>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/5">
               <Shield size={160} strokeWidth={1} className="opacity-10" />
               <p className="text-sm font-black uppercase tracking-[1.5em] mt-8 text-white/20">Select Secure Stream</p>
            </div>
         )}
      </main>
    </div>
  );
};
