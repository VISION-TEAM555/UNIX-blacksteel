import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Message, AppMode, MessageType } from './types';
import { MODE_CONFIG } from './constants';
import * as GeminiService from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      type: MessageType.TEXT,
      content: "مرحباً بك في **Unix Blacksteel**.\nأنا مساعدك الذكي المتقدم للبحث والدراسة.\nكيف يمكنني مساعدتك اليوم؟",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.STUDY);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: MessageType.TEXT,
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        type: MessageType.TEXT,
        content: '',
        timestamp: Date.now()
      };

      if (mode === AppMode.VISUAL) {
        // Image Generation
        const base64Image = await GeminiService.generateImage(input);
        responseMsg.type = MessageType.IMAGE;
        responseMsg.content = base64Image;
      } else if (mode === AppMode.MINDMAP) {
        // Mind Map Generation
        const mapData = await GeminiService.generateMindMapData(input);
        responseMsg.type = MessageType.MINDMAP;
        responseMsg.content = `تم إنشاء خريطة ذهنية لـ: ${input}`;
        responseMsg.mindMapData = mapData;
      } else {
        // Text/Research/Study
        const text = await GeminiService.generateTextResponse(
          [...messages, userMsg], 
          input, 
          MODE_CONFIG[mode].promptModifier
        );
        responseMsg.content = text;
      }

      setMessages(prev => [...prev, responseMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        type: MessageType.ERROR,
        content: "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-blacksteel-900 text-gray-200 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-blacksteel-800/80 backdrop-blur border-b border-blacksteel-700 z-10">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-blacksteel-accent to-red-800 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/20">
            U
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            UNIX <span className="text-blacksteel-accent font-light">BLACKSTEEL</span>
          </h1>
        </div>
        
        <div className="hidden md:flex flex-col items-end text-xs text-gray-500">
           <div className="flex space-x-4 space-x-reverse">
             <span>لا يتطلب تسجيل دخول</span>
             <span>•</span>
             <span>جلسة آمنة</span>
           </div>
           <span className="text-[10px] text-gray-600 mt-0.5 opacity-80">Operated by UNIX.co</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
        
        {/* Sidebar (Desktop Mode Switcher) */}
        <aside className="hidden md:flex flex-col w-64 bg-blacksteel-800/30 border-l border-blacksteel-700 p-4 space-y-2">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-2">أوضاع التشغيل</div>
          {Object.values(AppMode).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 w-full text-right ${
                mode === m 
                  ? 'bg-blacksteel-700 text-blacksteel-accent border border-blacksteel-600 shadow-lg' 
                  : 'hover:bg-blacksteel-800 text-gray-400'
              }`}
            >
              <span className="text-xl">{MODE_CONFIG[m].icon}</span>
              <span className="font-medium">{MODE_CONFIG[m].label}</span>
            </button>
          ))}
          
          <div className="mt-auto pt-8">
             <div className="p-4 rounded-xl bg-blacksteel-800 border border-blacksteel-700 text-xs text-gray-400 leading-relaxed">
               <strong className="text-gray-200 block mb-1">تنبيه:</strong>
               يتم إعادة تعيين الجلسة تلقائياً عند إغلاق المتصفح لضمان الخصوصية.
             </div>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scroll-smooth">
             <div className="max-w-4xl mx-auto w-full pb-24">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <Loader />}
                <div ref={messagesEndRef} />
             </div>
          </div>

          {/* Mobile Mode Selector (Horizontal Scroll) */}
          <div className="md:hidden flex space-x-2 space-x-reverse overflow-x-auto p-2 bg-blacksteel-900 border-t border-blacksteel-700 whitespace-nowrap">
             {Object.values(AppMode).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center space-x-1 space-x-reverse ${
                    mode === m 
                      ? 'bg-blacksteel-700 border-blacksteel-accent text-blacksteel-accent' 
                      : 'bg-transparent border-blacksteel-700 text-gray-400'
                  }`}
                >
                  <span>{MODE_CONFIG[m].icon}</span>
                  <span>{MODE_CONFIG[m].label}</span>
                </button>
             ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-blacksteel-900 border-t border-blacksteel-700 z-20">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute -top-10 right-0 flex space-x-2 space-x-reverse">
                 {mode === AppMode.VISUAL && (
                   <span className="bg-blacksteel-accent/10 text-blacksteel-accent text-xs px-2 py-1 rounded border border-blacksteel-accent/20 animate-fade-in">
                     وضع توليد الصور مفعل
                   </span>
                 )}
                 {mode === AppMode.MINDMAP && (
                   <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded border border-orange-500/20 animate-fade-in">
                     وضع الخرائط الذهنية مفعل
                   </span>
                 )}
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={mode === AppMode.VISUAL ? "وصف الصورة المطلوبة..." : "اسألني عن أي شيء..."}
                  className="w-full bg-blacksteel-800 text-gray-100 placeholder-gray-500 rounded-2xl py-4 pr-6 pl-16 border border-blacksteel-700 focus:border-blacksteel-accent focus:ring-1 focus:ring-blacksteel-accent outline-none transition-all shadow-lg"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute left-2 top-2 bottom-2 aspect-square bg-blacksteel-accent text-blacksteel-900 rounded-xl flex items-center justify-center hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-blacksteel-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 rotate-180">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-center mt-2 text-[10px] text-gray-600">
                Unix Blacksteel AI • بحث دقيق • توليد مرئي • بدون تسجيل <span className="mx-1">|</span> Operated by UNIX.co
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default App;