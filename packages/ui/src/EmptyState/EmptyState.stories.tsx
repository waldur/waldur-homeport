import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { BaseButton } from '../Button';

import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: {
    message: 'No presets match the search.',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Inline and in-dialog "nothing here" text: a muted line (`sm`) or a dashed frame (`md`) with an optional title and action. Lighter than the app\'s `NoResult`, which is for a whole table or page.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-5 max-w-[512px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {};

/** In a dialog section: framed, with a title and a next step. */
export const InDialog: Story = {
  args: {
    title: 'No proposals at this step',
    message: 'No proposal of this round is at this step now.',
    action: (
      <BaseButton variant="tertiary" size="sm" label="Pick another step" />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('No proposal of this round is at this step now.'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Pick another step' }),
    ).toBeVisible();
  },
};

/** Inside a row or a card: one muted line at the size of the text around it. */
export const Inline: Story = {
  args: {
    size: 'sm',
    message: 'Run the scenarios to see what this one checks.',
  },
};
