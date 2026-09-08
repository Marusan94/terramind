/**
 * RAG (Retrieval Augmented Generation) Service
 * Sube documentos y busca contexto relevante
 */

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'text';
  content: string;
  chunks: string[];
  uploadedAt: Date;
  source: string;
}

export interface SearchResult {
  chunk: string;
  documentId: string;
  documentName: string;
  score: number;
  relevance: 'high' | 'medium' | 'low';
}

class RAGService {
  private documents: Document[] = [];
  private storageKey = 'terramind-rag-docs';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const docs = JSON.parse(saved);
        this.documents = docs.map((d: any) => ({
          ...d,
          uploadedAt: new Date(d.uploadedAt)
        }));
      }
    } catch (e) {
      console.error('Failed to load RAG documents:', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.documents));
    } catch (e) {
      console.error('Failed to save RAG documents:', e);
    }
  }

  // Parse different file types
  async parseFile(file: File): Promise<{ content: string; chunks: string[] }> {
    const content = await this.extractContent(file);
    const chunks = this.chunkContent(content, file.name);
    return { content, chunks };
  }

  private async extractContent(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    // For now, use text-based parsing
    // In production, use pdf-parse, xlsx, mammoth
    const text = await file.text();

    switch (extension) {
      case 'pdf':
        return this.cleanPDFText(text);
      case 'xlsx':
      case 'xls':
        return this.parseExcelText(text);
      case 'docx':
      case 'doc':
        return this.parseWordText(text);
      case 'txt':
      case 'md':
        return text;
      default:
        return text;
    }
  }

  private cleanPDFText(text: string): string {
    // Remove excessive whitespace, page markers, etc.
    return text
      .replace(/\f/g, '\n')
      .replace(/\[PAGE \d+\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private parseExcelText(text: string): string {
    // Convert tab/comma separated to readable text
    const lines = text.split('\n');
    return lines.map(line => {
      const cells = line.split(/[\t,]/);
      return cells.join(' | ');
    }).join('\n');
  }

  private parseWordText(text: string): string {
    return text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n');
  }

  private chunkContent(content: string, _filename: string): string[] {
    // Split into chunks of ~500 characters
    const chunkSize = 500;
    const chunks: string[] = [];
    
    // Split by sentences first
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    let currentChunk = '';
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += '. ' + sentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  // Add document to the knowledge base
  async addDocument(file: File): Promise<Document> {
    const { content, chunks } = await this.parseFile(file);
    
    const doc: Document = {
      id: crypto.randomUUID(),
      name: file.name,
      type: this.getFileType(file.name),
      content,
      chunks,
      uploadedAt: new Date(),
      source: 'user-upload',
    };
    
    this.documents.push(doc);
    this.saveToStorage();
    
    return doc;
  }

  private getFileType(filename: string): 'pdf' | 'excel' | 'word' | 'text' {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return 'excel';
    if (['docx', 'doc'].includes(ext || '')) return 'word';
    return 'text';
  }

  // Remove document
  removeDocument(id: string) {
    this.documents = this.documents.filter(d => d.id !== id);
    this.saveToStorage();
  }

  // Search relevant chunks
  search(query: string, topK: number = 5): SearchResult[] {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const results: SearchResult[] = [];
    
    for (const doc of this.documents) {
      for (const chunk of doc.chunks) {
        const chunkLower = chunk.toLowerCase();
        
        // Calculate relevance score
        let score = 0;
        for (const word of queryWords) {
          if (chunkLower.includes(word)) {
            score += 1;
            // Bonus for exact phrases
            if (chunkLower.includes(query.toLowerCase())) {
              score += 5;
            }
          }
        }
        
        if (score > 0) {
          results.push({
            chunk,
            documentId: doc.id,
            documentName: doc.name,
            score,
            relevance: score >= 5 ? 'high' : score >= 2 ? 'medium' : 'low',
          });
        }
      }
    }
    
    // Sort by score and return top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // Get all documents
  getDocuments(): Document[] {
    return this.documents;
  }

  // Clear all documents
  clearAll() {
    this.documents = [];
    this.saveToStorage();
  }
}

export const ragService = new RAGService();

// Sample documents about Medellín air quality
export const SAMPLE_DOCUMENTS: Array<{ name: string; content: string }> = [
  {
    name: 'siata_informe_2024.txt',
    content: `
      INFORME DE CALIDAD DEL AIRE - VALLE DE ABURRÁ 2024
      
      RESUMEN EJECUTIVO:
      Durante el año 2024, el Valle de Aburrá experimentó mejoras significativas en la calidad del aire.
      El AQI promedio anual fue de 78, representando una reducción del 12% respecto al año anterior.
      
      PRINCIPALES HALLAZGOS:
      1. PM2.5: El promedio anual fue de 28 µg/m³, superando la guía OMS de 15 µg/m³.
      2. PM10: Concentración promedio de 45 µg/m³, dentro del límite nacional de 50 µg/m³.
      3. O3: Se registraron 15 días con niveles superiores a 100 µg/m³.
      4. Estaciones más afectadas: Itagüí (industrial), Bello (vehicular).
      
      RECOMENDACIONES:
      - Implementar restricciones vehiculares más estrictas en horas pico
      - Fortalecer controles de emisiones industriales
      - Crear zonas de baja emisiones en centros comerciales
    `,
  },
  {
    name: 'politicas_aire_medellin.txt',
    content: `
      POLÍTICAS PÚBLICAS DE CALIDAD DEL AIRE - MEDELLÍN
      
      PLAN DE DESCONTAMINACIÓN ATMOSFÉRICA:
      
      OBJETIVO: Alcanzar niveles de PM2.5 menores a 20 µg/m³ para 2030.
      
      MEDIDAS IMPLEMENTADAS:
      
      1. PICO Y PLACA AMBIENTAL
         - Restricción vehicular por identificación par/impar
         - Aplicación en toda el área metropolitana
         - Horario: 5:00 AM - 8:00 PM
         - Reduce 20% de emisiones vehiculares
         
      2. ZONAS DE BAJA EMISIÓN (ZBE)
         - Centro de Medellín convertido en ZBE desde 2022
         - Solo vehículos con sticker verde pueden circular
         - Peatonalización del centro histórico
         
      3. INCENTIVOS A VEHÍCULOS LIMPIOS
         - Exención de pico y placa para eléctricos
         - Subsidio del 10% en impuesto vehicular para híbridos
         - Instalación de 500 puntos de carga eléctrica
         
      4. CONTROL INDUSTRIAL
         - Estándares de emisión más estrictos para fábricas
         - Monitoreo en tiempo real de 50 empresas grandes
         - Programa de reconversión tecnológica
      
      RESULTADOS ESPERADOS:
      - Reducción del 30% en PM2.5 para 2028
      - Mejora en la calidad de vida de 500,000 habitantes
      - Reducción de enfermedades respiratorias en 15%
    `,
  },
];

// Initialize with sample documents
export function initializeSampleDocuments() {
  const existingDocs = ragService.getDocuments();
  if (existingDocs.length === 0) {
    for (const doc of SAMPLE_DOCUMENTS) {
      const chunks = doc.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const fullDoc: Document = {
        id: crypto.randomUUID(),
        name: doc.name,
        type: 'text',
        content: doc.content,
        chunks: chunks.map(c => c.trim() + '.'),
        uploadedAt: new Date(),
        source: 'system',
      };
      ragService.getDocuments(); // Initialize storage first
      (ragService as any).documents.push(fullDoc);
      (ragService as any).saveToStorage();
    }
  }
}
