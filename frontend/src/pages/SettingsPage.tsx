import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings, Volume2, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState('intermediario');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem('sws-user');
    if (!userData) {
      navigate('/');
      return;
    }

    // Carregar configurações salvas
    const savedLevel = localStorage.getItem('sws-level') || 'intermediario';
    const savedSpeech = localStorage.getItem('sws-speech') !== 'false';
    
    setCurrentLevel(savedLevel);
    setSpeechEnabled(savedSpeech);
  }, [navigate]);

  const handleSaveSettings = () => {
    localStorage.setItem('sws-level', currentLevel);
    localStorage.setItem('sws-speech', speechEnabled.toString());
    
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const levels = [
    { value: 'basico', label: 'Básico', description: 'Explicações simples e diretas' },
    { value: 'intermediario', label: 'Intermediário', description: 'Equilibrio entre simplicidade e detalhes' },
    { value: 'avancado', label: 'Avançado', description: 'Explicações detalhadas e técnicas' }
  ];

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Configurações
            </h1>
            <p className="text-gray-600">Personalize sua experiência de aprendizado</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Nível de Aprendizado */}
          <Card className="p-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-2">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Nível de Aprendizado</h3>
                  <p className="text-sm text-gray-600">Adapte as explicações ao seu conhecimento</p>
                </div>
              </div>

              <div>
                <Label htmlFor="level" className="text-sm font-medium text-gray-700">
                  Selecione seu nível
                </Label>
                <Select value={currentLevel} onValueChange={setCurrentLevel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Configurações de Áudio */}
          <Card className="p-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Configurações de Áudio</h3>
                  <p className="text-sm text-gray-600">Controle a narração das respostas</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Narração automática
                  </Label>
                  <p className="text-xs text-gray-500">
                    Reproduzir automaticamente as respostas do assistente
                  </p>
                </div>
                <Button
                  variant={speechEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={speechEnabled ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {speechEnabled ? "Ativado" : "Desativado"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Salvar configurações */}
          <Button
            onClick={handleSaveSettings}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
