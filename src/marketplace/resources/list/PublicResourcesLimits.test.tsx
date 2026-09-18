import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DASH_ESCAPE_CODE } from '@/table/constants';

import { limitEntries, PublicResourcesLimits } from './PublicResourcesLimits';

describe('limitEntries', () => {
  it('formats each component as "key: value"', () => {
    expect(limitEntries({ cpu: 4, ram: 8192 })).toEqual([
      'cpu: 4',
      'ram: 8192',
    ]);
  });

  it('is empty when there are no limits', () => {
    // Terminate orders carry `{}`; other rows may omit the field entirely.
    expect(limitEntries({})).toEqual([]);
    expect(limitEntries(null)).toEqual([]);
    expect(limitEntries(undefined)).toEqual([]);
  });
});

describe('PublicResourcesLimits', () => {
  it('renders one line per component', () => {
    render(<PublicResourcesLimits row={{ limits: { cpu: 4, ram: 8192 } }} />);
    expect(screen.getByText('cpu: 4')).toBeTruthy();
    expect(screen.getByText('ram: 8192')).toBeTruthy();
  });

  it('renders a dash for a row without limits', () => {
    // Must match the orders table export, which falls back to the same dash.
    const { container } = render(
      <PublicResourcesLimits row={{ limits: {} }} />,
    );
    expect(container.textContent).toBe(DASH_ESCAPE_CODE);
  });
});
