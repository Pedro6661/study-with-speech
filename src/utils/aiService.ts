interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const generateResponse = async (
  message: string,
  level: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const levelPrompts = {
    iniciante: "Responda de forma muito simples, usando linguagem básica e exemplos do dia a dia. Evite termos técnicos. Use frases curtas e diretas.",
    intermediario: "Responda de forma clara, usando exemplos práticos e alguns termos técnicos explicados. Mantenha um equilíbrio entre simplicidade e profundidade.",
    avancado: "Responda com detalhes técnicos, teorias mais profundas e conceitos complexos. Mantenha a clareza mesmo com termos especializados.",
    universitario: "Responda no nível acadêmico superior, com rigor científico e referências teóricas. Mantenha a precisão técnica sem perder a didática."
  };

  const systemPrompt = `Você é o EduBot AI, um assistente educacional especializado em fornecer explicações claras e envolventes, com foco especial em conteúdo que será narrado por voz.

INSTRUÇÕES IMPORTANTES:
- Nível atual do usuário: ${level}
- ${levelPrompts[level as keyof typeof levelPrompts]}
- Sempre responda em português brasileiro
- Use pontuação adequada para pausas naturais na fala
- Evite abreviações e símbolos que não são lidos naturalmente
- Use exemplos práticos e analogias quando possível
- Seja encorajador e motivador
- Se a pergunta for muito vaga, peça esclarecimentos específicos
- Ofereça sugestões de estudo relacionadas ao tópico
- Use emojis moderadamente para tornar a resposta mais engajante
- Estruture respostas longas com tópicos e subtópicos
- Inclua dicas práticas de estudo quando relevante

FORMATO DE RESPOSTA:
1. Introdução breve do tema
2. Explicação principal do conceito
3. Exemplos práticos (quando aplicável)
4. Dicas de estudo ou materiais recomendados
5. Pergunta para continuar o aprendizado

DICAS PARA NARRAÇÃO:
- Use pontuação adequada para pausas naturais
- Evite números e símbolos que não são lidos naturalmente
- Use frases curtas e diretas
- Evite abreviações
- Use conectivos para transições suaves

Pergunta do usuário: ${message}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
