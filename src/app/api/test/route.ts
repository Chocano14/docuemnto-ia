import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import openai from '@/lib/openai';

export async function GET() {
  try {
    const results = {
      supabase: false,
      openai: false,
      database: false,
      tables: false,
      openaiKey: false,
      openaiQuota: false,
    };

    // Probar si existe la API key de OpenAI
    if (
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
    ) {
      results.openaiKey = true;
    }

    // Probar Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('documents')
        .select('count')
        .limit(1);

      if (!error) {
        results.supabase = true;
        results.database = true;
      }
    } catch (error) {
      console.error('Error Supabase:', error);
    }

    // Probar OpenAI
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'test',
      });
      if (response.data[0].embedding) {
        results.openai = true;
        results.openaiQuota = true;
      }
    } catch (error) {
      console.error('Error OpenAI:', error);
      if (error instanceof Error && error.message.includes('quota')) {
        results.openai = false;
        results.openaiQuota = false;
      }
    }

    // Probar tablas
    try {
      const { data: documents, error: docError } = await supabaseAdmin
        .from('documents')
        .select('*')
        .limit(1);

      const { data: chunks, error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .select('*')
        .limit(1);

      if (!docError && !chunkError) {
        results.tables = true;
      }
    } catch (error) {
      console.error('Error tablas:', error);
    }

    // Determinar el estado general
    let status = 'ok';
    let message = 'Configuración completa';

    if (!results.openaiKey) {
      status = 'warning';
      message = 'OpenAI no configurado - usando modo de prueba';
    } else if (!results.openaiQuota) {
      status = 'warning';
      message = 'Cuota de OpenAI agotada - usando modo de prueba';
    } else if (!results.supabase) {
      status = 'error';
      message = 'Supabase no configurado';
    }

    return NextResponse.json({
      status,
      results,
      message,
      recommendations: {
        openai:
          results.openaiKey && !results.openaiQuota
            ? 'Agregar créditos a OpenAI'
            : null,
        supabase: !results.supabase ? 'Configurar Supabase' : null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
