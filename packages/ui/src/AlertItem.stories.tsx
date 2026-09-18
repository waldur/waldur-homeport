import type { Meta, StoryObj } from '@storybook/react-vite';

import { AlertItem } from './AlertItem';
import { Badge } from './Badge';
import { BaseButton } from './BaseButton';

const VARIANTS = ['info', 'warning', 'error'] as const;
const TYPES = ['full-width', 'floating'] as const;

const meta: Meta<typeof AlertItem> = {
  title: 'Feedback/AlertItem',
  component: AlertItem,
  parameters: {
    docs: {
      description: {
        component:
          'Pure Tailwind rebuild of AlertItem with design tokens. Supports variant: info | warning | error and type: full-width | floating.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    type: { control: 'radio', options: TYPES },
  },
  args: {
    variant: 'info',
    type: 'full-width',
    title: 'Resources are activated on 12 Oct 2026',
    body: 'The project starts on a future date, so the allocated resources stay in "Creating" until then.',
  },
};
export default meta;

type Story = StoryObj<typeof AlertItem>;

export const Playground: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {TYPES.map((type) => (
        <div key={type}>
          <div className="text-sm text-neutral-500 mb-2">type="{type}"</div>
          <div className="flex flex-col max-w-[480px]">
            {VARIANTS.map((variant) => (
              <AlertItem
                key={variant}
                variant={variant}
                type={type}
                title={`${variant} alert`}
                body="Supporting copy explaining the state in one short sentence."
                className={type === 'floating' ? 'mb-3' : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const WithTitleAfter: Story = {
  render: () => (
    <div className="max-w-[480px]">
      <AlertItem
        variant="info"
        title="Acme Cloud Project"
        titleAfter={
          <Badge variant="warning" size="sm" tone="light">
            Expires in 2 days
          </Badge>
        }
        body="Invited by Jane Doe to join as Member (project)."
      />
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-[480px]">
      <AlertItem
        variant="warning"
        title="Credit budget 90% consumed"
        body="Vienna University · $450/mo"
        actions={<BaseButton label="Review" variant="tertiary" size="sm" />}
      />
      <AlertItem
        variant="error"
        type="floating"
        title="Failed to resolve username conflicts."
        actions={<BaseButton label="Retry" variant="tertiary" size="sm" />}
      />
    </div>
  ),
};

export const StackedList: Story = {
  render: () => (
    <div className="max-w-[480px]">
      <AlertItem
        variant="info"
        title="Acme Cloud Project"
        titleAfter={
          <Badge variant="warning" size="sm" tone="light">
            Expires in 2 days
          </Badge>
        }
        body="Invited by Jane Doe to join as Member (project)."
      />
      <AlertItem
        variant="info"
        title="HPC Research Group"
        body="Invited by John Smith to join as Owner (customer)."
      />
      <AlertItem
        variant="warning"
        title="Storage quota exceeded"
        body="This resource has exceeded its allocated storage quota."
        actions={<BaseButton label="View" variant="tertiary" size="sm" />}
      />
    </div>
  ),
};

export const Floating: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-[480px]">
      <AlertItem
        variant="error"
        type="floating"
        title="Something went wrong while saving your changes."
      />
      <AlertItem
        variant="warning"
        type="floating"
        title="Renaming a live account changes who owns its files on your systems."
        body="Move or re-own the files of the renamed accounts afterwards."
      />
      <AlertItem
        variant="info"
        type="floating"
        title="Resources are activated on 12 Oct 2026"
        body='The project starts on a future date, so the allocated resources stay in "Creating" until then.'
      />
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className="max-w-[320px]">
      <AlertItem
        variant="warning"
        title="Some users with configured resource-usage quotas across three affiliated organizations are still awaiting provisioning"
        titleAfter={
          <Badge variant="neutral" size="sm" tone="outline">
            12 users
          </Badge>
        }
        body="Some offering users still need to be provisioned on the backend before they can access their resources. This can take a few minutes for large offerings."
      />
    </div>
  ),
};
