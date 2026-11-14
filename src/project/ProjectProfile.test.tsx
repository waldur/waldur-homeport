import { screen } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ProjectProfile } from './ProjectProfile';

// Pulls in the drawer context, which this test has no use for.
vi.mock('./dashboard/ProjectActions', () => ({
  ProjectActions: () => null,
}));

const project: any = {
  uuid: 'p1',
  name: 'Project A',
  kind: 'default',
  end_date: '2026-11-10',
  effective_end_date: '2026-11-28',
  is_in_grace_period: true,
};

describe('ProjectProfile end date', () => {
  beforeEach(() => {
    // Resolve the instant before installing the clock: computing it inside
    // the callback makes Settings.now call itself.
    const fixedNow = DateTime.fromISO('2026-11-14T09:00:00').toMillis();
    Settings.now = () => fixedNow;
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  // Must agree with GracePeriodWarningBar: access is lost at the start of
  // 28 Nov, so the last usable day is the 27th.
  it('counts the grace period to the last usable day', () => {
    renderWithProviders(<ProjectProfile project={project} />);

    expect(
      screen.getByText('(in grace period, 13 days left)'),
    ).toBeInTheDocument();
  });

  // On the effective end date the API still reports is_in_grace_period, but
  // the project has expired and the banner above says so.
  it('says expired, not in grace, on the effective end date', () => {
    renderWithProviders(
      <ProjectProfile
        project={{ ...project, effective_end_date: '2026-11-14' }}
      />,
    );

    expect(screen.getByText('(expired today)')).toBeInTheDocument();
    expect(screen.queryByText(/in grace period/)).toBeNull();
  });

  it('uses the singular for one day left', () => {
    renderWithProviders(
      <ProjectProfile
        project={{ ...project, effective_end_date: '2026-11-16' }}
      />,
    );

    expect(
      screen.getByText('(in grace period, 1 day left)'),
    ).toBeInTheDocument();
  });

  // Without a grace period the project ends, and its resources are
  // terminated, on the end date: 23 Nov is the last usable day.
  it('counts an end date without grace to the last usable day', () => {
    renderWithProviders(
      <ProjectProfile
        project={{
          ...project,
          end_date: '2026-11-24',
          effective_end_date: '2026-11-24',
          is_in_grace_period: false,
        }}
      />,
    );

    expect(screen.getByText('(9 days left)')).toBeInTheDocument();
  });
});
