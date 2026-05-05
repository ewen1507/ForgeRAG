import { Module } from '@nestjs/common';
import { ChromaController } from './chroma.controller';
import { ChromaService } from './chroma.service';

@Module({
  controllers: [ChromaController],
  providers: [ChromaService],
})
export class ChromaModule {}
