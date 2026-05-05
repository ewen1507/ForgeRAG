import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Observable } from 'rxjs';
import OpenAI from 'openai';

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

  private readonly openai = new OpenAI({
    baseURL:
      process.env.OPENAI_BASE_URL || 'http://host.docker.internal:1234/v1',
    apiKey: process.env.OPENAI_API_KEY || 'lm-studio',
  });

  private readonly llmModel = process.env.LLM_MODEL || 'qwen/qwen3-vl-4b';

  constructor(private readonly prisma: PrismaService) {}

  streamAnswer(question: string): Observable<MessageEvent> {
    return new Observable((observer) => {
      const run = async () => {
        try {
          const retrieved = await this.retrieveChunks(question, 3);

          console.log('retrieved', retrieved);

          const context = retrieved.results
            .map((chunk, index) => {
              return `Source ${index + 1} (${chunk.filename}):\n${chunk.text}`;
            })
            .join('\n\n');

          const prompt = `
Context:
${context}

Question:
${question}

Answer in 2 or 3 clear sentences.
Use the context, but do not copy long passages. If the context is empty or does not contain the answer, say I cannot answer this question.
`;

          const stream = await this.openai.chat.completions.create({
            model: this.llmModel,
            stream: true,
            temperature: 0.8,
            max_tokens: 1000,
            messages: [
              {
                role: 'system',
                content:
                  'You are ForgeRAG. Answer clearly and briefly using only the provided context. Do not repeat words. If the answer is not in the context, say you do not know.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          });

          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;

            if (token) {
              observer.next({
                data: token,
              } as MessageEvent);
            }
          }

          observer.next({
            data: '[DONE]',
          } as MessageEvent);

          observer.complete();
        } catch (error) {
          observer.next({
            data: `Error: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          } as MessageEvent);

          observer.next({
            data: '[DONE]',
          } as MessageEvent);

          observer.complete();
        }
      };

      run();

      return () => {
        observer.complete();
      };
    });
  }

  private async retrieveChunks(question: string, topK = 3) {
    const ragServiceUrl =
      process.env.RAG_SERVICE_URL || 'http://rag-service:8000';

    const response = await fetch(`${ragServiceUrl}/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: question,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `RAG service returned ${response.status}`,
      );
    }

    return response.json();
  }

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

  async resetChroamDB(user: AuthenticatedUser) {
    try {
      const response = await fetch(
        `${process.env.RAG_SERVICE_URL || 'http://rag-service:8000'}/reset-chroma`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new ServiceUnavailableException(
          `RAG service returned ${response.status}: ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        `Failed to reset ChromaDB: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}
