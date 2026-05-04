import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Sse,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RagService } from './rag.service';
import { RagQueryDto } from './dto/rag-query.dto';
import { Observable } from 'rxjs';

type RequestWithUser = {
  user: {
    id: string;
    email: string;
  };
};

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @UseGuards(JwtAuthGuard)
  @Post('query')
  async query(@Body() body: RagQueryDto, @Req() req: RequestWithUser) {
    return this.ragService.query(body.question, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async history(@Req() req: RequestWithUser) {
    return this.ragService.getHistory(req.user.id);
  }

  @Get('stream')
  @Sse()
  stream(@Query('question') question: string): Observable<MessageEvent> {
    return this.ragService.streamAnswer(question);
  }
}
