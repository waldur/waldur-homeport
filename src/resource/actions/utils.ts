import { ActionField } from './types';

function createMap(items: ActionField[]) {
  return items.reduce((map, item) => ({ ...map, [item.name]: item }), {});
}

export function mergeFields(
  xs: ActionField[],
  ys: ActionField[],
): ActionField[] {
  if (!ys || !xs) {
    return ys || xs;
  }

  const xmap = createMap(xs);
  const ymap = createMap(ys);

  return [
    ...xs.map((item) => ymap[item.name] || item),
    ...ys.filter((item) => !xmap[item.name]),
  ];
}
