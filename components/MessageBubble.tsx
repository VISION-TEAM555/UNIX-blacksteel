import React from 'react';
import { Message, MessageType } from '../types';
import MindMapVisualization from './MindMapVisualization';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic formatting helper (convert newlines to <br>, bold to <b>)
  const formatText = (text: string) => {
    return text.split('\n').map((str, index, array) => (
      <React.Fragment key={index}>
        {str.split(/(\*\*.*?\*\*)/).map((part, i) => 
          part.startsWith('**') && part.endsWith('**') ? 
          <b key={i} className="text-blacksteel-accent font-semibold">{part.slice(2, -2)}</b> : 
          <span key={i} className="opacity-90 group-hover:opacity-100 transition-opacity duration-300">{part}</span>
        )}
        {index === array.length - 1 ? null : <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full mb-6 animate-fade-in ${isUser ? 'justify-start' : 'justify-end'} group`}>
      <div 
        className={`
          max-w-[85%] md:max-w-[70%] p-5 rounded-2xl relative transition-all duration-300 ease-out
          ${isUser 
            ? 'bg-blacksteel-700 text-gray-100 rounded-br-none border border-blacksteel-600 hover:bg-blacksteel-600' 
            : 'bg-gradient-to-br from-blacksteel-800 to-blacksteel-900 text-gray-200 rounded-bl-none border border-blacksteel-600 shadow-lg shadow-black/50 hover:shadow-red-500/10 hover:border-blacksteel-500'}
        `}
      >
        {/* Role Label */}
        <div className={`text-xs font-bold mb-2 tracking-widest uppercase transition-colors duration-300 ${isUser ? 'text-gray-400 group-hover:text-gray-300' : 'text-blacksteel-accent group-hover:text-red-300'}`}>
          {isUser ? 'أنت' : 'Unix Blacksteel'}
        </div>

        {/* Content */}
        <div className="leading-relaxed text-base font-light">
          {message.type === MessageType.TEXT && (
            <div dir="rtl" className="whitespace-pre-wrap">
              {formatText(message.content)}
            </div>
          )}

          {message.type === MessageType.IMAGE && (
            <div className="mt-2 group/image relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-blacksteel-accent/0 group-hover/image:bg-blacksteel-accent/5 transition-colors duration-500 z-10 pointer-events-none"></div>
              <img 
                src={message.content} 
                alt="Generated Visual" 
                className="rounded-lg shadow-md border border-blacksteel-600 w-full object-cover max-h-96 transform transition-all duration-500 ease-out group-hover/image:scale-[1.02] group-hover/image:shadow-red-500/20"
              />
              <a 
                href={message.content} 
                download={`blacksteel-gen-${message.id}.png`}
                className="absolute bottom-4 right-4 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 translate-y-2 group-hover/image:translate-y-0 z-20 hover:bg-blacksteel-accent hover:text-black font-medium"
              >
                تحميل الصورة
              </a>
            </div>
          )}

          {message.type === MessageType.MINDMAP && message.mindMapData && (
             <MindMapVisualization data={message.mindMapData} />
          )}

           {message.type === MessageType.ERROR && (
            <div className="text-red-400 border border-red-900/50 bg-red-900/10 p-3 rounded hover:bg-red-900/20 transition-colors">
              {message.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;