import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { marketplacePlansCreate } from 'waldur-js-client';

import { AddPlanDialog } from './AddPlanDialog';
import { mockOffering, mockPlan } from './test-utils';

// Mock API specific to AddPlanDialog
vi.mock('waldur-js-client', () => ({
  marketplacePlansCreate: vi.fn(),
  formDataBodySerializer: {},
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

// Mock utils
vi.mock('@waldur/marketplace/details/utils', () => ({
  formatPlan: (data: any) => ({
    name: data.name,
    unit: data.unit?.value || data.unit,
    description: data.description,
    article_code: data.article_code,
  }),
}));

vi.mock('@waldur/marketplace/offerings/update/plans/utils', () => ({
  articleCodeValidator: () => {},
}));

const mockResolve = {
  offering: mockOffering,
  refetch: vi.fn(),
};

const mockResolveWithPlan = {
  ...mockResolve,
  plan: mockPlan,
};

const renderComponent = (resolve = mockResolve) => {
  return render(<AddPlanDialog resolve={resolve} />);
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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    expect(nameInput).toHaveValue('Clone of Test Plan');
  });

  it('initializes form with cloned plan data', () => {
    renderComponent(mockResolveWithPlan);

    // Check initial values from cloned plan
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    const articleCodeInput = document.querySelector(
      'input[name="article_code"]',
    ) as HTMLInputElement;

    expect(nameInput).toHaveValue('Clone of Test Plan');
    expect(articleCodeInput).toHaveValue('TEST001');

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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    await user.type(nameInput, 'New Plan');

    // Select billing period (required field)
    const selectContainer = document.querySelector('.metronic-select__control');
    if (selectContainer) {
      await user.click(selectContainer);
      const monthlyOption = await screen.findByText('Per month');
      await user.click(monthlyOption);
    }

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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    await user.type(nameInput, 'New Plan');

    // Select billing period (required field)
    const selectContainer = document.querySelector('.metronic-select__control');
    if (selectContainer) {
      await user.click(selectContainer);
      const monthlyOption = await screen.findByText('Per month');
      await user.click(monthlyOption);
    }

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
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    await user.type(nameInput, 'Test Plan');

    // Select billing period
    const selectContainer = document.querySelector('.metronic-select__control');
    if (selectContainer) {
      await user.click(selectContainer);
      const monthlyOption = await screen.findByText('Per month');
      await user.click(monthlyOption);
    }

    const createButton = screen.getByText('Create');
    expect(createButton).not.toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    const mockPlansCreate = vi.mocked(marketplacePlansCreate);
    // Mock a delayed response
    mockPlansCreate.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    renderComponent();
    const user = userEvent.setup();

    // Fill and submit form
    const nameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    await user.type(nameInput, 'Test Plan');

    // Select billing period (required field)
    const selectContainer = document.querySelector('.metronic-select__control');
    if (selectContainer) {
      await user.click(selectContainer);
      const monthlyOption = await screen.findByText('Per month');
      await user.click(monthlyOption);
    }

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
  });
});
