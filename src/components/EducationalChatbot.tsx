import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Settings, Volume2, VolumeX, BookOpen, User, LogOut } from 'lucide-react';
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
  rating?: 'positive' | 'negative' | 'love';
  saved?: boolean;
}

interface EducationalChatbotProps {
  userData: { name: string; email: string };
  onLogout: () => void;
}

const EducationalChatbot: React.FC<EducationalChatbotProps> = ({ userData, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [currentLevel, setCurrentLevel] = useState('intermediario');
  const [apiKey, setApiKey] = useState('');
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
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
    // Mensagem de boas-vindas personalizada
    setMessages([{
      id: '1',
      type: 'bot',
      content: `Olá, ${userData.name}! 🎓✨\n\nSou o SWS Assistant, seu companheiro de estudos com narração inteligente! Estou aqui para tornar seu aprendizado mais dinâmico e envolvente.\n\n🎯 **O que posso fazer por você:**\n• Explicar qualquer conceito de forma clara\n• Adaptar explicações ao seu nível\n• Narrar respostas com voz natural\n• Sugerir materiais de estudo\n• Criar exercícios práticos\n\nClique no botão 🔊 **Ouvir** para escutar minhas respostas narradas!\n\nSobre o que você gostaria de aprender hoje?`,
      timestamp: new Date()
    }]);
  }, [userData.name]);

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

  const handleRateMessage = (messageId: string, rating: 'positive' | 'negative' | 'love') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
  };

  const handleSaveMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, saved: true } : msg
    ));
    setSavedMessages(prev => [...prev, messageId]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Configure sua chave da API do Google Gemini nas configurações.",
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
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Chat Principal */}
      <div className="lg:col-span-3">
        <Card className="h-[700px] flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          {/* Header moderno */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">SWS Assistant</h2>
                <p className="text-sm opacity-90">Study With Speech</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{userData.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpeech}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {isSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mensagens */}
          <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onSpeak={(text) => isSpeechEnabled && speakText(text)}
                  onRate={handleRateMessage}
                  onSave={handleSaveMessage}
                  isSpeaking={isSpeaking()}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 max-w-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full p-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="thinking-dots flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-600 text-sm">Preparando resposta...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input moderno */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta ou use o microfone..."
                  className="pr-12 py-3 rounded-full border-2 border-gray-200 focus:border-purple-400 transition-all"
                  disabled={isLoading}
                />
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant="ghost"
                  size="sm"
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 ${
                    isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-gray-100"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full px-6 py-3 shadow-lg transition-all hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Painel Lateral */}
      <div className="space-y-6">
        <StudySuggestions />
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-0 shadow-lg">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            ✨ Dicas para Jovens Estudantes
          </h3>
          <ul className="text-sm text-purple-700 space-y-2">
            <li className="flex items-center gap-2">🎧 Use fones para melhor experiência sonora</li>
            <li className="flex items-center gap-2">⭐ Avalie as respostas para personalizar</li>
            <li className="flex items-center gap-2">💾 Salve conteúdos importantes</li>
            <li className="flex items-center gap-2">🗣️ Fale com o microfone para perguntas</li>
          </ul>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <h3 className="font-bold text-green-800 mb-2">📊 Seu Progresso</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-green-700">
              <span>Perguntas hoje:</span>
              <span className="font-semibold">{messages.filter(m => m.type === 'user').length}</span>
            </div>
            <div className="flex justify-between text-green-700">
              <span>Respostas salvas:</span>
              <span className="font-semibold">{savedMessages.length}</span>
            </div>
          </div>
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
