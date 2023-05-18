// eslint-disable-next-line @typescript-eslint/no-var-requires
const DocxMerger = require('docx-merger');
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
// const { writeFile } = fs;

function createPage(text: string) {
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
}

async function createImagePage(url) {
  const buf = await fetchFile(url);
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
}

function fetchFile(url) {
  return axios({
    url: `http://localhost:3003/download?file=${url}`,
    method: 'GET',
    responseType: 'arraybuffer',
  }).then((response) => {
    return Buffer.from(response.data, 'binary');
  });
  // return fetch(`http://localhost:3003/download?file=${url}`);
}

export const merger = async () => {
  const head1 = await createPage('概述');
  const file1 = await fetchFile('docx/d1.docx');
  // const file1 = fs.readFileSync(
  //   path.resolve(__dirname, 'docx/d1.docx'),
  //   'binary',
  // );
  const head2 = await createPage('技术规格要求');
  const file2 = await fetchFile('docx/d2.docx');
  // const file2 = fs.readFileSync(
  //   path.resolve(__dirname, 'docx/d2.docx'),
  //   'binary',
  // );
  // const head3 = await createPage('售后技术服务');
  // const file3 = fs.readFileSync(
  //   path.resolve(__dirname, 'docx/d9.docx'),
  //   'binary',
  // );
  // const head4 = await createPage('项目执行要求');
  // const file4 = fs.readFileSync(
  //   path.resolve(__dirname, 'docx/d6.docx'),
  //   'binary',
  // );
  const img1 = await createImagePage('docx/001.jpg');
  const img2 = await createImagePage('docx/002.jpg');
  const docx = new DocxMerger({ pageBreak: false }, [
    head1,
    file1,
    head2,
    file2,
    // head3,
    // file3,
    // head4,
    // file4,
    img1,
    img2,
  ]);

  //SAVING THE DOCX FILE
  // TODO: 处理模板文件合并时，部分无序列表样式失效问题
  // FIXME: 处理模板文件合并时，标题样式非原模板文件样式

  docx.save('nodebuffer', (data) => {
    console.log(writeFile, data);
    // fs.writeFile("output.zip", data, function(err){/*...*/});
    writeFile(resolve(__dirname, 'output.docx'), data, function (err) {
      /*...*/
      if (err) throw new Error(JSON.stringify(err));
    });
  });
};
