
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, User, Bot, ThumbsUp, ThumbsDown, Heart, Save, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  rating?: 'positive' | 'negative' | 'love';
  saved?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string) => void;
  onRate: (messageId: string, rating: 'positive' | 'negative' | 'love') => void;
  onSave: (messageId: string) => void;
  isSpeaking?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onSpeak, 
  onRate, 
  onSave, 
  isSpeaking = false 
}) => {
  const isUser = message.type === 'user';
  const { toast } = useToast();

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleRate = (rating: 'positive' | 'negative' | 'love') => {
    onRate(message.id, rating);
    const ratingTexts = {
      positive: 'Obrigado pelo feedback positivo! 👍',
      negative: 'Vamos melhorar! Obrigado pelo feedback 🤝',
      love: 'Que bom que você amou! ❤️'
    };
    toast({
      title: "Avaliação registrada",
      description: ratingTexts[rating]
    });
  };

  const handleSave = () => {
    onSave(message.id);
    toast({
      title: "Resposta salva",
      description: "Esta resposta foi salva em seus favoritos 📚"
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl p-4 shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white ml-auto'
              : 'bg-white border border-gray-100 text-gray-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isUser ? 'bg-white/20' : 'bg-gradient-to-br from-purple-100 to-blue-100'
            }`}>
              {isUser ? (
                <User className={`w-5 h-5 ${isUser ? 'text-white' : 'text-purple-600'}`} />
              ) : (
                <Bot className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">
                  {isUser ? 'Você' : 'SWS Assistant'}
                </div>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="text-sm leading-relaxed mb-3">
                {formatContent(message.content)}
              </div>
              
              {!isUser && (
                <div className="flex items-center justify-between">
                  {/* Botão de fala grande e intuitivo */}
                  <Button
                    onClick={() => onSpeak(message.content)}
                    className={`${
                      isSpeaking 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 animate-pulse' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                    } text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Ouvir
                      </>
                    )}
                  </Button>
                  
                  {/* Botões de ação */}
                  <div className="flex items-center gap-1">
                    {/* Avaliações */}
                    <div className="flex items-center gap-1 mr-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRate('positive')}
                        className={`h-8 w-8 p-0 rounded-full transition-all hover:scale-110 ${
                          message.rating === 'positive' 
                            ? 'bg-green-100 text-green-600' 
                            : 'hover:bg-green-50 text-gray-500'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRate('love')}
                        className={`h-8 w-8 p-0 rounded-full transition-all hover:scale-110 ${
                          message.rating === 'love' 
                            ? 'bg-red-100 text-red-600' 
                            : 'hover:bg-red-50 text-gray-500'
                        }`}
                      >
                        <Heart className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRate('negative')}
                        className={`h-8 w-8 p-0 rounded-full transition-all hover:scale-110 ${
                          message.rating === 'negative' 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Salvar */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className={`h-8 w-8 p-0 rounded-full transition-all hover:scale-110 ${
                        message.saved 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'hover:bg-blue-50 text-gray-500'
                      }`}
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                  </div>
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
