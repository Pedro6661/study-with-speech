import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, Calendar, Edit3, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import API_URL from '@/utils/api';

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name: '', email: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
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

    // Buscar imagem de perfil do backend
    const token = localStorage.getItem('sws-token');
    if (token) {
      fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(users => {
          const current = Array.isArray(users) ? users.find((u: any) => u.email === user.email) : null;
          if (current && current.profileImage) setProfileImage(current.profileImage);
        });
      // Estatísticas reais do backend
      fetch(`${API_URL}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setQuestionsCount(data.length);
          }
        });
    }
    // Mensagens salvas continuam do localStorage
    const savedMessages = JSON.parse(localStorage.getItem('sws-saved-messages') || '[]');
    setSavedCount(savedMessages.length);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        // Salvar no backend
        const token = localStorage.getItem('sws-token');
        if (token) {
          await fetch(`${API_URL}/profile-image`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ profileImage: base64 })
          });
        }
      };
      reader.readAsDataURL(file);
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
            <p className="text-gray-600">Personalize suas informações</p>
          </div>
        </div>

        {/* Perfil Card */}
        <Card className="p-6 flex flex-col items-center gap-6 bg-white/95 shadow-xl border-0">
          <div className="relative group">
            <label htmlFor="profile-image-upload" className="cursor-pointer">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 shadow-lg hover:opacity-80 transition"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-5xl text-purple-600 border-4 border-purple-300 shadow-lg">
                  <User className="w-16 h-16" />
                </div>
              )}
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <div className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 shadow group-hover:bg-purple-100 transition">
              <span className="text-xs text-purple-700 font-semibold">Trocar foto</span>
            </div>
          </div>
          <div className="text-center mb-8">
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
                      {questionsCount}
                    </div>
                    <div className="text-sm text-purple-700">Perguntas Feitas</div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {savedCount}
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
