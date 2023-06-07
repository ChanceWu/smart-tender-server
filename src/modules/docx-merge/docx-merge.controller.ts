import { Controller, Get, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { DocxMergeService } from './docx-merge.service';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';

@Controller('/tender-node/docx-merger')
export class DocxMergeController {
    constructor(private readonly docxMergeService: DocxMergeService) {}

    @Post()
    @HttpCode(200)
    create(@Body() data: CreateDocxMergeDto) {
        return this.docxMergeService.create(data);
    }

    @Get()
    findAll() {
        return this.docxMergeService.findAll();
    }
}
