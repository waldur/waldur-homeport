import { WarningCircleIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccordionCard } from './AccordionCard';
import { BaseButton } from './BaseButton';

const meta: Meta<typeof AccordionCard> = {
  title: 'Data Display/AccordionCard',
  component: AccordionCard,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof AccordionCard>;

export const Default: Story = {
  args: {
    title: 'Project details',
    defaultOpen: true,
    children: 'Card body content.',
  },
};

export const SubtitleAndActions: Story = {
  args: {
    title: 'Resource requests',
    subtitle: '3 problems detected',
    defaultOpen: true,
    actions: <BaseButton variant="tertiary" size="sm" label="Add resource" />,
    children: 'Card body content.',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Datacenter A',
    secondary: true,
    children: 'Card body content.',
  },
};

export const Solid: Story = {
  args: {
    title: 'Advanced settings',
    solid: true,
    defaultOpen: true,
    children: 'Card body content.',
  },
};

export const Collapsed: Story = {
  args: {
    title: 'Project details',
    subtitle: 'Name, description and end date',
    children: 'Card body content.',
  },
};

export const SecondaryOpen: Story = {
  args: {
    title: 'Datacenter A',
    secondary: true,
    defaultOpen: true,
    children: 'Card body content.',
  },
};

/** Slim variant on a muted surface, as in the invitation dialog's "Advanced settings". */
export const Small: Story = {
  args: {
    title: 'Advanced settings',
    size: 'sm',
    className: 'bg-[var(--surface-page-bg)]',
    titleClassName: 'text-[length:1.077rem]',
    defaultOpen: true,
    children: 'Card body content.',
  },
};

/** Slim variant as a warning notice, as in the invitation dialog's restrictions notice. */
export const SmallWarning: Story = {
  args: {
    title: (
      <span className="flex items-center gap-2 text-[color:var(--pill-warning-text)]">
        <WarningCircleIcon weight="bold" size={20} />
        Membership restrictions apply
      </span>
    ),
    size: 'sm',
    className: 'bg-[var(--pill-warning-bg)]',
    titleClassName: 'text-[length:1.077rem]',
    defaultOpen: true,
    children: 'Card body content.',
  },
};

/**
 * Content wider than the card, in a horizontally scrolling wrapper (as a
 * nested table is): it must scroll inside the card, not widen it.
 */
export const WideContent: Story = {
  args: {
    title: 'Project team',
    subtitle: 'Team members and their roles in the project.',
    defaultOpen: true,
    children: (
      <div style={{ overflowX: 'auto' }} data-testid="wide-scroller">
        <div style={{ width: 1200, padding: 8, border: '1px dashed #999' }}>
          A table wider than the card
        </div>
      </div>
    ),
  },
};
