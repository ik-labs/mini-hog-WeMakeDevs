import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { AiService } from './ai.service';

class QueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question!: string;
}

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('query')
  async query(@Body() body: QueryDto) {
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      throw new HttpException(
        'Question is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (question.length > 500) {
      throw new HttpException(
        'Question too long (max 500 characters)',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Processing query: "${question}"`);

    try {
      const result = await this.aiService.executeNaturalLanguageQuery(question);
      
      this.logger.log(
        `Query completed in ${result.executionTime}ms - ${result.results.length} results`,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('Query failed', error);

      // Return user-friendly error
      const message =
        error.message || 'Failed to process your question. Please try again.';

      throw new HttpException(
        {
          success: false,
          error: message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-sql')
  async generateSql(@Body() body: QueryDto) {
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      throw new HttpException(
        'Question is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Generating SQL for: "${question}"`);

    try {
      const sql = await this.aiService.generateSql(question);

      return {
        success: true,
        data: { question, sql },
      };
    } catch (error: any) {
      this.logger.error('SQL generation failed', error);

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to generate SQL',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
