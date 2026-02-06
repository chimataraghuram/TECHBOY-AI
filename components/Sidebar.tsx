import React, { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, History, ExternalLink, X, Circle, PanelLeft, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';
import { PORTFOLIO_URL } from '../constants';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSwitchSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    onRenameSession: (id: string, newTitle: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    onNewChat,
    sessions,
    currentSessionId,
    onSwitchSession,
    onDeleteSession,
    onRenameSession
}) => {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
                // Also save rename if clicking outside
                if (editingSessionId) {
                    saveRename();
                }
            }
        };

        if (activeMenuId || editingSessionId) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenuId, editingSessionId, editTitle]);

    useEffect(() => {
        if (editingSessionId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingSessionId]);

    const handleRenameStart = (e: React.MouseEvent, session: ChatSession) => {
        e.stopPropagation();
        setActiveMenuId(null);
        setEditingSessionId(session.id);
        setEditTitle(session.title);
    };

    const saveRename = () => {
        if (editingSessionId && editTitle.trim()) {
            onRenameSession(editingSessionId, editTitle.trim());
        }
        setEditingSessionId(null);
        setEditTitle("");
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveRename();
        }
    };

    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        setActiveMenuId(null);
        if (window.confirm("Are you sure you want to delete this chat?")) {
            onDeleteSession(sessionId);
        }
    };

    const toggleMenu = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === sessionId ? null : sessionId);
    };

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
                    <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none pr-1 pb-4" ref={menuRef}>
                        <div className="flex items-center gap-2 px-2 mb-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                            <History size={12} />
                            <span>Session Memory</span>
                        </div>
                        {sessions.map((session) => (
                            <div key={session.id} className="relative">
                                <button
                                    onClick={() => onSwitchSession(session.id)}
                                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 border ${currentSessionId === session.id
                                        ? 'bg-white/10 text-white border-amber-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                                        : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white hover:border-white/10'
                                        }`}
                                >
                                    {editingSessionId === session.id ? (
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={handleRenameKeyDown}
                                            onBlur={saveRename}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-transparent text-white outline-none w-full truncate border-b border-white/20 pb-0.5"
                                        />
                                    ) : (
                                        <span className="truncate max-w-[170px]">{session.title}</span>
                                    )}
                                    <div
                                        onClick={(e) => toggleMenu(e, session.id)}
                                        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${activeMenuId === session.id ? 'opacity-100 bg-white/10 text-white' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'
                                            }`}
                                    >
                                        <MoreVertical size={16} />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {activeMenuId === session.id && (
                                    <div className="absolute right-0 top-full mt-2 w-32 z-50 overflow-hidden rounded-xl border border-white/10 bg-[#1a1016]/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-fade-in origin-top-right">
                                        <div className="py-1">
                                            <button
                                                onClick={(e) => handleRenameStart(e, session)}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
                                            >
                                                <Edit2 size={12} />
                                                Rename
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, session.id)}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left border-t border-white/5"
                                            >
                                                <Trash2 size={12} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
