import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Verificar documentos
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Verificar chunks
    const { data: chunks, error: chunksError } = await supabaseAdmin
      .from('document_chunks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      documents: {
        count: documents?.length || 0,
        data: documents,
        error: docsError,
      },
      chunks: {
        count: chunks?.length || 0,
        data: chunks?.map(chunk => ({
          id: chunk.id,
          content_length: chunk.content?.length,
          has_embedding: !!chunk.embedding,
          metadata: chunk.metadata,
          created_at: chunk.created_at,
        })),
        error: chunksError,
      },
    });
  } catch (error) {
    console.error('Error en debug:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
