import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  args: {
    children: <button>Hover me</button>,
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

/** Default theme='dark' inverts with the app's light/dark mode. */
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

/** theme='light' stays a fixed dark bubble regardless of app theme. */
export const FixedDarkTheme: Story = {
  args: {
    label: 'Always dark, regardless of app theme',
    theme: 'light',
  },
};

export const ClickTrigger: Story = {
  args: {
    label: 'Click-triggered content',
    body: 'Dismisses on outside click or Escape',
    trigger: 'click',
    children: <button>Click me</button>,
  },
};
