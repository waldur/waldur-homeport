import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { nestedReviewerProfileAffiliationsDestroy } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { AffiliationsBulkRemoveButton } from './AffiliationsBulkRemoveButton';

describe('AffiliationsBulkRemoveButton', () => {
  const mockRefetch = vi.fn();

  const mockRows = [
    {
      uuid: '1',
      organization_name_display: 'Org 1',
      position_title: 'Pos 1',
    } as any,
    { uuid: '2', organization_name_display: 'Org 2' } as any,
  ];
  const mockProfile = { uuid: 'profile-uuid' };
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal().confirm).mockReturnValue(new Promise(() => {}));
  });

  const renderButton = () =>
    renderWithProviders(
      <AffiliationsBulkRemoveButton
        rows={mockRows}
        refetch={mockRefetch}
        profile={mockProfile}
      />,
    );

  it('renders correctly', () => {
    renderButton();
    expect(screen.getByText('Remove')).toBeDefined();
  });

  it('shows confirmation dialog on click with correct details', () => {
    renderButton();
    fireEvent.click(screen.getByText('Remove'));
    expect(useModal().confirm).toHaveBeenCalled();
    const [title, body, options] = vi.mocked(useModal().confirm).mock.calls[0];
    expect(title).toBe('Remove selected affiliations');
    expect(options.forDeletion).toBe(true);

    // Verify the body contains the organization names
    render(<div>{body}</div>);
    expect(screen.getByText(/Org 1/)).toBeDefined();
    expect(screen.getByText(/Pos 1/)).toBeDefined();
    expect(screen.getByText(/Org 2/)).toBeDefined();
  });

  it('performs bulk removal on confirmation success', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(true);
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
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Selected affiliations have been successfully removed.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles partial success correctly', async () => {
    vi.mocked(useModal().confirm).mockResolvedValue(true);
    const error = new Error('Failed to remove second one');
    vi.mocked(nestedReviewerProfileAffiliationsDestroy)
      .mockResolvedValueOnce({} as any)
      .mockRejectedValueOnce(error);

    renderButton();
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        '1 affiliations have been removed.',
      );
    });
    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Some affiliations could not be removed.',
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('does nothing when confirmation is cancelled', async () => {
    vi.mocked(useModal().confirm).mockRejectedValue(undefined);

    renderButton();
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalled();
    });

    expect(nestedReviewerProfileAffiliationsDestroy).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
  });
});
