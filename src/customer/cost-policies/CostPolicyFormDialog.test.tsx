import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  invoiceItemsCustomerCostsForPeriodRetrieve,
  invoiceItemsProjectCostsForPeriodRetrieve,
  marketplaceCustomerEstimatedCostPoliciesUpdate,
  marketplaceProjectEstimatedCostPoliciesCreate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import {
  organizationAutocomplete,
  projectAutocomplete,
} from '@/marketplace/common/autocompletes';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption, typeAndSelectOption } from '@/test/select';
import * as workspaceHooks from '@/workspace/hooks';

import { CostPolicyFormDialog } from './CostPolicyFormDialog';

ENV.plugins.WALDUR_CORE.CURRENCY_NAME = 'EUR';

vi.mock('@/marketplace/common/autocompletes', () => ({
  projectAutocomplete: vi.fn(),
  organizationAutocomplete: vi.fn(),
}));

vi.mock('@/project/ProjectCostField', () => ({
  ProjectCostField: () => '100 EUR',
}));

const renderDialog = (props: any) => {
  vi.mocked(workspaceHooks.useCustomer).mockReturnValue({
    uuid: 'customer-uuid',
  } as any);
  return renderWithProviders(<CostPolicyFormDialog {...props} />);
};

describe('CostPolicyFormDialog', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.CURRENCY_NAME = 'EUR';
    vi.clearAllMocks();
    vi.mocked(invoiceItemsProjectCostsForPeriodRetrieve).mockResolvedValue({
      data: {},
    } as any);
    vi.mocked(invoiceItemsCustomerCostsForPeriodRetrieve).mockResolvedValue({
      data: {},
    } as any);
    vi.mocked(projectAutocomplete).mockReturnValue(() =>
      Promise.resolve({
        options: [
          {
            name: 'Project 1',
            uuid: 'project-uuid',
            url: 'project-url',
            billing_price_estimate: {},
          },
        ],
        hasMore: false,
        additional: { page: 1 },
      }),
    );
    vi.mocked(organizationAutocomplete).mockReturnValue(() =>
      Promise.resolve({
        options: [
          {
            name: 'Org 1',
            uuid: 'org-uuid',
            url: 'org-url',
            billing_price_estimate: {},
          },
        ],
        hasMore: false,
        additional: { page: 1 },
      }),
    );
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

    await typeAndSelectOption(
      user,
      /Select project\(s\)/i,
      'Project 1',
      'Project 1 / est. 100 EUR this month',
    );
    await openAndSelectOption(user, 'Period', '1 month');
    const limitInput = screen.getByLabelText(/When estimated cost reaches/i);
    await user.clear(limitInput);
    await user.type(limitInput, '500');
    await openAndSelectOption(user, 'Then', 'Notify organization owners');

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
    expect(screen.getByText(/Select project\(s\)/i)).toBeInTheDocument();
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
    await openAndSelectOption(user, 'Then', 'Notify external user');

    await waitFor(() => {
      expect(
        screen.getByLabelText(/External user emails/i),
      ).toBeInTheDocument();
    });

    const emailField = screen.getByLabelText(/External user emails/i);
    await user.type(emailField, 'test@example.com');

    // Change action to "Notify organization owners"
    await openAndSelectOption(user, 'Then', 'Notify organization owners');

    // The email field should be hidden
    await waitFor(() => {
      expect(
        screen.queryByLabelText(/External user emails/i),
      ).not.toBeInTheDocument();
    });
  });
});
