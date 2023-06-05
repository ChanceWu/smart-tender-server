import { Controller, Get, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { DocxMergeService } from './docx-merge.service';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';

@Controller('/tender-node/docx-merger')
export class DocxMergeController {
    constructor(private readonly docxMergeService: DocxMergeService) {}

    @Post()
    @HttpCode(200)
    create(@Body() data: CreateDocxMergeDto) {
        console.log('create tender data -> ', JSON.stringify(data));
        return this.docxMergeService.create({
            ...data, name: '预设样式标书', id: 227, tenderCreateSourceDtoMap: {}, loginUser: {
                userId: 3418276614630400,
                userName: 'wuqianpeng',
                staffCode: '0120230934',
                staffName: '吴遣鹏',
                companyCode: 'default_org_company',
                companyName: '默认公司',
                token:
                    'Bearer 62b57360-6a6d-4441-9237-9bdf70dfe740',
            },
        });
        // return this.docxMergeService.create(data);
    }

    @Get()
    findAll() {
        return this.docxMergeService.findAll();
    }
}
