
import React, { useEffect, useState } from 'react';
import { Notification } from '../types';

interface NotificationToastProps {
    notification: Notification | null;
    onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification && !visible) return null;

    let bgColor = 'bg-gray-800';
    let icon = 'ℹ️';

    if (notification?.type === 'SUCCESS') {
        bgColor = 'bg-[#009688]';
        icon = '✅';
    } else if (notification?.type === 'ERROR') {
        bgColor = 'bg-red-600';
        icon = '⚠️';
    } else if (notification?.type === 'LIVE') {
        bgColor = 'bg-[#D4AF37]'; // Gold for real-time events
        icon = '⚡';
    } else if (notification?.type === 'INFO') {
        bgColor = 'bg-[#1A1A1A]';
        icon = '🔔';
    }

    return (
        <div className={`fixed top-4 right-4 z-[100] transition-all duration-300 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] border border-white/10 ${notification?.type === 'LIVE' ? 'text-[#1A1A1A] font-bold' : ''}`}>
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                    <p className="font-bold text-[10px] uppercase tracking-widest opacity-80">{notification?.type}</p>
                    <p className="text-sm font-medium">{notification?.message}</p>
                </div>
                <button onClick={() => setVisible(false)} className="opacity-50 hover:opacity-100">✕</button>
            </div>
        </div>
    );
};
