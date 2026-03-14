import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FORM_ERROR } from 'final-form';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { client } from 'waldur-js-client/client.gen';

import { waitForSpinner } from '@waldur/core/test-utils';

import { PolicyCreateDialog } from './PolicyCreateDialog';

const mockStore = configureMockStore();

const fillAndSubmitCostForm = async () => {
  const costInput = screen.getByPlaceholderText(
    'Enter the cost threshold (e.g. 1000 EUR)',
  );
  await userEvent.clear(costInput);
  await userEvent.type(costInput, '1000');

  await userEvent.click(
    screen.getByText('Select action to take when the condition is met...'),
  );
  await userEvent.keyboard('{ArrowDown}{Enter}');

  await userEvent.click(screen.getByText('Select period'));
  await userEvent.keyboard('{ArrowDown}{Enter}');

  await userEvent.click(screen.getByText('Select organization groups'));
  await userEvent.keyboard('{ArrowDown}{Enter}');

  await userEvent.click(screen.getByRole('button', { name: 'Create' }));
};

vi.mock('@waldur/core/config', () => ({
  ENV: {
    apiEndpoint: 'http://example.com',
    plugins: {
      WALDUR_CORE: {
        CURRENCY_NAME: 'USD',
      },
    },
  },
}));

vi.mock('@waldur/i18n', () => ({
  translate: vi.fn((str) => str),
}));

const mockOffering = {
  uuid: 'test-offering-uuid',
  url: 'test-offering-url',
  components: [
    {
      type: 'cpu',
      name: 'CPU',
      measured_unit: 'cores',
    },
    {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
    },
  ],
};

const renderComponent = (
  submitFn,
  type: 'cost' | 'usage' = 'cost',
  initialValues = {},
  offering = mockOffering,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  client.setConfig({
    baseUrl: 'http://example.com',
    throwOnError: true,
  });

  const store = mockStore({
    workspace: {
      user: {
        is_staff: true,
      },
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PolicyCreateDialog
          submitFn={submitFn}
          type={type}
          offering={offering}
          initialValues={initialValues}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('PolicyCreateDialog', () => {
  let submitFn: any;

  beforeEach(() => {
    submitFn = vi.fn();
    const orgGroups = [
      {
        name: 'Group 1',
        url: 'group-1-url',
        uuid: 'group-1-uuid',
      },
      {
        name: 'Group 2',
        url: 'group-2-url',
        uuid: 'group-2-uuid',
      },
    ];
    nock('http://example.com')
      .get('/api/organization-groups/')
      .query(true)
      .times(2)
      .reply(200, orgGroups, {
        'X-Result-Count': orgGroups.length.toString(),
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
    nock.cleanAll();
  });

  describe('Common behavior', () => {
    it('should render loading spinner and then the form', async () => {
      renderComponent(submitFn, 'cost');
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      await waitForSpinner();
      expect(
        screen.getByText('When estimated cost reaches'),
      ).toBeInTheDocument();
    });

    it('should handle API error when loading organization groups', async () => {
      nock.cleanAll();
      nock('http://example.com')
        .get('/api/organization-groups/')
        .query(true)
        .reply(400, { detail: 'Error' });
      renderComponent(submitFn, 'cost');
      await waitFor(() => {
        expect(
          screen.getByText('Unable to load organization groups.'),
        ).toBeInTheDocument();
      });
    });

    it('should display server error on submission failure', async () => {
      submitFn.mockReturnValue({
        [FORM_ERROR]: 'Unable to create policy.',
      });
      renderComponent(submitFn, 'cost');
      await waitForSpinner();
      await fillAndSubmitCostForm();
      await waitFor(() => {
        expect(
          screen.getByText('Unable to create policy.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Cost Policy Form', () => {
    it('should render cost policy form correctly', async () => {
      renderComponent(submitFn, 'cost');
      await waitForSpinner();
      expect(
        screen.getByText('When estimated cost reaches'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter the cost threshold (e.g. 1000 EUR)'),
      ).toBeInTheDocument();
      expect(screen.getByText('Then')).toBeInTheDocument();
      expect(screen.getByText('Period')).toBeInTheDocument();
      expect(screen.getByText('Organization groups')).toBeInTheDocument();
    });

    it('should disable create button when required fields are not filled', async () => {
      renderComponent(submitFn, 'cost');
      await waitForSpinner();
      const createButton = screen.getByRole('button', { name: 'Create' });
      expect(createButton).toBeDisabled();
    });

    it('should submit form with valid data', async () => {
      renderComponent(submitFn, 'cost');
      await waitForSpinner();
      await fillAndSubmitCostForm();
      await waitFor(() => {
        expect(submitFn).toHaveBeenCalledWith({
          limit_cost: '1000',
          actions: 'notify_organization_owners',
          period: 2,
          organization_groups: ['group-2-url'],
        });
      });
    });
  });

  describe('Usage Policy Form', () => {
    it('should render usage policy form correctly', async () => {
      renderComponent(submitFn, 'usage', { component_limits_set: [{}] });
      await waitForSpinner();
      expect(
        screen.getByText('When component limits reaches'),
      ).toBeInTheDocument();
      expect(screen.getByText('Then')).toBeInTheDocument();
      expect(screen.getByText('Period')).toBeInTheDocument();
      expect(screen.getByText('Organization groups')).toBeInTheDocument();
    });

    it('should initialize with one empty component limit row', async () => {
      renderComponent(submitFn, 'usage', { component_limits_set: [{}] });
      await waitForSpinner();
      const table = await screen.findByRole('table');
      const rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(2);
    });

    it('should allow adding and removing component limit rows', async () => {
      renderComponent(submitFn, 'usage', { component_limits_set: [{}] });
      await waitForSpinner();
      const table = await screen.findByRole('table');
      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
      let rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(3);

      const firstRow = rows[1];
      const removeButton = within(firstRow).getByRole('button', {
        name: 'Remove',
      });
      await userEvent.click(removeButton);
      rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(2);
    });

    it('should disable remove button when only one component limit exists', async () => {
      renderComponent(submitFn, 'usage', { component_limits_set: [{}] });
      await waitForSpinner();
      const table = await screen.findByRole('table');
      const rows = within(table).getAllByRole('row');
      const firstRow = rows[1];
      const removeButton = within(firstRow).getByRole('button', {
        name: 'Remove',
      });
      expect(removeButton).toBeDisabled();
    });

    it('should prevent adding more rows than available components', async () => {
      renderComponent(submitFn, 'usage');
      await waitForSpinner();

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(
        screen.queryByRole('button', { name: 'Add' }),
      ).not.toBeInTheDocument();

      const table = await screen.findByRole('table');
      const rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(3);
    });

    it('should show correct measured units for components', async () => {
      renderComponent(submitFn, 'usage', { component_limits_set: [{}] });
      await waitForSpinner();
      const table = await screen.findByRole('table');
      const rows = within(table).getAllByRole('row');
      const firstRow = rows[1];

      const componentSelect = within(firstRow).getByText(/Select component/i);
      await userEvent.click(componentSelect);
      await userEvent.keyboard('{ArrowDown}{Enter}');

      await waitFor(() => {
        expect(within(firstRow).getByText('RAM')).toBeInTheDocument();
        expect(within(firstRow).getByText('GB')).toBeInTheDocument();
      });
    });
  });
});
