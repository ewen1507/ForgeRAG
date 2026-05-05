import axios from 'axios';
import FormData from 'form-data';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  async uploadFile(
    file: Express.Multer.File,
    documentId: string,
    chunkSize: number = 800,
    chunkOverlap: number = 120,
  ) {
    // Créer une instance de FormData
    const formData = new FormData();

    // Ajouter le fichier à FormData. Utilise `file.buffer` pour envoyer le contenu du fichier
    formData.append('file', file.buffer, file.originalname);
    formData.append('document_id', documentId);
    formData.append('chunk_size', chunkSize.toString());
    formData.append('chunk_overlap', chunkOverlap.toString());

    try {
      // Récupérer les headers de FormData pour multipart/form-data
      const headers = formData.getHeaders();

      console.log('FormData Headers:', formData.getHeaders()); // Ajoute des logs des en-têtes FormData
      console.log('FormData Content:', file.originalname); // Affiche le nom du fichier
      console.log('FormData Size:', file.buffer.length);
      const response = await axios.post(
        'http://rag-service:8000/documents/upload',
        formData,
        {
          headers: {
            ...headers, // Inclure les headers de FormData
          },
        },
      );
      console.log('FastAPI Response:', response.data);
      return response.data; // Retourne la réponse de FastAPI
    } catch (error) {
      throw new Error('Error uploading file to FastAPI: ' + error.message);
    }
  }
}
