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
      content: "مرحباً بك في **Unix Blacksteel**.\nالنظام جاهز للعمل. حدد نمط المهمة للبدء.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.STUDY);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Image Paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setSelectedImage(event.target.result as string);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: MessageType.TEXT, // We display input as text, even if it has image attached contextually
      content: input + (selectedImage ? "\n[تم إرفاق صورة]" : ""),
      timestamp: Date.now()
    };
    
    // Create a temporary display message for user if image is attached
    if (selectedImage) {
        // In a real app we might want to show the image bubble separately
        // For now, we just append text indication. 
        // Or we could add a separate IMAGE message to the state immediately.
    }

    setMessages(prev => [...prev, userMsg]);
    
    // Store values for API call
    const promptToSend = input;
    const imageToSend = selectedImage;

    // Reset UI state
    setInput('');
    setSelectedImage(null);
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
        // Image Generation (Prompt only)
        const base64Image = await GeminiService.generateImage(promptToSend);
        responseMsg.type = MessageType.IMAGE;
        responseMsg.content = base64Image;
      } else if (mode === AppMode.MINDMAP) {
        // Mind Map Generation (Prompt only)
        const mapData = await GeminiService.generateMindMapData(promptToSend);
        responseMsg.type = MessageType.MINDMAP;
        responseMsg.content = `تم إنشاء هيكل بيانات للخرائط الذهنية: ${promptToSend}`;
        responseMsg.mindMapData = mapData;
      } else {
        // Text/Research/Study/Al-Duali (Supports Image + Text)
        const text = await GeminiService.generateTextResponse(
          [...messages, userMsg], 
          promptToSend, 
          MODE_CONFIG[mode].promptModifier,
          imageToSend || undefined
        );
        responseMsg.content = text;
      }

      setMessages(prev => [...prev, responseMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        type: MessageType.ERROR,
        content: "النظام غير قادر على الاتصال بالخادم. تحقق من الشبكة.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-blacksteel-950 text-gray-200 overflow-hidden font-sans selection:bg-blacksteel-accent selection:text-white relative">
      
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 bg-grid-overlay pointer-events-none z-0 opacity-40"></div>
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-blacksteel-900/40 backdrop-blur-xl border-b border-white/5 z-20 sticky top-0">
        <div className="flex items-center space-x-4 space-x-reverse group cursor-default">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blacksteel-800 to-black border border-white/10 flex items-center justify-center text-white font-bold text-xl shadow-glow group-hover:shadow-glow-strong transition-all duration-500 relative z-10">
              <span className="text-blacksteel-accent">U</span>
            </div>
            <div className="absolute inset-0 bg-blacksteel-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-wider text-white">
              UNIX <span className="text-blacksteel-accent font-light">BLACKSTEEL</span>
            </h1>
            <span className="text-[9px] text-gray-500 tracking-[0.2em] uppercase">Advanced Intelligence System</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-6 space-x-reverse">
           <div className="flex items-center space-x-2 space-x-reverse px-3 py-1 rounded-full bg-blacksteel-800/50 border border-white/5 text-[10px] text-gray-400">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span>SYSTEM ONLINE</span>
           </div>
           <span className="text-[10px] text-gray-600 font-mono opacity-60">V.2.0.4 // UNIX.CO</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col md:flex-row z-10">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-72 bg-blacksteel-900/20 backdrop-blur-sm border-l border-white/5 p-6 space-y-6">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-2">Protocol Selection</div>
          
          <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[60vh]">
            {Object.values(AppMode).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative group flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-300 border mb-2 ${
                  mode === m 
                    ? 'bg-blacksteel-800/80 border-blacksteel-accent/50 text-white shadow-glow' 
                    : 'bg-transparent border-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className={`text-xl transition-transform duration-300 ${mode === m ? 'scale-110' : 'group-hover:scale-110'}`}>{MODE_CONFIG[m].icon}</span>
                  <span className="font-medium text-sm tracking-wide">{MODE_CONFIG[m].label}</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                    {MODE_CONFIG[m].isBeta && (
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">BETA</span>
                    )}
                    {mode === m && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blacksteel-accent shadow-[0_0_8px_#ef4444]"></div>
                    )}
                </div>
                
                {/* Hover subtle glow background */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
              </button>
            ))}
          </div>
          
          <div className="mt-auto">
             <div className="p-4 rounded-xl bg-gradient-to-br from-blacksteel-800/50 to-black border border-white/5 text-[10px] text-gray-500 leading-relaxed backdrop-blur-md">
               <div className="flex items-center space-x-2 space-x-reverse mb-2 text-blacksteel-accent">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                   <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                 </svg>
                 <strong className="tracking-wider">SECURE SESSION</strong>
               </div>
               Data is processed in real-time. No persistent logs are maintained after window closure.
             </div>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 space-y-4 scroll-smooth">
             <div className="max-w-4xl mx-auto w-full pb-32">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <Loader />}
                <div ref={messagesEndRef} />
             </div>
          </div>

          {/* Mobile Mode Selector */}
          <div className="md:hidden flex space-x-2 space-x-reverse overflow-x-auto p-3 bg-blacksteel-900/80 backdrop-blur-md border-t border-white/5 scrollbar-hide">
             {Object.values(AppMode).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border flex items-center space-x-2 space-x-reverse whitespace-nowrap transition-colors flex-shrink-0 ${
                    mode === m 
                      ? 'bg-blacksteel-800 border-blacksteel-accent text-white shadow-glow' 
                      : 'bg-transparent border-white/5 text-gray-500'
                  }`}
                >
                  <span>{MODE_CONFIG[m].icon}</span>
                  <span>{MODE_CONFIG[m].label}</span>
                  {MODE_CONFIG[m].isBeta && <span className="text-[8px] text-red-400 bg-red-900/30 px-1 rounded">BETA</span>}
                </button>
             ))}
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-blacksteel-950 via-blacksteel-950/90 to-transparent z-30 pointer-events-none">
            <div className="max-w-4xl mx-auto relative pointer-events-auto">
              
              {/* Context Badges */}
              <div className="flex justify-end mb-3 space-x-2 space-x-reverse">
                 {mode === AppMode.VISUAL && (
                   <span className="flex items-center space-x-1 space-x-reverse bg-blacksteel-accent/10 text-blacksteel-accent text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded border border-blacksteel-accent/20 animate-fade-in shadow-glow">
                     <span>•</span><span>Visual Engine Active</span>
                   </span>
                 )}
                 {mode === AppMode.MINDMAP && (
                   <span className="flex items-center space-x-1 space-x-reverse bg-orange-500/10 text-orange-400 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded border border-orange-500/20 animate-fade-in">
                     <span>•</span><span>MindMap Structuring</span>
                   </span>
                 )}
                 {mode === AppMode.AL_DUALI && (
                   <span className="flex items-center space-x-1 space-x-reverse bg-red-500/10 text-red-400 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded border border-red-500/20 animate-fade-in">
                     <span>•</span><span>Al-Du'ali Verbal Engine (Beta)</span>
                   </span>
                 )}
              </div>
              
              {/* Image Preview */}
              {selectedImage && (
                  <div className="absolute -top-20 left-4 z-40 animate-slide-up">
                      <div className="relative group/preview">
                          <img src={selectedImage} alt="Upload Preview" className="h-16 w-16 object-cover rounded-lg border border-blacksteel-accent/50 shadow-glow" />
                          <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover/preview:opacity-100 transition-opacity"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                          </button>
                      </div>
                  </div>
              )}

              {/* Main Input Container */}
              <div className="relative group rounded-2xl bg-blacksteel-900/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 focus-within:border-blacksteel-accent/50 focus-within:shadow-glow focus-within:bg-blacksteel-900">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  onPaste={handlePaste}
                  placeholder={mode === AppMode.VISUAL ? "أدخل وصف المشهد المراد توليده..." : "أدخل سؤالاً أو الصق صورة للتحليل..."}
                  className="w-full bg-transparent text-gray-100 placeholder-gray-600 rounded-2xl py-5 pr-14 pl-20 focus:outline-none text-base font-light tracking-wide"
                  disabled={isLoading}
                />
                
                {/* File Upload Button */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-4 top-4 text-gray-500 hover:text-blacksteel-accent transition-colors"
                    title="Upload Image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="absolute left-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group-focus-within:bg-blacksteel-accent group-focus-within:text-black bg-blacksteel-800 text-gray-400 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-180">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
                
                {/* Decorative corner accents */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 rounded-bl-lg"></div>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-[10px] text-gray-600 font-mono">
                <span>SYSTEM STATUS: STABLE</span>
                <span>POWERED BY UNIX.CO</span>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default App;