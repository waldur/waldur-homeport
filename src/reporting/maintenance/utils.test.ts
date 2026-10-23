import { describe, expect, it } from 'vitest';

import { MaintenanceTimelineItem } from './types';
import { formatTimelineChart } from './utils';

const item = (overrides: Partial<MaintenanceTimelineItem>) =>
  ({
    id: 'm1',
    name: 'Upgrade',
    state: 'scheduled',
    scheduledStart: new Date('2026-01-01T10:00:00Z'),
    scheduledEnd: new Date('2026-01-01T12:00:00Z'),
    actualStart: null,
    actualEnd: null,
    providerName: 'Provider',
    providerUuid: 'p1',
    offeringNames: ['Offering'],
    maxImpactLevel: 1,
    startDeltaMinutes: null,
    endDeltaMinutes: null,
    timingBucket: 'on_time',
    ...overrides,
  }) as MaintenanceTimelineItem;

const tooltip = (timelineItem: MaintenanceTimelineItem) => {
  const chart = formatTimelineChart([timelineItem], 'provider', 'state') as any;
  return chart.tooltip.formatter({ data: { item: timelineItem } }) as string;
};

describe('formatTimelineChart tooltip', () => {
  // ECharts puts the tooltip in the page as HTML, so operator-supplied text
  // must arrive escaped.
  it('escapes the maintenance name, provider and state', () => {
    const html = tooltip(
      item({
        name: '<img src=x onerror="alert(1)">',
        providerName: `Tom & Jerry's`,
        state: '<b>odd</b>',
      }),
    );

    expect(html).toContain(
      '<strong>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</strong>',
    );
    expect(html).toContain('Tom &amp; Jerry&#39;s');
    expect(html).toContain('&lt;b&gt;odd&lt;/b&gt;');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>');
  });
});
