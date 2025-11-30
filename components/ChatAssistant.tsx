
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { createAssessmentChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Button } from './Button';

interface ChatAssistantProps {
  contextData: any;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextData && !chat) {
      const newChat = createAssessmentChat(contextData);
      setChat(newChat);
      setMessages([{ 
        role: 'model', 
        text: `Hallo ${contextData.userName}! Ik ben uw AI-assistent. Ik zie dat u een ${contextData.archetype} profiel heeft. Heeft u vragen over uw resultaten of plan?` 
      }]);
    }
  }, [contextData, chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result: GenerateContentResponse = await chat.sendMessage({ message: userMsg });
      const responseText = result.text;
      setMessages(prev => [...prev, { role: 'model', text: responseText || "Excuus, ik kon geen antwoord genereren." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, er ging iets mis met de verbinding." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105 z-40 flex items-center gap-2"
      >
        <MessageSquare size={24} />
        <span className="font-bold hidden md:inline">Chat over resultaten</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 w-full md:max-w-md bg-white md:rounded-2xl shadow-2xl md:border border-slate-200 flex flex-col z-50 overflow-hidden animate-fade-in-up h-full md:h-[600px]">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center justify-between text-white flex-shrink-0">
        <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-400" />
            <span className="font-bold">KAI Assistent</span>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsOpen(false)} className="hover:text-slate-300 transition-colors p-1">
                <ChevronDown size={24} className="md:hidden" />
                <X size={20} className="hidden md:block" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-none'
                }`}>
                    {msg.text}
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm rounded-bl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span className="text-xs text-slate-400">Aan het denken...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0 mb-safe-area">
        <div className="flex gap-2">
            <input 
                type="text" 
                className="flex-1 bg-slate-100 border-0 rounded-lg px-4 py-3 md:py-2 focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 text-base"
                placeholder="Stel een vraag..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
            />
            <Button 
                size="sm" 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="px-3"
            >
                <Send size={20} />
            </Button>
        </div>
      </div>
    </div>
  );
};
