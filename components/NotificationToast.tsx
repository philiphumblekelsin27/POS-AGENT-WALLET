
import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, XCircle, Zap, Info, Bell } from 'lucide-react';

interface NotificationToastProps {
    notification: Notification | null;
    onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    const themes = {
        SUCCESS: { bg: 'bg-[#3DF2C4] text-black', icon: <ShieldCheck size={20} /> },
        ERROR: { bg: 'bg-[#E5484D] text-white', icon: <XCircle size={20} /> },
        LIVE: { bg: 'bg-[#7C6CFF] text-white', icon: <Zap size={20} /> },
        INFO: { bg: 'bg-[#1C2230] text-white border border-white/10', icon: <Bell size={20} /> }
    };

    const theme = themes[notification.type] || themes.INFO;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className={`fixed top-10 right-10 z-[100] ${theme.bg} px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 min-w-[320px]`}
            >
                <div className="shrink-0">{theme.icon}</div>
                <div className="flex-1">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">{notification.type}</p>
                    <p className="text-xs font-black uppercase tracking-tight leading-tight">{notification.message}</p>
                </div>
                <button onClick={onClose} className="opacity-30 hover:opacity-100 transition-opacity">✕</button>
            </motion.div>
        </AnimatePresence>
    );
};
