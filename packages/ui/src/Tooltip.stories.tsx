import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tooltip } from './Tooltip';

/**
 * Built for visual parity with src/core/Tooltip.tsx's Tip (react-bootstrap)
 * — see Tooltip.tsx's header comment for the cross-check methodology.
 */
const meta: Meta<typeof Tooltip> = {
  title: 'Migration/Tooltip',
  component: Tooltip,
  args: {
    children: <button>Hover me</button>,
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const LabelOnly: Story = {
  args: {
    label: 'Example label',
  },
};

export const WithBody: Story = {
  args: {
    label: 'Example label',
    body: 'Extra detail body text',
  },
};
