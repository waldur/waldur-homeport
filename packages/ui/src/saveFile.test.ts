import { afterEach, describe, expect, it, vi } from 'vitest';

import { saveFile } from './saveFile';

describe('saveFile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('downloads the blob under the given name and cleans up after itself', () => {
    const createObjectURL = vi.fn(() => 'blob:report');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const blob = new Blob(['a,b'], { type: 'text/csv' });

    saveFile(blob, 'report.csv');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.href).toBe('blob:report');
    expect(link.download).toBe('report.csv');
    expect(link.isConnected).toBe(false);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report');
  });
});
