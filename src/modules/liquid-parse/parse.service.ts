import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { parse, valid } from 'node-html-parser';
const path = require('path');
const fs = require('fs');

import { Injectable } from '@nestjs/common';
import { initLiquidEngine } from 'src/utils/liquid';

const errorDir = path.resolve(__dirname);
console.error('---------- aiden --------------', errorDir);
// const errHtml = require()

@Injectable()
export class ParseService {
  getHello(): string {
    return 'Hello World! 01';
  }

  async renderLiquid(fileName: string): Promise<string> {
    const renderCtx = initLiquidEngine();

    const filePath = `src/liquid/${fileName}.liquid`;

    const liquidStr = await readFile(filePath, 'utf-8');

    if (!liquidStr) return '解析文件路径异常';

    const pageData = {
      name: 'alice',
      age: 18,
    };

    const html: string = await renderCtx
      .parseAndRender(liquidStr, { commonData: pageData })
      .catch((err) => {
        console.log('liquid解析异常：', err);
      });

    const htmlDir = path.resolve(__dirname, './html-str');
    const keepHtml = path.resolve(
      __dirname,
      './html-str/' + fileName + '.html',
    );

    console.log('html path:', keepHtml);

    // 检查目录是否存在，不存在则创建
    try {
      await access(htmlDir);
    } catch (error) {
      // 目录不存在，创建目录
      await mkdir(htmlDir, { recursive: true });
      console.log(`Directory ${htmlDir} created`);
    }

    // 写入文件（无论文件是否存在，writeFile 都会覆盖或创建）
    await writeFile(keepHtml, html, 'utf-8');
    console.log(`File ${keepHtml} has been written`);

    const root = parse(html, {
      comment: true,
    });

    console.error('---------- aiden root --------------', root);

    const headDOM = root.querySelector('head');
    const bodyDOM = root.querySelector('body');

    // 当liquid有异常标签时，如标签未结束，会导致解析异常，此时返回的html-dom为null
    // eg： <body><div> <span> </div></body>，此时div未结束，会导致解析异常，root.querySelector('body') 返回的bodyDOM为null

    // console.error('---------- aiden head--------------', headDOM);
    console.error('---------- aiden body--------------', bodyDOM);

    return html;
  }

  async validateHtml(fileName: string): Promise<string> {
    try {
      // 构建error.html文件的绝对路径
      const errorFilePath = path.resolve(process.cwd(), 'src/file/error.html');
      console.log('Reading error file from:', errorFilePath);
      // 检查文件是否存在
      try {
        await access(errorFilePath);
      } catch (error) {
        console.error(`Error: File ${errorFilePath} does not exist`);
        return `Error: File not found at ${errorFilePath}`;
      }
      
      // 读取文件内容
      const errorHtml = await readFile(errorFilePath, 'utf-8');
      console.log('Error HTML file loaded successfully');
      
      // 解析HTML内容
      const root = parse(errorHtml, {
        comment: true,
      });
      
      // 获取head和body元素
      const headDOM = root.querySelector('head');
      const bodyDOM = root.querySelector('body');
      
      console.log('HTML Validation Results:');
      console.log('- Head element exists:', !!headDOM);
      console.log('- Body element exists:', !!bodyDOM);
      
      // 检查HTML结构是否有问题
      if (!headDOM || !bodyDOM) {
        console.error('HTML structure is invalid - missing head or body element');
      }
      
      // 可以在这里添加更多的验证逻辑
      
      return errorHtml;
    } catch (error) {
      console.error('Error validating HTML:', error);
      return `Error validating HTML: ${error.message}`;
    }
  }
}
