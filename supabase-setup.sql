-- Habilitar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla para documentos
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
    document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para chunks de documentos con embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    embedding vector(1536), -- Para text-embedding-3-small
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda vectorial
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Función para buscar documentos similares
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Políticas RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Políticas para documentos (permitir lectura y escritura para todos por ahora)
CREATE POLICY "Allow all operations on documents" ON documents
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on document_chunks" ON document_chunks
    FOR ALL USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
