import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { ResourceSelectionTable } from './ResourceSelectionTable';

/**
 * Step two of reallocating capacity: how much of the freed pool each target
 * resource receives. The allocation field takes whatever is typed; once the
 * running total passes the pool it turns invalid and says why on hover, and
 * it must stay the same field while it does, or typing stops mid-number.
 */
const meta: Meta<typeof ResourceSelectionTable> = {
  title: 'Marketplace/Reallocate limits/Resource selection',
  component: ResourceSelectionTable,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ResourceSelectionTable>;

const component = { type: 'cpu', name: 'CPU', measured_unit: 'cores' };

const resources = [
  {
    uuid: 'alpha',
    name: 'Alpha cluster',
    offering_name: 'HPC',
    customer_name: 'Research Lab',
    project_name: 'Genomics',
    limits: { cpu: 40 },
    current_usages: { cpu: 12 },
  },
  {
    uuid: 'beta',
    name: 'Beta cluster',
    offering_name: 'HPC',
    customer_name: 'Research Lab',
    project_name: 'Imaging',
    limits: { cpu: 10 },
    current_usages: { cpu: 3 },
  },
];

const Harness = ({
  freedAmount = 100,
  selected = ['alpha'],
}: {
  freedAmount?: number;
  selected?: string[];
}) => {
  const [targets, setTargets] = useState(
    selected.map((uuid) => ({
      resource_uuid: uuid,
      allocated_limits: { cpu: 0 },
    })),
  );
  return (
    <ResourceSelectionTable
      component={component}
      resources={resources}
      freedAmount={freedAmount}
      targets={targets}
      loading={false}
      onAllocationChange={(resourceUuid, type, amount) =>
        setTargets((current) =>
          current.map((target) =>
            target.resource_uuid === resourceUuid
              ? {
                  ...target,
                  allocated_limits: {
                    ...target.allocated_limits,
                    [type]: amount,
                  },
                }
              : target,
          ),
        )
      }
    />
  );
};

/** One selected target; the other resource is listed but not receiving. */
export const Default: Story = {
  render: () => <Harness />,
  play: async () => {
    const input = await screen.findByTestId('allocation-alpha');
    await expect(input).toHaveValue(0);
    // The unselected row has no field, only dashes.
    await expect(screen.queryByTestId('allocation-beta')).toBeNull();
  },
};

/** Typing a number that is within the pool updates the new limit and change. */
export const Allocating: Story = {
  render: () => <Harness freedAmount={100} />,
  play: async () => {
    const input = await screen.findByTestId('allocation-alpha');
    await userEvent.clear(input);
    await userEvent.type(input, '25');
    await expect(input).toHaveValue(25);
    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(screen.getByText('65')).toBeInTheDocument();
    await expect(screen.getByText('+25')).toBeInTheDocument();
  },
};

/**
 * Past the freed pool the field is marked invalid and a tooltip explains it.
 * Typing "1509" into a pool of 100 crosses it on the third digit; the field
 * has to survive that, keep focus and take the fourth.
 */
export const ExceedsFreedPool: Story = {
  render: () => <Harness freedAmount={100} />,
  play: async () => {
    const input = await screen.findByTestId('allocation-alpha');
    await userEvent.clear(input);
    await userEvent.type(input, '1509');
    await expect(screen.getByTestId('allocation-alpha')).toBe(input);
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue(1509);
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    // The pointer is already over the field from typing; leave and re-enter.
    await userEvent.unhover(input);
    await userEvent.hover(input);
    await waitFor(
      () =>
        expect(
          screen.getAllByText('Allocation exceeds freed pool').length,
        ).toBeGreaterThan(0),
      { timeout: 3000 },
    );
  },
};

/** Two targets share one pool: together they may not take more than it holds. */
export const SharedPool: Story = {
  render: () => <Harness freedAmount={50} selected={['alpha', 'beta']} />,
  play: async () => {
    const alpha = await screen.findByTestId('allocation-alpha');
    const beta = await screen.findByTestId('allocation-beta');
    await userEvent.clear(alpha);
    await userEvent.type(alpha, '40');
    await userEvent.clear(beta);
    await userEvent.type(beta, '20');
    // 40 + 20 is over the pool of 50, so both fields say so.
    await expect(alpha).toHaveAttribute('aria-invalid', 'true');
    await expect(beta).toHaveAttribute('aria-invalid', 'true');

    await userEvent.clear(beta);
    await userEvent.type(beta, '10');
    await expect(alpha).not.toHaveAttribute('aria-invalid');
    await expect(beta).not.toHaveAttribute('aria-invalid');
  },
};
