
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen, Calculator, Atom, Globe, Palette } from 'lucide-react';

const StudySuggestions = () => {
  const suggestions = [
    {
      icon: <Calculator className="w-4 h-4" />,
      title: "Matemática",
      topics: ["Álgebra básica", "Geometria", "Estatística"]
    },
    {
      icon: <Atom className="w-4 h-4" />,
      title: "Ciências",
      topics: ["Física", "Química", "Biologia"]
    },
    {
      icon: <Globe className="w-4 h-4" />,
      title: "Geografia",
      topics: ["Capitais", "Relevo", "Clima"]
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      title: "História",
      topics: ["Brasil Colonial", "Revolução Industrial", "Guerras Mundiais"]
    },
    {
      icon: <Palette className="w-4 h-4" />,
      title: "Artes",
      topics: ["Renascimento", "Arte Moderna", "Música Clássica"]
    }
  ];

  const quickQuestions = [
    "Como funciona a fotossíntese?",
    "Explique a Lei de Newton",
    "O que foi a Revolução Francesa?",
    "Como resolver equações do 2º grau?",
    "Quais são os planetas do sistema solar?"
  ];

  return (
    <div className="space-y-4">
      {/* Sugestões de Tópicos */}
      <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">Tópicos Populares</h3>
        </div>
        <div className="space-y-3">
          {suggestions.slice(0, 3).map((subject, index) => (
            <div key={index} className="border border-yellow-200 rounded-lg p-3 bg-white/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">{subject.icon}</span>
                <span className="font-medium text-sm text-yellow-800">{subject.title}</span>
              </div>
              <div className="space-y-1">
                {subject.topics.map((topic, topicIndex) => (
                  <Button
                    key={topicIndex}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-yellow-700 hover:bg-yellow-100 w-full justify-start"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Perguntas Rápidas */}
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <h3 className="font-semibold text-purple-800 mb-3">🚀 Perguntas Rápidas</h3>
        <div className="space-y-2">
          {quickQuestions.slice(0, 4).map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-xs h-auto py-2 px-3 text-purple-700 border-purple-200 hover:bg-purple-100"
            >
              {question}
            </Button>
          ))}
        </div>
      </Card>

      {/* Estatísticas */}
      <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
        <h3 className="font-semibold text-indigo-800 mb-3">📊 Sua Jornada</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-indigo-700">
            <span>Perguntas hoje:</span>
            <span className="font-semibold">0</span>
          </div>
          <div className="flex justify-between text-indigo-700">
            <span>Tópicos explorados:</span>
            <span className="font-semibold">0</span>
          </div>
          <div className="flex justify-between text-indigo-700">
            <span>Tempo de estudo:</span>
            <span className="font-semibold">0 min</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudySuggestions;
