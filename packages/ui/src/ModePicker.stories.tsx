import {
  BuildingsIcon,
  ChartPieSliceIcon,
  ClipboardTextIcon,
  LifebuoyIcon,
  MegaphoneSimpleIcon,
  PackageIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ModeOption, ModePickerDialog } from './ModePicker';

const meta: Meta<typeof ModePickerDialog> = {
  title: 'Dashboard/ModePickerDialog',
  parameters: {
    docs: {
      description: {
        component:
          "The workspace switcher SidebarModeCard opens. The mode list is the consumer's, like OrgSwitcher's org list — this component owns the dialog shape and the selected treatment only.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ModePickerDialog>;

const modes: ModeOption[] = [
  {
    key: 'end-user',
    title: 'End user',
    description:
      'For researchers and individual members who need to request and manage their own resources.',
    icon: <UserCircleIcon size={22} weight="bold" />,
    variant: 'blue',
  },
  {
    key: 'service-provider',
    title: 'Service provider',
    description:
      'For teams that provide cloud resources to customers through the Waldur marketplace.',
    icon: <PackageIcon size={22} weight="bold" />,
    variant: 'purple',
  },
  {
    key: 'proposal-reviewer',
    title: 'Proposal reviewer',
    description: 'For reviewers evaluating submitted proposals for open calls.',
    icon: <ClipboardTextIcon size={22} weight="bold" />,
    variant: 'warning',
  },
  {
    key: 'organisation-admin',
    title: 'Organisation admin',
    description:
      'For organisation administrators managing projects, members, quotas and invoices.',
    icon: <BuildingsIcon size={22} weight="bold" />,
    variant: 'moss',
  },
  {
    key: 'call-manager',
    title: 'Call manager',
    description: 'Open and close calls, manage proposal lifecycles.',
    icon: <MegaphoneSimpleIcon size={22} weight="bold" />,
    variant: 'indigo',
  },
  {
    key: 'finance-reporting',
    title: 'Finance & reporting',
    description:
      'Invoices, cost analytics and financial reporting across organisations.',
    icon: <ChartPieSliceIcon size={22} weight="bold" />,
    variant: 'blue',
  },
  {
    key: 'support-agent',
    title: 'Support agent',
    description:
      'Handle customer support tickets and investigate issues via audit logs.',
    icon: <LifebuoyIcon size={22} weight="bold" />,
    variant: 'danger',
  },
  {
    key: 'platform-admin',
    title: 'Platform admin',
    description:
      'The full Waldur HomePort with every section. Use this for tasks that span domains.',
    icon: <ShieldCheckIcon size={22} weight="bold" />,
    variant: 'neutral',
  },
];

/** Open by default, so the dialog itself is what the story shows. */
export const AllModes: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState('organisation-admin');
    return (
      <ModePickerDialog
        open={open}
        onOpenChange={setOpen}
        title="Choose your workspace"
        description="You have access to multiple modes. Each gives you a tailored view of Waldur for a specific job. You can switch anytime from the sidebar."
        modes={modes}
        value={value}
        onSelect={(key) => {
          setValue(key);
          setOpen(false);
        }}
      />
    );
  },
};
