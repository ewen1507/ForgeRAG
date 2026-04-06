import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [PrismaModule, AuthModule, RagModule],
})
export class AppModule {}
