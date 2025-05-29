
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  BookOpen, 
  BarChart3, 
  LogOut,
  Home,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: string;
  onLevelChange: (level: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  savedMessagesCount: number;
  totalQuestions: number;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  savedMessagesCount,
  totalQuestions
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('sws-user');
    navigate('/');
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const userData = JSON.parse(localStorage.getItem('sws-user') || '{}');

  const menuItems = [
    {
      icon: Home,
      title: 'Chat Principal',
      description: 'Voltar ao chat',
      action: () => handleNavigation('/chat'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: User,
      title: 'Meu Perfil',
      description: 'Personalizar perfil',
      action: () => handleNavigation('/profile'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Settings,
      title: 'Configurações',
      description: 'API Key e preferências',
      action: () => handleNavigation('/settings'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Save,
      title: 'Mensagens Salvas',
      description: `${savedMessagesCount} mensagens salvas`,
      action: () => handleNavigation('/saved'),
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-purple-50 to-blue-50">
        <SheetHeader className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <SheetTitle className="text-white text-xl font-bold">
                Study With Speech
              </SheetTitle>
              <p className="text-white/90 text-sm">SWS Assistant</p>
            </div>
          </div>
          
          {/* Perfil do usuário */}
          <Card className="bg-white/10 border-white/20 p-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{userData.name}</p>
                <p className="text-white/80 text-sm">{userData.email}</p>
              </div>
            </div>
          </Card>
        </SheetHeader>

        <div className="flex-1 p-6 space-y-4">
          {/* Estatísticas rápidas */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Seu Progresso
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-green-700">
                <span>Perguntas hoje:</span>
                <span className="font-semibold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Respostas salvas:</span>
                <span className="font-semibold">{savedMessagesCount}</span>
              </div>
            </div>
          </Card>

          {/* Menu de navegação */}
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                onClick={item.action}
                variant="ghost"
                className="w-full justify-start h-auto p-4 hover:bg-white/60 transition-all"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className={`bg-gradient-to-r ${item.color} rounded-full p-2`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Dicas */}
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
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DrawerMenu;
