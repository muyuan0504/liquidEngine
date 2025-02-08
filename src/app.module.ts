import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParseController } from './modules/liquid-parse/parse.controller';
import { ParseService } from './modules/liquid-parse/parse.service';

@Module({
  imports: [],
  controllers: [AppController, ParseController],
  providers: [AppService, ParseService],
})
export class AppModule {}
