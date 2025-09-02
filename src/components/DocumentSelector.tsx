import React from 'react';
import { UploadedDocument } from '@/types';

interface DocumentSelectorProps {
  documents: UploadedDocument[];
  selectedDocuments: string[];
  onSelectionChange: (documentIds: string[]) => void;
}

export default function DocumentSelector({
  documents,
  selectedDocuments,
  onSelectionChange,
}: DocumentSelectorProps) {
  const handleDocumentToggle = (documentId: string) => {
    const newSelection = selectedDocuments.includes(documentId)
      ? selectedDocuments.filter(id => id !== documentId)
      : [...selectedDocuments, documentId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(documents.map(doc => doc.document_id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const selectedCount = selectedDocuments.length;
  const totalCount = documents.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Documentos para el chat
          </h3>
          <p className="text-sm text-gray-600">
            Selecciona los documentos sobre los que quieres hacer preguntas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            Seleccionar todos
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">
          {selectedCount} de {totalCount} documentos seleccionados
        </span>
        {selectedCount > 0 && (
          <span className="text-sm text-blue-600 font-medium">
            ✓ Chat activo
          </span>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-400 text-xl">📄</span>
          </div>
          <p className="text-gray-500 text-sm">
            No hay documentos cargados
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {documents.map((document) => (
            <div
              key={document.document_id}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedDocuments.includes(document.document_id)
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => handleDocumentToggle(document.document_id)}
            >
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(document.document_id)}
                  onChange={() => handleDocumentToggle(document.document_id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {document.name}
                </p>
                <p className="text-xs text-gray-500">
                  {document.status === 'completed' ? '✓ Procesado' : '⏳ Procesando...'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCount === 0 && documents.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⚠️ Selecciona al menos un documento para poder hacer preguntas
          </p>
        </div>
      )}
    </div>
  );
}
