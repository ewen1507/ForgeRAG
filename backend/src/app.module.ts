import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RagModule } from './rag/rag.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ChromaModule } from './chroma/chroma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RagModule,
    FileUploadModule,
    ChromaModule,
  ],
})
export class AppModule {}
