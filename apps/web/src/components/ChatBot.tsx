/**
 * ChatBot Especializado en Calidad del Aire y Políticas Públicas
 * Usa OpenRouter + RAG
 */

import { useState, useRef, useEffect } from 'react';
import { ragService, initializeSampleDocuments, SearchResult } from '../services/rag';

// Key via entorno (VITE_OPENROUTER_API_KEY en apps/web/.env.local). Sin key, la llamada falla de forma controlada.
const API_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) || '';
const BASE_URL = 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `Eres Terramind AI, un asistente especializado en calidad del aire para Medellín y el Valle de Aburrá.

EXPERTISE:
1. **Calidad del Aire**: Interpreto datos de AQI, PM2.5, PM10, O3, NO2
2. **Salud**: Doy recomendaciones según condiciones respiratorias (asma, EPOC, alergias)
3. **Políticas Públicas**: Conozco los planes de descontaminación, Zonas de Baja Emisión, Pico y Placa Ambiental
4. **Datos Científicos**: Puedo explicar metodologías de medición, estándares OMS, límites legales

REGLAS:
- Responde en español, máximo 3 párrafos
- Usa datos específicos cuando estén disponibles
- Cita fuentes de documentos cargados si son relevantes
- Da recomendaciones prácticas y accionables
- Si no sé algo, lo admito claramente

CONTEXTO ACTUAL:
- Ubicación: Valle de Aburrá, Medellín, Colombia
- Zona horaria: America/Bogota (UTC-5)
- Población afectada: ~3.5 millones de personas`;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SearchResult[];
  error?: boolean;
}

export default function ChatBot({ 
  onClose,
  airQualityData,
}: { 
  onClose?: () => void;
  airQualityData?: { aqi: number; pm25: number; category: string };
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '🌍 Hola, soy **Terramind AI**. Puedo ayudarte con:\n\n• Calidad del aire actual y pronóstico\n• Recomendaciones de salud\n• Políticas públicas de Medellín\n• Datos de documentos que subas\n\n**¿Qué te gustaría saber?**',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeSampleDocuments();
    setDocuments(ragService.getDocuments());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Search RAG for relevant context
      const searchResults = ragService.search(userMessage.content, 3);
      
      // 2. Build context from RAG
      let ragContext = '';
      if (searchResults.length > 0) {
        ragContext = '\n\n**Información de documentos cargados:**\n';
        searchResults.forEach((result, i) => {
          ragContext += `${i + 1}. ${result.chunk}\n   *(Fuente: ${result.documentName})*\n`;
        });
      }

      // 3. Build air quality context
      const airContext = airQualityData 
        ? `\n\n**Datos actuales de Medellín:**\n• AQI: ${airQualityData.aqi}\n• PM2.5: ${airQualityData.pm25} µg/m³\n• Categoría: ${airQualityData.category}`
        : '';

      // 4. Call OpenRouter
      const fullPrompt = `${SYSTEM_PROMPT}${airContext}${ragContext}\n\n**Pregunta del usuario:** ${userMessage.content}`;

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Terramind',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: fullPrompt },
            { role: 'user', content: userMessage.content },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        sources: searchResults.length > 0 ? searchResults : undefined,
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Tuve un problema conectando con el servicio. Por favor intenta de nuevo.',
        error: true,
      }]);
    }

    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const doc = await ragService.addDocument(file);
        setDocuments(ragService.getDocuments());
        
        setMessages(prev => [...prev, {
          id: (Date.now() + file.name).toString(),
          role: 'system',
          content: `✅ Documento cargado: **${file.name}** (${doc.chunks.length} secciones indexadas)`,
        }]);
      } catch (error) {
        setMessages(prev => [...prev, {
          id: (Date.now() + file.name).toString(),
          role: 'system',
          content: `❌ Error subiendo ${file.name}`,
          error: true,
        }]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    ragService.removeDocument(id);
    setDocuments(ragService.getDocuments());
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: '🗑️ Documento eliminado del índice',
    }]);
  };

  return (
    <div className="chat-bot-container">
      {/* Header */}
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="chat-title">
          <div className="chat-title-icon">T</div>
          Terramind AI
          <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 8 }}>
            • Calidad del Aire • Políticas Públicas
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowDocs(!showDocs)}
            style={{
              background: showDocs ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${showDocs ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 10,
              color: showDocs ? 'var(--accent)' : 'var(--text-dim)',
              cursor: 'pointer',
            }}
          >
            📄 Docs ({documents.length})
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Documents Panel */}
      {showDocs && (
        <div style={{
          padding: 12,
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
            📂 Documentos cargados ({documents.length})
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {documents.map(doc => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  fontSize: 10,
                }}
              >
                <span>{doc.type === 'pdf' ? '📕' : doc.type === 'excel' ? '📊' : doc.type === 'word' ? '📝' : '📄'}</span>
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name}
                </span>
                <button
                  onClick={() => removeDocument(doc.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.docx,.doc,.txt,.md"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--bg-3)',
              border: '1px dashed var(--border)',
              borderRadius: 4,
              color: 'var(--text-dim)',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            📤 Subir PDF, Excel o Word
          </button>
          
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>
            Los documentos se usan como contexto para el chat (RAG)
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role} ${msg.error ? 'error' : ''}`}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            
            {msg.sources && msg.sources.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 9, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 9, marginBottom: 4 }}>📚 Fuentes de documentos:</div>
                {msg.sources.map((s, i) => (
                  <div key={i} style={{ marginBottom: 4, padding: 4, background: 'var(--bg-2)', borderRadius: 4 }}>
                    <div style={{ color: 'var(--accent)' }}>{s.documentName}</div>
                    <div>{s.chunk.substring(0, 150)}...</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message system">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="loading-dot" />
              <span className="loading-dot" style={{ animationDelay: '0.2s' }} />
              <span className="loading-dot" style={{ animationDelay: '0.4s' }} />
              Analizando...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Pregunta sobre aire, salud o políticas..."
          disabled={isLoading}
          style={{ flex: 1 }}
        />
        <button
          className="chat-send"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          ➤
        </button>
      </div>

      {/* Suggested questions */}
      {!input && messages.length === 1 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 10 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>💡 Preguntas sugeridas:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[
              '¿Puedo salir a correr?',
              '¿Qué es el Pico y Placa Ambiental?',
              '¿Cuáles son las Zonas de Baja Emisión?',
              '¿Cómo afecta el PM2.5 a los niños?',
              '¿Qué políticas reducen la contaminación?',
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                style={{
                  padding: '4px 8px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  color: 'var(--text-dim)',
                  fontSize: 10,
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
