
import React, { useState, useEffect } from 'react';
import SplashScreen from "@/components/SplashScreen";
import AuthPage from "@/components/AuthPage";
import EducationalChatbot from "@/components/EducationalChatbot";

const Index = () => {
  const [appState, setAppState] = useState<'splash' | 'auth' | 'chat'>('splash');
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Verificar se usuário já está logado
    const savedUser = localStorage.getItem('sws-user');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
      setAppState('chat');
    }
  }, []);

  const handleSplashFinish = () => {
    setAppState('auth');
  };

  const handleLogin = (user: { name: string; email: string }) => {
    setUserData(user);
    localStorage.setItem('sws-user', JSON.stringify(user));
    setAppState('chat');
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('sws-user');
    setAppState('auth');
  };

  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (appState === 'auth' || !userData) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Study With Speech
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme seu aprendizado com narração inteligente e interação natural
          </p>
        </div>
        <EducationalChatbot userData={userData} onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Index;
