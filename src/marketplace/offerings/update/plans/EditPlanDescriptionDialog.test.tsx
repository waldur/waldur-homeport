import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { marketplacePlansUpdate } from 'waldur-js-client';

import { EditPlanDescriptionDialog } from './EditPlanDescriptionDialog';
import { mockOffering, mockPlan } from './test-utils';

// Mock API specific to EditPlanDescriptionDialog
vi.mock('waldur-js-client', () => ({
  marketplacePlansUpdate: vi.fn(),
  formDataBodySerializer: {},
}));

// Mock config to prevent errors from ENV access
vi.mock('@waldur/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        ENABLE_PROJECT_KIND_COURSE: false,
      },
    },
  },
}));

// Mock store hooks
vi.mock('@waldur/store/hooks', () => ({
  useNotify: () => ({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));

// Mock modal hooks
vi.mock('@waldur/modal/hooks', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
}));

// Mock translation
vi.mock('@waldur/core/translate', () => ({
  translate: (str: string) => str,
}));

// Mock local constants
vi.mock('./constants', () => ({
  getBillingPeriods: () => [
    { value: 'month', label: 'Per month' },
    { value: 'half_month', label: 'Per half month' },
    { value: 'day', label: 'Per day' },
    { value: 'hour', label: 'Per hour' },
  ],
}));

// Mock marketplace utils
vi.mock('@waldur/marketplace/details/utils', () => ({
  formatPlan: (data: any) => ({
    name: data.name,
    unit: data.unit?.value || data.unit,
    description: data.description,
    article_code: data.article_code,
  }),
}));

// Mock plan validation utils
vi.mock('@waldur/marketplace/offerings/update/plans/utils', () => ({
  articleCodeValidator: () => {},
}));

const mockResolve = {
  offering: mockOffering,
  plan: mockPlan,
  refetch: vi.fn(),
};

const renderComponent = (resolve = mockResolve) => {
  return render(<EditPlanDescriptionDialog resolve={resolve} />);
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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    const articleCodeInput = document.querySelector(
      'input[name="article_code"]',
    ) as HTMLInputElement;

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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    expect(nameInput).toHaveValue('Test Plan');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Plan Name');
    expect(nameInput).toHaveValue('New Plan Name');

    // Edit article code
    const articleCodeInput = document.querySelector(
      'input[name="article_code"]',
    ) as HTMLInputElement;
    expect(articleCodeInput).toHaveValue('TEST001');
    await user.clear(articleCodeInput);
    await user.type(articleCodeInput, 'NEW001');
    expect(articleCodeInput).toHaveValue('NEW001');

    // For description, just check that the MarkdownEditor exists
    const editorContent = document.querySelector('.mdxeditor [role="textbox"]');
    expect(editorContent).toBeInTheDocument();

    // Change billing period
    const selectContainer = document.querySelector('.metronic-select__control');
    await user.click(selectContainer!);
    const hourlyOption = screen.getByText('Per hour');
    await user.click(hourlyOption);
    expect(screen.getByText('Per hour')).toBeInTheDocument();
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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    await user.clear(nameInput);

    const saveButton = screen.getByText('Save');
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('shows loading state during submission', async () => {
    const mockPlansUpdate = vi.mocked(marketplacePlansUpdate);
    // Mock a delayed response
    mockPlansUpdate.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    renderComponent();
    const user = userEvent.setup();

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
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
