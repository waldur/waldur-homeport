import { describe, expect, it } from 'vitest';

import { formatDateTime } from '@/core/dateUtils';
import { renderWithProviders } from '@/test/harness';

import { ResourceDetailsTable } from './ResourceDetailsTable';

const buildResource = (overrides = {}) =>
  ({
    uuid: 'r1',
    name: 'Resource',
    state: 'OK',
    resource_effective_end_date: '2027-06-01',
    ...overrides,
  }) as any;

const renderText = (resource) =>
  renderWithProviders(<ResourceDetailsTable resource={resource} />).container
    .textContent;

describe('ResourceDetailsTable', () => {
  it('shows the scheduled date of a live resource', () => {
    const text = renderText(buildResource());
    expect(text).toContain('Scheduled termination');
    expect(text).not.toContain('Terminated at');
  });

  it('shows when a terminated resource was terminated instead', () => {
    const terminatedAt = '2026-09-06T10:30:00Z';
    const text = renderText(
      buildResource({ state: 'Terminated', terminated_at: terminatedAt }),
    );
    expect(text).toContain('Terminated at');
    expect(text).toContain(formatDateTime(terminatedAt));
    expect(text).not.toContain('Scheduled termination');
  });

  it('keeps the scheduled row when the moment is unknown', () => {
    const text = renderText(
      buildResource({ state: 'Terminated', terminated_at: null }),
    );
    expect(text).toContain('Scheduled termination');
    expect(text).not.toContain('Terminated at');
  });
});
