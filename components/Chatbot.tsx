
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { CloseIcon, SendIcon } from './Icon';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isThinking: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, messages, onSendMessage, isThinking }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[60vh] bg-gray-800 shadow-2xl rounded-2xl flex flex-col z-50 animate-fade-in-up">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">AI Filmmaking Assistant</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <CloseIcon />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
         {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-700 border-gray-600 rounded-full py-2 px-4 text-white focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isThinking}
          />
          <button type="submit" disabled={isThinking || !input.trim()} className="bg-indigo-600 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700">
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chatbot;
