import { parentPort, workerData } from 'worker_threads';
import { processDocument } from './documentProcessor';

async function processDocumentInWorker() {
  try {
    const { fileBuffer, fileName, fileType } = workerData;
    
    console.log(`Worker iniciando procesamiento de: ${fileName}`);
    
    const documentId = await processDocument(fileBuffer, fileName, fileType);
    
    parentPort?.postMessage({ success: true, documentId });
  } catch (error) {
    console.error('Error en worker:', error);
    parentPort?.postMessage({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
}

processDocumentInWorker();
