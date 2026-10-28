import type { Meta, StoryObj } from '@storybook/react-vite';
import { createPortal } from 'react-dom';

import { BaseButton } from 'waldur-ui';

import { BaseTableWithTabs } from './BaseTableWithTabs';
import { TableWithPortal } from './types';

/**
 * `BaseTableWithTabs` is a card of tabbed tables: the title on the left of
 * the header, `headerActions` and the open table's toolbar on the right
 * (below the title under `sm`), then the tab bar and the open tab.
 */
const meta: Meta<typeof BaseTableWithTabs> = {
  title: 'Tables/BaseTableWithTabs',
  component: BaseTableWithTabs,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof BaseTableWithTabs>;

// Stands in for a Table: portals a toolbar button into the card header.
const Panel = ({ portal, label }: TableWithPortal<{ label: string }>) => (
  <>
    {createPortal(
      <BaseButton variant="tertiary" label="Export" />,
      portal.toolbar,
    )}
    <p className="py-5 text-tertiary">{label}</p>
  </>
);

const tabs = [
  {
    key: 'active',
    title: 'Active',
    count: 12,
    component: (props) => <Panel {...props} label="Active resources" />,
  },
  {
    key: 'archived',
    title: 'Archived',
    count: 3,
    component: (props) => <Panel {...props} label="Archived resources" />,
  },
];

export const Default: Story = {
  args: {
    title: 'Resources',
    subtitle: 'Everything ordered in this project',
    tabs,
    headerActions: <BaseButton variant="primary" label="Add resource" />,
  },
};

export const LongTitle: Story = {
  args: {
    title:
      'Resources ordered by every project in this organization over the last year',
    tabs,
    headerActions: <BaseButton variant="primary" label="Add resource" />,
  },
};
