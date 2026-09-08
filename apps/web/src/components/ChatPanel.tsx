/**
 * Chat Panel - Draggable, Resizable, Maximizable
 * Connected to OpenRouter with RAG
 */

import { useState, useRef, useEffect } from 'react';
import { ragService, initializeSampleDocuments, SearchResult } from '../services/rag';

// Key via entorno (VITE_OPENROUTER_API_KEY en apps/web/.env.local). Sin key, la llamada falla de forma controlada.
const API_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) || '';
const BASE_URL = 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `Eres **Terramind AI**, un asistente especializado en calidad del aire para Medellín y el Valle de Aburrá, Colombia.

## TU EXPERTISE:
1. **Calidad del Aire**: Interpreto datos de AQI, PM2.5, PM10, O3, NO2, CO, SO2
2. **Salud Pública**: Doy recomendaciones según condiciones respiratorias
3. **Políticas Públicas**: Conozco Pico y Placa, Zonas de Baja Emisión, Planes de Descontaminación
4. **Datos Científicos**: Estándares OMS, límites legales colombianos, metodologías de medición

## REGLAS DE RESPUESTA:
- Máximo 3 párrafos cortos
- Usa datos específicos cuando estén disponibles
- Da recomendaciones prácticas
- Cita fuentes si el usuario subió documentos
- Si no sabes algo, admítelo honestamente

## CONTEXTO:
- Ubicación: Valle de Aburrá, Medellín, Colombia
- Población: ~3.5 millones
- Hora: Colombia (UTC-5)`;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SearchResult[];
  error?: boolean;
}

interface ChatPanelProps {
  onClose: () => void;
  maximized: boolean;
  minimized: boolean;
  onMaximize: () => void;
  onMinimize: () => void;
  airQualityData?: { aqi: number; pm25: number; category: string };
}

export default function ChatPanel({
  onClose,
  maximized,
  minimized,
  onMaximize,
  onMinimize,
  airQualityData,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hola, soy **Terramind AI**.

Puedo ayudarte con:
• Calidad del aire actual y recomendaciones
• Políticas públicas de Medellín
• Subir y analizar documentos (PDF, Excel, Word)

**Datos actuales:** AQI ${airQualityData?.aqi || '--'}, PM2.5 ${airQualityData?.pm25 || '--'} µg/m³

¿Qué te gustaría saber?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showDocs, setShowDocs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

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
      // Search RAG for relevant context
      const searchResults = ragService.search(userMessage.content, 3);
      
      let ragContext = '';
      if (searchResults.length > 0) {
        ragContext = '\n\n**Información de documentos cargados:**\n';
        searchResults.forEach((result, i) => {
          ragContext += `${i + 1}. ${result.chunk}\n*(Fuente: ${result.documentName})*\n\n`;
        });
      }

      const airContext = airQualityData 
        ? `\n\n**Datos actuales Medellín:**\n• AQI: ${airQualityData.aqi}\n• PM2.5: ${airQualityData.pm25} µg/m³\n• Categoría: ${airQualityData.category}`
        : '';

      const fullPrompt = `${SYSTEM_PROMPT}${airContext}${ragContext}\n\n**Pregunta:** ${userMessage.content}`;

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin || 'http://localhost:3000',
          'X-Title': 'Terramind',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: fullPrompt },
            { role: 'user', content: userMessage.content },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

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
        content: `❌ Error conectando con OpenRouter.\n\nDetalles: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nIntenta de nuevo en un momento.`,
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
          content: `✅ **${file.name}** cargado exitosamente.\n${doc.chunks.length} secciones indexadas para búsqueda.`,
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

  const handleDragStart = (e: React.MouseEvent) => {
    if (maximized || minimized) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: 16,
      startPosY: 60,
    };
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDrag = (_e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
  };

  const handleDragEnd = () => {
    dragRef.current.isDragging = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  if (minimized) {
    return (
      <div 
        className="chat-panel minimized"
        style={{ bottom: 60, right: 16 }}
      >
        <div className="chat-header" onClick={onMinimize} style={{ cursor: 'pointer', borderRadius: 'var(--radius-lg)' }}>
          <span className="chat-header-icon">💬</span>
          <span className="chat-header-title">Terramind AI</span>
          <div className="chat-header-controls">
            <button className="chat-control-btn" onClick={() => onMinimize()}>
              +
            </button>
            <button className="chat-control-btn" onClick={() => onClose()}>
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  const panelClass = `chat-panel${maximized ? ' maximized' : ''}`;

  return (
    <div className={panelClass}>
      {/* Header */}
      <div className="chat-header" onMouseDown={handleDragStart}>
        <span className="chat-header-icon">💬</span>
        <span className="chat-header-title">Terramind AI</span>
        <div className="chat-header-controls">
          <button className="chat-control-btn" onClick={onMinimize} title="Minimizar">
            −
          </button>
          <button className="chat-control-btn" onClick={onMaximize} title={maximized ? 'Restaurar' : 'Maximizar'}>
            {maximized ? '❐' : '□'}
          </button>
          <button className="chat-control-btn" onClick={onClose} title="Cerrar">
            ×
          </button>
        </div>
      </div>

      {/* Docs Panel */}
      {showDocs && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              📂 Documentos ({documents.length})
            </span>
            <button 
              onClick={() => setShowDocs(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {documents.map(doc => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  background: 'var(--bg-3)',
                  borderRadius: 'var(--radius)',
                  fontSize: 10,
                }}
              >
                <span>{doc.type === 'pdf' ? '📕' : doc.type === 'excel' ? '📊' : doc.type === 'word' ? '📝' : '📄'}</span>
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name}
                </span>
                <button
                  onClick={() => removeDocument(doc.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: 12 }}
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
              padding: '6px 10px',
              background: 'var(--bg-1)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-muted)',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            📤 Subir PDF, Excel o Word
          </button>
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
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: 4, fontSize: 10 }}>📚 Fuentes:</div>
                {msg.sources.map((s, i) => (
                  <div key={i} style={{ marginBottom: 4, padding: 4, background: 'var(--bg-1)', borderRadius: 'var(--radius)' }}>
                    <div style={{ color: 'var(--accent)' }}>{s.documentName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message system">
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <button
          onClick={() => setShowDocs(!showDocs)}
          style={{
            width: 36,
            height: 36,
            background: showDocs ? 'var(--accent)' : 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: showDocs ? 'white' : 'var(--text-dim)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Adjuntar documentos"
        >
          📎
        </button>
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Pregunta sobre aire, salud o políticas..."
          disabled={isLoading}
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          ➤
        </button>
      </div>

      {/* Suggestions */}
      {!input && messages.length === 1 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>💡 Sugerencias:</div>
          <div className="suggestions">
            {[
              '¿Puedo salir a correr?',
              '¿Qué es el Pico y Placa?',
              'Zonas de Baja Emisión',
              'PM2.5 vs PM10',
            ].map((q, i) => (
              <button
                key={i}
                className="suggestion"
                onClick={() => setInput(q)}
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
