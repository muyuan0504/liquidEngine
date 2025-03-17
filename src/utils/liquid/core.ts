import { Liquid } from 'liquidjs';
import { registerFilter } from './extend';
import { TagToken } from 'liquidjs';
import path from 'path';
/**
 * Liquid 构造函数接受一个参数对象，用来定义各种模板引擎行为
 * @param options
 * cache: 指定是否缓存曾经读取和处理过的模板来提升性能
 * root:  指定 LiquidJS 查找和读取模板的根目录
 * layouts: 和 root 具有一样的格式，用来指定 {% layout %} 所使用的目录。没有指定时默认为 root
 * partials: root 具有一样的格式，用来指定 {% render %} 和 {% include %} 所使用的目录。没有指定时默认为 root
 * relativeReference: 默认为 true 用来允许以相对路径引用其他文件。注意被引用的文件仍然需要在对应的 root 目录下
 */
export const initLiquidEngine = (options?: Object) => {
  console.log(__dirname);
  const opts = {
    cache: true, // 指定是否缓存曾经读取和处理过的模板来提升性能
    root: 'src/liquid',
    extname: '.liquid',
    ...options,
  };

  const engine = new Liquid(opts);

  registerFilter(engine);

  // 自定义标签接入
  engine.registerTag('upper', {
    parse: function (tagToken: TagToken) {
      this.name = tagToken.args;
    },
    render: function () {
      return `hello ${this.name}`;
    },
  });

  // 注册过滤器
  engine.registerFilter('upcase', (value: string) => {
    return value.toUpperCase();
  });

  return engine;
};
