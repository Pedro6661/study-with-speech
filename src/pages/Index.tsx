
import EducationalChatbot from "@/components/EducationalChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            EduBot AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seu assistente educacional inteligente com narração envolvente e aprendizado adaptativo
          </p>
        </div>
        <EducationalChatbot />
      </div>
    </div>
  );
};

export default Index;
