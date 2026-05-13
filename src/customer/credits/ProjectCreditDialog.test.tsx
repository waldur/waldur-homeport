import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customerCreditsList,
  projectCreditsCreate,
  projectCreditsUpdate,
} from 'waldur-js-client';

import { ProjectCreditDialog } from './ProjectCreditDialog';

vi.mock('waldur-js-client');
vi.mock('@/i18n', () => ({
  translate: (key, context) => {
    if (!context) return key;
    let result = key;
    Object.keys(context).forEach((k) => {
      result = result.replace(`{${k}}`, context[k]);
    });
    return result;
  },
  formatJsxTemplate: (text) => text,
}));
vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        CURRENCY_NAME: 'EUR',
      },
    },
  },
}));
vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

vi.mock('./ProjectCostChart', () => ({
  ProjectCostChart: () => <div data-testid="project-cost-chart" />,
}));

vi.mock('@/workspace/selectors', () => ({
  getCustomer: () => ({ uuid: 'customer-uuid', url: 'customer-url' }),
}));

vi.mock('@/modal/hooks', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
    confirm: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/form/AsyncSelectField', () => ({
  Select: (props) => (
    <input
      id={props.id}
      data-testid={props.id || 'async-select'}
      onChange={(e) => {
        if (props.input) {
          props.input.onChange({ url: e.target.value, name: 'Org 1' });
        }
      }}
      onBlur={() => props.input?.onBlur()}
      value={props.input?.value?.url || ''}
    />
  ),
}));

vi.mock('@/form/SelectField', () => ({
  SelectField: (props) => (
    <input
      data-testid={props.input?.name || props.name || 'select-field'}
      onChange={(e) => {
        const value = e.target.value;
        if (props.input?.name === 'project') {
          props.input.onChange({ url: value, name: 'Project 1' });
        } else {
          props.input?.onChange(value);
        }
      }}
      onBlur={() => props.input?.onBlur()}
      value={
        typeof props.input?.value === 'object'
          ? props.input.value.url
          : props.input?.value || ''
      }
    />
  ),
}));

const mockStore = configureStore();

const renderComponent = (resolve) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const store = mockStore({
    workspace: { customer: { uuid: 'customer-uuid', url: 'customer-url' } },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ProjectCreditDialog resolve={resolve} />
      </QueryClientProvider>
    </Provider>,
  );
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
    const projectInput = screen.getByTestId('project');
    await user.type(projectInput, 'project-url');
    await user.tab();

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
