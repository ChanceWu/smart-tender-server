import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { DocxMergeService } from './docx-merge.service';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';

@Controller('/inter-api/tender-node/docx-merger')
export class DocxMergeController {
  constructor(private readonly docxMergeService: DocxMergeService) { }

  @Post()
  @HttpCode(200)
  create(@Body() data: CreateDocxMergeDto) {
    console.log('create tender data -> ', JSON.stringify(data))
    return this.docxMergeService.create(data);
  }

  @Get()
  findAll() {
    return this.docxMergeService.findAll();
  }
}
