import { describe, expect, it } from 'vitest';

import { toStatusLine } from './statusLine';

describe('toStatusLine', () => {
  it.each([
    ['Let me check **your** projects:', 'Let me check your projects…'],
    ['Let me check your projects…', 'Let me check your projects…'],
    ['Shall I look?', 'Shall I look?'],
    ['Calling list_projects.', 'Calling list_projects…'],
    ['Two\nlines.', 'Two lines…'],
    ['Let me open [your projects](/projects/).', 'Let me open your projects…'],
    [
      'See ![the chart](/c.png) and [**docs**](https://x/).',
      'See the chart and docs…',
    ],
    ['  ', ''],
  ])('%j → %j', (input, expected) => {
    expect(toStatusLine(input)).toBe(expected);
  });
});
