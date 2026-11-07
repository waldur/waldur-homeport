import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ComponentEditRow2 } from '@/marketplace/details/plan/ComponentEditRow';
import { renderWithProviders } from '@/test/harness';

import { RequestBudgetBounds } from './RequestBudgetBounds';

const rule = (overrides = {}) =>
  ({
    uuid: 'r1',
    requested_offering_uuid: 'ro1',
    component_type: 'cpu',
    measured_unit: 'hours',
    limit_period: 'total',
    min_per_proposal: null,
    max_per_proposal: null,
    default_amount: null,
    is_fixed: false,
    ...overrides,
  }) as any;

const renderBounds = (rules: any[], initialLimits = {}) => {
  let values: any = {};
  let state: any = {};
  render(
    <Form
      onSubmit={() => undefined}
      initialValues={{ limits: initialLimits }}
      render={({ values: current, errors, invalid }) => {
        values = current;
        state = { errors, invalid };
        return (
          <RequestBudgetBounds
            rules={rules}
            requestedOfferingUuid="ro1"
            components={[
              { type: 'cpu', name: 'CPU' },
              { type: 'gpu', name: 'GPU' },
            ]}
            limits={current.limits}
          />
        );
      }}
    />,
  );
  const read = () => values;
  read.state = () => state;
  return read;
};

describe('RequestBudgetBounds', () => {
  it('states the bounds of each ruled component with its unit', () => {
    renderBounds([
      rule({ min_per_proposal: 10, max_per_proposal: 200 }),
      rule({ component_type: 'gpu', requested_offering_uuid: 'ro2' }),
    ]);
    expect(
      screen.getByText('CPU: Between 10 hours and 200 hours.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/GPU/)).not.toBeInTheDocument();
  });

  it('sets a fixed amount whatever was typed', async () => {
    const values = renderBounds(
      [rule({ is_fixed: true, default_amount: 500 })],
      { cpu: 20 },
    );
    expect(screen.getByText(/Fixed at 500 hours/)).toBeInTheDocument();
    expect(
      screen.getByText(/The amount cannot be changed/),
    ).toBeInTheDocument();
    await waitFor(() => expect(values().limits.cpu).toBe(500));
  });

  it('starts an empty request from the default amount', async () => {
    const values = renderBounds([
      rule({ max_per_proposal: 200, default_amount: 50 }),
    ]);
    await waitFor(() => expect(values().limits.cpu).toBe(50));
  });

  it('keeps what the applicant typed', async () => {
    const values = renderBounds(
      [rule({ max_per_proposal: 200, default_amount: 50 })],
      { cpu: 120 },
    );
    await waitFor(() => expect(values().limits.cpu).toBe(120));
  });

  it('marks an amount outside the bounds as a form error', async () => {
    const values = renderBounds(
      [rule({ min_per_proposal: 10, max_per_proposal: 200 })],
      { cpu: 5 },
    );
    await waitFor(() =>
      expect(values.state().errors.limits.cpu).toBe(
        'Outside what the call allows. Between 10 hours and 200 hours.',
      ),
    );
    expect(values.state().invalid).toBe(true);
  });

  it('accepts an amount inside the bounds', async () => {
    const values = renderBounds(
      [rule({ min_per_proposal: 10, max_per_proposal: 200 })],
      { cpu: 50 },
    );
    await waitFor(() => expect(values.state().invalid).toBe(false));
    expect(values.state().errors.limits).toBeUndefined();
  });

  it('never flags a fixed amount, which it sets itself', async () => {
    const values = renderBounds(
      [rule({ is_fixed: true, default_amount: 500 })],
      { cpu: 20 },
    );
    await waitFor(() => expect(values().limits.cpu).toBe(500));
    expect(values.state().invalid).toBe(false);
  });

  const renderWithRow = (initialLimits = {}) =>
    renderWithProviders(
      <Form onSubmit={vi.fn()} initialValues={{ limits: initialLimits }}>
        {({ values }) => (
          <>
            <RequestBudgetBounds
              rules={[rule({ min_per_proposal: 10, max_per_proposal: 200 })]}
              requestedOfferingUuid="ro1"
              components={[{ type: 'cpu', name: 'CPU' }]}
              limits={values.limits}
            />
            {/* eslint-disable-next-line waldur-custom/no-hand-rolled-table */}
            <table>
              <tbody>
                <ComponentEditRow2
                  component={
                    {
                      type: 'cpu',
                      name: 'CPU',
                      measured_unit: 'hours',
                      min_value: 1,
                      prices: [],
                    } as any
                  }
                  hidePrices
                />
              </tbody>
            </table>
          </>
        )}
      </Form>,
    );

  it('shows the rule on the amount input itself', async () => {
    // The amount row registers its own validator on the same field; the
    // rule's message must still be the one the input shows.
    renderWithRow();
    const input = screen.getByLabelText('CPU');
    await userEvent.type(input, '5');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'hours Outside what the call allows. Between 10 hours and 200 hours.',
    );
  });

  it('flags a saved amount the rule no longer allows before anyone types', async () => {
    renderWithRow({ cpu: 5 });
    const input = screen.getByLabelText('CPU');
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(input).toHaveAccessibleDescription(
      'hours Outside what the call allows. Between 10 hours and 200 hours.',
    );
  });
});
