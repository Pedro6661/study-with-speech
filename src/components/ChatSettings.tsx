
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Settings, Key, Users, BookOpen, ExternalLink } from 'lucide-react';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: string;
  onLevelChange: (level: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onLevelChange,
  apiKey,
  onApiKeyChange
}) => {
  const levels = [
    { value: 'iniciante', label: 'Iniciante', desc: 'Explicações simples e básicas' },
    { value: 'intermediario', label: 'Intermediário', desc: 'Conceitos moderados com exemplos' },
    { value: 'avancado', label: 'Avançado', desc: 'Explicações detalhadas e técnicas' },
    { value: 'universitario', label: 'Universitário', desc: 'Nível acadêmico superior' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do EduBot
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* API Key Configuration */}
          <Card className="p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-blue-600" />
              <Label className="text-sm font-semibold text-blue-800">
                Chave da API do Google Gemini
              </Label>
            </div>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Cole sua chave da API aqui..."
              className="mb-2"
            />
            <div className="text-xs text-blue-600">
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Obter chave da API gratuita
              </a>
            </div>
          </Card>

          {/* Learning Level */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <Label className="text-sm font-semibold">Nível de Aprendizado</Label>
            </div>
            <Select value={currentLevel} onValueChange={onLevelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-gray-500">{level.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tips */}
          <Card className="p-3 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Dicas</span>
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• A API do Gemini é gratuita para uso pessoal</li>
              <li>• Sua chave é armazenada localmente no navegador</li>
              <li>• Ajuste o nível para respostas mais adequadas</li>
            </ul>
          </Card>

          <Button 
            onClick={onClose} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
          >
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatSettings;
