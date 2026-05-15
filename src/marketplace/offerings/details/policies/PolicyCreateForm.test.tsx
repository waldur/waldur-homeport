import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingEstimatedCostPoliciesCreate } from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

import { waitForSpinner } from '@/core/test-utils';

import { PolicyCreateDialog } from './PolicyCreateDialog';

const mockStore = configureMockStore();

vi.mock('waldur-js-client', async (importOriginal) => {
  const original = await importOriginal<typeof import('waldur-js-client')>();
  return {
    ...original,
    marketplaceOfferingEstimatedCostPoliciesCreate: vi.fn(),
    marketplaceOfferingUsagePoliciesCreate: vi.fn(),
  };
});

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

  await userEvent.click(screen.getByText(/month/i));
  await userEvent.keyboard('Total{Enter}');

  await userEvent.click(screen.getByText('Select organization groups'));
  await userEvent.keyboard('{ArrowDown}{Enter}');

  await userEvent.click(screen.getByRole('button', { name: 'Create' }));
};

vi.mock('@/core/config', () => ({
  ENV: {
    apiEndpoint: 'http://example.com',
    plugins: {
      WALDUR_CORE: {
        CURRENCY_NAME: 'USD',
      },
    },
  },
}));

vi.mock('@/i18n', () => ({
  translate: vi.fn((str, values) => {
    if (!values) return str;
    return Object.entries(values).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, String(value)),
      str,
    );
  }),
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
  type: 'cost' | 'usage' = 'cost',
  refetch = vi.fn(),
  initialValues = undefined,
  offering = mockOffering as any,
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
          type={type}
          offering={offering}
          refetch={refetch}
          initialValues={initialValues}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('PolicyCreateDialog', () => {
  let refetch: any;

  beforeEach(() => {
    refetch = vi.fn();
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
      renderComponent('cost');
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
      renderComponent('cost');
      await waitFor(() => {
        expect(
          screen.getByText('Unable to load organization groups.'),
        ).toBeInTheDocument();
      });
    });

    it('should display server error on submission failure', async () => {
      vi.mocked(
        marketplaceOfferingEstimatedCostPoliciesCreate,
      ).mockRejectedValue({
        response: {
          status: 400,
          data: { non_field_errors: ['Unable to create policy.'] },
        },
      } as any);
      renderComponent('cost');
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
      renderComponent('cost');
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
      renderComponent('cost');
      await waitForSpinner();
      const createButton = screen.getByRole('button', { name: 'Create' });
      expect(createButton).toBeDisabled();
    });

    it('should submit form with valid data', async () => {
      vi.mocked(
        marketplaceOfferingEstimatedCostPoliciesCreate,
      ).mockResolvedValue({} as any);
      renderComponent('cost', refetch);
      await waitForSpinner();
      await fillAndSubmitCostForm();
      await waitFor(() => {
        expect(
          marketplaceOfferingEstimatedCostPoliciesCreate,
        ).toHaveBeenCalledWith({
          body: expect.objectContaining({
            limit_cost: '1000',
            actions: 'notify_organization_owners',
            period: 1,
            organization_groups: ['group-2-url'],
          }),
        });
        expect(refetch).toHaveBeenCalled();
      });
    });
  });

  describe('Usage Policy Form', () => {
    it('should render usage policy form correctly', async () => {
      renderComponent('usage', refetch, { component_limits_set: [{}] });
      await waitForSpinner();
      expect(
        screen.getByText('When component limits reaches'),
      ).toBeInTheDocument();
      expect(screen.getByText('Then')).toBeInTheDocument();
      expect(screen.getByText('Period')).toBeInTheDocument();
      expect(screen.getByText('Organization groups')).toBeInTheDocument();
    });

    it('should initialize with one empty component limit row', async () => {
      renderComponent('usage', refetch, { component_limits_set: [{}] });
      await waitForSpinner();
      const table = await screen.findByRole('table');
      const rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(2);
    });

    it('should allow adding and removing component limit rows', async () => {
      renderComponent('usage', refetch, { component_limits_set: [{}] });
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
      renderComponent('usage', refetch, { component_limits_set: [{}] });
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
      renderComponent('usage');
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
      renderComponent('usage', refetch, { component_limits_set: [{}] });
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
