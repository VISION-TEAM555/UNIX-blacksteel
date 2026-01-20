import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex w-full justify-end mb-6 animate-fade-in">
      <div className="relative group">
        {/* Background Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blacksteel-accent to-red-900 rounded-2xl rounded-bl-none opacity-20 blur-sm transition duration-1000 group-hover:opacity-30 animate-pulse-slow"></div>
        
        {/* Main Container */}
        <div className="relative flex items-center gap-4 bg-blacksteel-900 px-5 py-3 rounded-2xl rounded-bl-none border border-blacksteel-700/50 shadow-xl backdrop-blur-md">
          
          {/* Waveform Animation */}
          <div className="flex items-center justify-center h-4 gap-1">
            <div className="w-1 h-full bg-blacksteel-accent rounded-full animate-wave" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-full bg-blacksteel-accent/80 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-full bg-red-700 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-full bg-red-700/80 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1 h-full bg-blacksteel-accent/60 rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* Text Information */}
          <div className="flex flex-col justify-center border-r border-blacksteel-700 pr-4 mr-1">
            <span className="text-[10px] uppercase tracking-[0.15em] text-blacksteel-accent font-semibold leading-none mb-1">
              Unix AI
            </span>
            <span className="text-xs text-gray-400 font-light leading-none flex items-center">
              جاري التحليل
              <span className="inline-flex gap-0.5 mr-1">
                 <span className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                 <span className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                 <span className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Loader;