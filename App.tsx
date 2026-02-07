import React, { useState, useEffect, useRef } from 'react';
import { Message, Role, ChatSession } from './types';
import { INITIAL_GREETING, PORTFOLIO_OWNER } from './constants';
import { sendMessageStream } from './services/aiService';
import {
  getSessions,
  createNewSession,
  saveSession,
  setActiveSessionId,
  getActiveSessionId,
  updateSessionTitle,
  deleteSession,
  renameSession
} from './services/chatService';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import {
  Menu,
  Sparkles,
  Settings,
  PanelLeft
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

      // Move updated session to top
      const otherSessions = prev.filter(s => s.id !== sessionId);
      return [updatedSession, ...otherSessions];
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

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        handleSwitchSession(updatedSessions[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    renameSession(sessionId, newTitle);
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
  };

  return (
    <div className="relative flex h-screen w-full bg-transparent overflow-hidden selection:bg-rose-glow/30 selection:text-white">

      {/* 🎬 Splash Screen Overlay - Always mounted but toggled by state */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* 🔮 SIDEBAR COMPONENT */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSwitchSession={handleSwitchSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      {/* 🗨️ MAIN CHAT */}
      <main className="relative flex flex-col flex-1 h-screen min-w-0 overflow-hidden">

        {/* Header Bar - Floating Glass */}
        <header className="sticky top-0 z-30 liquid-glass border-b border-white/5 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between mx-2 sm:mx-4 my-1 sm:my-2 rounded-xl sm:rounded-2xl shadow-2xl">

          {/* Left: Hamburger */}
          <div className="flex items-center w-1/4 sm:w-auto">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white glass-circle-btn transition-transform hover:scale-110 active:scale-95 w-9 h-9 sm:w-11 sm:h-11"
            >
              <PanelLeft size={20} className="sm:hidden" />
              <PanelLeft size={24} className="hidden sm:block" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5 ml-4">
              <Sparkles size={20} className="text-amber-glow animate-float" />
            </div>
          </div>

          {/* Center: Title (Mobile Only Centering) */}
          <div className="flex-1 flex justify-center sm:justify-start sm:ml-4 overflow-hidden">
            <p className="text-[13px] sm:text-[16px] font-black whitespace-nowrap tracking-[0.1em] sm:tracking-[0.15em] bg-gradient-to-r from-amber-light to-rose-glow bg-clip-text text-transparent uppercase leading-none text-center">
              {PORTFOLIO_OWNER}
            </p>
          </div>

          {/* Right: Avatar */}
          <div className="flex items-center justify-end w-1/4 sm:w-auto gap-4 sm:gap-6">
            <div className="relative group">
              {/* Refined Outer Glow */}
              <div className="absolute -inset-2 sm:-inset-4 bg-amber-glow/20 sm:bg-amber-glow/25 rounded-full blur-xl sm:blur-2xl group-hover:bg-amber-glow/50 transition-all duration-700 animate-pulse-slow"></div>

              {/* Main Logo Container */}
              <div className="relative w-10 h-10 sm:w-16 sm:h-16 rounded-full liquid-glass border sm:border-2 border-white/20 p-0.5 sm:p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,154,60,0.2)] sm:shadow-[0_0_30px_rgba(255,154,60,0.3)] overflow-hidden transition-transform duration-500 group-hover:scale-110">
                <img
                  src={`${import.meta.env.BASE_URL}logo.jpg`}
                  alt="Logo"
                  className="w-full h-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Messages Feed - Balanced Spacing */}
        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-5 sm:px-10 py-5 sm:py-8 space-y-4 sm:space-y-6 scroll-smooth">
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

        {/* Detached Input Container - Stays at bottom */}
        <div className="w-full px-4 sm:px-16 pb-4 sm:pb-8 z-50">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;