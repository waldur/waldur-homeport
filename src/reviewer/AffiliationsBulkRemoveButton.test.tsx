import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { nestedReviewerProfileAffiliationsDestroy } from 'waldur-js-client';

import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/notify';

import { AffiliationsBulkRemoveButton } from './AffiliationsBulkRemoveButton';

vi.mock('waldur-js-client');
vi.mock('@/store/notify');
vi.mock('@/modal/hooks');
vi.mock('@/i18n', () => ({
  translate: (key, context) => {
    if (context) {
      return Object.entries(context).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
        key,
      );
    }
    return key;
  },
}));

describe('AffiliationsBulkRemoveButton', () => {
  const mockRefetch = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockConfirm = vi.fn();
  const mockCloseDialog = vi.fn();

  const mockRows = [
    {
      uuid: '1',
      organization_name_display: 'Org 1',
      position_title: 'Pos 1',
    } as any,
    { uuid: '2', organization_name_display: 'Org 2' } as any,
  ];
  const mockProfile = { uuid: 'profile-uuid' };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(new Promise(() => {}));
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      confirm: mockConfirm,
      closeDialog: mockCloseDialog,
    } as any);
  });

  const renderButton = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AffiliationsBulkRemoveButton
          rows={mockRows}
          refetch={mockRefetch}
          profile={mockProfile}
        />
      </QueryClientProvider>,
    );

  it('renders correctly', () => {
    renderButton();
    expect(screen.getByText('Remove')).toBeDefined();
  });

  it('shows confirmation dialog on click with correct details', () => {
    renderButton();
    fireEvent.click(screen.getByText('Remove'));
    expect(mockConfirm).toHaveBeenCalled();
    const [title, body, options] = mockConfirm.mock.calls[0];
    expect(title).toBe('Remove selected affiliations');
    expect(options.forDeletion).toBe(true);

    // Verify the body contains the organization names
    render(<div>{body}</div>);
    expect(screen.getByText(/Org 1/)).toBeDefined();
    expect(screen.getByText(/Pos 1/)).toBeDefined();
    expect(screen.getByText(/Org 2/)).toBeDefined();
  });

  it('performs bulk removal on confirmation success', async () => {
    mockConfirm.mockResolvedValue(true);
    vi.mocked(nestedReviewerProfileAffiliationsDestroy).mockResolvedValue(
      {} as any,
    );

    renderButton();
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(nestedReviewerProfileAffiliationsDestroy).toHaveBeenCalledTimes(2);
    });

    expect(nestedReviewerProfileAffiliationsDestroy).toHaveBeenCalledWith({
      path: { reviewer_profile_uuid: 'profile-uuid', uuid: '1' },
    });
    expect(nestedReviewerProfileAffiliationsDestroy).toHaveBeenCalledWith({
      path: { reviewer_profile_uuid: 'profile-uuid', uuid: '2' },
    });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Selected affiliations have been successfully removed.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles partial success correctly', async () => {
    mockConfirm.mockResolvedValue(true);
    const error = new Error('Failed to remove second one');
    vi.mocked(nestedReviewerProfileAffiliationsDestroy)
      .mockResolvedValueOnce({} as any)
      .mockRejectedValueOnce(error);

    renderButton();
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith(
        '1 affiliations have been removed.',
      );
    });
    await waitFor(() => {
      expect(mockShowErrorResponse).toHaveBeenCalledWith(
        error,
        'Some affiliations could not be removed.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('does nothing when confirmation is cancelled', async () => {
    mockConfirm.mockRejectedValue(undefined);

    renderButton();
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
    });

    expect(nestedReviewerProfileAffiliationsDestroy).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
  });
});
