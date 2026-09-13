import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tooltip } from './Tooltip';

/**
 * Built for visual parity with src/core/Tooltip.tsx's Tip (react-bootstrap)
 * — see Tooltip.tsx's header comment for the cross-check methodology.
 */
const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  args: {
    children: <button>Hover me</button>,
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

/** Default theme='dark' inverts with the app's own light/dark mode — see
 * Tooltip.tsx's theme prop comment. Toggle Storybook's theme toolbar to see it. */
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

export const AutoWidth: Story = {
  args: {
    label:
      'A much longer label that would normally wrap at the default 200px cap',
    autoWidth: true,
  },
};

/** theme='light' stays a fixed dark bubble regardless of app mode — matches
 * CallCard.tsx, Tip's one real theme='light' call site. */
export const FixedDarkTheme: Story = {
  args: {
    label: 'Always dark, regardless of app theme',
    theme: 'light',
  },
};

export const ClickTrigger: Story = {
  args: {
    label: 'Click-triggered content',
    body: 'Dismisses on outside click or Escape, like Tip trigger="click" rootClose',
    trigger: 'click',
    children: <button>Click me</button>,
  },
};
