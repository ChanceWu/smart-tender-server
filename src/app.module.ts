import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocxMergeModule } from './modules/docx-merge/docx-merge.module';

@Module({
  imports: [DocxMergeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
