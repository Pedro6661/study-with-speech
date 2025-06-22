import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '@/utils/api';

interface SavedMessage {
  id: number;
  content: string;
  timestamp: string;
}

const SavedMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('sws-token');
    if (!token) return;
    fetch(`${API_URL}/saved-messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      });
  }, []);

  const handleRemove = async (id: number) => {
    const token = localStorage.getItem('sws-token');
    if (!token) return;
    await fetch(`${API_URL}/saved-messages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/chat')}
            className="rounded-full hover:bg-white/60"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-pink-500 bg-clip-text text-transparent">
              Mensagens Salvas
            </h1>
            <p className="text-gray-600">Veja e gerencie suas mensagens favoritas</p>
          </div>
        </div>
        {/* Lista de mensagens salvas */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">Nenhuma mensagem salva ainda.</Card>
          ) : (
            messages.map(msg => (
              <Card key={msg.id} className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString('pt-BR')}</span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleSpeak(msg.content)}>
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleRemove(msg.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="text-gray-800 text-base whitespace-pre-line">{msg.content}</div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedMessagesPage; 