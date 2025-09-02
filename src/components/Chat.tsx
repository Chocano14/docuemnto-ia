'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, DocumentChunk } from '@/types';

interface ChatProps {
  documentsLoaded: boolean;
  selectedDocuments: string[];
}

export default function Chat({ documentsLoaded, selectedDocuments }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('Mensajes actualizados:', messages); // Debug
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Input value:', inputValue); // Debug
    if (!inputValue.trim() || isLoading) return;

    // Verificar que hay documentos seleccionados
    if (selectedDocuments.length === 0) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Por favor, selecciona al menos un documento antes de hacer una pregunta.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: inputValue,
          documentIds: selectedDocuments 
        }),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data); // Debug

      if (response.ok) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
          timestamp: new Date(),
        };
        console.log('Mensaje del asistente creado:', assistantMessage); // Debug
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${data.error}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error al conectar con el servidor',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!documentsLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-sm">!</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay documentos disponibles
            </h3>
            <p className="text-gray-600">
              Sube algunos documentos para empezar a chatear con la IA
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white/80 backdrop-blur-sm overflow-hidden">
      {/* Header del chat */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Asistente IA
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-500 text-sm">En línea</span>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div
        className="flex-1 overflow-y-auto bg-white"
        style={{ minHeight: '400px' }}
      >
        <div className="max-w-3xl mx-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                ¡Hola! Soy tu asistente de IA
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {selectedDocuments.length > 0 
                  ? `Haz preguntas sobre los ${selectedDocuments.length} documento${selectedDocuments.length > 1 ? 's' : ''} seleccionado${selectedDocuments.length > 1 ? 's' : ''}.`
                  : 'Selecciona documentos arriba para empezar a hacer preguntas.'
                }
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              console.log(`Renderizando mensaje ${index}:`, message); // Debug
              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                          message.role === 'user'
                            ? 'bg-white/20'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {message.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="whitespace-pre-wrap leading-relaxed"
                          style={{
                            color: message.role === 'user' ? 'white' : 'black',
                            fontSize: '14px',
                          }}
                        >
                          {message.content || 'Sin contenido'}
                        </p>

                        {/* Fuentes */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Fuentes:
                              </span>
                              <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                            <div className="space-y-3">
                              {message.sources.map((source, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 text-sm mb-1">
                                        {source.metadata.document_name}
                                      </p>
                                      <p className="text-gray-600 text-sm leading-relaxed">
                                        {source.content.substring(0, 150)}...
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-xs mt-3 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🤖</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input del chat */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={e => {
                  console.log('Input changed:', e.target.value); // Debug
                  setInputValue(e.target.value);
                }}
                                 placeholder={selectedDocuments.length > 0 
                   ? "Escribe tu pregunta sobre los documentos seleccionados..."
                   : "Selecciona documentos para hacer preguntas..."
                 }
                                 disabled={isLoading || selectedDocuments.length === 0}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                style={{
                  color: '#111827',
                  fontSize: '16px',
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <span className="text-xs">⌘K</span>
              </div>
            </div>
                                        <button
                 type="submit"
                 disabled={!inputValue.trim() || isLoading || selectedDocuments.length === 0}
               className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Enviar</span>
                  <span className="text-base">→</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
