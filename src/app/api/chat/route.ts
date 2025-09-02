import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/documentProcessor';

export async function POST(request: NextRequest) {
  try {
    const { question, documentIds } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere una pregunta válida' },
        { status: 400 }
      );
    }

    // Verificar si tenemos OpenAI configurado
    const hasOpenAI =
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    if (!hasOpenAI) {
      // Modo de prueba sin OpenAI
      return NextResponse.json({
        answer: `Esta es una respuesta de prueba. Tu pregunta fue: "${question}". Para obtener respuestas reales, necesitas configurar OpenAI con créditos disponibles.`,
        sources: [
          {
            id: 'demo-1',
            content:
              'Este es un contenido de ejemplo para demostrar la funcionalidad.',
            metadata: {
              document_name: 'Documento de Prueba',
              chunk_index: 0,
              created_at: new Date().toISOString(),
            },
          },
        ],
      });
    }

    // Generar embedding para la pregunta
    const questionEmbedding = await generateEmbedding(question);

    // Buscar chunks más relevantes usando similitud de coseno
    let chunks;
    let searchError;

    // Primero intentar buscar documentos con embeddings
    if (questionEmbedding) {
      try {
        // Construir query para match_documents con filtro de documentos
        let matchQuery = {
          query_embedding: questionEmbedding,
          match_threshold: 0.7,
          match_count: 5,
        };

        // Si hay documentos seleccionados, necesitamos filtrar después
        const result = await supabaseAdmin.rpc('match_documents', matchQuery);
        chunks = result.data;
        searchError = result.error;

        // Filtrar por documentos seleccionados si se proporcionan
        if (documentIds && documentIds.length > 0 && chunks) {
          console.log(
            'Filtrando resultados vectoriales por documentos seleccionados:',
            documentIds
          );
          chunks = chunks.filter((chunk: any) =>
            documentIds.includes(chunk.metadata.document_id)
          );
        }
      } catch (error) {
        console.log('Búsqueda vectorial falló, usando documentos simples');
        chunks = null;
        searchError = error;
      }
    }

    // Si no hay chunks con embeddings, buscar documentos simples
    if (!chunks || chunks.length === 0) {
      console.log('Buscando documentos procesados de forma simple...');

      // Construir query base
      let query = supabaseAdmin
        .from('document_chunks')
        .select('*')
        .is('embedding', null);

      // Filtrar por documentos seleccionados si se proporcionan
      if (documentIds && documentIds.length > 0) {
        console.log('Filtrando por documentos seleccionados:', documentIds);
        query = query.in("metadata->>'document_id'", documentIds);
      }

      const result = await query
        .order('created_at', { ascending: false })
        .limit(5);

      chunks = result.data;
      searchError = result.error;

      console.log('Chunks sin embeddings encontrados:', chunks?.length || 0);
      if (chunks && chunks.length > 0) {
        console.log('Primer chunk simple:', {
          id: chunks[0].id,
          content_length: chunks[0].content?.length,
          metadata: chunks[0].metadata,
        });
      }
    }

    if (searchError) {
      console.error('Error en búsqueda vectorial:', searchError);
      return NextResponse.json(
        { error: 'Error al buscar en la base de datos' },
        { status: 500 }
      );
    }

    console.log('Chunks encontrados:', chunks?.length || 0);

    if (!chunks || chunks.length === 0) {
      console.log(
        'No se encontraron chunks, devolviendo respuesta por defecto'
      );
      return NextResponse.json({
        answer:
          'Lo siento, no encontré información relevante en los documentos para responder tu pregunta. Asegúrate de que hay documentos subidos y procesados.',
        sources: [],
      });
    }

    // Construir contexto con los chunks más relevantes
    console.log('Construyendo contexto con chunks:', chunks.length);
    const context = chunks
      .map(
        (chunk: any) =>
          `Documento: ${chunk.metadata.document_name}\nContenido: ${chunk.content}`
      )
      .join('\n\n');

    console.log('Contexto construido, longitud:', context.length);

    // Generar respuesta usando OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente inteligente que responde preguntas basándose en los documentos proporcionados. 
          Responde de manera clara y concisa. Si la información no está en los documentos, indícalo claramente.
          Siempre cita las fuentes de información cuando sea posible.`,
        },
        {
          role: 'user',
          content: `Contexto de los documentos:\n\n${context}\n\nPregunta: ${question}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content;
    console.log(
      'Respuesta de OpenAI generada:',
      answer?.substring(0, 100) + '...'
    );

    // Formatear fuentes para la respuesta
    const sources = chunks.map((chunk: any) => ({
      id: chunk.id,
      content: chunk.content,
      metadata: chunk.metadata,
    }));

    console.log('Enviando respuesta al cliente');
    return NextResponse.json({
      answer,
      sources,
    });
  } catch (error) {
    console.error('Error en chat:', error);

    // Si es error de OpenAI, devolver respuesta de prueba
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json({
        answer: `Error: Se agotó la cuota de OpenAI. Tu pregunta fue: "${question}". Para usar la funcionalidad completa, agrega créditos a tu cuenta de OpenAI.`,
        sources: [],
      });
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
