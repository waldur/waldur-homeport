import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EXPORT_OPTIONS } from './constants';
import saveAsJson from './json';
import { saveFile } from './saveFile';

vi.mock('./saveFile', () => ({ saveFile: vi.fn() }));

describe('JSON exporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is offered in the Format select of every export dialog', () => {
    expect(EXPORT_OPTIONS).toContainEqual({ value: 'json', label: 'JSON' });
  });

  it('saves the rows exactly as given, under the table name', async () => {
    const rows = [
      { uuid: 'a', name: 'vm-1', cores: 4, tags: ['gpu'], owner: null },
      { uuid: 'b', name: 'vm-2', limits: { cpu: 2 }, is_shared: false },
    ];

    saveAsJson('Resources', rows);

    const [blob, name] = vi.mocked(saveFile).mock.calls[0];
    expect(name).toBe('Resources.json');
    expect(blob.type).toBe('application/json;charset=utf-8');
    expect(JSON.parse(await blob.text())).toEqual(rows);
  });
});
