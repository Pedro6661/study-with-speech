import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Menu, Volume2, VolumeX, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '@/components/ChatMessage';
import DrawerMenu from '@/components/DrawerMenu';
import { generateResponse } from '@/utils/aiService';
import { speakText, stopSpeaking, isSpeaking } from '@/utils/speechService';
import API_URL from '@/utils/api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  rating?: 'positive' | 'negative';
  saved?: boolean;
  likes?: number;
  dislikes?: number;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [currentLevel, setCurrentLevel] = useState('intermediario');
  const [apiKey, setApiKey] = useState('');
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
  const [savedMessagesCount, setSavedMessagesCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Verificar se usuário está logado
  useEffect(() => {
    const userData = localStorage.getItem('sws-user');
    const token = localStorage.getItem('sws-token');
    if (!userData || !token) {
      navigate('/');
      return;
    }

    // Buscar estatísticas iniciais
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/saved-messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSavedMessagesCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Erro ao buscar mensagens salvas:", error);
      }
    };

    fetchStats();

    const user = JSON.parse(userData);
    // Mensagem de boas-vindas personalizada
    setMessages([{
      id: '1',
      type: 'bot',
      content: `Olá, ${user.name}! 🎓✨\n\nSou o SWS Assistant, seu companheiro de estudos com narração inteligente! Estou aqui para tornar seu aprendizado mais dinâmico e envolvente.\n\n🎯 **O que posso fazer por você:**\n• Explicar qualquer conceito de forma clara\n• Adaptar explicações ao seu nível\n• Narrar respostas com voz natural\n• Sugerir materiais de estudo\n• Criar exercícios práticos\n\nClique no botão 🔊 **Ouvir** para escutar minhas respostas narradas!\n\nSobre o que você gostaria de aprender hoje?`,
      timestamp: new Date()
    }]);
    // Carregar chave da API salva
    const savedApiKey = localStorage.getItem('sws-api-key') || '';
    setApiKey(savedApiKey);
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleRateMessage = async (messageId: string, rating: 'positive' | 'negative') => {
    const token = localStorage.getItem('sws-token');
    if (!token) {
      toast({
        title: 'Sessão expirada',
        description: 'Faça login novamente para avaliar mensagens.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    try {
      const endpoint = rating === 'positive' ? 'like' : 'dislike';
      const res = await fetch(`${API_URL}/messages/${messageId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar avaliação');
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, rating, likes: data.likes ?? msg.likes, dislikes: data.dislikes ?? msg.dislikes }
          : msg
      ));
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registrar avaliação.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveMessage = async (messageId: string) => {
    const token = localStorage.getItem('sws-token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/saved-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageId })
      });
      if (!res.ok) throw new Error('Erro ao salvar mensagem');
      
      // Atualiza estado visual da mensagem
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, saved: true } : msg
      ));
      
      // Atualiza contador
      setSavedMessagesCount(prevCount => prevCount + 1);

      toast({
        title: "Resposta salva!",
        description: "Você pode vê-la em 'Mensagens Salvas'.",
      });

    } catch (e) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('sws-token');
    if (!token) {
      toast({
        title: 'Sessão expirada',
        description: 'Faça login novamente para enviar mensagens.',
        variant: 'destructive'
      });
      navigate('/');
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
      // Envia mensagem para o backend
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: inputMessage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar mensagem');

      // Adiciona ao estado as mensagens do usuário e do bot, ambas com IDs reais do banco
      setMessages(prev => [
        ...prev.filter((msg, idx) => !(msg.type === 'user' && idx === prev.length - 1)),
        {
          id: String(data.userMessage.id),
          type: 'user',
          content: data.userMessage.content,
          timestamp: new Date(data.userMessage.createdAt),
        },
        {
          id: String(data.botMessage.id),
          type: 'bot',
          content: data.botMessage.content,
          timestamp: new Date(data.botMessage.createdAt),
        }
      ]);
      if (isSpeechEnabled) {
        speakText(data.botMessage.content);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: error.message || 'Erro ao enviar mensagem.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar mensagem.',
        variant: 'destructive'
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

  const handleSendSuggestion = async (text: string) => {
    const token = localStorage.getItem('sws-token');
    if (!token) {
      toast({
        title: 'Sessão expirada',
        description: 'Faça login novamente para enviar sugestões.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar sugestão');
      toast({
        title: 'Sugestão enviada!',
        description: 'Obrigado por contribuir com o app!',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar sugestão.',
        variant: 'destructive'
      });
    }
  };

  const handleSpeak = (messageId: string, text: string) => {
    setSpeakingMessageId(messageId);
    speakText(text, {
      onend: () => setSpeakingMessageId(null),
      onerror: () => setSpeakingMessageId(null)
    });
  };

  const handlePause = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
  };

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const handleEnd = () => setSpeakingMessageId(null);
    window.speechSynthesis.addEventListener('end', handleEnd);
    window.speechSynthesis.addEventListener('error', handleEnd);
    return () => {
      window.speechSynthesis.removeEventListener('end', handleEnd);
      window.speechSynthesis.removeEventListener('error', handleEnd);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <Card className="h-screen flex flex-col shadow-none border-0 bg-white/95 backdrop-blur-sm rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Bot className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">SWS Assistant</h2>
              <p className="text-sm opacity-90">Study With Speech</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSpeech}
            className="text-white hover:bg-white/20 rounded-full"
          >
            {isSpeechEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mensagens */}
        <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onSpeak={(text) => isSpeechEnabled && handleSpeak(message.id, text)}
                onPause={handlePause}
                onRate={handleRateMessage}
                onSave={handleSaveMessage}
                isSpeaking={speakingMessageId === message.id && isSpeaking()}
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

        {/* Input */}
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

      <DrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        savedMessagesCount={savedMessagesCount}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};

export default ChatPage;
