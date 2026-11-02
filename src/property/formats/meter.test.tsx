import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { propVal } from './propVal';

describe('propVal.meter', () => {
  it('returns null on empty or non-numeric values', () => {
    expect(propVal.meter(null)).toBeNull();
    expect(propVal.meter(undefined)).toBeNull();
    expect(propVal.meter('')).toBeNull();
    expect(propVal.meter('not a number')).toBeNull();
  });

  it('formats fraction with unit and percentage', () => {
    const meter = propVal.meter(4, 16, {
      unit: 'cores',
      showPercent: true,
    });
    expect(meter).not.toBeNull();
    expect(meter?.__isFormattedProperty).toBe(true);
    expect(meter?.text).toBe('4 / 16 cores (25%)');
  });

  it('handles unlimited limit (-1)', () => {
    const meter = propVal.meter(10, -1, {
      unit: 'GB',
    });
    expect(meter).not.toBeNull();
    expect(meter?.text).toBe('10 GB / Unlimited');
  });

  it('formats single percentage meter without max', () => {
    const meter = propVal.meter(85, {
      format: 'percent',
      display: 'bar',
    });
    expect(meter).not.toBeNull();
    expect(meter?.text).toBe('85%');

    // Decimal percentage formats cleanly with 1 decimal and does not round to 100%
    const decimalMeter = propVal.meter(99.87, {
      format: 'percent',
      display: 'inline',
    });
    expect(decimalMeter?.text).toBe('99.9%');

    // Small percentage between 0 and 1 is not multiplied by 100
    const smallMeter = propVal.meter(0.5, {
      format: 'percent',
      display: 'inline',
    });
    expect(smallMeter?.text).toBe('0.5%');
  });

  it('formats fileSize values with unit scaling', () => {
    const meter = propVal.meter(1024, 4096, {
      format: 'fileSize',
      showPercent: true,
    });
    expect(meter).not.toBeNull();
    expect(meter?.text).toContain('1 GB / 4 GB (25%)');
  });

  it('renders in PropertyList with accessible progress bar and clipboard text', () => {
    render(
      <PropertyList>
        <PropertyItem
          label="CPU usage"
          value={propVal.meter(4, 16, {
            unit: 'cores',
            showPercent: true,
          })}
          hasCopy
        />
        <PropertyItem
          label="RAM inline"
          value={propVal.meter(2048, 8192, {
            format: 'fileSize',
            display: 'inline',
          })}
        />
      </PropertyList>,
    );

    expect(screen.getByText('CPU usage')).toBeInTheDocument();
    expect(screen.getByText('cores')).toBeInTheDocument();
    expect(screen.getByText('(25%)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });
});

describe('propVal.badge and propVal.annotated', () => {
  it('formats badge with clean copy text', () => {
    const badge = propVal.badge('Production', { variant: 'success' });
    expect(badge).not.toBeNull();
    expect(badge?.text).toBe('Production');
  });

  it('formats badgeList with joined copy text', () => {
    const list = propVal.badgeList(['Tag1', 'Tag2', 'Tag3']);
    expect(list).not.toBeNull();
    expect(list?.text).toBe('Tag1, Tag2, Tag3');
  });

  it('formats annotated value with hint and subtext', () => {
    const annotated = propVal.annotated('Project Alpha', {
      hint: 'ALPHA',
      subtext: 'Department of Computing',
    });
    expect(annotated).not.toBeNull();
    expect(annotated?.text).toBe(
      'Project Alpha (ALPHA) — Department of Computing',
    );
  });
});
