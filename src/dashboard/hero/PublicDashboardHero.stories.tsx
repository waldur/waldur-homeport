import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from 'waldur-ui';

import { PublicDashboardHero } from './PublicDashboardHero';

/**
 * `PublicDashboardHero` heads the organization, project and user dashboards:
 * the identity card on the left and, from `md` up, a quick section beside it
 * (`quickBody`, `quickActions`, `quickFooter`). `hideQuickSection` gives the
 * identity card the full width.
 */
const meta: Meta<typeof PublicDashboardHero> = {
  title: 'Dashboard/PublicDashboardHero',
  component: PublicDashboardHero,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof PublicDashboardHero>;

const identity = {
  logoAlt: 'ACME Research',
  title: <h2 className="mb-0">ACME Research</h2>,
  actions: <BaseButton variant="tertiary" label="Edit" />,
  children: (
    <div className="text-tertiary">Organization · 14 projects · 37 members</div>
  ),
  cardBordered: true,
};

export const WithQuickSection: Story = {
  args: {
    ...identity,
    quickBody: (
      <div>
        <div className="text-tertiary">Estimated cost this month</div>
        <div className="text-2xl font-semibold">€ 4 210.50</div>
      </div>
    ),
    quickActions: <BaseButton variant="tertiary" label="Invoices" />,
    quickFooter: <div className="text-tertiary">Credit left: € 12 000</div>,
  },
};

export const WithoutQuickSection: Story = {
  args: { ...identity, hideQuickSection: true },
};
