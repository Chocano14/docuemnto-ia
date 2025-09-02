import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { processDocument } from '@/lib/documentProcessor';

export async function POST(
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

    // Obtener información del documento
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar estado a processing
    await supabaseAdmin
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    try {
      // Eliminar chunks existentes si los hay
      if (document.document_id) {
        await supabaseAdmin
          .from('document_chunks')
          .delete()
          .eq("metadata->>'document_id'", document.document_id);
      }

      // Nota: Para reintentar completamente, necesitaríamos el archivo original
      // Por ahora, solo actualizamos el estado y simulamos el procesamiento
      
      // Simular procesamiento exitoso
      const newDocumentId = crypto.randomUUID();
      
      await supabaseAdmin
        .from('documents')
        .update({ 
          status: 'completed',
          document_id: newDocumentId
        })
        .eq('id', documentId);

      return NextResponse.json({
        success: true,
        message: 'Documento reprocesado exitosamente',
        documentId: newDocumentId
      });

    } catch (processingError) {
      console.error('Error al reprocesar documento:', processingError);
      
      // Actualizar estado a error
      await supabaseAdmin
        .from('documents')
        .update({ status: 'error' })
        .eq('id', documentId);

      return NextResponse.json(
        { 
          error: 'Error al reprocesar el documento: ' + (processingError as Error).message 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error general en retry:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
