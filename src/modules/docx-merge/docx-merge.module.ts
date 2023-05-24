import { Module } from '@nestjs/common';
import { DocxMergeService } from './docx-merge.service';
import { DocxMergeController } from './docx-merge.controller';

@Module({
  controllers: [DocxMergeController],
  providers: [DocxMergeService],
})
export class DocxMergeModule {}
