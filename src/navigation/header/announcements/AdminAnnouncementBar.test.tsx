import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminAnnouncement } from 'waldur-js-client';

import {
  AdminAnnouncementBar,
  getMaintenanceByline,
} from './AdminAnnouncementBar';

vi.mock('./useTextTruncation', () => ({
  useTextTruncation: () => ({ textRef: { current: null }, isTruncated: false }),
}));

const announcement = (
  overrides: Partial<AdminAnnouncement> = {},
): AdminAnnouncement =>
  ({
    uuid: 'a1',
    type: 'warning',
    description: 'Short message.',
    maintenance_uuid: 'm1',
    maintenance_name: 'Network upgrade',
    maintenance_service_provider: 'HPC Centre',
    maintenance_affected_offerings: [],
    ...overrides,
  }) as AdminAnnouncement;

const offerings = (...names: string[]) =>
  names.map((name, index) => ({ uuid: String(index), name }));

describe('getMaintenanceByline', () => {
  it('names the affected offerings', () => {
    expect(
      getMaintenanceByline(
        announcement({
          maintenance_affected_offerings: offerings('Cloud', 'Storage'),
        }),
      ),
    ).toBe('Affects Cloud, Storage');
  });

  it('lists two offerings and counts the rest', () => {
    expect(
      getMaintenanceByline(
        announcement({
          maintenance_affected_offerings: offerings('A', 'B', 'C', 'D'),
        }),
      ),
    ).toBe('Affects A, B and 2 more');
  });

  it('falls back to the provider without affected offerings', () => {
    expect(getMaintenanceByline(announcement())).toBe('By HPC Centre');
  });

  it('is empty for a plain announcement', () => {
    expect(
      getMaintenanceByline(
        announcement({
          maintenance_uuid: null,
          maintenance_service_provider: null,
          maintenance_affected_offerings: null,
        }),
      ),
    ).toBeUndefined();
  });
});

describe('AdminAnnouncementBar', () => {
  it('offers Show more when the dialog lists affected offerings', () => {
    render(
      <AdminAnnouncementBar
        announcement={announcement({
          maintenance_affected_offerings: offerings('Cloud'),
        })}
        onShowMore={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Show more/ })).toBeTruthy();
  });

  it('hides Show more on a maintenance without offerings when the text fits', () => {
    // The message carries the schedule and the byline the provider, so the
    // dialog would only repeat the bar.
    render(
      <AdminAnnouncementBar
        announcement={announcement()}
        onShowMore={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /Show more/ })).toBeNull();
  });
});
