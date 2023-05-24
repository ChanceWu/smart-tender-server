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
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DocxMerger = require('docx-merger');
const BACKEND_SERVER = process.env.BACKEND_SERVER;
@Injectable()
export class DocxMergeService {
  private readonly logger = new Logger('DocxMergeService');

  private token: string;
  async create(data: API.TenderTocType[], id: number, token: string) {
    this.handleCreateTender(data, id, token)
    return { msg: '标书生成中', code: 200 };
  }

  async handleCreateTender(data: API.TenderTocType[], id: number, token: string) {
    try {
      const treeData = formatTreeData(data);
      this.token = token;
      const list = getListFromTree(treeData, 1);
      const source = await this.getSourceByData(list);
      const blobData = await this.mergerDocx(source);
      const tenderKey = await this.uploadDocx(blobData);
      this.createCallBack({ fileKey: tenderKey, id, status: 'SUCCESS' });
    } catch (err) {
      this.createCallBack({ id, status: 'FAIL' });
      // this.logger.error(`create tender get err: ${err.message}`, err.stack);
      throw new HttpException({ msg: '标书生成失败', details: `create tender get err: ${err.message}, ${err.stack}` }, HttpStatus.INTERNAL_SERVER_ERROR);
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

  fetchNewFile(key: string) {
    console.log('token ', this.token)
    return axios({
      url: `${BACKEND_SERVER}/inter-api/tender/file/download/${key}`,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        Authorization: this.token,
      }
    }).then((response) => {
      return Buffer.from(response.data, 'binary');
    }).catch((err) => {
      this.logger.error(`axios ${key} get err: ${err.message}`, err.stack);
      throw new Error(err);
    });
  }

  async getSourceByData(data: API.TenderTocTreeNode[]) {
    console.log(data)
    const reqList = data.map(v => {
      if (v.tocFlag && v.tenderSourceDto) {
        if (['.jpg', '.jpeg', '.png'].includes(v.tenderSourceDto.fileDetailRespList[0].postfix)) {
          return this.createImagePage(v.tenderSourceDto.fileDetailRespList[0].key)
        } else {
          return this.fetchNewFile(v.tenderSourceDto.fileDetailRespList[0].key)
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

      return new Promise<Blob>((resolve, reject) => {
        docx.save('blob', (data) => {
          console.log(writeFile, data);
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

  async uploadDocx(data: Blob) {
    const formData = new FormData();
    formData.append('file', data);
    try {
      const { data } = await axios<API.UploadResult>({
        url: `${BACKEND_SERVER}/inter-api/tender/file/upload`,
        method: 'POST',
        data: formData,
        headers: {
          Authorization: this.token,
        }
      })
      if (data.code === 1) {
        return data.data.key;
      } else {
        throw new Error(data.msg || '上传标书出错');
      }
    } catch (err) {
      this.logger.error(`uploadDocx get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }

  async createCallBack(data: API.CreateCallback) {
    try {
      axios<API.UploadResult>({
        url: `${BACKEND_SERVER}/inter-api/tender/tender/create/notice`,
        method: 'POST',
        data,
        headers: {
          Authorization: this.token,
        }
      })
    } catch (err) {
      this.logger.error(`createCallBack get err: ${err.message}`, err.stack);
      throw new Error(err);
    }
  }
}
