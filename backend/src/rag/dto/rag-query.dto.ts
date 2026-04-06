import { IsString, MinLength } from 'class-validator';

export class RagQueryDto {
  @IsString()
  @MinLength(1)
  question!: string;
}
