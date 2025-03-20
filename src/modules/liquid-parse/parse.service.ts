import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { parse, valid, HTMLElement } from 'node-html-parser';
const path = require('path');
const fs = require('fs');

import { Injectable } from '@nestjs/common';
import { initLiquidEngine, validateDom } from 'src/utils/index';

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

    // const root = parse(html, {
    //   comment: true,
    // });

    // console.error('---------- aiden root --------------', root);

    // const headDOM = root.querySelector('head');
    // const bodyDOM = root.querySelector('body');

    // 当liquid有异常标签时，如标签未结束，会导致解析异常，此时返回的html-dom为null
    // eg： <body><div> <span> </div></body>，此时div未结束，会导致解析异常，root.querySelector('body') 返回的bodyDOM为null

    // console.error('---------- aiden head--------------', headDOM);
    // console.error('---------- aiden body--------------', bodyDOM);

    validateDom(html);

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

      // 获取head和body元素并记录清理前的状态
      const headDOM = root.querySelector('head');
      const bodyDOM = root.querySelector('body');
      const scripts = root.querySelectorAll('script');

      console.log('HTML Validation Results (Before Cleaning):');
      console.log('- Head element exists:', !!headDOM);
      console.log('- Body element exists:', !!bodyDOM);
      console.log('- Scripts count:', scripts.length);

      if (!bodyDOM) {
        console.error('Warning: Body element not found in original HTML');
      }

      // 只查找直接位于 head 或 body 内的脚本，而不是所有脚本
      // 这样可以避免误删包含脚本的父元素
      const headScripts = root.querySelectorAll('script') || [];
      const bodyScripts = root.querySelectorAll('script') || [];

      // 找出包含 'gtag' 的脚本标签
      const gtagScripts: HTMLElement[] = [];

      // 处理 head 中的脚本
      headScripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        const content = script.text;

        // 检查脚本的src属性或内容是否包含'gtag'
        if (
          (src && src.includes('gtag')) ||
          (content && content.includes('gtag'))
        ) {
          console.log(
            `Found gtag script in head at index ${index}:`,
            src || content.substring(0, 50) + '...',
          );
          gtagScripts.push(script);
        }
      });

      // 处理 body 中的脚本
      bodyScripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        const content = script.text;

        // 检查脚本的src属性或内容是否包含'gtag'
        if (
          (src && src.includes('gtag')) ||
          (content && content.includes('gtag'))
        ) {
          console.log(
            `Found gtag script in body at index ${index}:`,
            src || content.substring(0, 50) + '...',
          );
          gtagScripts.push(script);
        }
      });

      // 从DOM中移除gtag脚本
      gtagScripts.forEach((script) => {
        // 安全地移除脚本，确保不会影响父元素
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        } else {
          script.remove();
        }
      });

      console.log(`Removed ${gtagScripts.length} gtag scripts from HTML`);

      // 再次检查HTML结构，确保清理后body仍然存在
      const bodyAfterClean = root.querySelector('body');
      const headAfterClean = root.querySelector('head');

      console.log('HTML Validation Results (After Cleaning):');
      console.log('- Head element exists after cleaning:', !!headAfterClean);
      console.log('- Body element exists after cleaning:', !!bodyAfterClean);

      // 检查HTML结构是否有问题
      if (!bodyAfterClean) {
        console.error(
          'Error: Body element was removed during cleaning process!',
        );
        // 如果body被移除，可以考虑恢复原始HTML或采取其他措施
      }

      /** 移除之后再往里塞指定脚本 */
      // 创建一个新的script元素
      const newScript = `
        <script>
          console.log("This script was added by the HTML cleaner");
        </script>
      `;
      if (headAfterClean) {
        root.set_content(
          root.innerHTML.replace('</head>', newScript + '</head>'),
        );
      } else if (bodyAfterClean) {
        root.set_content(
          root.innerHTML.replace('</body>', newScript + '</body>'),
        );
      }

      // 获取清理后的HTML
      const cleanedHtml = root.toString();

      // 可以选择将清理后的HTML写入新文件
      const cleanedFilePath = path.resolve(
        process.cwd(),
        'src/file/cleaned_error.html',
      );
      await writeFile(cleanedFilePath, cleanedHtml, 'utf-8');
      console.log(`Cleaned HTML written to ${cleanedFilePath}`);

      return cleanedHtml;
    } catch (error) {
      console.error('Error validating HTML:', error);
      return `Error validating HTML: ${error.message}`;
    }
  }
}
