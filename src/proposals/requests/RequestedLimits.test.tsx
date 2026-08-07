import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RequestedLimits } from './RequestedLimits';

describe('RequestedLimits', () => {
  it('renders whatever keys the request carries', () => {
    render(<RequestedLimits limits={{ cpu_hours: 50000, gpu_hours: 5000 }} />);
    expect(screen.getByText(/Cpu hours/i)).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
  });

  // A storage vault reports TB, an allocation reports hours — no fixed column.
  it('is not tied to a fixed set of components', () => {
    render(<RequestedLimits limits={{ storage_tb: 8 }} />);
    expect(screen.getByText(/Storage tb/i)).toBeInTheDocument();
  });

  it('says so when no limits were requested', () => {
    render(<RequestedLimits limits={{}} />);
    expect(screen.getByText('Not specified')).toBeInTheDocument();
  });

  it('tolerates a missing limits blob', () => {
    render(<RequestedLimits />);
    expect(screen.getByText('Not specified')).toBeInTheDocument();
  });

  // The schema types limits as an open JSON object, so non-numbers can arrive.
  it('skips values that are not numbers', () => {
    render(
      <RequestedLimits
        limits={{ cpu_hours: 10, note: 'urgent', missing: null } as any}
      />,
    );
    expect(screen.getByText(/Cpu hours/i)).toBeInTheDocument();
    expect(screen.queryByText(/Note/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Missing/i)).not.toBeInTheDocument();
  });
});
