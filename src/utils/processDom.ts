import { parse } from 'node-html-parser';

/**
 * 即使HEAD/body标签因为有未闭合的元素，对于root.querySelectorAll('script')依然是不受影响是
 * @param htmlStr
 */
export const validateDom = (htmlStr: string) => {
  const root = parse(htmlStr, {
    comment: true,
  });

  const scripts = root.querySelectorAll('script');

  console.error(
    '---------- aiden scripts --------------',
    scripts.map((sc) => sc.text),
  );

  const headDOM = root.querySelector('head');
  const bodyDOM = root.querySelector('body');
  // console.error('---------- aiden  headDOM --------------', headDOM);
  // console.error('---------- aiden  bodyDOM --------------', bodyDOM);
};
