import { readFile } from 'fs/promises';

import { Injectable } from '@nestjs/common';
import { initLiquidEngine } from 'src/utils/liquid';

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

    return html;
  }
}
