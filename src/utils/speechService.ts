let currentUtterance: SpeechSynthesisUtterance | null = null;
let availableVoices: SpeechSynthesisVoice[] = [];

export const speakText = (text: string, options?: {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}): void => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Para qualquer fala em andamento
  speechSynthesis.cancel();

  // Remove emojis e limpa o texto
  const cleanText = text
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[#*]/g, '')
    .trim();

  if (!cleanText) return;

  currentUtterance = new SpeechSynthesisUtterance(cleanText);
  
  // Configurações para português brasileiro
  currentUtterance.lang = 'pt-BR';
  currentUtterance.rate = options?.rate ?? 0.85;
  currentUtterance.pitch = options?.pitch ?? 1;
  currentUtterance.volume = options?.volume ?? 0.8;

  // Seleciona a voz
  if (options?.voice) {
    const selectedVoice = availableVoices.find(v => v.name === options.voice);
    if (selectedVoice) {
      currentUtterance.voice = selectedVoice;
    }
  } else {
    // Tenta usar uma voz em português se disponível
    const ptVoice = availableVoices.find(voice => 
      voice.lang.includes('pt') || voice.lang.includes('BR')
    );
    if (ptVoice) {
      currentUtterance.voice = ptVoice;
    }
  }

  // Eventos
  currentUtterance.onstart = () => {
    console.log('Speech started');
  };

  currentUtterance.onend = () => {
    console.log('Speech ended');
    currentUtterance = null;
  };

  currentUtterance.onerror = (event) => {
    console.error('Speech error:', event);
    currentUtterance = null;
  };

  speechSynthesis.speak(currentUtterance);
};

export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
};

export const isSpeaking = (): boolean => {
  return 'speechSynthesis' in window && speechSynthesis.speaking;
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  return availableVoices;
};

export const getPortugueseVoices = (): SpeechSynthesisVoice[] => {
  return availableVoices.filter(voice => 
    voice.lang.includes('pt') || voice.lang.includes('BR')
  );
};

// Carregar vozes quando disponíveis
if ('speechSynthesis' in window) {
  const loadVoices = () => {
    availableVoices = speechSynthesis.getVoices();
    console.log('Voices loaded:', availableVoices.length);
  };

  // Carrega as vozes imediatamente se já estiverem disponíveis
  loadVoices();

  // E também quando o evento de mudança de vozes for disparado
  speechSynthesis.onvoiceschanged = loadVoices;
}
