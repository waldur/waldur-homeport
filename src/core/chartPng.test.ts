import { describe, expect, it, vi } from 'vitest';

import { saveFile } from '@/table/exporters/saveFile';

import { saveChartPng } from './chartPng';

vi.mock('@/table/exporters/saveFile', () => ({ saveFile: vi.fn() }));

// The 8-byte PNG signature, base64.
const PNG_SIGNATURE = 'iVBORw0KGgo=';

describe('saveChartPng', () => {
  it('saves the chart as a PNG blob, not a data-URL link', async () => {
    const chart = {
      getDataURL: vi.fn(() => `data:image/png;base64,${PNG_SIGNATURE}`),
    };
    saveChartPng(chart, 'Orders by state', '#ffffff');

    expect(chart.getDataURL).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'png', backgroundColor: '#ffffff' }),
    );
    const [blob, name] = vi.mocked(saveFile).mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect([...new Uint8Array(await blob.arrayBuffer())]).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    expect(name).toBe('Orders by state.png');
  });
});
