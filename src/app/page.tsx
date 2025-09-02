'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import Chat from '@/components/Chat';
import DocumentList from '@/components/DocumentList';
import DocumentSelector from '@/components/DocumentSelector';
import { UploadedDocument } from '@/types';

export default function Home() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'chat' | 'documents'>(
    'upload'
  );

  const handleUploadSuccess = () => {
    fetchDocuments();
    setActiveTab('chat');
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const hasDocuments = documents.length > 0;
  const hasCompletedDocuments = documents.some(
    doc => doc.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header con diseño moderno */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Asistente de Documentos
                </h1>
                <p className="text-gray-600 font-medium">
                  IA Inteligente para Análisis de Documentos
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✨ IA Activa
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs con diseño moderno */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">📤</span>
                <span>Subir Documentos</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              disabled={!hasCompletedDocuments}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : hasCompletedDocuments
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">💬</span>
                <span>Chat IA</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'documents'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">📁</span>
                <span>Documentos</span>
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content con diseño moderno */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'upload' && (
          <div className="space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-800 font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Nuevo
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
                Sube tus Documentos
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Sube archivos PDF o de texto para que nuestro asistente de IA
                pueda analizarlos y responder tus preguntas de manera
                inteligente.
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />

            {hasDocuments && (
              <div className="mt-16">
                <DocumentList />
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <DocumentSelector
              documents={documents.filter(doc => doc.status === 'completed')}
              selectedDocuments={selectedDocuments}
              onSelectionChange={setSelectedDocuments}
            />
            <div className="h-[calc(100vh-300px)] w-full -mx-4 sm:-mx-6 lg:-mx-8">
              <Chat
                documentsLoaded={hasCompletedDocuments}
                selectedDocuments={selectedDocuments}
              />
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full text-green-800 font-medium mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Gestión
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
                Tus Documentos
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Gestiona todos los documentos que has subido y revisa su estado
                de procesamiento.
              </p>
            </div>
            <DocumentList />
          </div>
        )}
      </main>

      {/* Footer moderno */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Asistente de Documentos Inteligente
              </span>
            </div>
            <p className="text-gray-600">
              Powered by OpenAI & Supabase • Diseñado para la productividad
              moderna
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
