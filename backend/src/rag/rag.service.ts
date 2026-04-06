import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AuthenticatedUser = {
  id: string;
  email: string;
};

@Injectable()
export class RagService {
  constructor(private readonly prisma: PrismaService) {}

  async query(question: string, user: AuthenticatedUser) {
    // Réponse temporaire en attendant le vrai moteur RAG
    const generatedAnswer = `ForgeRAG is your secured RAG backend project. Question received: ${question}`;

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
    };
  }

  async getHistory(userId: string) {
    return this.prisma.ragQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
