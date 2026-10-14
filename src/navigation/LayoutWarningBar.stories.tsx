import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { BaseButton } from 'waldur-ui';

import { LayoutWarningBar } from './LayoutWarningBar';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const getBar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-variant]');

const meta: Meta<typeof LayoutWarningBar> = {
  title: 'Navigation/LayoutWarningBar',
  component: LayoutWarningBar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-primary" style={{ minHeight: 160 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LayoutWarningBar>;

export const Warning: Story = {
  args: {
    title: 'Grace period active:',
    children:
      'This project ended on 01.10.2026. Resources will remain active until 15.10.2026.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Grace period active:')).toBeVisible();
    await expect(
      canvas.getByText(/Resources will remain active until/),
    ).toBeVisible();

    // Status tint is applied (guards against the arbitrary-value classes
    // not being generated or being overridden by Bootstrap).
    const bar = getBar(canvasElement);
    await expect(bar).toHaveAttribute('data-variant', 'warning');
    await expect(getComputedStyle(bar!).backgroundColor).not.toBe(TRANSPARENT);
  },
};

const onRecover = fn();

export const WithAction: Story = {
  args: {
    title: 'Project Removed:',
    children:
      'This project has been removed. All resources have been terminated and user roles have been revoked.',
    actions: (
      <BaseButton
        label="Recover Project"
        iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
        variant="warning"
        size="sm"
        onClick={onRecover}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Recover Project' });
    await expect(button).toBeVisible();

    // Action sits at the far end of the row, after the message.
    const message = canvas.getByText(/This project has been removed/);
    await expect(
      message.compareDocumentPosition(button) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.click(button);
    await expect(onRecover).toHaveBeenCalledOnce();
  },
};

export const TertiaryAction: Story = {
  args: {
    title: 'Action required for some accounts.',
    children: 'You have 3 accounts that require attention to complete setup.',
    actions: <BaseButton variant="tertiary" label="View accounts" size="sm" />,
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Restricted access:',
    children: 'You can view this organization but cannot make any changes.',
  },
  play: async ({ canvasElement }) => {
    const bar = getBar(canvasElement);
    await expect(bar).toHaveAttribute('data-variant', 'danger');
    await expect(getComputedStyle(bar!).backgroundColor).not.toBe(TRANSPARENT);
  },
};

/** The permission banner (auth/WarningBar): centred text, no icon. */
export const CenteredWithoutIcon: Story = {
  args: {
    title: 'Limited access:',
    children: 'Some actions are unavailable for your role in this project.',
    icon: null,
    centered: true,
  },
  play: async ({ canvasElement }) => {
    const bar = getBar(canvasElement);
    await expect(bar!.querySelector('.featured-icon, svg')).toBeNull();
  },
};

export const MessageOnly: Story = {
  args: {
    children: 'Announcements could not be loaded.',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('strong')).toBeNull();
  },
};

export const LongMessageWraps: Story = {
  args: {
    title: 'Project expired:',
    children:
      'This project expired on 01.10.2026. Active resources are scheduled for termination. Contact your organization owner to extend the end date or move the resources to another project before they are removed permanently.',
    actions: <BaseButton variant="tertiary" label="Contact owner" size="sm" />,
  },
  globals: { viewport: 'mobile' },
};

export const Stacked: Story = {
  render: () => (
    <>
      <LayoutWarningBar
        variant="danger"
        title="Restricted access:"
        icon={null}
        centered
      >
        You can view this organization but cannot make any changes.
      </LayoutWarningBar>
      <LayoutWarningBar title="Grace period active:">
        Resources will remain active until 15.10.2026.
      </LayoutWarningBar>
    </>
  ),
};
