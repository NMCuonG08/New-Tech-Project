// Chat Overlay Component - Icon floating và Chat Box

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { formatChatTime } from '../utils/chatUtils';

export function ChatOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { messages, loading, sendMessage, clearChat, messagesEndRef } = useChat();
    const inputRef = useRef(null);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle send message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || loading) return;

        const message = inputValue.trim();
        setInputValue('');
        await sendMessage(message);
    };

    // Handle toggle chat
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                    aria-label="Open chat"
                >
                    <MessageCircle className="h-6 w-6" />
                    {messages.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {messages.length}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Box */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                                <MessageCircle className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-100">AI Assistant</h3>
                                <p className="text-xs text-slate-400">Hỏi tôi bất cứ điều gì</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200"
                                    title="Clear chat"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={toggleChat}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                                aria-label="Close chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <MessageCircle className="mx-auto h-12 w-12 text-slate-500" />
                                    <p className="mt-4 text-sm text-slate-400">
                                        Chào bạn! Tôi có thể giúp gì cho bạn?
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.type === 'user'
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                                    : message.type === 'error'
                                                        ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                                                        : 'bg-white/10 text-slate-100 border border-white/20'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.content}
                                            </p>
                                            <p className="mt-1 text-xs opacity-70">
                                                {formatChatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                                                <span className="text-sm text-slate-300">Đang suy nghĩ...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSend} className="border-t border-white/10 p-4">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                disabled={loading}
                                className="flex-1 rounded-xl border border-white/20 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || loading}
                                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-white transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Send message"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

