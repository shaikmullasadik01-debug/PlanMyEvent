import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { FullEventData, ChatMessage } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AIAssistantChatProps {
  eventData: FullEventData;
  onRefresh: () => void;
  onNavigate: (view: string) => void;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ eventData, onRefresh, onNavigate }) => {
  const { event } = eventData;

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am your Senior Event Planning Specialist for **${event.name}**.\n\nI have complete visibility into your **${event.currency} ${event.totalBudget.toLocaleString()}** budget, ${event.guestCount} projected attendees, vendors, and milestone deadlines. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    { label: 'Reduce Budget 15%', prompt: `Analyze my current expenses and suggest concrete ways to reduce my event budget by 15% without removing primary activities or compromising guest experience.` },
    { label: '3-Month Preparation Timeline', prompt: `Create a phased 3-month preparation timeline leading up to ${event.date}, highlighting critical vendor booking deadlines.` },
    { label: 'Outdoor Decor Hacks', prompt: `Suggest stylish, atmospheric decoration and lighting ideas for an outdoor evening celebration with color palette ${event.colors.join(', ')}.` },
    { label: 'Emergency Backup Plan', prompt: `What are the top 3 contingency scenarios (weather, vendor delay, dietary shortfall) for ${event.type} and how should we mitigate them?` },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, event.id);
      const assistantMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: res.reply || 'I processed your request, but could not retrieve details.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: `I encountered an issue connecting with the planning engine: ${err.message || 'Please retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <span>Conversational Copilot</span>
            <span>·</span>
            <span>Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B3B2B]">
            AI Event Planning Specialist
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('budget')}
            className="px-3 py-1.5 text-xs font-semibold text-[#1B3B2B] bg-[#F2EDE4] hover:bg-[#EAE4D7] rounded-lg transition-colors border border-[#DDD5C7]"
          >
            Go to Budget Manager →
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm overflow-hidden flex flex-col h-[650px]">
        {/* Active Context Banner */}
        <div className="px-6 py-2.5 bg-[#FAF8F5] border-b border-[#E8E2D8] flex items-center justify-between text-xs text-[#52635A]">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="font-semibold text-[#1B3B2B]">Live Event Context:</span>
            <span className="truncate">{event.name} ({event.city})</span>
          </div>
          <span className="font-mono text-[#1B3B2B] shrink-0 font-semibold">
            {event.currency} {event.totalBudget.toLocaleString()}
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-[#1B3B2B] text-white'
                      : 'bg-[#F2EDE4] text-[#1B3B2B] border border-[#DDD5C7]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#C5A859]" />}
                </div>

                <div className={`space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#1B3B2B] text-white rounded-tr-none'
                        : 'bg-[#FAF8F5] text-[#1E2522] border border-[#E8E2D8] rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.content}
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[10px] text-[#8C9B92]">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        className="hover:text-[#1B3B2B] flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-[#F2EDE4] text-[#1B3B2B] border border-[#DDD5C7] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-[#C5A859]" />
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] text-[#52635A] border border-[#E8E2D8] text-xs flex items-center gap-2">
                <span>Senior Event Architect is formulating recommendations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-6 py-2.5 bg-[#F5F2EB] border-t border-[#E8E2D8] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-[#6B7D73] whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-[#C5A859]" />
            Suggestions:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isLoading}
              className="px-3 py-1 text-[11px] font-medium bg-white hover:bg-[#FAF8F5] text-[#1B3B2B] border border-[#DDD5C7] rounded-lg whitespace-nowrap transition-colors shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E8E2D8]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything: 'Suggest affordable lighting', 'Optimize catering', 'Draft run sheet schedule'..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-4 py-2.5 text-xs text-[#1E2522] focus:outline-none focus:ring-1 focus:ring-[#1B3B2B]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 text-white bg-[#1B3B2B] hover:bg-[#142B20] disabled:opacity-40 rounded-xl transition-all shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
