import {
  CloudArrowUpIcon,
  InfoIcon,
  LifebuoyIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconSquare } from './IconSquare';

/**
 * A bordered square around an icon: an empty state's or an error's
 * illustration, an announcement's or a card's leading icon. `md` (40px,
 * 20px icon) and `lg` (48px, 24px icon); a caller adds a colour pair
 * through `className`, and `asChild` draws it on a button.
 */
const meta: Meta<typeof IconSquare> = {
  title: 'Data Display/Icon square',
  component: IconSquare,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof IconSquare>;

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconSquare>
        <InfoIcon weight="bold" />
      </IconSquare>
      <IconSquare size="lg">
        <WarningCircleIcon weight="bold" />
      </IconSquare>
      <IconSquare size="lg" className="bg-brand-subtle text-brand">
        <LifebuoyIcon weight="bold" />
      </IconSquare>
    </div>
  ),
};

export const OnAButton: Story = {
  render: () => (
    <IconSquare asChild>
      <button type="button" aria-label="Choose a file">
        <CloudArrowUpIcon weight="bold" />
      </button>
    </IconSquare>
  ),
};
