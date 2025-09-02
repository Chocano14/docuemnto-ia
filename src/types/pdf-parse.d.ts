declare module 'pdf-parse' {
  interface PDFOptions {
    max?: number;
    version?: string;
  }

  interface PDFData {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;

  export = pdfParse;
}
