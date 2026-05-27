import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingTermsOfServiceCreate } from 'waldur-js-client';

import { AddTosDialog } from './AddTosDialog';

vi.mock('waldur-js-client');

// Mock MarkdownEditor to avoid heavy MDXEditor dependency in tests
vi.mock('@/form/MarkdownEditor', () => ({
  default: ({ input }: any) => (
    <textarea
      data-testid="markdown-editor"
      value={input?.value || ''}
      onChange={(e) => input?.onChange(e.target.value)}
    />
  ),
}));

const fakeOffering = { url: 'offering-url', uuid: 'offering-uuid' };

const renderDialog = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state);
  const refetch = vi.fn();
  const result = render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AddTosDialog resolve={{ offering: fakeOffering, refetch }} />
      </QueryClientProvider>
    </Provider>,
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
    const { container } = renderDialog();
    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit when version is filled', async () => {
    const user = userEvent.setup();
    const { container } = renderDialog();

    await user.type(container.querySelector('input[name="version"]'), '1.0');

    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitBtn).not.toBeDisabled();
  });

  it('submits markdown content correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingTermsOfServiceCreate).mockResolvedValue(
      {} as any,
    );
    const { container } = renderDialog();

    await user.type(container.querySelector('input[name="version"]'), '1.0');
    await user.type(screen.getByTestId('markdown-editor'), '# Terms');

    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
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
    const { container } = renderDialog();

    // Fill version
    await user.type(container.querySelector('input[name="version"]'), '2.0');

    // Switch to external link
    const addAsSelect = container.querySelector(
      '.metronic-select-container input',
    );
    await user.click(addAsSelect);
    const externalLinkOption = await screen.findByText('External link');
    await user.click(externalLinkOption);

    // Markdown editor should be gone, external link field should appear
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();

    // Fill external link
    await user.type(
      container.querySelector('input[name="terms_of_service_link"]'),
      'https://example.com/tos',
    );

    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
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
    const { container } = renderDialog();

    // Grace period should not be visible initially
    expect(screen.queryByText('Grace period (days)')).not.toBeInTheDocument();

    // Check requires_reconsent
    await user.click(
      screen.getByRole('checkbox', { name: /Requires re-consent/i }),
    );

    // Grace period should now be visible with default value 60
    expect(screen.getByText('Grace period (days)')).toBeInTheDocument();
    expect(
      container.querySelector('input[name="grace_period_days"]'),
    ).toHaveValue(60);
  });

  it('submits with checkboxes and grace period', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingTermsOfServiceCreate).mockResolvedValue(
      {} as any,
    );
    const { container } = renderDialog();

    await user.type(container.querySelector('input[name="version"]'), '3.0');

    // Toggle checkboxes
    await user.click(screen.getByRole('checkbox', { name: /Is active/i }));
    await user.click(
      screen.getByRole('checkbox', { name: /Requires re-consent/i }),
    );

    // Change grace period
    const gracePeriodInput = container.querySelector(
      'input[name="grace_period_days"]',
    ) as HTMLInputElement;
    await user.clear(gracePeriodInput);
    await user.type(gracePeriodInput, '30');

    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
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
