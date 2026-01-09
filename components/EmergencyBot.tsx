
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/gemini';
import { 
  X, Send, Bot, HeartPulse, 
  Zap, Activity, Loader2, AlertCircle
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface EmergencyBotProps {
  userName: string;
}

const EmergencyBot: React.FC<EmergencyBotProps> = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Uplink established. I am HelpX. Describe your emergency or select a quick-action below. Help is en-route.` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = GeminiService.startFirstAidChat(userName);
      if ("vibrate" in navigator) navigator.vibrate(50);
    }
  }, [isOpen, userName]);

  const handleSend = async (customText?: string) => {
    const text = customText || input;
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) chatRef.current = GeminiService.startFirstAidChat(userName);
      
      const stream = await chatRef.current.sendMessageStream({ message: text });
      
      // Initialize an empty message for the model
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Neural link interrupted. Priority: Keep the patient warm and still." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'CPR Steps', icon: <HeartPulse className="w-3 h-3" /> },
    { label: 'Severe Bleeding', icon: <Activity className="w-3 h-3" /> },
    { label: 'Choking', icon: <Zap className="w-3 h-3" /> },
    { label: 'Seizure', icon: <AlertCircle className="w-3 h-3" /> },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-[6000] flex flex-col items-end pointer-events-none">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="w-[90vw] md:w-[400px] h-[70vh] max-h-[600px] bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col mb-6 pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-500">
          {/* HEADER */}
          <div className="bg-red-600 p-6 flex justify-between items-center shadow-lg relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-white/20 animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">HelpX</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-red-100 uppercase tracking-widest">Life-Aid AI Active</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-sm font-bold leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white rounded-tr-none shadow-xl' 
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none italic'
                }`}>
                  {msg.text.split('\n').map((line, li) => line.trim() ? (
                    <p key={li} className={line.startsWith('-') || line.match(/^\d\./) ? 'ml-2' : 'mb-2'}>
                      {line}
                    </p>
                  ) : null)}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[1.8rem] rounded-tl-none flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Triage...</span>
                </div>
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {quickActions.map((action, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(action.label)}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-600/50 text-[9px] font-black uppercase text-slate-400 hover:text-white px-4 py-2 rounded-full transition-all"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="p-6 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-2 flex items-center gap-2 focus-within:border-red-600/50 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe symptoms..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-white font-bold text-sm px-4 placeholder:text-slate-600"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-[1.5rem] transition-all shadow-lg shadow-red-900/40"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto p-6 bg-red-600 rounded-full shadow-[0_20px_50px_rgba(220,38,38,0.5)] border-4 border-white/10 hover:scale-110 active:scale-95 transition-all group relative"
      >
        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <div className="flex flex-col items-center">
            <HeartPulse className="w-8 h-8 text-white animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
};

export default EmergencyBot;
