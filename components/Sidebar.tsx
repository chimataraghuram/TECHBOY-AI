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
    onOpen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    onNewChat,
    sessions,
    currentSessionId,
    onSwitchSession,
    onDeleteSession,
    onRenameSession,
    onOpen
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
            {/* 🌑 Sidebar Overlay - Mobile Only */}
            <div
                className={`
                    fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* 🔮 SIDEBAR */}
            {/* 🔮 SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 h-full sidebar-glass overflow-hidden will-change-[width,transform]
                transition-[width,transform] duration-300 ease-out
                lg:relative lg:z-auto border-r border-white/5
                ${isOpen
                    ? 'translate-x-0 w-[280px]'
                    : '-translate-x-full lg:translate-x-0 lg:w-[70px]'}
            `}>
                <div className={`flex flex-col h-full ${isOpen ? 'p-6' : 'p-2 py-4 items-center'} justify-between`}>

                    {/* TOP SECTION */}
                    <div className="flex flex-col w-full">

                        {/* 1. Header Row (Toggle + Brand) */}
                        <div className={`flex w-full mb-6 ${isOpen ? 'items-center justify-between flex-row-reverse' : 'flex-col items-center gap-6'}`}>

                            {/* Toggle Button - Adaptive Behavior */}
                            <button
                                onClick={isOpen ? onClose : onOpen}
                                className={`
                                    relative mt-4 flex justify-center items-center
                                    p-2 text-white/70 hover:text-white transition-all duration-200 
                                    ${isOpen ? 'opacity-100' : 'opacity-100'}
                                `}
                                title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                            >
                                <PanelLeft size={24} className={!isOpen ? "rotate-180" : ""} />
                            </button>

                            {/* Divider after Toggle (Mini Mode Only) */}
                            {!isOpen && (
                                <div className="w-8 h-[1px] bg-white/10"></div>
                            )}

                            {/* Branding */}
                            {isOpen ? (
                                <div className="flex flex-col">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-light to-rose-glow bg-clip-text text-transparent">
                                        TECHBOY AI
                                    </h1>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse-slow" />
                                        <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest">Neural Sync</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                    <Circle size={10} className="fill-emerald-500 text-emerald-500 animate-pulse-slow" />
                                </div>
                            )}
                        </div>

                        {/* 2. New Chat Button */}
                        <button
                            onClick={onNewChat}
                            className={`
                                jelly-btn flex items-center justify-center gap-2 rounded-full text-white font-bold shadow-lg transition-all duration-300 relative group
                                ${isOpen ? 'w-full py-4 mb-4' : 'w-10 h-10 p-0 mb-4 bg-amber-glow/20 !border-amber-glow/40'}
                            `}
                            title={isOpen ? "" : "New Chat"}
                        >
                            <MessageSquarePlus size={isOpen ? 20 : 18} />
                            {isOpen && <span>New Chat</span>}

                            {!isOpen && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    New Chat
                                </div>
                            )}
                        </button>

                        {/* 3. Session List */}
                        {isOpen ? (
                            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-none pr-1 pb-4 max-h-[calc(100vh-320px)]" ref={menuRef}>
                                <div className="flex items-center gap-2 px-2 mb-2 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
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
                                                className={`p-2 rounded-full hover:bg-white/10 transition-all duration-200 ${activeMenuId === session.id ? 'opacity-100 bg-white/10 text-white' : 'opacity-60 lg:opacity-0 lg:group-hover:opacity-60 hover:!opacity-100'
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
                        ) : (
                            <div className="w-full flex flex-col items-center gap-6">
                                {/* Mini Session Indicators */}
                                {sessions.slice(0, 5).map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => onSwitchSession(session.id)}
                                        className={`
                                            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 relative group
                                            ${currentSessionId === session.id
                                                ? 'bg-amber-glow/20 text-amber-glow shadow-[0_0_10px_rgba(255,154,60,0.2)]'
                                                : 'text-white/30 hover:bg-white/5 hover:text-white'}
                                        `}
                                        title={session.title}
                                    >
                                        {currentSessionId === session.id ? (
                                            <div className="w-2 h-2 rounded-full bg-current animate-pulse-slow" />
                                        ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                        )}

                                        {/* Tooltip */}
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 max-w-[150px] truncate">
                                            {session.title}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BOTTOM SECTION: Portfolio */}
                    <div className={`pt-6 border-t border-white/5 ${isOpen ? '' : 'flex justify-center'}`}>
                        {isOpen ? (
                            <a
                                href={PORTFOLIO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full glass-pill flex items-center gap-3 px-5 py-3.5 rounded-full text-white/90 hover:text-amber-light text-xs font-medium"
                            >
                                <ExternalLink size={16} />
                                <span>Enter Portfolio</span>
                            </a>
                        ) : (
                            <a
                                href={PORTFOLIO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-amber-light hover:bg-white/5 transition-colors relative group"
                                title=""
                            >
                                <ExternalLink size={18} />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Enter Portfolio
                                </div>
                            </a>
                        )}
                    </div>
                </div>
            </aside >
        </>
    );
};

export default Sidebar;
