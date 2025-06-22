import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Settings, Users, BookOpen } from 'lucide-react';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onLevelChange
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
            Configurações do EduBot
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
              <li>• A API da Groq é extremamente rápida e suporta modelos Llama 3</li>
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
