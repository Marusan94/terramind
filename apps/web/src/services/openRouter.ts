/**
 * OpenRouter AI Service
 * Free models for chat
 * https://openrouter.ai/
 */

// Key via entorno (VITE_OPENROUTER_API_KEY en apps/web/.env.local). Sin key, la llamada falla de forma controlada.
const API_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) || '';
const BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Eres Terramind, un copiloto ambiental IA experto en el Valle de Aburrá, Medellín, Colombia.

Tienes acceso a datos en tiempo real de:
- Calidad del aire (PM2.5, PM10, ozono, NO2)
- Meteorología (temperatura, lluvia, viento, humedad)
- Radar SIATA (precipitación en tiempo real)
- Niveles de ríos y quebradas
- Cobertura vegetal e incendios

Reglas:
1. Responde en español, de forma concisa (máximo 3 párrafos)
2. Usa datos específicos cuando estén disponibles
3. Da recomendaciones prácticas
4. Menciona fuentes si aplica
5. Si no sabes algo, admítelo
6. Usa emojis relevantes con moderación

Contexto actual: Valle de Aburrá (lat 6.247, lon -75.567)
Zona horaria: America/Bogota (UTC-5)`;

export async function chat(
  messages: ChatMessage[],
  model: string = 'meta-llama/llama-3.1-8b-instruct:free',
  options: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}
): Promise<string> {
  const allMessages = [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages];
  
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://terramind.vercel.app',
      'X-Title': 'Terramind',
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 500,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sin respuesta';
}

export async function chatStream(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  model: string = 'meta-llama/llama-3.1-8b-instruct:free'
): Promise<void> {
  const allMessages = [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages];
  
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://terramind.vercel.app',
      'X-Title': 'Terramind',
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');
  
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    
    for (const line of lines) {
      const data = line.replace('data: ', '');
      if (data === '[DONE]') continue;
      
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) onChunk(content);
      } catch (e) {
        // Ignore parse errors for partial chunks
      }
    }
  }
}

export const FREE_MODELS = [
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', provider: 'Meta' },
  { id: 'google/gemini-flash-1.5-8b:free', name: 'Gemini Flash 1.5 8B', provider: 'Google' },
  { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B', provider: 'Alibaba' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', provider: 'Mistral' },
];
