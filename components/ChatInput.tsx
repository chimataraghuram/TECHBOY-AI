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
          w-full floating-input-bar transition-all duration-500 group
          ${disabled ? 'opacity-50 grayscale' : 'hover:border-amber-glow/60'}
        `}
      >
        <div className="flex items-end gap-2 sm:gap-4 p-4 sm:p-5">

          {/* Action Group 1 */}
          <div className="flex items-center pb-1">
            <button
              type="button"
              className="glass-circle-btn text-gray-400"
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
              placeholder="Query TECHBOY AI..."
              className="
                w-full bg-transparent text-white placeholder:text-gray-500
                text-[15px] sm:text-[17px] resize-none focus:outline-none 
                py-2.5 max-h-[220px] leading-relaxed
                scrollbar-none font-medium
              "
              rows={1}
            />
            {input.length === 0 && !disabled && (
              <Sparkles size={16} className="absolute right-0 text-amber-glow/20 pointer-events-none" />
            )}
          </div>

          {/* Action Group 2 */}
          <div className="flex items-center gap-2 sm:gap-3 pb-1">
            <button
              type="button"
              className="hidden sm:flex glass-circle-btn text-gray-400"
              title="Voice Input"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={`
                w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl
                ${input.trim() && !disabled
                  ? 'jelly-btn text-white scale-110 rotate-0'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                }
              `}
            >
              <Send size={20} strokeWidth={2.5} className={input.trim() && !disabled ? 'ml-1' : ''} />
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