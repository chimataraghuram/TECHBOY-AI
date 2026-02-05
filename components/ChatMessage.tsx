import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { Sparkles, User, AlertCircle, Terminal } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, isLoading }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group animate-fade-in`}>
      <div className={`flex gap-3 sm:gap-4 max-w-full sm:max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar - High Contrast Glass Badge */}
        <div className={`
          flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center
          transition-all duration-300 border backdrop-blur-3xl shadow-2xl overflow-hidden
          ${isUser
            ? 'bg-rose-glow/30 border-rose-glow/50 shadow-[0_0_20px_rgba(255,77,109,0.2)]'
            : isError
              ? 'bg-red-500/30 border-red-500/50 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'liquid-glass border-white/30 shadow-[0_0_20px_rgba(255,154,60,0.2)]'
          }
        `}>
          {isError ? (
            <AlertCircle size={20} strokeWidth={2.5} />
          ) : (
            <img
              src={isUser ? "/TECHBOY-AI/user.jpg" : "/TECHBOY-AI/logo.jpg"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
          <div className={`
            chat-bubble px-10 py-7 sm:px-12 sm:py-8 transition-all duration-500
            ${isUser
              ? 'user-bubble text-white'
              : isError
                ? 'bg-red-500/10 border border-red-500/40 text-red-50 shadow-inner'
                : 'ai-bubble'
            }
          `}>
            {isUser ? (
              <p className="whitespace-pre-wrap text-[15px] sm:text-[16px] leading-relaxed font-medium tracking-tight">
                {message.text}
              </p>
            ) : (
              <div className={`
                prose prose-invert prose-sm sm:prose-base max-w-none
                prose-p:leading-relaxed prose-p:my-2.5 prose-p:text-gray-50
                prose-headings:text-amber-light prose-headings:font-bold prose-headings:mb-4
                prose-a:text-amber-glow prose-a:underline decoration-amber-glow/30 hover:decoration-amber-glow transition-all
                prose-strong:text-amber-glow prose-strong:font-black
                prose-code:text-amber-light prose-code:bg-black/40 prose-code:px-2 prose-code:py-1 
                prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-pre:shadow-2xl
                ${isLoading ? 'after:content-["▋"] after:animate-pulse after:ml-1 after:text-amber-glow' : ''}
              `}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Timestamp - Subtle */}
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-[10px] text-gray-300 font-medium tracking-wide">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && !isError && (
              <div className="flex items-center gap-1 text-[10px] text-amber-glow/70">
                <Terminal size={10} />
                <span>Neural Output</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;