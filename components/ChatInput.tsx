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
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
          w-full floating-input-bar group
          ${disabled ? 'opacity-50 grayscale' : 'hover:border-amber-glow/60'}
        `}
      >
        <div className="flex items-end gap-2 sm:gap-4 p-4">

          {/* Action Group 1 */}
          <div className="flex items-center pb-2">
            <button
              type="button"
              className="glass-circle-btn text-white/90 hover:text-white"
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>
          </div>

          {/* Text Area */}
          <div className="flex-1 relative flex items-center min-h-[48px]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask anything or Ask about Raghu"
              className="
                w-full bg-transparent text-white placeholder:text-white/40
                text-[15px] sm:text-[17px] resize-none focus:outline-none 
                py-3 max-h-[220px] leading-relaxed
                scrollbar-none font-medium
              "
              rows={1}
            />
            {input.length === 0 && !disabled && (
              <Sparkles size={16} className="absolute right-0 text-amber-glow/20 pointer-events-none" />
            )}
          </div>

          {/* Action Group 2 */}
          <div className="flex items-center gap-2 sm:gap-3 pb-2">
            <button
              type="button"
              className="hidden sm:flex glass-circle-btn text-white/90 hover:text-white"
              title="Voice Input"
            >
              <Mic size={18} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={`
                glass-circle-btn shadow-xl
                ${input.trim() && !disabled
                  ? 'jelly-btn text-white !border-none'
                  : 'text-gray-600 cursor-not-allowed'
                }
              `}
            >
              <Send size={18} className={input.trim() && !disabled ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>

        {/* Footer Hint (Desktop Only) */}
        <div className="hidden sm:flex justify-center pb-2 opacity-60 hover:opacity-100 transition-opacity">
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