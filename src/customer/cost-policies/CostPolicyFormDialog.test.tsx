import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  invoiceItemsCustomerCostsForPeriodRetrieve,
  invoiceItemsProjectCostsForPeriodRetrieve,
  marketplaceCustomerEstimatedCostPoliciesUpdate,
  marketplaceProjectEstimatedCostPoliciesCreate,
} from 'waldur-js-client';

import { useManagedMutation } from '@/modal/useManagedMutation';

import { CostPolicyFormDialog } from './CostPolicyFormDialog';

vi.mock('waldur-js-client');
vi.mock('@/modal/useManagedMutation');
vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        CURRENCY_NAME: 'EUR',
      },
    },
  },
}));

vi.mock('@/marketplace/common/autocompletes', () => ({
  projectAutocomplete: vi.fn(),
  organizationAutocomplete: vi.fn(),
}));

vi.mock('@/project/ProjectCostField', () => ({
  ProjectCostField: () => '100 EUR',
}));

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

// Mock fields to simplify testing
vi.mock('@/form/select/AsyncSelect', () => ({
  AsyncSelect: ({ input, isMulti, name }: any) => (
    <input
      id={input?.name || name}
      data-testid={input?.name || name}
      value={
        isMulti
          ? input?.value?.[0]?.url || ''
          : input?.value?.url || input?.value || ''
      }
      onChange={(e) => {
        const val = e.target.value;
        if (input) {
          if (isMulti) {
            input.onChange(
              val
                ? [
                    {
                      name: val,
                      uuid: val,
                      url: val,
                      billing_price_estimate: {},
                    },
                  ]
                : [],
            );
          } else {
            input.onChange(val);
          }
        }
      }}
    />
  ),
}));

vi.mock('@/form/select/SelectField', () => ({
  SelectField: ({ input, options, simpleValue }: any) => (
    <select
      id={input.name}
      data-testid={input.name}
      value={input.value?.value || input.value || ''}
      onChange={(e) => {
        const option = options.find((o) => String(o.value) === e.target.value);
        if (simpleValue) {
          input.onChange(option ? option.value : e.target.value);
        } else {
          input.onChange(option || e.target.value);
        }
      }}
    >
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('@/form/NumberField', () => ({
  NumberField: ({ input }: any) => (
    <input id={input.name} data-testid={input.name} type="number" {...input} />
  ),
}));

vi.mock('@/form/StringField', () => ({
  StringField: ({ input }: any) => (
    <input id={input.name} data-testid={input.name} {...input} />
  ),
}));

const renderDialog = (props: any) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore(() => ({
    workspace: { customer: { uuid: 'customer-uuid' } },
  }));
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CostPolicyFormDialog {...props} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('CostPolicyFormDialog', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useManagedMutation).mockImplementation(
      (options: any) =>
        ({
          mutateAsync: vi.fn((values) => options.mutationFn(values)),
          isPending: false,
        }) as any,
    );
    vi.mocked(invoiceItemsProjectCostsForPeriodRetrieve).mockResolvedValue({
      data: {},
    } as any);
    vi.mocked(invoiceItemsCustomerCostsForPeriodRetrieve).mockResolvedValue({
      data: {},
    } as any);
  });

  it('submits create project policy correctly', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const createSpy = vi
      .mocked(marketplaceProjectEstimatedCostPoliciesCreate)
      .mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        type: 'project',
        refetch,
      },
    });

    await user.type(screen.getByTestId('scope'), 'project-url');
    await user.selectOptions(screen.getByTestId('period'), '2'); // 1 month
    const limitInput = screen.getByLabelText(/When estimated cost reaches/i);
    await user.clear(limitInput);
    await user.type(limitInput, '500');
    await user.selectOptions(
      screen.getByTestId('actions'),
      'notify_organization_owners',
    );

    await user.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            scope: 'project-url',
            limit_cost: 500,
            actions: 'notify_organization_owners',
            period: 2,
          }),
        }),
      );
    });
  });

  it('renders create project policy dialog correctly', () => {
    renderDialog({
      resolve: {
        type: 'project',
        refetch: vi.fn(),
      },
    });
    expect(screen.getByText('New policy')).toBeInTheDocument();
    expect(screen.getByLabelText(/Select project\(s\)/i)).toBeInTheDocument();
  });

  it('renders edit organization policy dialog correctly', async () => {
    const row = {
      uuid: 'policy-uuid',
      scope_name: 'Org 1',
      scope_uuid: 'org-uuid',
      scope: 'org-url',
      actions: 'notify_external_user',
      limit_cost: 1000,
      period: 1,
      options: { notify_external_user: 'test@example.com' },
    };
    renderDialog({
      resolve: {
        type: 'organization',
        refetch: vi.fn(),
        row,
      },
    });
    expect(screen.getByText('Edit policy')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('1000')).toBeInTheDocument();
    expect(
      await screen.findByDisplayValue('test@example.com'),
    ).toBeInTheDocument();
  });

  it('submits edit organization policy correctly', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const row = {
      uuid: 'policy-uuid',
      scope_name: 'Org 1',
      scope_uuid: 'org-uuid',
      scope: 'org-url',
      actions: 'notify_organization_owners',
      limit_cost: 1000,
      period: 1,
    };
    const updateSpy = vi
      .mocked(marketplaceCustomerEstimatedCostPoliciesUpdate)
      .mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        type: 'organization',
        refetch,
        row,
      },
    });

    const input = screen.getByLabelText(/When estimated cost reaches/i);
    await user.clear(input);
    await user.type(input, '2000');

    await user.click(screen.getByRole('button', { name: /Edit/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'policy-uuid' },
          body: expect.objectContaining({
            limit_cost: 2000,
          }),
        }),
      );
    });
  });

  it('clears options when action changes', async () => {
    const user = userEvent.setup();
    renderDialog({
      resolve: {
        type: 'project',
        refetch: vi.fn(),
      },
    });

    // Select "Notify external user" to show the email field
    await user.selectOptions(
      screen.getByTestId('actions'),
      'notify_external_user',
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(/External user emails/i),
      ).toBeInTheDocument();
    });

    const emailField = screen.getByLabelText(/External user emails/i);
    await user.type(emailField, 'test@example.com');

    // Change action to "Notify organization owners"
    await user.selectOptions(
      screen.getByTestId('actions'),
      'notify_organization_owners',
    );

    // The email field should be hidden
    await waitFor(() => {
      expect(
        screen.queryByLabelText(/External user emails/i),
      ).not.toBeInTheDocument();
    });
  });
});
