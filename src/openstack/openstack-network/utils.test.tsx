import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { formatAllocationPool } from './utils';

describe('formatAllocationPool', () => {
  it('renders each pool', () => {
    render(
      <div>
        {formatAllocationPool([{ start: '10.0.0.2', end: '10.0.0.9' }])}
      </div>,
    );
    expect(screen.getByText(/10\.0\.0\.2/)).toBeInTheDocument();
  });

  it('survives the {} the API returns for a subnet with no pools', () => {
    // SubNet.allocation_pools defaults to an empty dict server-side, so a
    // subnet created through the API without pools comes back as {} until the
    // first pull. Calling .map() on that used to crash the subnet summary and
    // with it the whole subnets table row.
    expect(() =>
      render(<div>{formatAllocationPool({} as any)}</div>),
    ).not.toThrow();
  });

  it('renders a dash for an empty list', () => {
    const { container } = render(<div>{formatAllocationPool([])}</div>);
    expect(container.textContent).toBe('―');
  });
});
