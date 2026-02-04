import React, { useRef, useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const baseUrl = import.meta.env.BASE_URL;

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Auto-play failed:", error);
                setTimeout(onComplete, 3000);
            });
        }

        const timeout = setTimeout(() => {
            onComplete();
        }, 10000);

        return () => clearTimeout(timeout);
    }, [onComplete]);

    const handleVideoEndOrError = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-wine-darker flex items-center justify-center overflow-hidden">
            {/* Animated Background Orbs for the 'Logo' feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-glow/20 rounded-full blur-[100px] animate-pulse"></div>

            <div className="relative flex flex-col items-center">
                {/* Logo Intro Container - Smaller on Mobile */}
                <div className="
                    w-48 h-48 sm:w-80 sm:h-80 
                    rounded-[40px] overflow-hidden 
                    liquid-glass border-2 border-white/20 
                    shadow-[0_0_50px_rgba(255,154,60,0.3)]
                    animate-float
                ">
                    <video
                        ref={videoRef}
                        src={`${baseUrl}intro.mp4`}
                        className="w-full h-full object-cover"
                        onEnded={handleVideoEndOrError}
                        onError={handleVideoEndOrError}
                        muted
                        autoPlay
                        playsInline
                        preload="auto"
                    />
                </div>

                {/* Subtext for premium feel */}
                <div className="mt-8 text-center animate-pulse">
                    <p className="text-amber-glow font-bold tracking-[0.4em] uppercase text-xs sm:text-sm">
                        TECHBOY AI
                    </p>
                    <div className="mt-2 flex gap-1 justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-glow animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-glow animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-glow animate-bounce"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
