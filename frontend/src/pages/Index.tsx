
import React, { useState, useEffect } from 'react';
import SplashScreen from "@/components/SplashScreen";
import AuthPage from "@/components/AuthPage";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [appState, setAppState] = useState<'splash' | 'auth'>('splash');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário já está logado
    const savedUser = localStorage.getItem('sws-user');
    if (savedUser) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleSplashFinish = () => {
    setAppState('auth');
  };

  const handleLogin = (user: { name: string; email: string }) => {
    localStorage.setItem('sws-user', JSON.stringify(user));
    navigate('/chat');
  };

  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return <AuthPage onLogin={handleLogin} />;
};

export default Index;
