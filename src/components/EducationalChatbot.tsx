
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Settings, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import ChatSettings from './ChatSettings';
import StudySuggestions from './StudySuggestions';
import { generateResponse } from '@/utils/aiService';
import { speakText, stopSpeaking, isSpeaking } from '@/utils/speechService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const EducationalChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [currentLevel, setCurrentLevel] = useState('intermediario');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas
    setMessages([{
      id: '1',
      type: 'bot',
      content: 'Olá! Sou o EduBot AI, seu assistente educacional inteligente! 🎓\n\nEstou aqui para ajudar você a aprender de forma interativa e envolvente. Posso explicar conceitos, dar sugestões de estudo e adaptar minhas respostas ao seu nível de conhecimento.\n\nPara começar, você pode me perguntar sobre qualquer assunto que gostaria de aprender!',
      timestamp: new Date()
    }]);
  }, []);

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Erro no reconhecimento de voz",
          description: "Não foi possível capturar sua voz. Tente novamente.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  useEffect(() => {
    initSpeechRecognition();
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      toast({
        title: "Recurso não disponível",
        description: "Reconhecimento de voz não é suportado neste navegador.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking()) {
      stopSpeaking();
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Por favor, configure sua chave da API do Google Gemini nas configurações.",
        variant: "destructive"
      });
      setIsSettingsOpen(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateResponse(inputMessage, currentLevel, apiKey);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (isSpeechEnabled) {
        speakText(response);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Verifique sua conexão e tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro",
        description: "Não foi possível gerar uma resposta. Verifique sua API key e conexão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Chat Principal */}
      <div className="lg:col-span-3">
        <Card className="h-[600px] flex flex-col shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <h2 className="text-xl font-semibold">EduBot AI</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpeech}
                className="text-white hover:bg-white/20"
              >
                {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mensagens */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onSpeak={(text) => isSpeechEnabled && speakText(text)}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3 max-w-md">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta ou use o microfone..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={isListening ? stopListening : startListening}
                variant="outline"
                size="icon"
                className={isListening ? "bg-red-100 text-red-600" : ""}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Painel Lateral */}
      <div className="space-y-6">
        <StudySuggestions />
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50">
          <h3 className="font-semibold text-green-800 mb-2">💡 Dicas de Uso</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Use o microfone para perguntas por voz</li>
            <li>• Ajuste o nível nas configurações</li>
            <li>• Peça exemplos práticos</li>
            <li>• Solicite exercícios</li>
          </ul>
        </Card>
      </div>

      {/* Modal de Configurações */}
      <ChatSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />
    </div>
  );
};

export default EducationalChatbot;
