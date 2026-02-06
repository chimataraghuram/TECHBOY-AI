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
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group animate-fade-in`}>
      <div className={`flex w-full max-w-4xl gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>

        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <div className={`
            w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center
            transition-all duration-300 border backdrop-blur-3xl shadow-2xl overflow-hidden
            ${isUser
              ? 'bg-rose-glow/30 border-rose-glow/50 shadow-[0_0_20px_rgba(255,77,109,0.2)]'
              : isError
                ? 'bg-red-500/30 border-red-500/50 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'liquid-glass border-white/30 shadow-[0_0_20px_rgba(255,154,60,0.2)]'
            }
          `}>
            {isError ? (
              <AlertCircle size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
            ) : (
              <img
                src={`${baseUrl}${isUser ? 'user.jpg' : 'logo.jpg'}`}
                alt={isUser ? "User" : "AI"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Message Content Component */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
          <div className={`
            chat-bubble px-5 py-3.5 sm:px-6 sm:py-5 transition-all duration-500
            max-w-[85%] md:max-w-[75%] lg:max-w-[70%] text-left
            ${isUser
              ? 'user-bubble text-white'
              : isError
                ? 'bg-red-500/10 border border-red-500/40 text-red-50 shadow-inner'
                : 'ai-bubble'
            }
          `}>
            {isUser ? (
              <p className="whitespace-pre-wrap text-[15px] sm:text-[16px] leading-relaxed font-medium tracking-wide">
                {message.text}
              </p>
            ) : (
              <div className={`
                prose prose-invert prose-sm sm:prose-base max-w-none
                prose-p:leading-relaxed prose-p:my-2 prose-p:text-gray-100
                prose-headings:text-amber-light prose-headings:font-bold prose-headings:mb-3
                prose-a:text-amber-glow prose-a:underline decoration-amber-glow/30 hover:decoration-amber-glow transition-all
                prose-strong:text-amber-glow prose-strong:font-black
                prose-code:text-amber-light prose-code:bg-black/40 prose-code:px-1.5 prose-code:py-0.5
                prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:shadow-2xl
                ${isLoading ? 'after:content-["▋"] after:animate-pulse-slow after:ml-1 after:text-amber-glow' : ''}
              `}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`flex items-center gap-2 mt-2 px-1 opacity-60 hover:opacity-100 transition-opacity`}>
            {isUser && (
              <span className="text-[10px] sm:text-[11px] font-medium tracking-wider text-white">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            {!isUser && !isError && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-glow">
                <Terminal size={10} />
                <span className="uppercase tracking-wider font-bold">Neural Output</span>
                <div className="w-1 h-1 rounded-full bg-amber-glow animate-pulse"></div>
              </div>
            )}

            {!isUser && (
              <span className="text-[10px] sm:text-[11px] font-medium tracking-wider text-white">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatMessage;