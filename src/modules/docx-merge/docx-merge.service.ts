import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';
import { UpdateDocxMergeDto } from './dto/update-docx-merge.dto';
import {
  formatTreeData,
  getHeaderStyleFromList,
  getListFromTree,
} from 'src/utils';
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  NumberFormat,
  Packer,
  PageNumber,
  Paragraph,
  TableOfContents,
  TabStopPosition,
  TabStopType,
  TextRun,
} from 'docx';
import { writeFile } from 'fs';
import { resolve } from 'path';
import * as FormData from 'form-data';
import axios from 'axios';
import { Readable } from 'stream';
import fetch from 'node-fetch';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DocxMerger = require('docx-merger');

const HeaderArr = [
  'Heading1',
  'Heading1',
  'Heading2',
  'Heading3',
  'Heading4',
  'Heading5',
  'Heading6',
];
const DefaultStyle = {
  level: 'Heading1',
  fontFamily: '黑体',
  fontSize: 42,
  lineHeight: 240,
  alignment: 'left',
};

@Injectable()
export class DocxMergeService {
  private readonly logger = new Logger('DocxMergeService');

  private loginUser: API.LoginUser;
  create(data: CreateDocxMergeDto) {
    this.handleCreateTender(data);
    return { msg: '标书生成中' };
  }

  async handleCreateTender(data: CreateDocxMergeDto) {
    try {
      const treeData = formatTreeData(data.tenderToc);
      this.loginUser = {
        Authorization: data.loginUser.token,
        userName: encodeURI(data.loginUser.userName),
        staffCode: encodeURI(data.loginUser.staffCode),
        staffName: encodeURI(data.loginUser.staffName),
        companyCode: encodeURI(data.loginUser.companyCode),
        companyName: encodeURI(data.loginUser.companyName),
        userId: data.loginUser.userId,
      };
      console.log(JSON.stringify(treeData));
      const list = getListFromTree(treeData, data.tenderCreateSourceDtoMap, 1);
      console.log(JSON.stringify(list));
      const source = await this.getSourceByData(list, data.preStyle);
      const blobData = await this.mergerDocx(source);
      // const tenderKey = await this.uploadDocx(blobData, data.name);
      // this.createCallBack({
      //   fileKey: tenderKey,
      //   id: data.id,
      //   status: 'SUCCESS',
      // });
    } catch (err) {
      // this.createCallBack({ id: data.id, status: 'FAIL' });
      this.logger.error(`create tender get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async findAll() {
    return `This action returns all docxMerge ${process.env.BACKEND_SERVER}`;
  }

  async createTableOfContents() {
    const buf = await this.fetchNewFile(
      `http://localhost:3003/download?file=docx/001.jpg`,
    );
    try {
      const doc = new Document({
        features: {
          updateFields: true,
        },
        sections: [
          {
            properties: {
              page: {
                pageNumbers: {
                  start: 1,
                  formatType: NumberFormat.DECIMAL,
                },
              },
            },
            headers: {
              default: new Header({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: buf,
                        transformation: {
                          width: 100,
                          height: 30,
                        },
                      }),
                      new TextRun('Foo Bar corp. '),
                      new TextRun({
                        children: ['Page Number ', PageNumber.CURRENT],
                      }),
                      new TextRun({
                        children: [' to ', PageNumber.TOTAL_PAGES],
                      }),
                    ],
                  }),
                ],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun('Foo Bar corp. '),
                      new TextRun({
                        children: ['Page Number: ', PageNumber.CURRENT],
                      }),
                      new TextRun({
                        children: [' to ', PageNumber.TOTAL_PAGES],
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              new TableOfContents('Summary', {
                hyperlink: true,
                headingStyleRange: '1-5',
              }),
            ],
          },
        ],
      });
      return Packer.toBuffer(doc);
    } catch (err) {
      this.logger.error(`createPage get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async createPage(text: string, level: number, preStyle: API.PreStyle) {
    const headerStyle = getHeaderStyleFromList(preStyle.header);
    console.log(JSON.stringify(headerStyle));
    const HeaderLevel = HeaderArr[level ?? 0];
    const style = headerStyle[HeaderLevel] || DefaultStyle;
    try {
      const doc = new Document({
        styles: {
          default: {
            [HeaderLevel.toLowerCase()]: {
              run: {
                font: style.fontFamily ?? 'Calibri',
                size: style.fontSize ?? 52,
                bold: true,
                color: '000000',
              },
            },
          },
        },
        sections: [
          {
            properties: {
              page: {
                margin: preStyle.margin ?? {
                  top: 50,
                  right: 30,
                  bottom: 20,
                  left: 10,
                },
              },
            },
            children: [
              new Paragraph({
                text: text,
                heading: (style.level ??
                  HeadingLevel.HEADING_1) as HeadingLevel,
                alignment: (style.alignment ??
                  AlignmentType.RIGHT) as AlignmentType,
                spacing: {
                  line: style.lineHeight ?? 720,
                },
              }),
            ],
          },
        ],
      });
      return Packer.toBuffer(doc);
    } catch (err) {
      this.logger.error(`createPage get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async createImagePage(url) {
    const buf = await this.fetchNewFile(url);
    console.log('image ', buf);
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: buf,
                    transformation: {
                      width: 200,
                      height: 200,
                    },
                  }),
                ],
              }),
            ],
          },
        ],
      });
      return Packer.toBuffer(doc);
    } catch (err) {
      this.logger.error(`createImagePage get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async fetchNewFile(key: string) {
    let url = `http://localhost:3003/download?file=docx/d3.docx`;
    if (key === `http://localhost:3003/download?file=docx/001.jpg`)
      url = `http://localhost:3003/download?file=docx/001.jpg`;
    try {
      return axios({
        url: url,
        method: 'GET',
        responseType: 'arraybuffer',
      }).then((response) => {
        return Buffer.from(response.data, 'binary');
      });
      const response = await axios({
        url: `${process.env.BACKEND_SERVER}/inter-api/tender/file/download/${key}`,
        method: 'GET',
        responseType: 'arraybuffer',
        headers: {
          ...this.loginUser,
        },
      });
      return Buffer.from(response.data, 'binary');
    } catch (err) {
      this.logger.error(`axios ${key} get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async getSourceByData(data: API.TenderTocTreeNode[], preStyle: API.PreStyle) {
    const reqList = data.map((v) => {
      if (v.sourceFlag && v.tenderSourceDto) {
        if (
          ['.jpg', '.jpeg', '.png'].includes(
            v.tenderSourceDto.fileDtoList[0].postfix,
          )
        ) {
          return this.createImagePage(v.tenderSourceDto.fileDtoList[0].key);
        } else {
          return this.fetchNewFile(v.tenderSourceDto.fileDtoList[0].key);
        }
      } else {
        return this.createPage(v.tocName, v.level, preStyle);
      }
    });
    try {
      return Promise.all([this.createTableOfContents(), ...reqList]);
    } catch (err) {
      this.logger.error(`getSourceByData get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async mergerDocx(bufList: Buffer[]) {
    try {
      const docx = new DocxMerger({ pageBreak: false }, bufList);

      // return new Promise<Buffer>((resolve, reject) => {
      docx.save('nodebuffer', (data) => {
        console.log(writeFile, data, Buffer.isBuffer(data));
        // return resolve(data);

        // fs.writeFile("output.zip", data, function(err){/*...*/});
        writeFile(resolve(__dirname, 'output.docx'), data, function (err) {
          /*...*/
          if (err) throw new Error(JSON.stringify(err));
        });
      });
      // });
    } catch (err) {
      this.logger.error(`mergerDocx get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async uploadDocx(data: Buffer, name = 'tender') {
    const formData = new FormData();
    formData.append('file', data, { filename: name + '.docx' });
    console.log('formData', formData.getHeaders());
    try {
      const { data } = await axios<API.UploadResult>({
        url: `${process.env.BACKEND_SERVER}/inter-api/tender/file/upload`,
        method: 'POST',
        data: formData,
        headers: {
          ...this.loginUser,
          ...formData.getHeaders(),
        },
      });
      if (data.code === 1) {
        return data.data.key;
      } else {
        this.logger.error(`uploadDocx get err: ${data.msg || '上传标书出错'}`);
        throw new Error(data.msg || '上传标书出错');
      }
    } catch (err) {
      this.logger.error(`uploadDocx get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async createCallBack(data: API.CreateCallback) {
    this.logger.warn(`createCallBack data: `, data);
    try {
      await axios<API.UploadResult>({
        url: `${process.env.BACKEND_SERVER}/inter-api/tender/tender/create/notice`,
        method: 'POST',
        data,
        headers: {
          ...this.loginUser,
        },
      });
    } catch (err) {
      this.logger.error(`createCallBack get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }
}
