import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Image, Film, FileText, Mic, Sparkles, Camera, AtSign, User, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

// Add SpeechRecognition types for TS
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);
  const [mentionPos, setMentionPos] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const MENTION_OPTIONS = [
    { label: 'Ask About Raghu (Developer)', value: '@Ask About Raghu (Developer)', icon: <User size={14} /> },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalMessage = [...mentions, input].join(' ').trim();
    if (finalMessage && !disabled) {
      onSend(finalMessage);
      setInput('');
      setMentions([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setInput(value);

    // Detect @ mention
    const lastChar = value.slice(selectionStart - 1, selectionStart);
    if (lastChar === '@') {
      setShowMentions(true);
      setMentionPos({ start: selectionStart - 1, end: selectionStart });
    } else {
      // Hide mentions if space is typed or if cursor moves away from @
      const textBeforeCursor = value.slice(0, selectionStart);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      if (lastAtIndex === -1 || textBeforeCursor.slice(lastAtIndex).includes(' ')) {
        setShowMentions(false);
      }
    }
  };

  const insertMention = (mentionValue: string) => {
    if (!mentions.includes(mentionValue)) {
      setMentions(prev => [...prev, mentionValue]);
    }

    // Remove the '@' or partial mention text that triggered this
    const before = input.slice(0, mentionPos.start);
    const after = input.slice(mentionPos.end);
    setInput(before + after);
    setShowMentions(false);

    // Auto-focus the textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const removeMention = (mentionValue: string) => {
    setMentions(prev => prev.filter(m => m !== mentionValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      if (showMentions) {
        e.preventDefault();
        insertMention(MENTION_OPTIONS[0].value);
      } else {
        e.preventDefault();
        handleSubmit();
      }
    }
    if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Handle click outside to close menu and mentions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (mentionRef.current && !mentionRef.current.contains(event.target as Node)) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const menuOptions = [
    { icon: <Image size={18} />, label: 'Upload Photo' },
    { icon: <Film size={18} />, label: 'Upload Video' },
    { icon: <FileText size={18} />, label: 'Upload File' },
    { icon: <User size={18} />, label: '@Ask About Raghu (Developer)', value: '@Ask About Raghu (Developer)' },
  ];

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Camera/File selected:', file.name);
    }
  };

  const handleFileClick = (type: 'photo' | 'video' | 'file') => {
    if (type === 'photo') photoInputRef.current?.click();
    else if (type === 'video') videoInputRef.current?.click();
    else if (type === 'file') fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <form
        onSubmit={handleSubmit}
        className={`
          w-full floating-input-bar group relative
          ${disabled ? 'opacity-50 grayscale' : 'hover:border-amber-glow/60'}
        `}
      >
        {/* Mention Suggestions */}
        {showMentions && (
          <div
            ref={mentionRef}
            className="absolute bottom-full left-4 mb-4 w-[280px] liquid-glass rounded-2xl overflow-hidden z-[60] animate-fade-in shadow-2xl"
          >
            <div className="p-2 flex flex-col gap-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-amber-glow/60 uppercase tracking-widest">
                Suggestions
              </div>
              {MENTION_OPTIONS.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertMention(option.value)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all group text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-glow/10 flex items-center justify-center text-amber-glow group-hover:bg-amber-glow group-hover:text-black transition-all">
                    {option.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-[10px] opacity-50 uppercase tracking-tighter">Shortcut</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4">

          {/* Plus Button & Dropdown */}
          <div className="flex-shrink-0 relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`
                glass-circle-btn text-white/90 hover:text-white
                w-11 h-11 sm:w-10 sm:h-10 transition-all duration-200 hover:scale-[1.05]
                ${isMenuOpen ? 'border-amber-glow shadow-[0_0_15px_rgba(255,154,60,0.4)]' : ''}
              `}
              title="Add attachment"
            >
              <Plus size={22} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                className="absolute bottom-full left-0 mb-4 w-[280px] sm:w-64 liquid-glass rounded-2xl overflow-hidden z-50 animate-fade-in origin-bottom-left shadow-2xl"
              >
                <div className="p-1.5 flex flex-col gap-1">
                  {menuOptions.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group active:scale-[0.98]"
                      onClick={() => {
                        if (option.label === 'Upload Photo') handleFileClick('photo');
                        else if (option.label === 'Upload Video') handleFileClick('video');
                        else if (option.label === 'Upload File') handleFileClick('file');
                        else if (option.value) {
                          const pos = textareaRef.current?.selectionStart ?? input.length;
                          setMentionPos({ start: pos, end: pos });
                          setTimeout(() => {
                            insertMention(option.value!);
                          }, 0);
                        }
                        setIsMenuOpen(false);
                      }}
                    >
                      <span className="w-8 h-8 rounded-lg bg-amber-glow/5 flex items-center justify-center text-amber-glow/70 group-hover:text-amber-glow group-hover:bg-amber-glow/10 transition-all duration-200">
                        {option.icon}
                      </span>
                      <span className="truncate font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area with Separate Chips */}
          <div className="flex-grow flex items-center gap-2 min-h-[54px] sm:min-h-[48px] overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap max-w-[50%]">
              {mentions.map((mention, i) => (
                <span key={i} className="mention-tag group/tag !mr-0">
                  <span className="truncate max-w-[120px]">{mention}</span>
                  <button
                    type="button"
                    onClick={() => removeMention(mention)}
                    className="ml-1.5 p-0.5 rounded-full hover:bg-white/20 transition-colors inline-flex items-center justify-center active:scale-95 flex-shrink-0"
                    title="Remove mention"
                  >
                    <X size={12} className="text-amber-glow" />
                  </button>
                </span>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={(!input.trim() && mentions.length === 0 && !isListening) ? "Ask anything..." : isListening ? "Listening..." : ""}
              className="
                flex-1 bg-transparent border-none outline-none text-white caret-white placeholder:text-white/40
                text-[16px] sm:text-[17px] resize-none focus:outline-none 
                py-3.5 sm:py-3 max-h-[200px] leading-relaxed
                scrollbar-none font-medium transition-all duration-200
                relative z-10 pr-2
              "
              rows={1}
            />
            {input.trim().length === 0 && !disabled && !isListening && (
              <Sparkles size={16} className="absolute right-0 text-amber-glow/20 pointer-events-none hidden sm:block animate-pulse" />
            )}
            {isListening && (
              <div className="absolute right-0 flex gap-0.5 pb-1">
                <div className="w-1 h-3 bg-amber-glow rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-4 bg-amber-glow rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-3 bg-amber-glow rounded-full animate-bounce"></div>
              </div>
            )}
          </div>

          {/* Action Group 2 */}
          <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-3">
            {/* Camera Button */}
            <label
              className="glass-circle-btn w-11 h-11 sm:w-10 sm:h-10 text-white/90 hover:text-white cursor-pointer group transition-all duration-200 hover:scale-[1.05]"
              title="Take Photo"
            >
              <Camera size={20} className="transition-transform duration-200 group-hover:scale-[1.1]" />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraChange}
              />
            </label>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`
                glass-circle-btn w-11 h-11 sm:w-10 sm:h-10 transition-all duration-200 hover:scale-[1.05]
                ${isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(255,77,109,0.6)] animate-pulse'
                  : 'text-white/90 hover:text-white'
                }
              `}
              title={isListening ? "Stop Listening" : "Voice Input"}
            >
              <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </button>

            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={`
                glass-circle-btn shadow-xl w-11 h-11 sm:w-10 sm:h-10 transition-all duration-200
                ${input.trim() && !disabled
                  ? 'jelly-btn text-white !border-none hover:scale-[1.08] active:scale-[0.95]'
                  : 'text-white/20 border-white/5 cursor-not-allowed opacity-40 shadow-none'
                }
              `}
            >
              <Send size={22} className={input.trim() && !disabled ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input type="file" ref={photoInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleCameraChange} />
        <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleCameraChange} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleCameraChange} />

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