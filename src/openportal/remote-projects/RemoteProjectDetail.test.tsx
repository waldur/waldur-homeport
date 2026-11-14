import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openportalRemoteProjectsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { RemoteProjectDetail } from './RemoteProjectDetail';

vi.mock('./RemoteProjectAuditLog', () => ({
  RemoteProjectAuditLog: () => null,
}));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));

const NOTE_TEXT = 'First line\nSecond line';

describe('RemoteProjectDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      params: { remoteProjectUuid: 'rp-1' },
    } as any);
    vi.mocked(openportalRemoteProjectsRetrieve).mockResolvedValue({
      data: {
        uuid: 'rp-1',
        current_project_name: 'Remote project',
        state: 'OK',
        notes: [
          {
            author: 'Site portal',
            timestamp: '2026-10-20T09:00:00Z',
            text: NOTE_TEXT,
          },
        ],
      },
    } as any);
  });

  it('keeps the line breaks of a note', async () => {
    renderWithProviders(<RemoteProjectDetail />);
    await screen.findByRole('heading', { name: 'Remote project' });
    const note = screen.getByText(
      (_, element) => element?.textContent === NOTE_TEXT,
      { selector: 'div' },
    );
    expect(note).toHaveClass('whitespace-pre-wrap');
  });
});
