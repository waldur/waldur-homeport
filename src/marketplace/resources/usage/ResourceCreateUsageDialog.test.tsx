import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceComponentUsagesSetUsage,
  OfferingComponent,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { getProviderUsageComponents } from './api';
import { ResourceCreateUsageDialog } from './ResourceCreateUsageDialog';

vi.mock('./api');

const props = {
  resolve: {
    resource_name: 'Test resource',
    resource_uuid: 'test-uuid',
    offering_uuid: 'test-offering-uuid',
    customer_name: 'Test customer',
    project_name: 'Test project',
  },
};

const mockData = {
  components: [
    {
      uuid: 'comp-1',
      name: 'Component 1',
      type: 'comp1',
      measured_unit: 'GB',
      description: 'Test component',
      offering_uuid: 'test-offering-uuid',
      billing_type: 'usage',
      factor: 1,
      is_builtin: false,
    } satisfies OfferingComponent,
  ],

  periods: [
    {
      label: 'January 2024',
      value: {
        uuid: 'period-1',
        plan_name: 'Test Plan',
        plan_uuid: 'plan-1',
        start: '2024-01-01',
        end: '2024-01-31',
        components: [],
      },
    },
  ],
};

const renderDialog = (props) => {
  renderWithProviders(<ResourceCreateUsageDialog {...props} />);
};

const twoComponents = {
  ...mockData,
  components: [
    mockData.components[0],
    {
      ...mockData.components[0],
      uuid: 'comp-2',
      name: 'Component 2',
      type: 'comp2',
    },
  ],
};

// jsdom has no layout, so fake a dialog where only the first tab fits and
// every later one wraps onto a new row.
const fakeOnlyFirstTabFits = () =>
  vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      /* eslint-disable testing-library/no-node-access */
      const wrapped =
        this.parentElement?.getAttribute('role') === 'tablist' &&
        this.previousElementSibling !== null;
      /* eslint-enable testing-library/no-node-access */
      return { top: wrapped ? 40 : 0 } as DOMRect;
    });

const findOverflowTrigger = () =>
  waitFor(() => {
    const trigger = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-haspopup') === 'menu');
    expect(trigger).toBeDefined();
    return trigger;
  });

// A tab that doesn't fit on the row is offered in the overflow menu instead.
const expectOverflowMenuToOffer = async (
  user: ReturnType<typeof userEvent.setup>,
  offered: RegExp,
  notOffered: RegExp,
) => {
  await user.click(await findOverflowTrigger());
  expect(
    await screen.findByRole('menuitem', { name: offered }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('menuitem', { name: notOffered }),
  ).not.toBeInTheDocument();
};

describe('ResourceCreateUsageDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when data is being fetched', () => {
    vi.mocked(getProviderUsageComponents).mockImplementation(
      () => new Promise(() => {}),
    );
    renderDialog(props);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    vi.mocked(getProviderUsageComponents).mockRejectedValue('error');
    renderDialog(props);
    await waitFor(() => {
      expect(
        screen.getByText('Unable to load offering details.'),
      ).toBeInTheDocument();
    });
  });

  it('renders message when there are no components', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue({
      components: [],
      periods: [],
    });
    renderDialog(props);
    await waitFor(() => {
      expect(
        screen.getByText('Offering does not have any usage-based components.'),
      ).toBeInTheDocument();
    });
  });

  it('displays dialog title with resource name', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue({
      components: [],
      periods: [],
    });
    renderDialog(props);
    await waitFor(() => {
      expect(
        screen.getByText(`${'Resource usage'} "Test resource"`),
      ).toBeInTheDocument();
    });
  });

  it('displays client organization name', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue(mockData);
    renderDialog(props);
    await waitFor(() => {
      expect(screen.queryByTestId('SpinnerIcon')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Client organization')).toBeInTheDocument();
    expect(
      screen.getByText('Test customer', { exact: false }),
    ).toBeInTheDocument();
  });

  it('renders the footer as a sibling of the body, not nested inside it', async () => {
    vi.mocked(getProviderUsageComponents).mockResolvedValue(mockData);
    renderDialog(props);
    await waitFor(() => {
      expect(screen.queryByTestId('SpinnerIcon')).not.toBeInTheDocument();
    });

    const footer = screen.getByTestId('modal-footer');
    // eslint-disable-next-line testing-library/no-node-access
    const body = footer.parentElement.querySelector('.modal-body');
    expect(body).not.toBeNull();
    expect(body.contains(footer)).toBe(false);
  });

  it('switches to a component picked from the overflow menu', async () => {
    const user = userEvent.setup();
    vi.mocked(getProviderUsageComponents).mockResolvedValue(twoComponents);
    const rectSpy = fakeOnlyFirstTabFits();

    renderDialog(props);
    await user.click(await findOverflowTrigger());
    await user.click(
      await screen.findByRole('menuitem', { name: /Component 2/ }),
    );

    expect(
      screen.getByRole('tab', { name: /Component 2/, selected: true }),
    ).toBeInTheDocument();
    rectSpy.mockRestore();
  });

  it('moves a component picked from the overflow menu onto the visible tab row', async () => {
    const user = userEvent.setup();
    vi.mocked(getProviderUsageComponents).mockResolvedValue(twoComponents);
    const rectSpy = fakeOnlyFirstTabFits();

    renderDialog(props);
    await user.click(await findOverflowTrigger());
    await user.click(
      await screen.findByRole('menuitem', { name: /Component 2/ }),
    );

    await expectOverflowMenuToOffer(user, /Component 1/, /Component 2/);
    rectSpy.mockRestore();
  });

  it('moves a component reached with the arrow keys onto the visible tab row', async () => {
    const user = userEvent.setup();
    vi.mocked(getProviderUsageComponents).mockResolvedValue(twoComponents);
    const rectSpy = fakeOnlyFirstTabFits();

    renderDialog(props);
    await findOverflowTrigger();
    screen.getByRole('tab', { name: /Component 1/, selected: true }).focus();
    await user.keyboard('{ArrowRight}');

    expect(
      screen.getByRole('tab', { name: /Component 2/, selected: true }),
    ).toBeInTheDocument();
    await expectOverflowMenuToOffer(user, /Component 1/, /Component 2/);
    rectSpy.mockRestore();
  });

  it('submits form with usage values', async () => {
    const user = userEvent.setup();
    vi.mocked(getProviderUsageComponents).mockResolvedValue(mockData);
    const submitSpy = vi.mocked(marketplaceComponentUsagesSetUsage);
    submitSpy.mockResolvedValue({} as any);

    renderDialog(props);
    await waitFor(() => {
      expect(screen.queryByTestId('SpinnerIcon')).not.toBeInTheDocument();
    });

    const amountInput = screen.getByPlaceholderText('Amount *');
    const descInput = screen.getByPlaceholderText('Enter a description...');
    const submitBtn = screen.getByText('Submit usage report');

    await user.clear(amountInput);
    await user.type(amountInput, '10');
    await user.clear(descInput);
    await user.type(descInput, 'Test usage');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith({
        body: {
          plan_period: 'period-1',
          resource: undefined,
          usages: [
            {
              type: 'comp1',
              amount: '10',
              description: 'Test usage',
              // Reporting always states the policy explicitly, so that
              // re-reporting clears a policy set on an earlier report.
              missing_usage_policy: 'none',
            },
          ],
        },
      });
    });
  });
});
