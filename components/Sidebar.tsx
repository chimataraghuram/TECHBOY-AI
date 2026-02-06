import React from 'react';
import { MessageSquarePlus, History, ExternalLink, X, Circle } from 'lucide-react';
import { ChatSession } from '../types';
import { PORTFOLIO_URL } from '../constants';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSwitchSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    onNewChat,
    sessions,
    currentSessionId,
    onSwitchSession,
}) => {
    return (
        <>
            {/* 📱 Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* 🔮 SIDEBAR */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] sidebar-glass transition-transform duration-500 ease-in-out
        lg:relative lg:translate-x-0 lg:flex lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full p-6">

                    {/* Logo & Branding - Text Only */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-light to-rose-glow bg-clip-text text-transparent">
                                TECHBOY AI
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse-slow" />
                                <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest">Neural Sync</span>
                            </div>
                        </div>

                        {/* 📱 Close Button (Mobile Only) */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* New Chat Jelly Button */}
                    <button
                        onClick={onNewChat}
                        className="jelly-btn w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-bold mb-10 shadow-lg"
                    >
                        <MessageSquarePlus size={20} />
                        <span>New Chat</span>
                    </button>

                    {/* Chat History Pills */}
                    <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pr-2">
                        <div className="flex items-center gap-2 px-2 mb-5 text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
                            <History size={12} />
                            <span>Session Memory</span>
                        </div>
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => onSwitchSession(session.id)}
                                className={`w-full text-left px-5 py-3.5 rounded-full text-xs truncate font-medium ${currentSessionId === session.id
                                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-white border border-amber-500/30'
                                    : 'glass-pill text-white/80 hover:text-white'
                                    }`}
                            >
                                {session.title}
                            </button>
                        ))}
                    </div>

                    {/* Footer Controls */}
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                        <a
                            href={PORTFOLIO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full glass-pill flex items-center gap-3 px-5 py-3.5 rounded-full text-white/90 hover:text-amber-light text-xs font-medium"
                        >
                            <ExternalLink size={16} />
                            <span>Enter Portfolio</span>
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
