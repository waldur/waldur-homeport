import { render, screen } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ProjectLifecycleBadge } from './ProjectLifecycleBadge';

const badge = (end_date: string, effective_end_date: string) =>
  render(
    <ProjectLifecycleBadge
      project={{ end_date, effective_end_date, is_in_grace_period: true }}
    />,
  );

describe('ProjectLifecycleBadge', () => {
  beforeEach(() => {
    const fixedNow = DateTime.fromISO('2026-11-14T09:00:00').toMillis();
    Settings.now = () => fixedNow;
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('counts the grace period to the last usable day', () => {
    badge('2026-11-10', '2026-11-28');

    expect(screen.getByText('In grace, 13d left')).toBeInTheDocument();
  });

  // is_in_grace_period is still true on the effective end date, but the
  // resources are being terminated that day.
  it('is expired on the effective end date', () => {
    badge('2026-11-10', '2026-11-14');

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('counts an end date without grace to the last usable day', () => {
    badge('2026-11-24', '2026-11-24');

    expect(screen.getByText('9d left')).toBeInTheDocument();
  });
});
