
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, Calendar, Edit3, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name: '', email: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('sws-user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    const user = JSON.parse(savedUser);
    setUserData(user);
    setEditedData(user);
  }, [navigate]);

  const handleSave = () => {
    if (!editedData.name.trim() || !editedData.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('sws-user', JSON.stringify(editedData));
    setUserData(editedData);
    setIsEditing(false);
    
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
            <p className="text-gray-600">Personalize suas informações</p>
          </div>
        </div>

        {/* Perfil Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-purple-100">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {getInitials(userData.name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
            <p className="text-gray-600">{userData.email}</p>
          </div>

          <div className="space-y-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nome completo
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedData.name}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      {userData.name}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedData.email}
                      onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {userData.email}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>

            {/* Estatísticas */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Estatísticas de Uso
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                    <div className="text-sm text-purple-700">Perguntas Feitas</div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.floor(Math.random() * 20) + 5}
                    </div>
                    <div className="text-sm text-green-700">Mensagens Salvas</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
