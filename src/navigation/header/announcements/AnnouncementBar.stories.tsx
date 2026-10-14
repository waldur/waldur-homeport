import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  WrenchIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AnnouncementBar } from './AnnouncementBar';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const getBar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-variant]');

const meta: Meta<typeof AnnouncementBar> = {
  title: 'Navigation/AnnouncementBar',
  component: AnnouncementBar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 160 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    icon: WarningCircleIcon,
    variant: 'warning',
  },
};

export default meta;
type Story = StoryObj<typeof AnnouncementBar>;

export const Warning: Story = {
  args: {
    label: 'Offering paused',
    hasColon: true,
    description: 'New orders are not accepted until the provider resumes it.',
    colored: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Offering paused/)).toBeVisible();
    const bar = getBar(canvasElement);
    await expect(bar).toHaveAttribute('data-variant', 'warning');
    await expect(getComputedStyle(bar!).backgroundColor).not.toBe(TRANSPARENT);
  },
};

export const Danger: Story = {
  args: {
    icon: XCircleIcon,
    variant: 'danger',
    label: 'Order failed',
    hasColon: true,
    description: 'The provider rejected the request: quota exceeded.',
    colored: true,
  },
  play: async ({ canvasElement }) => {
    await expect(
      getComputedStyle(getBar(canvasElement)!).backgroundColor,
    ).not.toBe(TRANSPARENT);
  },
};

export const Success: Story = {
  args: {
    icon: CheckCircleIcon,
    variant: 'success',
    label: 'Resource is ready',
    hasColon: true,
    description: 'Provisioning finished and the resource is now available.',
    colored: true,
  },
  play: async ({ canvasElement }) => {
    await expect(
      getComputedStyle(getBar(canvasElement)!).backgroundColor,
    ).not.toBe(TRANSPARENT);
  },
};

/** Without `colored` the bar sits on the plain body background. */
export const Uncolored: Story = {
  args: {
    icon: InfoIcon,
    variant: 'neutral',
    label: 'Heads up',
    hasColon: true,
    description: 'Usage reports are recalculated every night at 02:00 UTC.',
  },
  play: async ({ canvasElement }) => {
    await expect(getBar(canvasElement)).toHaveClass('bg-primary');
  },
};

/** An admin maintenance announcement, as rendered by AnnouncementGroup. */
export const MaintenanceAnnouncement: Story = {
  args: {
    icon: WrenchIcon,
    variant: 'warning',
    title: 'Storage cluster upgrade',
    provider: 'University HPC Centre',
    description:
      'Block storage will be read-only between 22:00 and 23:30 on Friday. See the [status page](https://status.example.com) for details.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Storage cluster upgrade/)).toBeVisible();
    await expect(canvas.getByText(/By University HPC Centre/)).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'status page' }),
    ).toHaveAttribute('href', 'https://status.example.com');
  },
};

const onAction = fn();

export const WithAction: Story = {
  args: {
    label: 'Pending consent',
    hasColon: true,
    description: 'Accept the terms of service to keep using this offering.',
    colored: true,
    actionLabel: 'Review terms',
    onAction,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Review terms' }));
    await expect(onAction).toHaveBeenCalledOnce();
  },
};

const onShowMore = fn();

/** Long text is cut to one line; "Show more" appears only when it overflows. */
export const TruncatedWithShowMore: Story = {
  args: {
    icon: WrenchIcon,
    title: 'Network maintenance',
    description:
      'Core switches in both availability zones will be replaced. Expect short connectivity drops of up to two minutes per instance while traffic fails over between the redundant uplinks. Floating IPs and security groups are not affected.',
    ellipsis: true,
    onShowMore,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // "Show more" appears when the truncated text overflows; the check runs
    // at mount and again after 100ms.
    const showMore = await canvas.findByRole('button', { name: /Show more/ });
    await userEvent.click(showMore);
    await expect(onShowMore).toHaveBeenCalledOnce();
  },
};

export const ShortTextHidesShowMore: Story = {
  args: {
    icon: InfoIcon,
    variant: 'neutral',
    title: 'Reminder',
    description: 'Office hours on Thursday.',
    ellipsis: true,
    onShowMore: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The truncation check re-runs after 100ms; give it time before asserting.
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(
      canvas.queryByRole('button', { name: /Show more/ }),
    ).toBeNull();
  },
};

export const Stacked: Story = {
  render: () => (
    <>
      <AnnouncementBar
        icon={XCircleIcon}
        variant="danger"
        label="Order failed"
        hasColon
        description="Quota exceeded."
        colored
      />
      <AnnouncementBar
        icon={WarningCircleIcon}
        variant="warning"
        label="Offering paused"
        hasColon
        description="New orders are not accepted."
        colored
      />
      <AnnouncementBar
        icon={InfoIcon}
        variant="neutral"
        title="Reminder"
        description="Office hours on Thursday."
      />
    </>
  ),
};
