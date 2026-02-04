import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className={`
          w-full liquid-glass border border-white/10 rounded-[32px] transition-all duration-500
          floating-input-bar group
          ${disabled ? 'opacity-50 grayscale' : 'hover:border-amber-glow/40'}
        `}
      >
        <div className="flex items-end gap-2 sm:gap-4 p-3 sm:p-4">

          {/* Action Group 1 */}
          <div className="flex items-center pb-1">
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-amber-glow hover:bg-white/5 transition-all"
              title="Attach File"
            >
              <Paperclip size={20} />
            </button>
          </div>

          {/* Text Area */}
          <div className="flex-1 relative flex items-center min-h-[44px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Query Raghu AI..."
              className="
                w-full bg-transparent text-gray-100 placeholder:text-gray-500
                text-[15px] sm:text-[16px] resize-none focus:outline-none 
                py-2.5 max-h-[180px] leading-relaxed
                scrollbar-none
              "
              rows={1}
            />
            {input.length === 0 && !disabled && (
              <Sparkles size={14} className="absolute right-0 text-amber-glow/20 pointer-events-none" />
            )}
          </div>

          {/* Action Group 2 */}
          <div className="flex items-center gap-1 sm:gap-2 pb-1">
            <button
              type="button"
              className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-gray-400 hover:text-rose-glow hover:bg-white/5 transition-all"
              title="Voice Input"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={`
                w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300
                ${input.trim() && !disabled
                  ? 'jelly-btn text-white scale-110'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                }
              `}
            >
              <Send size={18} strokeWidth={2.5} className={input.trim() && !disabled ? 'ml-0.5' : ''} />
            </button>
          </div>
        </div>

        {/* Footer Hint (Desktop Only) */}
        <div className="hidden sm:flex justify-center pb-2 opacity-30 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-amber-light font-bold tracking-widest uppercase">
            Neural Processing Active • Press Enter
          </p>
        </div>
      </form>

      {/* Safety Margin for detached look on mobile */}
      <div className="h-4 sm:hidden"></div>
    </div>
  );
};

export default ChatInput;