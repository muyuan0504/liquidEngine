import { Controller, Get, Param } from '@nestjs/common';
import { ParseService } from './parse.service';
import { valid } from 'node-html-parser';

@Controller('parse')
export class ParseController {
  constructor(private readonly parseService: ParseService) {}

  @Get()
  getHello(): string {
    return this.parseService.getHello();
  }

  @Get('/liquid/:fileName')
  renderLiquid(@Param('fileName') fileName: string): Promise<string> {
    return this.parseService.renderLiquid(fileName);
  }

  @Get('/validate/:fileName')
  validateHtml(@Param('fileName') fileName: string): Promise<string> {
    return this.parseService.validateHtml(fileName);
  }
}
