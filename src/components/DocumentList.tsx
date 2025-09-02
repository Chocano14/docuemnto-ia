'use client';

import { useState, useEffect } from 'react';
import { UploadedDocument } from '@/types';
import Modal from './Modal';

export default function DocumentList() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);

    const newModalConfig = {
      isOpen: true,
      title: 'Eliminar Documento',
      message: `¿Estás seguro de que quieres eliminar "${document?.name}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setDeletingId(documentId);
        try {
          const response = await fetch(`/api/documents/${documentId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            // Eliminar de la lista local
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          } else {
            const error = await response.json();
            // Mostrar error en modal
            setModalConfig({
              isOpen: true,
              title: 'Error',
              message: `Error al eliminar: ${error.error}`,
              onConfirm: () =>
                setModalConfig(prev => ({ ...prev, isOpen: false })),
            });
          }
        } catch (error) {
          console.error('Error al eliminar documento:', error);
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: 'Error al eliminar el documento. Inténtalo de nuevo.',
            onConfirm: () =>
              setModalConfig(prev => ({ ...prev, isOpen: false })),
          });
        } finally {
          setDeletingId(null);
        }
      },
    };

    setModalConfig(newModalConfig);
  };

  const handleRetry = async (documentId: string) => {
    setRetryingId(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}/retry`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refrescar la lista
        await fetchDocuments();
      } else {
        const error = await response.json();
        setModalConfig({
          isOpen: true,
          title: 'Error',
          message: `Error al reintentar: ${error.error}`,
          onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
        });
      }
    } catch (error) {
      console.error('Error al reintentar documento:', error);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Error al reintentar el documento. Inténtalo de nuevo.',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
      });
    } finally {
      setRetryingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">Cargando documentos...</p>
        </div>

        {/* Modal */}
        <Modal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.title === 'Error' ? 'Entendido' : 'Eliminar'}
          cancelText={modalConfig.title === 'Error' ? undefined : 'Cancelar'}
          type={modalConfig.title === 'Error' ? 'warning' : 'danger'}
        />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📁</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay documentos subidos
        </h3>
        <p className="text-gray-600">Sube tu primer documento para empezar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Documentos Subidos
        </h3>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-800">
            {documents.length} documentos
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Fondo con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative">
              {/* Header del documento */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      doc.type === 'application/pdf'
                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}
                  >
                    <span className="text-white text-xl">
                      {doc.type === 'application/pdf' ? '📄' : '📝'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 break-words">
                      {doc.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del documento */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subido:</span>
                  <span className="font-medium text-gray-700">
                    {formatDate(doc.uploaded_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Estado:</span>
                  <div
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(doc.status)}`}
                  >
                    <span>{getStatusIcon(doc.status)}</span>
                    <span>{getStatusText(doc.status)}</span>
                  </div>
                </div>

                {/* Indicador de progreso para documentos en procesamiento */}
                {doc.status === 'processing' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Procesando...</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    ID: {doc.id.slice(0, 8)}...
                  </span>
                  <div className="flex items-center space-x-2">
                    {/* Botón de reintentar para documentos con error o processing */}
                    {(doc.status === 'error' ||
                      doc.status === 'processing') && (
                      <button
                        onClick={() => handleRetry(doc.id)}
                        disabled={retryingId === doc.id}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {retryingId === doc.id
                          ? 'Reintentando...'
                          : '🔄 Reintentar'}
                      </button>
                    )}

                    {/* Botón de eliminar */}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {deletingId === doc.id ? 'Eliminando...' : '🗑️ Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {documents.length}
            </div>
            <div className="text-sm text-gray-600">Total documentos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Procesados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatFileSize(
                documents.reduce((acc, doc) => acc + doc.size, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Tamaño total</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.title === 'Error' ? 'Entendido' : 'Eliminar'}
        cancelText={modalConfig.title === 'Error' ? undefined : 'Cancelar'}
        type={modalConfig.title === 'Error' ? 'warning' : 'danger'}
      />
    </div>
  );
}
