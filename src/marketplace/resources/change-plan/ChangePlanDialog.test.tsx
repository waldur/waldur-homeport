import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesSwitchPlan } from 'waldur-js-client';

import { useModal } from '@waldur/modal/hooks';
import { usePermission } from '@waldur/permissions/hooks';
import { useNotify } from '@waldur/store/hooks';

import { ChangePlanDialog } from './ChangePlanDialog';
import { loadData } from './utils';

vi.mock('./utils');
vi.mock('waldur-js-client');
vi.mock('@waldur/store/hooks');
vi.mock('@waldur/modal/hooks');
vi.mock('@waldur/permissions/hooks');

const mockData = {
  resource: {
    uuid: 'test-uuid',
    plan_name: 'Basic Plan',
  },
  columns: [
    { name: 'name', label: 'Name' },
    { name: 'price', label: 'Price' },
  ],

  choices: [
    {
      url: 'plan1-url',
      uuid: 'plan1',
      name: 'Plan 1',
      price: '$10',
      disabled: false,
    },
    {
      url: 'plan2-url',
      uuid: 'plan2',
      name: 'Plan 2',
      price: '$20',
      disabled: false,
      archived: false,
    },
  ],

  initialValues: {
    plan: {
      url: 'plan1-url',
      uuid: 'plan1',
      name: 'Plan 1',
      price: '$10',
    },
  },
};

const renderDialog = () =>
  render(
    <ChangePlanDialog
      resolve={{
        resource: {
          marketplace_resource_uuid: 'test-uuid',
        },
        refetch: vi.fn(),
      }}
    />,
  );

describe('ChangePlanDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: vi.fn(),
    } as any);
    vi.mocked(usePermission).mockReturnValue(() => true);
  });

  it('should show loading spinner initially', () => {
    vi.mocked(loadData).mockImplementation(() => new Promise(() => {}));
    renderDialog();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should show error message when data loading fails', async () => {
    vi.mocked(loadData).mockRejectedValue(new Error('Failed to load'));
    renderDialog();
    await waitFor(() => {
      expect(screen.getByText('Unable to load data.')).toBeInTheDocument();
    });
  });

  it('should render plans when data loads successfully', async () => {
    vi.mocked(loadData).mockResolvedValue(mockData as any);
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Current plan')).toBeInTheDocument();
      expect(screen.getByText('Plan 2')).toBeInTheDocument();
    });
  });

  it('should handle plan switching', async () => {
    vi.mocked(loadData).mockResolvedValue(mockData as any);
    const { showSuccess } = useNotify();
    const { closeDialog } = useModal();

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    const plan2Row = await screen.findByText('Plan 2');
    await userEvent.click(plan2Row);

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    expect(marketplaceResourcesSwitchPlan).toHaveBeenCalledWith({
      path: { uuid: 'test-uuid' },
      body: { plan: 'plan2-url' },
    });
    expect(showSuccess).toHaveBeenCalled();
    expect(closeDialog).toHaveBeenCalled();
  });

  it('should show error when plan switching fails', async () => {
    vi.mocked(loadData).mockResolvedValue(mockData as any);
    vi.mocked(marketplaceResourcesSwitchPlan).mockRejectedValue(
      new Error('Switch failed'),
    );
    const { showErrorResponse } = useNotify();

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    const plan2Row = await screen.findByText('Plan 2');
    await userEvent.click(plan2Row);

    const submitButton = screen.getByText('Submit');
    await userEvent.click(submitButton);

    expect(showErrorResponse).toHaveBeenCalled();
  });
});
