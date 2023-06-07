import { Injectable } from '@nestjs/common';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';
import {
  formatTreeData,
  getDefaultHeaderStyle,
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
  TextRun,
} from 'docx';
import { writeFile, readFileSync } from 'fs';
import { resolve } from 'path';
import * as FormData from 'form-data';
import axios from 'axios';
import { DefaultHeaderStyle } from 'src/utils/docxData';
import { wsLogger } from 'src/utils/wsLogger';
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

@Injectable()
export class DocxMergeService {
  private loginUser: API.LoginUser;
  create(data: CreateDocxMergeDto) {
    wsLogger.info(`/tender-node/docx-merger data--> ${JSON.stringify(data)}`);
    this.handleCreateTender(data);
    return { msg: '标书生成中' };
  }

  async handleCreateTender(data: CreateDocxMergeDto) {
    try {
      const treeData = formatTreeData(data.tenderToc);
      this.loginUser = {
        Authorization: data.loginUser.token,
        // supToken: data.loginUser.token,
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
      const source = await this.getSourceByData(list, data.tenderPreStyle);
      const blobData = await this.mergerDocx(source);
      const tenderKey = await this.uploadDocx(blobData, data.name);
      this.createCallBack({
        fileKey: tenderKey,
        id: data.id,
        status: 'SUCCESS',
      });
    } catch (err) {
      this.createCallBack({ id: data.id, status: 'FAIL' });
      wsLogger.error(`create tender get err: ${err.message}`, err);
      throw new Error(err);
    }
  }

  async findAll() {
    return `This action returns all docxMerge ${process.env.BACKEND_SERVER}`;
  }

  async createDefaultPage(tenderPreStyle: API.TenderPreStyle) {
    const { margin = {}, header = [] } = tenderPreStyle ?? {};
    const headerStyle = getHeaderStyleFromList(header);
    try {
      const doc = new Document({
        features: {
          updateFields: true,
        },
        styles: {
          default: {
            ...(getDefaultHeaderStyle(headerStyle) || {})
          },
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: `${margin.top ?? 2.54}cm`,
                  right: `${margin.right ?? 3.18}cm`,
                  bottom: `${margin.bottom ?? 2.54}cm`,
                  left: `${margin.left ?? 3.18}cm`,
                },
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
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new ImageRun({
                        data: readFileSync(resolve(__dirname, '../../../public/images/logo.jpeg')),
                        transformation: {
                          width: 157,
                          height: 17,
                        },

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
                      new TextRun({
                        children: [PageNumber.CURRENT],
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun(''),
                ],
              }),
            ],
          },
        ],
      });
      return Packer.toBuffer(doc);
    } catch (err) {
      wsLogger.error(`createDefaultPage get err: ${err.message}`, err);
      throw err;
    }
  }

  async createPage(text: string, level: number, tenderPreStyle: API.TenderPreStyle) {
    const headerStyle = getHeaderStyleFromList(tenderPreStyle.header);
    console.log(JSON.stringify(headerStyle));
    const HeaderLevel = HeaderArr[level ?? 0];
    const style = headerStyle[HeaderLevel] || DefaultHeaderStyle[HeaderLevel];
    try {
      const doc = new Document({
        // styles: {
        //   default: {
        //     [HeaderLevel.toLowerCase()]: {
        //       run: {
        //         font: style.fontFamily ?? 'Calibri',
        //         size: style.fontSize ?? 52,
        //         bold: true,
        //         color: '000000',
        //       },
        //     },
        //   },
        // },
        sections: [
          {
            children: [
              new Paragraph({
                text: text,
                heading: (style.level ??
                  HeadingLevel.HEADING_6) as HeadingLevel,
                alignment: (style.alignment ??
                  AlignmentType.LEFT) as AlignmentType,
                spacing: {
                  line: style.lineHeight ?? 240,
                },
              }),
            ],
          },
        ],
      });
      return Packer.toBuffer(doc);
    } catch (err) {
      wsLogger.error(`createPage get err: ${err.message}`, err);
      throw err;
    }
  }

  async createImagePage(url) {
    const buf = await this.requestFileBuffer(url);
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
      wsLogger.error(`createImagePage get err: ${err.message}`, err);
      throw err;
    }
  }

  async requestFileBuffer(key: string) {
    try {
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
      wsLogger.error(`axios ${key} get err: ${err.message}`, err);
      throw err;
    }
  }

  async getSourceByData(data: API.TenderTocTreeNode[], tenderPreStyle: API.TenderPreStyle = {}) {
    const reqList = data.map((v) => {
      if (v.sourceFlag && v.tenderSourceDto) {
        if (
          ['.jpg', '.jpeg', '.png'].includes(
            v.tenderSourceDto.fileDtoList[0].postfix,
          )
        ) {
          return this.createImagePage(v.tenderSourceDto.fileDtoList[0].key);
        } else {
          return this.requestFileBuffer(v.tenderSourceDto.fileDtoList[0].key);
        }
      } else {
        return this.createPage(v.tocName, v.level, tenderPreStyle);
      }
    });
    try {
      return Promise.all([this.createDefaultPage(tenderPreStyle), ...reqList]);
    } catch (err) {
      wsLogger.error(`getSourceByData get err: ${err.message}`, err);
      throw err;
    }
  }

  async mergerDocx(bufList: Buffer[]) {
    try {
      const docx = new DocxMerger({ pageBreak: false }, bufList);

      return new Promise<Buffer>((resolve, reject) => {
        docx.save('nodebuffer', (data) => {
          console.log(writeFile, data, Buffer.isBuffer(data));
          return resolve(data);

          // fs.writeFile("output.zip", data, function(err){/*...*/});
          // writeFile(resolve(__dirname, 'output.docx'), data, function (err) {
          //   /*...*/
          //   if (err) throw new Error(JSON.stringify(err));
          // });
        });
      });
    } catch (err) {
      wsLogger.error(`mergerDocx get err: ${err.message}`, err);
      throw err;
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
        wsLogger.error(`uploadDocx msg get err: ${data.msg || '上传标书出错'}`);
        throw Error(data.msg || '上传标书出错');
      }
    } catch (err) {
      wsLogger.error(`uploadDocx get err: ${err.message}`, err);
      throw err;
    }
  }

  async createCallBack(data: API.CreateCallback) {
    wsLogger.info(`createCallBack data: ${JSON.stringify(data)}`);
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
      wsLogger.error(`createCallBack get err: ${err.message}`, err);
      throw err;
    }
  }
}
