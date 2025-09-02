'use client';

import { useState } from 'react';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Subiendo archivo...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('¡Archivo procesado exitosamente!');
        onUploadSuccess();
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        setUploadStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`relative group transition-all duration-300 ${
          dragActive ? 'scale-105' : 'hover:scale-[1.02]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
            dragActive
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl'
              : 'border-gray-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl'
          }`}
        >
          {/* Fondo animado */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Patrón de puntos */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-purple-500 rounded-full"></div>
            <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-12 right-4 w-1 h-1 bg-purple-400 rounded-full"></div>
          </div>

          <div className="relative p-12 text-center">
            <div className="space-y-6">
              {/* Icono animado */}
              <div className="relative mx-auto w-24 h-24">
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg transition-all duration-300 ${
                    dragActive
                      ? 'scale-110 rotate-12'
                      : 'group-hover:scale-105 group-hover:rotate-3'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  📄
                </div>
                {dragActive && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {dragActive
                    ? '¡Suelta tu archivo aquí!'
                    : 'Sube tu documento'}
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                  {dragActive
                    ? 'El archivo se procesará automáticamente'
                    : 'Arrastra y suelta un archivo PDF o texto aquí, o haz clic para seleccionar'}
                </p>

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>TXT</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>MD</span>
                  </div>
                </div>
              </div>

              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileInput}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 cursor-pointer ${
                  isUploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📁</span>
                    Seleccionar archivo
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Status message */}
      {uploadStatus && (
        <div
          className={`mt-6 p-4 rounded-xl border-l-4 transition-all duration-300 ${
            uploadStatus.includes('Error')
              ? 'bg-red-50 text-red-700 border-red-400 shadow-lg'
              : 'bg-green-50 text-green-700 border-green-400 shadow-lg'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                uploadStatus.includes('Error') ? 'bg-red-100' : 'bg-green-100'
              }`}
            >
              {uploadStatus.includes('Error') ? '❌' : '✅'}
            </div>
            <span className="font-medium">{uploadStatus}</span>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-4 text-sm text-gray-500 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Máximo 1MB</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Procesamiento automático</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>IA Inteligente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
