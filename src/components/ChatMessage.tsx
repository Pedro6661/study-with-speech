
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak }) => {
  const isUser = message.type === 'user';

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
              : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800'
          }`}
        >
          <div className="flex items-start gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-white/20' : 'bg-blue-100'
            }`}>
              {isUser ? (
                <User className={`w-4 h-4 ${isUser ? 'text-white' : 'text-blue-600'}`} />
              ) : (
                <Bot className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">
                {isUser ? 'Você' : 'EduBot AI'}
              </div>
              <div className="text-sm leading-relaxed">
                {formatContent(message.content)}
              </div>
              {!isUser && (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSpeak(message.content)}
                    className="text-xs h-6 px-2 hover:bg-gray-200"
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Ouvir
                  </Button>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
