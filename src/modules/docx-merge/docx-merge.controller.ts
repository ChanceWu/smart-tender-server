import { Controller, Get, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { DocxMergeService } from './docx-merge.service';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';

@Controller('/inter-api/tender-node/docx-merger')
export class DocxMergeController {
  constructor(private readonly docxMergeService: DocxMergeService) {}

  @Post()
  @HttpCode(200)
  create(@Body() data: CreateDocxMergeDto) {
    console.log('create tender data -> ', JSON.stringify(data));
    return this.docxMergeService.create({
      name: '标书7',
      id: 84,
      preStyle: {
        margin: {
          left: 10,
          right: 30,
          top: 50,
          bottom: 20,
        },
        header: [
          {
            level: 'Heading1',
            fontFamily: '黑体',
            fontSize: 42 * 2,
            lineHeight: 720,
            alignment: 'left',
          },
          {
            level: 'Heading2',
            fontFamily: '宋体',
            fontSize: 26 * 2,
            lineHeight: 600,
            alignment: 'right',
          },
          {
            level: 'Heading3',
            fontFamily: '仿宋',
            fontSize: 24 * 2,
            lineHeight: 480,
            alignment: 'center',
          },
          {
            level: 'Heading4',
            fontFamily: '仿宋',
            fontSize: 22 * 2,
            lineHeight: 360,
            alignment: 'both',
          },
          {
            level: 'Heading5',
            fontFamily: '微软雅黑',
            fontSize: 18 * 2,
            lineHeight: 240,
            alignment: 'distribute',
          },
          {
            level: 'Heading6',
            fontFamily: '楷体',
            fontSize: 16 * 2,
            lineHeight: 240,
            alignment: 'center',
          },
        ],
      },
      tenderToc: [
        {
          t: { tocName: '概览', sourceFlag: false },
          children: [
            {
              t: { tocName: '对对对', tenderSourceId: 35, sourceFlag: true },
              children: [],
            },
            {
              t: {
                tocName: 'zzz封面库都是图片类',
                tenderSourceId: 31,
                sourceFlag: true,
              },
              children: [],
            },
          ],
        },
        {
          t: { tocName: '章节一', sourceFlag: false },
          children: [
            {
              t: { tocName: '对对对', tenderSourceId: 25, sourceFlag: true },
              children: [],
            },
            {
              t: { tocName: '测试', tenderSourceId: 9, sourceFlag: true },
              children: [],
            },
          ],
        },
        {
          t: { tocName: '目录一', sourceFlag: false },
          children: [
            {
              t: { tocName: '目录二', sourceFlag: false },
              children: [
                {
                  t: { tocName: '目录三', sourceFlag: false },
                  children: [
                    {
                      t: { tocName: '目录四', sourceFlag: false },
                      children: [
                        {
                          t: { tocName: '目录五', sourceFlag: false },
                          children: [
                            {
                              t: { tocName: '目录六', sourceFlag: false },
                              children: [
                                {
                                  t: {
                                    tocName: '测试',
                                    tenderSourceId: 9,
                                    sourceFlag: true,
                                  },
                                  children: [],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      tenderCreateSourceDtoMap: {
        '9': {
          id: 9,
          name: '测试',
          categoryId: 33,
          fileDtoList: [
            {
              id: 37,
              name: '002.jpg',
              postfix: '.jpg',
              fileUrl:
                '10.10.168.177:8080/file/download/429298aa-81b5-4bb7-b333-9c7db0d23c41',
              key: '429298aa-81b5-4bb7-b333-9c7db0d23c41',
            },
            {
              id: 39,
              name: '003.jpg',
              postfix: '.jpg',
              fileUrl:
                '10.10.168.177:8080/file/download/aa275f06-fb14-4f9c-b1ed-c5c6e8942fdf',
              key: 'aa275f06-fb14-4f9c-b1ed-c5c6e8942fdf',
            },
          ],
          typeCode: 'PIC',
        },
        '25': {
          id: 25,
          name: '对对对',
          categoryId: 30,
          fileDtoList: [
            {
              id: 63,
              name: 'd8.docx',
              postfix: '.docx',
              fileUrl:
                'http://10.40.0.244:8080/inter-api/tender/file/download/dce348ce-0e58-413c-ad04-ac51cc171781',
              key: 'dce348ce-0e58-413c-ad04-ac51cc171781',
            },
          ],
          typeCode: 'WORD',
        },
        '31': {
          id: 31,
          name: 'zzz封面库都是图片类',
          categoryId: 50,
          fileDtoList: [
            {
              id: 90,
              name: 'ca8a42a1d14d820129aab4508493a578.jpeg',
              postfix: '.jpeg',
              fileUrl:
                'http://10.40.0.244:8080/inter-api/tender/file/download/dc231fbf-f8f1-4b91-bba9-a6654c4c6d83',
              key: 'dc231fbf-f8f1-4b91-bba9-a6654c4c6d83',
            },
            {
              id: 91,
              name: 'ee4be4fbf170fbb615cdef854ebf937f.jpeg',
              postfix: '.jpeg',
              fileUrl:
                'http://10.40.0.244:8080/inter-api/tender/file/download/a951bcd4-fb17-4b8f-8fdf-d1fe8a1cb792',
              key: 'a951bcd4-fb17-4b8f-8fdf-d1fe8a1cb792',
            },
          ],
          typeCode: 'PIC',
        },
        '35': {
          id: 35,
          name: '对对对',
          categoryId: 29,
          fileDtoList: [
            {
              id: 101,
              name: 'd9.docx',
              postfix: '.docx',
              fileUrl:
                'http://10.40.0.244:8080/inter-api/tender/file/download/0218af65-64c2-45c0-8693-b168f0477b22',
              key: '0218af65-64c2-45c0-8693-b168f0477b22',
            },
          ],
          typeCode: 'WORD',
        },
      },
      loginUser: {
        userId: 3418276614630400,
        userName: 'wuqianpeng',
        staffCode: '0120230934',
        staffName: '吴遣鹏',
        companyCode: 'default_org_company',
        companyName: '默认公司',
        token:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJwelhpeXRYVHZVVmx6YTloUC1tZTdEUXNLbXlvRkxLSmFHeE5HMEQzdUpNIn0.eyJleHAiOjE2ODc2OTgwMDEsImlhdCI6MTY4NTEwNjAwMSwianRpIjoiZjE5YjE3OTQtN2M3NC00YmEyLTg2ZmQtODQ2NjYzYWI1MTdiIiwiaXNzIjoiaHR0cDovLzEwMC4xMDUuMjEzLjE0NTo4MDgwL2F1dGgvcmVhbG1zL2R0Iiwic3ViIjoiZjphZWVlNzYxZS03ZjYyLTQ0NzUtOGQ4Yy00M2U1MmM5Nzg5OGQ6d3VxaWFucGVuZyIsInR5cCI6IkJlYXJlciIsImF6cCI6InBjX2R0Iiwic2Vzc2lvbl9zdGF0ZSI6Ijc3ZDliMWE1LWNhOTYtNDJiOS1hYTNiLTVlYjcyMGQyMWJhMSIsImFjciI6IjEiLCJzY29wZSI6InN1cG9zIiwiZGVwYXJ0bWVudF9jb2RlIjoic3RhbmRhcmRfZGVwYXJ0bWVudCIsInN0YWZmX25hbWUiOiLlkLTpgaPpuY8iLCJjb21wYW55X2lkIjoxMDAwLCJkZXBhcnRtZW50X2lkIjoyLCJ1c2VyX25hbWUiOiJ3dXFpYW5wZW5nIiwicG9zaXRpb25fY29kZSI6InN0YW5kYXJkX3Bvc2l0aW9uIiwiZGVwYXJ0bWVudF9uYW1lIjoi6buY6K6k6YOo6ZeoIiwicG9zaXRpb25fbmFtZSI6Ium7mOiupOWyl-S9jSIsInN0YWZmX2NvZGUiOiIwMTIwMjMwOTM0IiwidXNlcl90eXBlIjowLCJ1c2VyX2lkIjozNDE4Mjc2NjE0NjMwNDAwLCJjb21wYW55X25hbWUiOiLpu5jorqTlhazlj7giLCJzdGFmZl9pZCI6MzQxODI3NTQ0Nzc2MTUyMCwiY29tcGFueV9jb2RlIjoiZGVmYXVsdF9vcmdfY29tcGFueSIsInBvc2l0aW9uX2NvbXBhbnlfaWQiOjEwMDAsInBvc2l0aW9uX2lkIjoyfQ.dW2HHr0jZYHarHU2xYj8Ap3ftGiCkuScL17brQNE_FczHrHWnute7IusNgC7IcxsjBVLNmY3IHeQoYdpxUaET31Ep2FWnkQRLMNLpbk6ITgJcyOHz6Z7GBlh2iDUBxIdbwrNPIkdwlNH-6bKK3ojgrXy1r_MEVlXRNSop7sWLMULFhVKvwlPDEIZvnMoPejuXD_Y81GgbRft4wEFXwLzbxkv7Ar3-bTTgIANjrfAEfLIUkJf1JFZ8DZzzEGkBpIZxzyaZKMEAfJFV2o9ZL2WgS2nWGFNEBsd3PbaYs4zZB0L7CAnyEE8ihQruPiAHppDf3Qg-1C9cArj5DPAj36Fsg',
      },
    });
    // return this.docxMergeService.create(data);
  }

  @Get()
  findAll() {
    return this.docxMergeService.findAll();
  }
}
