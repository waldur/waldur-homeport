import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingUsersCreate, usersList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { CreateOfferingUserDialog } from './CreateOfferingUserDialog';

const renderDialog = (props: any) => {
  renderWithProviders(<CreateOfferingUserDialog {...props} />);
};

describe('CreateOfferingUserDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const offering = {
    url: '/api/marketplace-offerings/offering-1/',
  };

  it('renders correctly and submits valid data', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    vi.mocked(usersList).mockResolvedValue(
      mockListResponse([
        {
          url: '/api/users/user-1/',
          full_name: 'Test User',
          email: 'test@example.com',
          username: 'test_user',
          uuid: 'user-1',
        },
      ]),
    );

    vi.mocked(marketplaceOfferingUsersCreate).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        offering,
        onSuccess,
      },
    });

    expect(await screen.findByText('Create offering user')).toBeInTheDocument();

    // Fill user
    await user.click(screen.getByLabelText('User'));
    await user.click(await screen.findByText('Test User'));

    // Fill username
    await user.type(screen.getByLabelText(/Username/i), 'new_username');

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(marketplaceOfferingUsersCreate).toHaveBeenCalledWith({
        body: {
          offering: '/api/marketplace-offerings/offering-1/',
          user: '/api/users/user-1/',
          username: 'new_username',
        },
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
