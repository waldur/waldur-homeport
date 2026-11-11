import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { TotalLimitComponentsTable } from './TotalLimitComponentsTable';

// A limit-based component with no min_value: the validator only checks the
// minimum when min_value is set, so the input's own min is what stops a
// negative limit.
const makeComponent = (type = 'storage') =>
  ({
    type,
    name: type,
    measured_unit: 'GB',
    price: 1,
    amount: 0,
    max_value: 1000,
  }) as any;

const component = makeComponent();

const table = (components: any[], limits: Record<string, number>) => (
  <Form initialValues={{ limits }} onSubmit={() => undefined}>
    {() => (
      <TotalLimitComponentsTable
        components={components}
        total={0}
        viewMode={false}
        hidePrices
      />
    )}
  </Form>
);

const renderTable = () =>
  renderWithProviders(table([component], { storage: 10 }));

describe('TotalLimitComponentsTable', () => {
  it('marks a negative limit and brings it back to 0 when left', async () => {
    renderTable();
    const field = screen.getByRole('spinbutton');
    await userEvent.tripleClick(field);
    await userEvent.paste('-5');
    expect(field).toHaveValue(-5);
    expect(field).toHaveAttribute('aria-invalid', 'true');

    await userEvent.tab();
    expect(field).toHaveValue(0);
  });

  it('keeps a limit to the component maximum', async () => {
    renderTable();
    const field = screen.getByRole('spinbutton');
    await userEvent.tripleClick(field);
    await userEvent.paste('5000');
    await userEvent.tab();
    expect(field).toHaveValue(1000);
  });

  // A validator built per row inside the map would be one hook per row, so
  // React saw the hook count change and threw "Rendered more hooks than
  // during the previous render" -- a plan switch that adds a total-limited
  // component is enough.
  it('survives the component list changing length', () => {
    const { rerender } = renderWithProviders(
      table([makeComponent('storage')], { storage: 10 }),
    );
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);

    rerender(
      table([makeComponent('storage'), makeComponent('ram')], {
        storage: 10,
        ram: 2,
      }),
    );
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
  });
});
