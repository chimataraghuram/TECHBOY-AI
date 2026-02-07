import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Image, Film, FileText, Mic, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuOptions = [
    { icon: <Image size={18} />, label: 'Upload Photo' },
    { icon: <Film size={18} />, label: 'Upload Video' },
    { icon: <FileText size={18} />, label: 'Upload File' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className={`
          w-full floating-input-bar group
          ${disabled ? 'opacity-50 grayscale' : 'hover:border-amber-glow/60'}
        `}
      >
        <div className="flex items-end gap-2 sm:gap-4 p-2.5 sm:p-4">

          {/* Plus Button & Dropdown */}
          <div className="flex items-center pb-2 relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`glass-circle-btn text-white/90 hover:text-white ${isMenuOpen ? 'border-amber-glow shadow-[0_0_15px_rgba(255,154,60,0.4)]' : ''}`}
              title="Add attachment"
            >
              <Plus size={20} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute bottom-full left-0 mb-4 w-48 liquid-glass rounded-2xl overflow-hidden z-50 animate-fade-in origin-bottom-left">
                <div className="p-1.5 flex flex-col gap-1">
                  {menuOptions.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-amber-glow/70 group-hover:text-amber-glow transition-colors">
                        {option.icon}
                      </span>
                      <span className="font-medium tracking-wide">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="flex-1 relative flex items-center min-h-[54px] sm:min-h-[48px] px-2 sm:px-0">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask anything..."
              className="
                w-full bg-transparent text-white placeholder:text-white/40
                text-[16px] sm:text-[17px] resize-none focus:outline-none 
                py-3.5 sm:py-3 max-h-[220px] leading-relaxed
                scrollbar-none font-medium
              "
              rows={1}
            />
            {input.length === 0 && !disabled && (
              <Sparkles size={16} className="absolute right-0 text-amber-glow/20 pointer-events-none hidden sm:block" />
            )}
          </div>

          {/* Action Group 2 */}
          <div className="flex items-center gap-2 sm:gap-3 pb-1.5 sm:pb-2">
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
                glass-circle-btn shadow-xl w-11 h-11 sm:w-10 sm:h-10
                ${input.trim() && !disabled
                  ? 'jelly-btn text-white !border-none'
                  : 'text-gray-600 cursor-not-allowed'
                }
              `}
            >
              <Send size={20} className={input.trim() && !disabled ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>

        {/* Footer Hint (Desktop Only) */}
        <div className="hidden sm:flex justify-center pb-2 opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-amber-light font-bold tracking-widest uppercase">
            COOKED BY RAGHU WITH ❤️
          </p>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;