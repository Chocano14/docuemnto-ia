import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { error: 'ID de documento requerido' },
        { status: 400 }
      );
    }

    // Primero obtener el document_id del documento
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('document_id')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      console.error('Error al obtener documento:', fetchError);
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar los chunks asociados usando el document_id
    if (document.document_id) {
      const { error: chunksError } = await supabaseAdmin
        .from('document_chunks')
        .delete()
        .eq("metadata->>'document_id'", document.document_id);

      if (chunksError) {
        console.error('Error al eliminar chunks:', chunksError);
      }
    }

    // Luego eliminar el documento
    const { error: documentError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (documentError) {
      console.error('Error al eliminar documento:', documentError);
      return NextResponse.json(
        { error: 'Error al eliminar el documento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
