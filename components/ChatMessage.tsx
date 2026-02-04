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
          flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center
          transition-all duration-300 border backdrop-blur-xl shadow-lg
          ${isUser
            ? 'bg-rose-glow/20 border-rose-glow/40 text-rose-glow'
            : isError
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-amber-glow/20 border-amber-glow/40 text-amber-glow'
          }
        `}>
          {isUser ? (
            <User size={18} strokeWidth={2.5} />
          ) : isError ? (
            <AlertCircle size={18} strokeWidth={2.5} />
          ) : (
            <Sparkles size={18} strokeWidth={2.5} className="animate-pulse" />
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
          <div className={`
            chat-bubble px-5 py-3.5 sm:px-6 sm:py-4 transition-all duration-500
            ${isUser
              ? 'user-bubble text-white'
              : isError
                ? 'bg-red-500/10 border border-red-500/30 text-red-200'
                : 'ai-bubble'
            }
          `}>
            {isUser ? (
              <p className="whitespace-pre-wrap text-[15px] sm:text-[16px] leading-relaxed font-medium">
                {message.text}
              </p>
            ) : (
              <div className={`
                prose prose-invert prose-sm sm:prose-base max-w-none
                prose-p:leading-relaxed prose-p:my-2 prose-p:text-gray-100
                prose-headings:text-amber-light prose-headings:font-bold prose-headings:mb-3
                prose-a:text-rose-glow prose-a:no-underline hover:prose-a:underline
                prose-strong:text-amber-glow prose-strong:font-bold
                prose-code:text-amber-light prose-code:bg-black/60 prose-code:px-1.5 prose-code:py-0.5 
                prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-wine-darker/80 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
                ${isLoading ? 'after:content-["▋"] after:animate-pulse after:ml-1 after:text-amber-glow' : ''}
              `}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Timestamp - Subtle */}
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-[10px] text-gray-500 font-medium tracking-wide">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && !isError && (
              <div className="flex items-center gap-1 text-[10px] text-amber-glow/40">
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