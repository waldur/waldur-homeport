import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { formatDateTime } from '@/core/dateUtils';

import { EndDateField } from './EndDateField';

vi.mock('@/core/WarnTip', () => ({ WarnTip: () => null }));

const buildResource = (overrides = {}) =>
  ({
    uuid: 'r1',
    end_date: null,
    project_end_date: '2026-09-06',
    // Grace-awareness now lives on the backend; the frontend just renders this.
    resource_effective_end_date: '2026-10-06',
    ...overrides,
  }) as any;

describe('EndDateField', () => {
  it('renders the backend-computed effective end date', () => {
    const { container } = render(
      <EndDateField
        resource={buildResource({ resource_effective_end_date: '2026-09-06' })}
      />,
    );
    expect(container.textContent).toContain('2026-09-06');
    expect(container.textContent).not.toContain('2026-10-06');
  });

  it('renders the effective (with-grace) end date for a normal offering', () => {
    const { container } = render(<EndDateField resource={buildResource()} />);
    expect(container.textContent).toContain('2026-10-06');
  });

  describe('for a terminated resource', () => {
    const terminatedAt = '2026-09-06T10:30:00Z';

    it('shows when it was terminated instead of the planned date', () => {
      const { container } = render(
        <EndDateField
          resource={buildResource({
            state: 'Terminated',
            terminated_at: terminatedAt,
          })}
        />,
      );
      expect(container.textContent).toContain('Terminated at');
      expect(container.textContent).toContain(formatDateTime(terminatedAt));
      expect(container.textContent).not.toContain('Termination date');
      expect(container.textContent).not.toContain('2026-10-06');
    });

    it('falls back to the planned date when the moment is unknown', () => {
      const { container } = render(
        <EndDateField
          resource={buildResource({ state: 'Terminated', terminated_at: null })}
        />,
      );
      expect(container.textContent).toContain('Termination date');
      expect(container.textContent).toContain('2026-10-06');
    });

    it('ignores the date kept while a restore is in progress', () => {
      const { container } = render(
        <EndDateField
          resource={buildResource({
            state: 'Creating',
            terminated_at: terminatedAt,
          })}
        />,
      );
      expect(container.textContent).not.toContain('Terminated at');
      expect(container.textContent).toContain('2026-10-06');
    });
  });
});
