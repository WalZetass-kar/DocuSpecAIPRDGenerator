import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { PRDDocument } from '../types';
import { supabase } from '../lib/supabase';
import { generateContent } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePRD?: PRDDocument | null;
}

const QUICK_SUGGESTIONS = [
  'Bagaimana cara menulis PRD yang jelas dan lengkap?',
  'Bantu buat kriteria penerimaan (Acceptance Criteria) untuk fitur Login & OAuth.',
  'Rekomendasi tech stack terbaik untuk aplikasi AI SaaS Web & Mobile.',
  'Apa perbedaan antara Functional Requirement dan Non-Functional Requirement?',
  'Bagaimana cara membagi PRD menjadi User Story & Sprint Task?',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  activePRD,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: activePRD
        ? `Halo! Saya AI Product Assistant. Saya siap membantu Anda mendiskusikan, menyempurnakan, atau menjawab pertanyaan terkait PRD **"${activePRD.title}"**. Ada yang ingin Anda tanyakan?`
        : 'Halo! Saya AI Product Assistant. Saya siap membantu Anda membuat PRD, menentukan strategi produk, menyusun User Story, atau memilih tech stack terbaik. Ada yang bisa saya bantu hari ini?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const systemInstruction = 'You are an AI Product Assistant. Answer the user based on the PRD context provided. Format with markdown.';
      
      const prdContext = activePRD
        ? {
            title: activePRD.title,
            category: activePRD.category,
            platform: activePRD.platform,
            problemStatement: activePRD.problemStatement,
          }
        : null;

      const promptText = `
PRD Context:
${prdContext ? JSON.stringify(prdContext, null, 2) : 'No PRD context available.'}

User message: ${query}
      `;

      const aiResponseText = await generateContent(promptText, systemInstruction);

      const assistantMsg: Message = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      let fallbackAnswer = err?.message || 'Maaf, terjadi gangguan jaringan. ';
      if (!err?.message) {
        if (query.toLowerCase().includes('prd')) {
          fallbackAnswer +=
            'PRD (Product Requirements Document) yang efektif mencakup: Executive Summary, Problem Statement, Target User & Persona, Functional Requirements dengan kriteria penerimaan, Architecture & Tech Stack, serta Risk & Timeline.';
        } else if (query.toLowerCase().includes('tech stack') || query.toLowerCase().includes('stack')) {
          fallbackAnswer +=
            'Untuk aplikasi modern, kombinasi yang sangat direkomendasikan adalah React/Vite + Tailwind CSS + TypeScript di Frontend, Express / Node.js di Backend, dan Firebase Firestore / Cloud SQL untuk Database.';
        } else {
          fallbackAnswer += 'Bisa diulangi atau diperjelas pertanyaan Anda terkait proyek ini?';
        }
      }

      const fallbackMsg: Message = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: fallbackAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: activePRD
          ? `Percakapan direset. Ada pertanyaan lain mengenai PRD **"${activePRD.title}"**?`
          : 'Percakapan direset. Silakan tanyakan apa saja seputar perencanaan produk, PRD, atau sistem software!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 border border-gray-200  dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100/10 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-black/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B11226] text-white flex items-center justify-center shadow-md shadow-[#B11226]/20">
              <Bot className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  AI Product Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activePRD ? `Konteks: ${activePRD.title}` : 'Asisten pintar seputar PRD & Produk'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar bg-gray-50/30 dark:bg-gray-950/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-2xl bg-[#B11226] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[80%] space-y-1`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#B11226] text-white font-medium rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-xs shadow-xs markdown-chat'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 text-[10px] text-gray-400 px-1 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-0.5 cursor-pointer ml-1"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-2xl bg-[#B11226] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200  dark:border-gray-700 text-gray-500 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B11226] animate-spin" />
                <span>AI sedang berpikir...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-2 px-1 uppercase tracking-wider">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Rekomendasi Pertanyaan:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {QUICK_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-2xl bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/40 text-gray-700 dark:text-gray-300 hover:text-[#B11226] dark:hover:text-red-400 border border-gray-200  dark:border-gray-700/80 hover:border-red-200 dark:hover:border-red-900/50 text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-100/10 dark:border-gray-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanya AI Asisten (misal: Bantu buat User Story)..."
              disabled={isLoading}
              className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B11226]/50 focus:border-[#B11226] transition-all disabled:opacity-50 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-3 bg-[#B11226] hover:bg-[#900E1F] transition-colors text-white font-extrabold rounded-2xl shadow-md shadow-[#B11226]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-2 text-xs sm:text-sm"
            >
              <span>Kirim</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
