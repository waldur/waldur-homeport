import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openportalAccessForEmailList } from 'waldur-js-client';

import { queryClient } from '@/core/queryClient';
import { goToErrorPage } from '@/error/utils';
import { renderWithProviders } from '@/test/harness';

import { AccessForEmail, fetchAccess } from './AccessForEmail';

vi.mock('@/error/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/error/utils')>()),
  goToErrorPage: vi.fn(() => true),
}));

// An email search answers one object, not a list.
const SINGLE: any = {
  email: 'alice@example.com',
  status: 'active',
  short_name: 'alice',
  projects: {
    'project-a.example': {
      name: 'Project A',
      resources: [{ name: 'batch.cluster1.example', username: 'alice.a' }],
    },
  },
  invited_by: '',
  reason: '',
};

// "Nothing matched" is a 404 with a reason, shaped as the API client throws it.
const notFound = {
  error: "No results found for query: 'nobody'.",
  status: 404,
  response: { status: 404 },
};

describe('fetchAccess', () => {
  beforeEach(() => vi.clearAllMocks());

  it('wraps a single match in a list', async () => {
    vi.mocked(openportalAccessForEmailList).mockResolvedValue({
      data: SINGLE,
    } as any);

    expect(await fetchAccess('alice@example.com')).toEqual([SINGLE]);
  });

  it('passes a list through', async () => {
    vi.mocked(openportalAccessForEmailList).mockResolvedValue({
      data: [SINGLE, SINGLE],
    } as any);

    expect(await fetchAccess('Project A')).toHaveLength(2);
  });

  it('treats a 404 as no results', async () => {
    vi.mocked(openportalAccessForEmailList).mockRejectedValue(notFound);

    expect(await fetchAccess('nobody')).toEqual([]);
  });

  it('lets any other error through', async () => {
    const refused = { error: 'Only your own email.', status: 403 };
    vi.mocked(openportalAccessForEmailList).mockRejectedValue(refused);

    await expect(fetchAccess('bob@example.com')).rejects.toBe(refused);
  });
});

// Rendered with the app's own queryClient: its global error handler is what
// sent a 404 to the Not Found page, and a fresh test client has none.
describe('AccessForEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const search = async (text: string) => {
    renderWithProviders(<AccessForEmail />, { queryClient });
    await userEvent.type(
      screen.getByPlaceholderText(/Enter email, short name/),
      text,
    );
  };

  it('shows a single match', async () => {
    vi.mocked(openportalAccessForEmailList).mockResolvedValue({
      data: SINGLE,
    } as any);

    await search('alice@example.com');

    expect(await screen.findByText('Project A')).toBeInTheDocument();
  });

  it('shows every user of a list', async () => {
    vi.mocked(openportalAccessForEmailList).mockResolvedValue({
      data: [SINGLE, { ...SINGLE, email: 'carol@example.com' }],
    } as any);

    await search('Project A');

    expect(await screen.findByText('carol@example.com')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('shows "No results found" for a 404, without leaving the page', async () => {
    vi.mocked(openportalAccessForEmailList).mockRejectedValue(notFound);

    await search('nobody');

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    expect(goToErrorPage).not.toHaveBeenCalled();
  });

  it("shows the endpoint's reason for a refusal", async () => {
    vi.mocked(openportalAccessForEmailList).mockRejectedValue({
      error: 'You can only search by your own email address.',
      status: 403,
      response: { status: 403 },
    });

    await search('bob@example.com');

    await waitFor(() =>
      expect(
        screen.getByText('You can only search by your own email address.'),
      ).toBeInTheDocument(),
    );
    expect(goToErrorPage).not.toHaveBeenCalled();
  });

  // Only "no results" is the page's own business: an incomplete profile
  // (428) still goes to its page, as everywhere else in the app.
  it('leaves an incomplete profile to the global handler', async () => {
    vi.mocked(openportalAccessForEmailList).mockRejectedValue({
      detail: 'Complete your profile.',
      status: 428,
      response: { status: 428 },
    });

    await search('alice@example.com');

    await waitFor(() => expect(goToErrorPage).toHaveBeenCalled());
  });
});
