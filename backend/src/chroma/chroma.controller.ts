import { Controller, Post } from '@nestjs/common';
import { ChromaService } from './chroma.service';

@Controller('chroma')
export class ChromaController {
  constructor(private readonly chromaService: ChromaService) {}

  @Post('reset')
  async resetChromaDB(): Promise<string> {
    return this.chromaService.resetChromaDB();
  }
}
