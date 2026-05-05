import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { Express } from 'express';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: { documentId: string; chunkSize: number; chunkOverlap: number },
  ) {
    const { documentId, chunkSize, chunkOverlap } = body;

    return await this.fileUploadService.uploadFile(
      file,
      documentId,
      chunkSize,
      chunkOverlap,
    );
  }
}
