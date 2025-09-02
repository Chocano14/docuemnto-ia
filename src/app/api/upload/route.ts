import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/documentProcessor';
import { processDocumentSimple } from '@/lib/simpleDocumentProcessor';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Tipo de archivo no soportado. Solo se permiten PDF y archivos de texto.',
        },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 1MB para evitar problemas de memoria)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 1MB.' },
        { status: 400 }
      );
    }

    // Validar tamaño mínimo
    const minSize = 1024; // 1KB
    if (file.size < minSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado pequeño. Mínimo 1KB.' },
        { status: 400 }
      );
    }

    // Convertir archivo a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Registrar documento en la base de datos
    const { data: document, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert({
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al insertar documento:', insertError);
      return NextResponse.json(
        { error: 'Error al registrar el documento' },
        { status: 500 }
      );
    }

    try {
      // Procesar documento con timeout reducido - usar procesamiento simple para evitar errores de memoria
      const documentId = (await Promise.race([
        processDocumentSimple(buffer, file.name, file.type),
        new Promise(
          (_, reject) =>
            setTimeout(
              () =>
                reject(new Error('Timeout: El procesamiento tardó demasiado')),
              60000
            ) // 1 minuto
        ),
      ])) as string;

      // Actualizar estado del documento
      await supabaseAdmin
        .from('documents')
        .update({
          status: 'completed',
          document_id: documentId,
        })
        .eq('id', document.id);

      return NextResponse.json({
        success: true,
        documentId,
        message: 'Documento procesado exitosamente',
      });
    } catch (processingError) {
      console.error('Error al procesar documento:', processingError);

      // Actualizar estado a error
      await supabaseAdmin
        .from('documents')
        .update({
          status: 'error',
        })
        .eq('id', document.id);

      return NextResponse.json(
        {
          error:
            'Error al procesar el documento: ' +
            (processingError as Error).message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error general en upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
