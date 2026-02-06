import React from 'react';
import { MessageSquarePlus, History, ExternalLink, X, Circle, PanelLeft, MoreHorizontal } from 'lucide-react';
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
                fixed inset-y-0 left-0 z-50 h-full sidebar-glass transition-all duration-500 ease-in-out overflow-hidden
                lg:relative lg:z-auto lg:translate-x-0
                w-[280px]
                ${isOpen ? 'translate-x-0 lg:w-[280px]' : '-translate-x-full lg:w-0'}
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

                        {/* 📱 Mobile Toggle Button */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <PanelLeft size={24} />
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
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-medium transition-all duration-200 ${
                                    currentSessionId === session.id
                                        ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-white border border-amber-500/30 shadow-[0_0_15px_rgba(255,154,60,0.1)]'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className="truncate max-w-[170px]">{session.title}</span>
                                <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${currentSessionId === session.id ? 'opacity-100 text-amber-glow' : ''}`}>
                                    <MoreHorizontal size={16} />
                                </div>
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
