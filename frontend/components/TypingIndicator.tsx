import React from 'react';

const TypingIndicator: React.FC = () => {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div className="flex w-full justify-center group animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-[60px_1fr_60px] gap-2 sm:gap-4 w-full max-w-full items-start">
        
        {/* Left Side (AI Avatar) */}
        <div className="flex justify-center pt-2">
          <div className="
            flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center
            transition-all duration-300 border backdrop-blur-3xl shadow-2xl overflow-hidden
            liquid-glass border-white/30 shadow-[0_0_20px_rgba(255,154,60,0.2)]
          ">
            <img
              src={`${baseUrl}logo.jpg`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Message Bubble - Typing Dots */}
        <div className="flex flex-col items-start min-w-0">
          <div className="
            chat-bubble px-6 py-5 sm:px-8 sm:py-6 transition-all duration-500
            ai-bubble flex items-center gap-1.5
          ">
            <div className="w-2 h-2 rounded-full bg-amber-glow/60 animate-[bounce_1.4s_infinite_0ms]"></div>
            <div className="w-2 h-2 rounded-full bg-amber-glow/60 animate-[bounce_1.4s_infinite_200ms]"></div>
            <div className="w-2 h-2 rounded-full bg-amber-glow/60 animate-[bounce_1.4s_infinite_400ms]"></div>
          </div>
        </div>

        {/* Right Spacer */}
        <div className="hidden sm:block w-[60px]" />
      </div>
    </div>
  );
};

export default TypingIndicator;
