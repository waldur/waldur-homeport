import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';

import { AttachmentCard, AttachmentCardList } from './AttachmentCard';

/** One file in a list of attachments: thumbnail, name, meta line and actions. */
const meta: Meta<typeof AttachmentCard> = {
  title: 'Forms/AttachmentCard',
  component: AttachmentCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    thumb: <FileIcon size={22} weight="bold" />,
    title: 'quarterly-report.pdf',
    subtitle: '1.2 MB - 09.11.2026 10:24',
    actions: (
      <BaseButton
        iconNode={<TrashIcon weight="bold" />}
        tooltip="Delete attachment"
        variant="text-danger"
        size="sm"
      />
    ),
  },
};
export default meta;

type Story = StoryObj<typeof AttachmentCard>;

export const Default: Story = {};

/** The border thickens to two pixels without the card changing size. */
export const Error: Story = {
  args: {
    error: true,
    title: 'Upload failed, please try again',
    subtitle: 'quarterly-report.pdf',
  },
};

/** Shown while a delete is in flight. */
export const Busy: Story = {
  args: { overlay: <LoadingSpinner /> },
};

export const List: Story = {
  render: (args) => (
    <AttachmentCardList>
      <li>
        <AttachmentCard {...args} />
      </li>
      <li>
        <AttachmentCard {...args} title="budget.xlsx" subtitle="48 KB" />
      </li>
      <li>
        <AttachmentCard {...args} error title="notes.txt" subtitle="2 KB" />
      </li>
    </AttachmentCardList>
  ),
};
