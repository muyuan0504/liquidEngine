/** 扩展 */

const sumFilter = {
  name: 'sum',
  filterFn: function (initial: number, arg1: number, arg2: number): number {
    return initial + arg1 + arg2;
  },
};

export const registerFilter = (engine) => {
  engine.registerFilter(sumFilter.name, sumFilter.filterFn);
};
