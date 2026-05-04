import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AuthenticatedUser = {
  id: string;
  email: string;
};

type RagChunk = {
  chunk_id: string;
  document_id: string;
  filename: string;
  source_type: string;
  text: string;
  distance: number;
};

type RagRetrieveResponse = {
  results: RagChunk[];
};

@Injectable()
export class RagService {
  private readonly ragServiceUrl =
    process.env.RAG_SERVICE_URL || 'http://rag-service:8000';

  constructor(private readonly prisma: PrismaService) {}

  async query(question: string, user: AuthenticatedUser) {
    let retrieved: RagRetrieveResponse;

    try {
      console.log(
        `Querying RAG service at ${this.ragServiceUrl} with question: "${question}"`,
      );
      const response = await fetch(`${this.ragServiceUrl}/retrieve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question,
          top_k: 3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ServiceUnavailableException(
          `RAG service returned ${response.status}: ${errorText}`,
        );
      }

      retrieved = (await response.json()) as RagRetrieveResponse;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        `Failed to reach RAG service: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }

    if (!retrieved || !Array.isArray(retrieved.results)) {
      throw new InternalServerErrorException(
        'Invalid response format from RAG service',
      );
    }

    const generatedAnswer =
      retrieved.results.length > 0
        ? retrieved.results.map((chunk) => chunk.text).join('\n\n')
        : 'No relevant context found.';

    const savedQuery = await this.prisma.ragQuery.create({
      data: {
        question,
        answer: generatedAnswer,
        userId: user.id,
      },
    });

    return {
      id: savedQuery.id,
      question: savedQuery.question,
      answer: savedQuery.answer,
      createdAt: savedQuery.createdAt,
      user: {
        id: user.id,
        email: user.email,
      },
      sources: retrieved.results.map((chunk) => ({
        chunk_id: chunk.chunk_id,
        document_id: chunk.document_id,
        filename: chunk.filename,
        source_type: chunk.source_type,
        distance: chunk.distance,
      })),
      results: retrieved.results,
    };
  }

  async getHistory(userId: string) {
    return this.prisma.ragQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
