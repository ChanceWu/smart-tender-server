import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateDocxMergeDto } from './dto/create-docx-merge.dto';
import { UpdateDocxMergeDto } from './dto/update-docx-merge.dto';
import { formatTreeData, getListFromTree } from 'src/utils';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
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
@Injectable()
export class DocxMergeService {
  private readonly logger = new Logger('DocxMergeService');

  private loginUser: API.LoginUser;
  create(data: CreateDocxMergeDto) {
    this.handleCreateTender(data)
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
        userId: encodeURI(data.loginUser.userId),
      };
      console.log(JSON.stringify(treeData))
      const list = getListFromTree(treeData, data.tenderCreateSourceDtoMap, 1);
      console.log(JSON.stringify(list))
      const source = await this.getSourceByData(list);
      const blobData = await this.mergerDocx(source);
      const tenderKey = await this.uploadDocx(blobData, data.name);
      this.createCallBack({ fileKey: tenderKey, id: data.id, status: 'SUCCESS' });
    } catch (err) {
      this.createCallBack({ id: data.id, status: 'FAIL' });
      this.logger.error(`create tender get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async findAll() {
    return `This action returns all docxMerge ${process.env.BACKEND_SERVER}`;
  }

  async createPage(text: string) {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: text,
                heading: HeadingLevel.HEADING_1,
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
    console.log('image ',buf)
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
    try {
      const response = await axios({
        url: `${process.env.BACKEND_SERVER}/inter-api/tender/file/download/${key}`,
        method: 'GET',
        responseType: 'arraybuffer',
        headers: {
          ...this.loginUser,
        }
      });
      return Buffer.from(response.data, 'binary');
    } catch (err) {
      this.logger.error(`axios ${key} get err: ${err.message}`, err.stack);
      throw new Error(err);
    }

  }

  async getSourceByData(data: API.TenderTocTreeNode[]) {
    const reqList = data.map(v => {
      if (v.sourceFlag && v.tenderSourceDto) {
        if (['.jpg', '.jpeg', '.png'].includes(v.tenderSourceDto.fileDtoList[0].postfix)) {
          return this.createImagePage(v.tenderSourceDto.fileDtoList[0].key)
        } else {
          return this.fetchNewFile(v.tenderSourceDto.fileDtoList[0].key)
        }
      } else {
        return this.createPage(v.tocName);
      }
    })
    try {
      return Promise.all(reqList);
    } catch (err) {
      this.logger.error(`getSourceByData get err: ${err.message}`, err.stack);
      throw new Error(err);
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
        })

      })
    } catch (err) {
      this.logger.error(`mergerDocx get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  };

  async uploadDocx(data: Buffer, name = 'tender') {
    const formData = new FormData();
    formData.append('file', data, { filename: name+'.docx' });
    console.log('formData', formData.getHeaders())
    try {
      const { data } = await axios<API.UploadResult>({
        url: `${process.env.BACKEND_SERVER}/inter-api/tender/file/upload`,
        method: 'POST',
        data: formData,
        headers: {
          ...this.loginUser,
          ...formData.getHeaders()
        }
      })
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
        }
      })
    } catch (err) {
      this.logger.error(`createCallBack get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }
}
