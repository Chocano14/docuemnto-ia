import pdf from 'pdf-parse';
import openai from './openai';
import { supabaseAdmin } from './supabase';
import { DocumentChunk } from '@/types';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer, {
      max: 0, // Sin límite de páginas
      version: 'v2.0.550',
    });
    return data.text;
  } catch (error) {
    throw new Error('Error al procesar el PDF: ' + error);
  }
}

export function chunkText(
  text: string,
  chunkSize: number = 200,
  overlap: number = 30
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    let chunk = text.slice(start, end);

    // Si no es el último chunk, intentar cortar en un punto o espacio
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastSpace = chunk.lastIndexOf(' ');

      if (lastPeriod > chunkSize * 0.8) {
        chunk = chunk.slice(0, lastPeriod + 1);
      } else if (lastSpace > chunkSize * 0.8) {
        chunk = chunk.slice(0, lastSpace);
      }
    }

    chunks.push(chunk.trim());
    start = start + chunk.length - overlap;
  }

  return chunks.filter(chunk => chunk.length > 15); // Filtrar chunks muy pequeños
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Verificar si tenemos API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.log(
        'No hay API key de OpenAI, usando embeddings simulados para testing'
      );
      // Generar embedding simulado para testing
      return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error al generar embedding con OpenAI:', error);

    // Si es error de cuota, usar embeddings simulados
    if (error instanceof Error && error.message.includes('quota')) {
      console.log('Cuota de OpenAI agotada, usando embeddings simulados');
      return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    }

    throw new Error('Error al generar embedding: ' + error);
  }
}

export async function saveChunksToDatabase(
  chunks: DocumentChunk[],
  documentId: string,
  documentName: string
): Promise<void> {
  try {
    // Procesar chunks en lotes para evitar sobrecarga de memoria
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const { error } = await supabaseAdmin.from('document_chunks').insert(
        batch.map(chunk => ({
          content: chunk.content,
          metadata: chunk.metadata,
          embedding: chunk.embedding,
        }))
      );

      if (error) throw error;

      // Pequeña pausa entre lotes para evitar sobrecarga
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    throw new Error('Error al guardar chunks en la base de datos: ' + error);
  }
}

export async function processDocument(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> {
  try {
    console.log(`Iniciando procesamiento de: ${fileName} (${fileType})`);

    // Extraer texto del documento
    let text: string;
    if (fileType === 'application/pdf') {
      console.log('Procesando PDF...');
      text = await extractTextFromPDF(fileBuffer);
    } else if (fileType.includes('text/')) {
      console.log('Procesando archivo de texto...');
      text = fileBuffer.toString('utf-8');
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    console.log(`Texto extraído: ${text.length} caracteres`);

    // Limitar el tamaño del texto para evitar problemas de memoria
    const maxTextLength = 15000; // 15KB de texto (reducido de 25KB)
    if (text.length > maxTextLength) {
      console.log(
        `Texto truncado de ${text.length} a ${maxTextLength} caracteres`
      );
      text =
        text.substring(0, maxTextLength) +
        '\n\n[Documento truncado por tamaño]';
    }

    // Dividir en chunks
    const textChunks = chunkText(text);
    console.log(`Documento dividido en ${textChunks.length} chunks`);

    if (textChunks.length === 0) {
      throw new Error('No se pudo extraer contenido útil del documento');
    }

    // Generar ID único para el documento
    const documentId = crypto.randomUUID();
    console.log(`ID del documento: ${documentId}`);

    // Generar embeddings para cada chunk con límite de concurrencia más bajo
    const chunks: DocumentChunk[] = [];
    const maxConcurrent = 1; // Procesar 1 chunk a la vez para evitar sobrecarga
    const maxChunks = 25; // Limitar a máximo 25 chunks para evitar sobrecarga de memoria

    // Limitar el número de chunks si es necesario
    const limitedChunks = textChunks.slice(0, maxChunks);
    if (textChunks.length > maxChunks) {
      console.log(`Limitando chunks de ${textChunks.length} a ${maxChunks}`);
    }

    for (let i = 0; i < limitedChunks.length; i += maxConcurrent) {
      const batch = limitedChunks.slice(i, i + maxConcurrent);
      console.log(
        `Procesando lote ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(limitedChunks.length / maxConcurrent)}`
      );

      const batchPromises = batch.map(async (chunkText, batchIndex) => {
        const chunkIndex = i + batchIndex;
        console.log(
          `Generando embedding para chunk ${chunkIndex + 1}/${limitedChunks.length}`
        );
        const embedding = await generateEmbedding(chunkText);
        return {
          id: crypto.randomUUID(),
          content: chunkText,
          metadata: {
            document_id: documentId,
            document_name: fileName,
            chunk_index: chunkIndex,
            created_at: new Date().toISOString(),
          },
          embedding,
        };
      });

      const batchResults = await Promise.all(batchPromises);
      chunks.push(...batchResults);

             // Pausa más larga entre lotes
       if (i + maxConcurrent < limitedChunks.length) {
         await new Promise(resolve => setTimeout(resolve, 2000));
       }
    }

    console.log(
      `Generados ${chunks.length} embeddings, guardando en base de datos...`
    );

    // Guardar en la base de datos
    await saveChunksToDatabase(chunks, documentId, fileName);

    console.log(`Documento procesado exitosamente: ${documentId}`);
    return documentId;
  } catch (error) {
    console.error('Error en processDocument:', error);
    throw new Error('Error al procesar documento: ' + error);
  }
}
