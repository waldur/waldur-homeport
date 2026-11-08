import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';

import { propVal } from './propertyFields';

/**
 * Read-only property rows formatted via `propVal.*`. A missing value is left to
 * the list: the divided list shows a dash (or the row's `placeholder`), the
 * summary list leaves the row out. `false` is a value, so it always reads.
 */
const meta: Meta = {
  title: 'Forms/Property fields',
  parameters: {
    layout: 'padded',
    // Fails the storybook test run on any axe violation.
    a11y: { test: 'error' },
  },
};
export default meta;

type Story = StoryObj;

interface Order {
  created: string;
  completed_at: string | null;
  consumer_reviewed_at: string | null;
  offering_billable: boolean;
  offering_shared: boolean;
  archived: boolean | null;
}

const order: Order = {
  created: '2027-02-26T14:00:00',
  completed_at: null,
  consumer_reviewed_at: null,
  offering_billable: false,
  offering_shared: true,
  archived: null,
};

const Rows = () => (
  <>
    <PropertyItem
      value={propVal.date(order.created, { precision: 'datetime' })}
      label="Date created"
      hasCopy
    />
    <PropertyItem
      value={propVal.date(order.completed_at, { precision: 'datetime' })}
      label="Date completed"
    />
    <PropertyItem
      value={propVal.date(order.consumer_reviewed_at)}
      label="Consumer reviewed at"
      placeholder="Not reviewed yet"
      hideIfEmpty={false}
    />
    <PropertyItem
      value={propVal.boolean(order.offering_billable)}
      label="Offering billable?"
    />
    <PropertyItem
      value={propVal.boolean(order.offering_shared, {
        wording: 'enabled',
        colored: true,
      })}
      label="Offering shared?"
    />
    <PropertyItem value={propVal.boolean(order.archived)} label="Archived" />
  </>
);

export const Divided: Story = {
  render: () => (
    <div className="max-w-140">
      <PropertyList detailsMode>
        <Rows />
      </PropertyList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = (label: string) =>
      canvas.getByRole('definition', { name: new RegExp(label) });
    await expect(value('Date completed')).toHaveTextContent('—');
    await expect(value('Consumer reviewed at')).toHaveTextContent(
      'Not reviewed yet',
    );
    await expect(value('Offering billable')).toHaveTextContent('No');
    await expect(value('Archived')).toHaveTextContent('—');
  },
};

export const Summary: Story = {
  render: () => (
    <div className="max-w-140">
      <PropertyList variant="summary" termWidth="md">
        <Rows />
      </PropertyList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Date completed')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Archived')).not.toBeInTheDocument();
    await expect(canvas.getByText('No')).toBeInTheDocument();
  },
};

/** One row of each type, as a resource's details panel would hold them. */
export const AllTypes: Story = {
  render: () => {
    // Storybook skips the app bootstrap, so defaultCurrency has no currency.
    ENV.plugins = {
      ...ENV.plugins,
      WALDUR_CORE: { ...ENV.plugins?.WALDUR_CORE, CURRENCY_NAME: 'EUR' },
    } as typeof ENV.plugins;
    return (
      <div className="max-w-140">
        <PropertyList detailsMode>
          <PropertyItem
            label="Name"
            value={propVal.text('production-cluster-01')}
          />
          <PropertyItem
            label="Backend ID"
            value={propVal.code('9f1c2a7e-0b4d-4e3a-8c1f-6d2e5b7a9c04', {
              truncate: 'middle',
            })}
            hasCopy
          />
          <PropertyItem
            label="State"
            value={propVal.state('OK', {
              states: { OK: { label: 'Healthy', variant: 'success' } },
            })}
          />
          <PropertyItem
            label="Shared"
            value={propVal.boolean(true, { display: 'badge' })}
          />
          <PropertyItem
            label="Billable"
            value={propVal.boolean(false, { display: 'icon' })}
          />
          <PropertyItem
            label="Cores"
            value={propVal.number(64, { unit: 'cores' })}
          />
          <PropertyItem
            label="Storage quota"
            value={propVal.number(-1, { unlimited: -1 })}
          />
          <PropertyItem
            label="Monthly cost"
            value={propVal.currency('1234.5')}
          />
          <PropertyItem
            label="Created"
            value={propVal.date('2027-02-26T14:00:00', { relative: true })}
          />
          <PropertyItem
            label="Billing period"
            value={propVal.date('2027-02-01', { precision: 'month' })}
          />
          <PropertyItem
            label="Tags"
            value={propVal.list(['hpc', 'gpu', 'eu-north'], {
              display: 'badges',
            })}
          />
          <PropertyItem
            label="Fixed IPs"
            value={propVal.list(['10.0.0.12', '10.0.0.13'], {
              display: 'stack',
              itemCopy: true,
            })}
          />
          <PropertyItem
            label="Disk"
            value={propVal.fileSize(51200, { unit: 'MB' })}
          />
          <PropertyItem label="Uptime" value={propVal.duration(273600)} />
          <PropertyItem
            label="CPU used"
            value={propVal.percent(0.256, { ratio: true })}
          />
          <PropertyItem
            label="Transition mode"
            value={propVal.enum('manual', {
              labels: { manual: 'Hold for manual advance' },
            })}
          />
          <PropertyItem
            label="Created by"
            value={propVal.user({ full_name: 'Ada Lovelace', username: 'ada' })}
          />
          <PropertyItem
            label="API URL"
            value={propVal.url('https://api.example.com/v1')}
          />
          <PropertyItem
            label="API token"
            value={propVal.secret('s3cr3t-t0k3n')}
          />
          <PropertyItem
            label="Notes"
            value={propVal.richText(
              'Maintenance on Friday.\nExpect a short outage.',
            )}
          />
          <PropertyItem
            label="Attributes"
            value={propVal.json({ flavor: 'm1.large', disk: 80 })}
          />
          <PropertyItem label="Description" value={propVal.text('')} />
        </PropertyList>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Unlimited')).toBeInTheDocument();
    await expect(canvas.getByText('February 2027')).toBeInTheDocument();
  },
};
