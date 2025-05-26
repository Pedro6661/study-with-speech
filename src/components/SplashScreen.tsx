
import React, { useEffect, useState } from 'react';
import { Volume2, BookOpen, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center z-50">
      <div className="text-center text-white">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-110 animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="w-12 h-12 animate-bounce-subtle" />
              <Volume2 className="w-12 h-12 animate-pulse-gentle" />
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
          SWS
        </h1>
        <h2 className="text-2xl font-semibold mb-1">Study With Speech</h2>
        <p className="text-lg opacity-90 mb-8">Aprenda ouvindo, evolua falando</p>
        
        <div className="w-64 bg-white/20 rounded-full h-2 mx-auto mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-center space-x-1 text-sm opacity-75">
          <Sparkles className="w-4 h-4" />
          <span>Carregando sua experiência de aprendizado...</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
