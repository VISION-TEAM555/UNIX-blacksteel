import React from 'react';
import { Message, MessageType } from '../types';
import MindMapVisualization from './MindMapVisualization';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic formatting helper
  const formatText = (text: string) => {
    return text.split('\n').map((str, index, array) => (
      <React.Fragment key={index}>
        {str.split(/(\*\*.*?\*\*)/).map((part, i) => 
          part.startsWith('**') && part.endsWith('**') ? 
          <b key={i} className="text-white font-bold drop-shadow-md">{part.slice(2, -2)}</b> : 
          <span key={i} className="text-gray-300">{part}</span>
        )}
        {index === array.length - 1 ? null : <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full mb-8 animate-slide-up ${isUser ? 'justify-start' : 'justify-end'} group`}>
      
      {/* Avatar / Icon */}
      {!isUser && (
        <div className="hidden md:flex flex-col items-center ml-4 mt-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blacksteel-800 to-black border border-blacksteel-accent/30 flex items-center justify-center shadow-glow text-blacksteel-accent text-xs font-bold">
                U
            </div>
            <div className="h-full w-px bg-gradient-to-b from-blacksteel-800 to-transparent mt-2"></div>
        </div>
      )}

      <div 
        className={`
          max-w-[90%] md:max-w-[75%] relative
          ${isUser ? 'pl-0' : 'pr-0'}
        `}
      >
        {/* Header Metadata */}
        <div className={`flex items-center gap-2 mb-2 text-[10px] tracking-widest uppercase font-mono ${isUser ? 'justify-start text-gray-500' : 'justify-end text-blacksteel-accent'}`}>
          {isUser ? (
             <>
               <span className="font-bold">OPERATOR</span>
               <span className="text-gray-700">|</span>
               <span className="opacity-50">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </>
          ) : (
             <>
               <span className="opacity-50">{new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               <span className="text-red-900/50">|</span>
               <span className="font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">UNIX BLACKSTEEL</span>
             </>
          )}
        </div>

        {/* Bubble Container */}
        <div 
          className={`
            p-5 md:p-6 rounded-xl border backdrop-blur-md transition-all duration-300
            ${isUser 
              ? 'bg-blacksteel-900/50 border-white/5 text-gray-200 rounded-tr-none hover:bg-blacksteel-800/50' 
              : 'bg-gradient-to-br from-blacksteel-900/90 to-blacksteel-800/40 border-blacksteel-accent/20 text-gray-100 rounded-tl-none shadow-lg shadow-black/20 hover:border-blacksteel-accent/40'}
          `}
        >
          {/* Decorative Lines for AI */}
          {!isUser && (
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blacksteel-accent/20 to-transparent opacity-50"></div>
          )}

          <div className="leading-7 text-sm md:text-base font-light">
            {message.type === MessageType.TEXT && (
              <div dir="rtl" className="whitespace-pre-wrap">
                {formatText(message.content)}
              </div>
            )}

            {message.type === MessageType.IMAGE && (
              <div className="mt-2 relative group/image overflow-hidden rounded-lg border border-white/10 bg-black/50">
                <img 
                  src={message.content} 
                  alt="Generated Visual" 
                  className="w-full h-auto object-cover opacity-90 transition-all duration-700 group-hover/image:opacity-100 group-hover/image:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end translate-y-2 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300">
                    <span className="text-[10px] text-gray-400 font-mono">IMG_GEN_V2.5</span>
                    <a 
                      href={message.content} 
                      download={`blacksteel-gen-${message.id}.png`}
                      className="bg-blacksteel-accent/90 hover:bg-blacksteel-accent text-black text-xs px-3 py-1.5 rounded font-bold transition-colors"
                    >
                      DOWNLOAD
                    </a>
                </div>
              </div>
            )}

            {message.type === MessageType.MINDMAP && message.mindMapData && (
               <MindMapVisualization data={message.mindMapData} />
            )}

             {message.type === MessageType.ERROR && (
              <div className="flex items-center gap-3 text-red-400 border border-red-900/30 bg-red-950/20 p-4 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{message.content}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Avatar / Icon */}
      {isUser && (
        <div className="hidden md:flex flex-col items-center mr-4 mt-2">
            <div className="w-8 h-8 rounded-full bg-blacksteel-800 border border-white/10 flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="h-full w-px bg-gradient-to-b from-blacksteel-800 to-transparent mt-2"></div>
        </div>
      )}

    </div>
  );
};

export default MessageBubble;