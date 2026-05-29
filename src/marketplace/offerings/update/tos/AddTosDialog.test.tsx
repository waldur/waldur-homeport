import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingTermsOfServiceCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { AddTosDialog } from './AddTosDialog';

const fakeOffering = { url: 'offering-url', uuid: 'offering-uuid' };

const renderDialog = () => {
  const refetch = vi.fn();
  const result = renderWithProviders(
    <AddTosDialog resolve={{ offering: fakeOffering, refetch }} />,
  );
  return { ...result, refetch };
};

describe('AddTosDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct initial values', () => {
    renderDialog();
    expect(screen.getByText('Add Terms of Service')).toBeInTheDocument();
    // Markdown is selected by default, so the editor should be visible
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('disables submit when version is empty', () => {
    renderDialog();
    const submitBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit when version is filled', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/Version/i), '1.0');

    const submitBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(submitBtn).not.toBeDisabled();
  });

  it('submits markdown content correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingTermsOfServiceCreate).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    await user.type(screen.getByLabelText(/Version/i), '1.0');
    await user.type(screen.getByTestId('markdown-editor'), '# Terms');

    const submitBtn = screen.getByRole('button', { name: 'Confirm' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(marketplaceOfferingTermsOfServiceCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            offering: 'offering-url',
            version: '1.0',
            terms_of_service: '# Terms',
            is_active: false,
            requires_reconsent: false,
          }),
        }),
      );
    });
  });

  it('switches to external link mode and submits', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingTermsOfServiceCreate).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    // Fill version
    await user.type(screen.getByLabelText(/Version/i), '2.0');

    // Switch to external link
    await openAndSelectOption(user, 'Add as', 'External link');

    // Markdown editor should be gone, external link field should appear
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();

    // Fill external link
    await user.type(
      screen.getByLabelText(/External link/i),
      'https://example.com/tos',
    );

    const submitBtn = screen.getByRole('button', { name: 'Confirm' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(marketplaceOfferingTermsOfServiceCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            offering: 'offering-url',
            version: '2.0',
            terms_of_service_link: 'https://example.com/tos',
            is_active: false,
            requires_reconsent: false,
          }),
        }),
      );
    });
  });

  it('shows grace period field when requires_reconsent is checked', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Grace period should not be visible initially
    expect(screen.queryByText('Grace period (days)')).not.toBeInTheDocument();

    // Check requires_reconsent
    await user.click(
      screen.getByRole('checkbox', { name: /Requires re-consent/i }),
    );

    // Grace period should now be visible with default value 60
    expect(screen.getByText('Grace period (days)')).toBeInTheDocument();
    expect(screen.getByLabelText(/Grace period/i)).toHaveValue(60);
  });

  it('submits with checkboxes and grace period', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingTermsOfServiceCreate).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    await user.type(screen.getByLabelText(/Version/i), '3.0');

    // Toggle checkboxes
    await user.click(screen.getByRole('checkbox', { name: /Is active/i }));
    await user.click(
      screen.getByRole('checkbox', { name: /Requires re-consent/i }),
    );

    // Change grace period
    const gracePeriodInput = screen.getByLabelText(/Grace period/i);
    await user.clear(gracePeriodInput);
    await user.type(gracePeriodInput, '30');

    const submitBtn = screen.getByRole('button', { name: 'Confirm' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(marketplaceOfferingTermsOfServiceCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            offering: 'offering-url',
            version: '3.0',
            is_active: true,
            requires_reconsent: true,
            grace_period_days: 30,
          }),
        }),
      );
    });
  });
});
