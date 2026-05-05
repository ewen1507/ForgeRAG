import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChromaService {
  async resetChromaDB(): Promise<string> {
    try {
      const response = await axios.get(
        'http://localhost:8000/vector-store/reset',
      ); // Appel à l'API FastAPI
      return response.data.status; // Renvoie le statut de la réinitialisation
    } catch (error) {
      throw new Error('Failed to reset ChromaDB: ' + error.message);
    }
  }
}
