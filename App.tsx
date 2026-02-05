import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, ChatSession } from './types';
import { INITIAL_GREETING, PORTFOLIO_URL, PORTFOLIO_OWNER } from './constants';
import { sendMessageStream } from './services/aiService';
import {
  getSessions,
  createNewSession,
  saveSession,
  setActiveSessionId,
  getActiveSessionId,
  updateSessionTitle
} from './services/chatService';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import ChatInput from './components/ChatInput';
import {
  MessageSquarePlus,
  Settings,
  ExternalLink,
  Menu,
  History,
  Sparkles,
  Circle
} from 'lucide-react';
import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize data
  // Initialize data
  useEffect(() => {
    // Load sessions
    const loadedSessions = getSessions();
    let activeId = getActiveSessionId();
    let activeSession = activeId ? loadedSessions.find(s => s.id === activeId) : null;

    if (!activeSession) {
      if (loadedSessions.length === 0) {
        activeSession = createNewSession();
        loadedSessions.unshift(activeSession);
      } else {
        activeSession = loadedSessions[0];
      }
      activeId = activeSession.id;
      setActiveSessionId(activeId);
    }

    setSessions(loadedSessions);
    setCurrentSessionId(activeId);
    if (activeSession) {
      setMessages(activeSession.messages);
    }

    // Handle initial sidebar state
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Sync scroll
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll immediately
    scrollToBottom();

    // Scroll again after a short delay to account for layout shifts/animations
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === sessionId);
      if (idx === -1) return prev;

      const updatedSession = { ...prev[idx], messages: newMessages, updatedAt: new Date().toISOString() };

      // Auto-title for new chats
      if (newMessages.length === 2 && newMessages[1].role === Role.USER) {
        let title = newMessages[1].text.substring(0, 30);
        if (newMessages[1].text.length > 30) title += "...";
        updatedSession.title = title;
      }

      saveSession(updatedSession);

      const newArr = [...prev];
      newArr[idx] = updatedSession;
      return newArr;
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentSessionId) return;

    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: text, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    updateSessionMessages(currentSessionId, updatedMessages);

    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    try {
      const stream = sendMessageStream(text);
      let fullText = "";
      let isFirstChunk = true;
      let currentMessages = updatedMessages; // Track locally for saving

      for await (const chunk of stream) {
        fullText += chunk;
        if (isFirstChunk) {
          isFirstChunk = false;
          const botMsg: Message = { id: botMsgId, role: Role.MODEL, text: fullText, timestamp: new Date() };
          currentMessages = [...updatedMessages, botMsg]; // Use updatedMessages instead of currentMessages to avoid duplication
          setMessages(currentMessages);
        } else {
          currentMessages = currentMessages.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg);
          setMessages(currentMessages);
        }
      }
      updateSessionMessages(currentSessionId, currentMessages);

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: Role.MODEL,
        text: "Neural link interrupted. Please check your network.",
        timestamp: new Date(),
        isError: true,
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      updateSessionMessages(currentSessionId, finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleSwitchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full bg-transparent overflow-hidden selection:bg-rose-glow/30 selection:text-white">

      {/* 🎬 Splash Screen Overlay - Always mounted but toggled by state */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* 📱 Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🔮 SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 sidebar-glass transition-all duration-500 ease-in-out
        transform lg:relative lg:translate-x-0 lg:flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">

          {/* Logo & Branding - Text Only */}
          <div className="flex flex-col mb-12">
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-light to-rose-glow bg-clip-text text-transparent">
              TECHBOY AI
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse-slow" />
              <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest">Neural Sync</span>
            </div>
          </div>

          {/* New Chat Jelly Button */}
          <button
            onClick={handleNewChat}
            className="jelly-btn w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-bold mb-10 shadow-lg"
          >
            <MessageSquarePlus size={20} />
            <span>Reset Neural Link</span>
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
                onClick={() => handleSwitchSession(session.id)}
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

      {/* 🗨️ MAIN CHAT */}
      <main className="relative flex flex-col flex-1 min-w-0">

        {/* Header Bar - Floating Glass */}
        <header className="sticky top-0 z-30 liquid-glass border-b border-white/5 px-6 h-20 flex items-center justify-between mx-4 my-2 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-white glass-circle-btn"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} className="text-amber-glow animate-float" />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-[14px] sm:text-[16px] font-black whitespace-nowrap tracking-[0.15em] bg-gradient-to-r from-amber-light to-rose-glow bg-clip-text text-transparent uppercase leading-none">{PORTFOLIO_OWNER}</p>
            </div>
            <div className="relative group">
              {/* Refined Outer Glow */}
              <div className="absolute -inset-4 bg-amber-glow/25 rounded-full blur-2xl group-hover:bg-amber-glow/50 transition-all duration-700 animate-pulse-slow"></div>

              {/* Glass Badge Ring */}
              <div className="absolute -inset-1 rounded-full border border-white/10 glass-pill opacity-40"></div>

              {/* Main Logo Container */}
              <div className="relative w-16 h-16 rounded-full liquid-glass border-2 border-white/20 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(255,154,60,0.3)] overflow-hidden transition-transform duration-500 group-hover:scale-110">
                <img
                  src={`${import.meta.env.BASE_URL}logo.jpg`}
                  alt="Logo"
                  className="w-full h-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 sm:px-10 pt-20 pb-52 space-y-8 scroll-smooth">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLast={idx === messages.length - 1}
              isLoading={isLoading && idx === messages.length - 1 && msg.role === Role.MODEL}
            />
          ))}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === Role.USER && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Floating Detached Input */}
        <div className="fixed bottom-0 left-0 right-0 px-6 sm:px-16 pb-10 pointer-events-none z-50">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;