import { Injectable } from '@nestjs/common';
import { merger } from 'src/utils/docx-merger';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';
import { UpdateDocxMergeDto } from './dto/update-docx-merge.dto';

@Injectable()
export class DocxMergeService {
  async create(createDocxMergeDto: CreateDocxMergeDto) {
    await merger();
    return 'This action adds a new docxMerge';
  }

  async findAll() {
    await merger();
    return `This action returns all docxMerge`;
  }

  findOne(id: number) {
    return `This action returns a #${id} docxMerge`;
  }

  update(id: number, updateDocxMergeDto: UpdateDocxMergeDto) {
    return `This action updates a #${id} docxMerge`;
  }

  remove(id: number) {
    return `This action removes a #${id} docxMerge`;
  }
}
