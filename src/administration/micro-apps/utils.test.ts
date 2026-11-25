import { describe, expect, it } from 'vitest';
import type { MicroAppSetting } from 'waldur-js-client';

import { choiceOf, joinMicroApps } from './utils';

const entry = (name: string, title = name) => ({
  name,
  title,
  description: '',
  visibleTo: { features: [], roles: [], staffOnly: false },
});

const setting = (name: string, mode: MicroAppSetting['mode']) =>
  ({
    url: '',
    uuid: name,
    name,
    mode,
    feature_key: `micro_apps.${name}`,
    rules_count: 0,
    created: '',
    modified: '',
  }) as MicroAppSetting;

describe('joinMicroApps', () => {
  it('joins the image’s apps with the operator’s settings', () => {
    const rows = joinMicroApps(
      [entry('b-app', 'B app'), entry('a-app', 'A app')],
      [setting('b-app', 'audience'), setting('gone-app', 'all')],
    );
    expect(rows.map((row) => [row.name, row.deployed])).toEqual([
      ['a-app', true],
      ['b-app', true],
      ['gone-app', false],
    ]);
    expect(choiceOf(rows[0])).toBe('feature');
    expect(choiceOf(rows[1])).toBe('audience');
    expect(choiceOf(rows[2])).toBe('all');
  });
});
