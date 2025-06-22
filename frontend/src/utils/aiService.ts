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
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          top_p: 0.95,
          max_tokens: 1024
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};
