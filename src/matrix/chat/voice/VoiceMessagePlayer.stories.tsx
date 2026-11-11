import type { Meta, StoryObj } from '@storybook/react-vite';

import { VoiceMessagePlayer } from './VoiceMessagePlayer';

const meta: Meta<typeof VoiceMessagePlayer> = {
  title: 'Matrix/VoiceMessagePlayer',
  component: VoiceMessagePlayer,
  parameters: {
    docs: {
      description: {
        component:
          'Audio player for voice messages in team chat with a waveform display, ' +
          'play/pause toggle, and duration counter.',
      },
    },
  },
  args: {
    src: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    durationMs: 15_000,
    waveform: [
      120, 240, 500, 800, 950, 600, 400, 300, 700, 900, 1024, 750, 450, 200,
      100, 350, 550, 800, 650, 300, 200, 450, 700, 920, 850, 600, 400, 250, 150,
      300, 600, 850, 700, 400, 250, 500, 750, 600, 350, 150,
    ],
  },
  decorators: [
    (Story) => (
      <div className="p-4 max-w-sm bg-primary border border-secondary rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VoiceMessagePlayer>;

export const Default: Story = {};

export const NoWaveform: Story = {
  args: {
    waveform: undefined,
    durationMs: 42_000,
  },
};

export const ShortClip: Story = {
  args: {
    waveform: [100, 800, 400],
    durationMs: 3_000,
  },
};

export const NarrowContainer: Story = {
  decorators: [
    (Story) => (
      <div className="p-3 max-w-[200px] bg-primary border border-secondary rounded-lg">
        <Story />
      </div>
    ),
  ],
};
