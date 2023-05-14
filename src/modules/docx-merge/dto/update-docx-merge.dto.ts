import { PartialType } from '@nestjs/mapped-types';
import { CreateDocxMergeDto } from './create-docx-merge.dto';

export class UpdateDocxMergeDto extends PartialType(CreateDocxMergeDto) {}
