import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customerCreditsList,
  projectCreditsCreate,
  projectCreditsUpdate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import * as workspaceHooks from '@/workspace/hooks';

import { ProjectCreditDialog } from './ProjectCreditDialog';

ENV.plugins.WALDUR_CORE.CURRENCY_NAME = 'EUR';

vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

vi.mock('./ProjectCostChart', () => ({
  ProjectCostChart: () => <div data-testid="project-cost-chart" />,
}));

vi.mock('@/workspace/selectors', () => ({
  getCustomer: () => ({ uuid: 'customer-uuid', url: 'customer-url' }),
}));

const renderComponent = (resolve) => {
  vi.mocked(workspaceHooks.useCustomer).mockReturnValue({
    uuid: 'customer-uuid',
    url: 'customer-url',
    projects: [{ name: 'Project 1', url: 'project-url' }],
  } as any);
  return renderWithProviders(<ProjectCreditDialog resolve={resolve} />);
};

describe('ProjectCreditDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders creation form correctly and handles organization credit loading', async () => {
    vi.mocked(customerCreditsList).mockResolvedValue({
      data: [{ value: 1000 }],
    } as any);

    renderComponent({ refetch: mockRefetch });

    expect(screen.getByText('Add project credit')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('Credits available for this organization: EUR 1000'),
      ).toBeInTheDocument();
    });
  });

  it('submits creation form correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(customerCreditsList).mockResolvedValue({
      data: [{ value: 1000 }],
    } as any);
    vi.mocked(projectCreditsCreate).mockResolvedValue({} as any);

    renderComponent({ refetch: mockRefetch });

    const valueInput = await screen.findByTestId('value');

    // Fill Project
    await openAndSelectOption(user, 'Project', 'Project 1');

    // Fill Value
    await user.clear(valueInput);
    await user.type(valueInput, '200');
    await user.tab();

    const confirmButton = screen.getByTestId('submit-button');
    await waitFor(() => expect(confirmButton).not.toBeDisabled());
    await user.click(confirmButton);

    await waitFor(() => {
      expect(projectCreditsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            project: 'project-url',
            value: '200',
            minimal_consumption_logic: 'fixed',
          }),
        }),
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders edit form correctly', async () => {
    const credit = {
      uuid: 'credit-uuid',
      project_uuid: 'project-uuid',
      project_name: 'Project 1',
      project: { url: 'project-url', name: 'Project 1' },
      value: 300,
      minimal_consumption_logic: 'fixed',
    };

    vi.mocked(customerCreditsList).mockResolvedValue({
      data: [{ value: 1000 }],
    } as any);

    renderComponent({ credit, refetch: mockRefetch });

    expect(screen.getByText('Edit project credit')).toBeInTheDocument();
    expect(screen.getByTestId('project-cost-chart')).toBeInTheDocument();

    const valueInput = await screen.findByTestId('value');
    expect(valueInput).toHaveValue(300);

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('submits edit form correctly', async () => {
    const user = userEvent.setup();
    const credit = {
      uuid: 'credit-uuid',
      project_uuid: 'project-uuid',
      project_name: 'Project 1',
      project: { url: 'project-url', name: 'Project 1' },
      value: 300,
      minimal_consumption_logic: 'fixed',
    };

    vi.mocked(customerCreditsList).mockResolvedValue({
      data: [{ value: 1000 }],
    } as any);
    vi.mocked(projectCreditsUpdate).mockResolvedValue({} as any);

    renderComponent({ credit, refetch: mockRefetch });

    const valueInput = await screen.findByTestId('value');
    await user.clear(valueInput);
    await user.type(valueInput, '400');
    await user.tab();

    const editButton = screen.getByTestId('submit-button');
    await waitFor(() => expect(editButton).not.toBeDisabled());
    await user.click(editButton);

    await waitFor(() => {
      expect(projectCreditsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'credit-uuid' },
          body: {
            apply_as_minimal_consumption: undefined,
            end_date: undefined,
            expected_consumption: undefined,
            grace_coefficient: undefined,
            minimal_consumption_logic: 'fixed',
            project: 'project-url',
            value: '400',
          },
        }),
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });
});
