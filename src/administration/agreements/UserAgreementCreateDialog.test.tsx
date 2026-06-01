import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userAgreementsCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { UserAgreementCreateDialog } from './UserAgreementCreateDialog';

describe('UserAgreementCreateDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.languageChoices = [
      { code: 'en', label: 'English' },
      { code: 'et', label: 'Estonian' },
    ];
  });

  it('renders "Create a user agreements" dialog correctly', () => {
    renderWithProviders(
      <UserAgreementCreateDialog resolve={{ refetch: mockRefetch }} />,
    );
    expect(screen.getByText('Create a user agreements')).toBeInTheDocument();
    expect(screen.getByText('Agreement type')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserAgreementCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();

    // Select Agreement type
    await openAndSelectOption(user, 'Agreement type', 'Privacy policy');
    expect(saveButton).toBeDisabled();

    // Select Language
    await openAndSelectOption(user, 'Language', 'English');

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
  });

  it('handles successful user agreement creation', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .mocked(userAgreementsCreate)
      .mockResolvedValue({} as any);

    renderWithProviders(
      <UserAgreementCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await openAndSelectOption(user, 'Agreement type', 'Terms of service');
    await openAndSelectOption(user, 'Language', 'Estonian');

    const contentInput = screen.getByTestId('markdown-editor');
    await user.type(contentInput, 'Test content');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: {
          agreement_type: 'TOS',
          content: 'Test content',
          language: 'et',
        },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles successful user agreement creation with default language', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .mocked(userAgreementsCreate)
      .mockResolvedValue({} as any);

    renderWithProviders(
      <UserAgreementCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await openAndSelectOption(user, 'Agreement type', 'Privacy policy');
    await openAndSelectOption(user, 'Language', 'Default');

    const contentInput = screen.getByTestId('markdown-editor');
    await user.type(contentInput, 'Privacy content');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: {
          agreement_type: 'PP',
          content: 'Privacy content',
          language: '',
        },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles API failure during user agreement creation', async () => {
    const user = userEvent.setup();
    const error = new Error('API Error');
    vi.mocked(userAgreementsCreate).mockRejectedValue(error);

    renderWithProviders(
      <UserAgreementCreateDialog resolve={{ refetch: mockRefetch }} />,
    );

    await openAndSelectOption(user, 'Agreement type', 'Privacy policy');
    await openAndSelectOption(user, 'Language', 'English');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(userAgreementsCreate).toHaveBeenCalled();
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to create a user agreement.',
      );
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });
});
