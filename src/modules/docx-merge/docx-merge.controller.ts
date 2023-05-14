import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DocxMergeService } from './docx-merge.service';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';
import { UpdateDocxMergeDto } from './dto/update-docx-merge.dto';

@Controller('docx-merger')
export class DocxMergeController {
  constructor(private readonly docxMergeService: DocxMergeService) {}

  @Post()
  create(@Body() createDocxMergeDto: CreateDocxMergeDto) {
    return this.docxMergeService.create(createDocxMergeDto);
  }

  @Get()
  findAll() {
    return this.docxMergeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docxMergeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocxMergeDto: UpdateDocxMergeDto,
  ) {
    return this.docxMergeService.update(+id, updateDocxMergeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docxMergeService.remove(+id);
  }
}
