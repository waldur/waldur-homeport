import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { marketplacePlansCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { AddPlanDialog } from './AddPlanDialog';
import { mockOffering, mockPlan } from './test-utils';

const mockResolve = {
  offering: mockOffering,
  refetch: vi.fn(),
};

const mockResolveWithPlan = {
  ...mockResolve,
  plan: mockPlan,
};

const renderComponent = (resolve = mockResolve) => {
  return renderWithProviders(<AddPlanDialog resolve={resolve} />);
};

describe('AddPlanDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with correct title and form fields', () => {
    renderComponent();

    expect(screen.getByText('Add plan')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Billing period')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Article code')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('shows clone prefix when cloning existing plan', () => {
    renderComponent(mockResolveWithPlan);

    // Check that the name field contains "Clone of" prefix
    expect(screen.getByLabelText(/Name/)).toHaveValue('Clone of Test Plan');
  });

  it('initializes form with cloned plan data', () => {
    renderComponent(mockResolveWithPlan);

    // Check initial values from cloned plan
    expect(screen.getByLabelText(/Name/)).toHaveValue('Clone of Test Plan');
    expect(screen.getByLabelText(/Article code/)).toHaveValue('TEST001');

    // For MarkdownEditor, just check that description text appears somewhere
    expect(screen.getByText('Test plan description')).toBeInTheDocument();
  });

  it('successfully creates plan when form is submitted', async () => {
    const mockPlansCreate = vi.mocked(marketplacePlansCreate);
    mockPlansCreate.mockResolvedValue({
      data: { uuid: 'new-plan-uuid' },
    } as any);

    renderComponent();
    const user = userEvent.setup();

    // Fill out the form
    await user.type(screen.getByLabelText(/Name/), 'New Plan');

    // Select billing period (required field)
    await openAndSelectOption(user, /Billing period/, 'Per month');

    // Submit the form
    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockPlansCreate).toHaveBeenCalledWith({
        body: {
          offering: mockOffering.url,
          name: 'New Plan',
          unit: 'month',
          description: undefined,
          article_code: undefined,
        },
      });
    });
  });

  it('calls refetch after successful plan creation', async () => {
    const mockRefetch = vi.fn();
    const resolve = { ...mockResolve, refetch: mockRefetch };

    const mockPlansCreate = vi.mocked(marketplacePlansCreate);
    mockPlansCreate.mockResolvedValue({
      data: { uuid: 'new-plan-uuid' },
    } as any);

    renderComponent(resolve);
    const user = userEvent.setup();

    // Fill and submit form
    await user.type(screen.getByLabelText(/Name/), 'New Plan');

    // Select billing period (required field)
    await openAndSelectOption(user, /Billing period/, 'Per month');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('disables submit button when form is invalid', () => {
    renderComponent();

    const createButton = screen.getByText('Create');
    // Button should be disabled when required fields are empty
    expect(createButton).toBeDisabled();
  });

  it('enables submit button when required fields are filled', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Fill required fields
    await user.type(screen.getByLabelText(/Name/), 'Test Plan');

    // Select billing period
    await openAndSelectOption(user, /Billing period/, 'Per month');

    const createButton = screen.getByText('Create');
    expect(createButton).not.toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    const mockPlansCreate = vi.mocked(marketplacePlansCreate);
    // Mock a delayed response
    let resolvePromise: () => void;
    const delayedPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockPlansCreate.mockImplementation(() => delayedPromise as any);

    renderComponent();
    const user = userEvent.setup();

    // Fill and submit form
    await user.type(screen.getByLabelText(/Name/), 'Test Plan');

    // Select billing period (required field)
    await openAndSelectOption(user, /Billing period/, 'Per month');

    const createButton = screen.getByText('Create');
    const clickPromise = user.click(createButton);

    // Button should be disabled during submission
    await waitFor(
      () => {
        expect(createButton).toBeDisabled();
      },
      { timeout: 2000 },
    );

    // Resolve the promise to clean up
    resolvePromise!();
    await clickPromise;
  });
});
