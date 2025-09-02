export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    document_id: string
    document_name: string
    page_number?: number
    chunk_index: number
    created_at: string
  }
  embedding: number[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: DocumentChunk[]
  timestamp: Date
}

export interface UploadedDocument {
  id: string
  name: string
  size: number
  type: string
  uploaded_at: string
  status: 'processing' | 'completed' | 'error'
}

export interface ChatResponse {
  answer: string
  sources: DocumentChunk[]
}
