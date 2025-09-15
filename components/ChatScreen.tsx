import React, { useState, useRef, useEffect } from 'react';
import type { Message, ConnectionState } from '../types';
import { MessageType } from '../types';
import { Button } from './common/Button';
import { SendIcon, PaperclipIcon, LogOutIcon } from './icons';

interface ChatScreenProps {
  messages: Message[];
  sendMessage: (content: string) => void;
  sendImage: (file: File) => void;
  closeConnection: () => void;
  connectionState: ConnectionState;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isMe = message.sender === 'me';
  const bubbleClasses = isMe
    ? 'bg-indigo-600 text-white self-end'
    : 'bg-gray-700 text-gray-200 self-start';
  
  if(message.type === MessageType.System) {
      return (
          <div className="text-center my-2">
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{message.content}</span>
          </div>
      )
  }

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2 my-1 ${bubbleClasses}`}>
        {message.type === MessageType.Text && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
        {message.type === MessageType.Image && (
          <img src={message.content} alt="Shared content" className="rounded-lg max-h-64 cursor-pointer" onClick={() => window.open(message.content, '_blank')}/>
        )}
      </div>
    </div>
  );
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ messages, sendMessage, sendImage, closeConnection, connectionState }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    sendMessage(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      sendImage(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  const EMOJI_PALETTE = ['😊', '😂', '❤️', '👍', '🤔', '🎉', '👋'];

  const statusMap: { [key in ConnectionState]: { text: string; color: string; pulse: boolean } } = {
    connected: { text: 'Connected', color: 'bg-green-500', pulse: false },
    connecting: { text: 'Connecting...', color: 'bg-yellow-500', pulse: true },
    disconnected: { text: 'Disconnected', color: 'bg-gray-500', pulse: false },
    failed: { text: 'Failed', color: 'bg-red-500', pulse: false },
  };
  const currentStatus = statusMap[connectionState];

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-800">
      <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700 shadow-md">
        <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Encrypted Chat</h1>
            <div className="flex items-center space-x-2">
                <span className={`h-2.5 w-2.5 rounded-full ${currentStatus.color} ${currentStatus.pulse ? 'animate-pulse' : ''}`}></span>
                <span className="text-sm text-gray-300">{currentStatus.text}</span>
            </div>
        </div>
        <Button onClick={closeConnection} variant="danger" size="sm">
            <LogOutIcon className="w-5 h-5 mr-2" />
            Leave
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex space-x-2 mb-2">
            {EMOJI_PALETTE.map(emoji => (
                <button 
                    key={emoji}
                    onClick={() => setText(t => t + emoji)} 
                    className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                >
                    {emoji}
                </button>
            ))}
        </div>
        <div className="flex items-center bg-gray-800 rounded-lg p-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none px-2 max-h-24"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button variant="ghost" className="p-2" onClick={() => fileInputRef.current?.click()}>
            <PaperclipIcon className="w-6 h-6 text-gray-400" />
          </Button>
          <Button variant="primary" className="p-2" onClick={handleSend} disabled={!text.trim()}>
            <SendIcon className="w-6 h-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
};
