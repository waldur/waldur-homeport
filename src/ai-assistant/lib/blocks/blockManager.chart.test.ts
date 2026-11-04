import { describe, expect, it } from 'vitest';

import { extractTextFromBlocks } from '@/ai-assistant/lib/messages/messageUtils';

import { updateBlocks } from './blockManager';

const chartPart = {
  k: 'chart',
  chart_type: 'stacked_bar',
  title: 'Job outcomes per day',
  subtitle: 'Last 14 days',
  x: { type: 'category', categories: ['10-16', '10-17'] },
  y: { type: 'value', label: 'jobs' },
  series: [
    {
      name: 'Completed',
      tone: 'success',
      points: [
        [0, 3],
        [1, 5],
      ],
    },
  ],
  link: {
    label: 'Open insights',
    url: '/resource-details/abc/?tab=hpc-insights',
  },
};

describe('updateBlocks for chart', () => {
  it('keeps the spec fields flat on a complete block', () => {
    const [block] = updateBlocks([], chartPart as any);
    expect(block.key).toBe('chart');
    expect(block.status).toBe('complete');
    expect(block.chart_type).toBe('stacked_bar');
    expect(block.series?.[0].points).toEqual([
      [0, 3],
      [1, 5],
    ]);
    expect(block.link?.url).toContain('hpc-insights');
  });

  it('replaces the tool loading block', () => {
    const loading = updateBlocks([], { k: 'load', t: 'tool' } as any);
    const blocks = updateBlocks(loading, chartPart as any);
    expect(blocks.map((block) => block.key)).toEqual(['chart']);
  });

  it('names the chart in the text form', () => {
    const blocks = updateBlocks([], chartPart as any);
    expect(extractTextFromBlocks(blocks)).toContain(
      'Chart: Job outcomes per day',
    );
  });
});
