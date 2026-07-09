import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EndDateField } from './EndDateField';

vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
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
});
