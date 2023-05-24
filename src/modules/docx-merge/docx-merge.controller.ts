import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { DocxMergeService } from './docx-merge.service';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';

@Controller('/inter-api/tender-node/docx-merger')
export class DocxMergeController {
  constructor(private readonly docxMergeService: DocxMergeService) { }

  @Post()
  create(@Body() data: CreateDocxMergeDto, @Headers('authorization') token: string) {
    return this.docxMergeService.create(data.tenderToc, data.id, token);
  }

  @Get()
  findAll() {
    return this.docxMergeService.findAll();
  }
}
