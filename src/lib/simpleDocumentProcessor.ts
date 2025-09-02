import { extractTextFromPDF } from './documentProcessor';
import { supabaseAdmin } from './supabase';

export async function processDocumentSimple(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> {
  try {
    console.log(`Iniciando procesamiento simple de: ${fileName} (${fileType})`);

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
    const maxTextLength = 10000; // 10KB de texto
    if (text.length > maxTextLength) {
      console.log(
        `Texto truncado de ${text.length} a ${maxTextLength} caracteres`
      );
      text =
        text.substring(0, maxTextLength) +
        '\n\n[Documento truncado por tamaño]';
    }

    // Generar ID único para el documento
    const documentId = crypto.randomUUID();
    console.log(`ID del documento: ${documentId}`);

    // Guardar solo el texto en la base de datos (sin embeddings)
    const chunkData = {
      id: crypto.randomUUID(),
      content: text,
      metadata: {
        document_id: documentId,
        document_name: fileName,
        chunk_index: 0,
        created_at: new Date().toISOString(),
        simple_processing: true
      },
      embedding: null // Sin embedding
    };
    
    console.log('Intentando guardar chunk con datos:', {
      id: chunkData.id,
      content_length: chunkData.content.length,
      metadata: chunkData.metadata
    });
    
    const { error: insertError } = await supabaseAdmin
      .from('document_chunks')
      .insert(chunkData);

    if (insertError) {
      console.error('Error al guardar chunk:', insertError);
      throw new Error('Error al guardar en base de datos');
    }

    console.log(`Documento procesado exitosamente (modo simple): ${documentId}`);
    return documentId;
  } catch (error) {
    console.error('Error en processDocumentSimple:', error);
    throw new Error('Error al procesar documento: ' + error);
  }
}
