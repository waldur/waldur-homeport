import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePlansUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { EditPlanDescriptionDialog } from './EditPlanDescriptionDialog';
import { mockOffering, mockPlan } from './test-utils';

ENV.plugins.WALDUR_CORE.ENABLE_PROJECT_KIND_COURSE = false;

const mockResolve = {
  offering: mockOffering,
  plan: mockPlan,
  refetch: vi.fn(),
};

const renderComponent = (resolve = mockResolve) => {
  return renderWithProviders(<EditPlanDescriptionDialog resolve={resolve} />);
};

describe('EditPlanDescriptionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with correct title and form fields', () => {
    renderComponent();

    expect(screen.getByText('Edit plan')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Billing period')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Article code')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('initializes form with existing plan data', () => {
    renderComponent();

    // Check that form is populated with existing plan data
    const nameInput = screen.getByLabelText(/Name/i);
    const articleCodeInput = screen.getByLabelText(/Article code/i);

    expect(nameInput).toHaveValue('Test Plan');
    expect(articleCodeInput).toHaveValue('TEST001');
    expect(screen.getByText('Test plan description')).toBeInTheDocument();
    expect(screen.getByText('Per month')).toBeInTheDocument(); // Selected billing period
  });

  it('successfully updates plan when form is submitted', async () => {
    const mockPlansUpdate = vi.mocked(marketplacePlansUpdate);
    mockPlansUpdate.mockResolvedValue({ data: mockPlan } as any);

    renderComponent();
    const user = userEvent.setup();

    // Modify the plan name
    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Plan Name');

    // Submit the form
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockPlansUpdate).toHaveBeenCalledWith({
        path: { uuid: 'plan-uuid' },
        body: {
          name: 'Updated Plan Name',
          unit: 'month',
          description: 'Test plan description',
          article_code: 'TEST001',
        },
      });
    });
  });

  it('calls refetch after successful plan update', async () => {
    const mockRefetch = vi.fn();
    const resolve = { ...mockResolve, refetch: mockRefetch };

    const mockPlansUpdate = vi.mocked(marketplacePlansUpdate);
    mockPlansUpdate.mockResolvedValue({ data: mockPlan } as any);

    renderComponent(resolve);
    const user = userEvent.setup();

    // Submit form with existing data
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('allows editing all form fields', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Edit name
    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveValue('Test Plan');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Plan Name');
    expect(nameInput).toHaveValue('New Plan Name');

    // Edit article code
    const articleCodeInput = screen.getByLabelText(/Article code/i);
    expect(articleCodeInput).toHaveValue('TEST001');
    await user.clear(articleCodeInput);
    await user.type(articleCodeInput, 'NEW001');
    expect(articleCodeInput).toHaveValue('NEW001');

    await openAndSelectOption(user, 'Billing period', 'Per hour');
  });

  it('handles different billing period formats', () => {
    const customPlan = {
      ...mockPlan,
      unit: 'hour', // String instead of object
    };

    const customResolve = {
      ...mockResolve,
      plan: customPlan,
    };

    renderComponent(customResolve);

    // Should still work with string unit values
    expect(screen.getByText('Per hour')).toBeInTheDocument();
  });

  it('disables submit button when form is invalid', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Clear required field
    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);

    const saveButton = screen.getByText('Save');
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('shows loading state during submission', async () => {
    const mockPlansUpdate = vi.mocked(marketplacePlansUpdate);
    // Mock a delayed response with controllable promise
    let resolvePromise: () => void;
    const delayedPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockPlansUpdate.mockImplementation(() => delayedPromise as any);

    renderComponent();

    const saveButton = screen.getByText('Save');
    // Use fireEvent for synchronous click to catch the submitting state
    fireEvent.click(saveButton);

    // Button should be disabled during submission
    await waitFor(
      () => {
        expect(saveButton).toBeDisabled();
      },
      { timeout: 2000 },
    );

    // Resolve the promise to clean up
    resolvePromise!();
  });

  it('handles API errors gracefully', async () => {
    const mockPlansUpdate = vi.mocked(marketplacePlansUpdate);
    const mockError = new Error('API Error');
    mockPlansUpdate.mockRejectedValue(mockError);

    renderComponent();
    const user = userEvent.setup();

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockPlansUpdate).toHaveBeenCalled();
    });

    // Error should be handled by showErrorResponse
    // Component should not crash
    expect(screen.getByText('Edit plan')).toBeInTheDocument();
  });
});
