// @flow
export type Chart = {
  +title: string,
  +feature: string,
  +current: number,
  +change: number,
  +data: Array<{
    +label: string,
    +value: number,
  }>
};

export type Scope = {
  url: string,
  quotas: Array<{
    name: string,
    url: string,
  }>,
};

export type ChartsState = {
  +loading: boolean,
  +erred: boolean,
  +charts: Array<Chart>,
};
