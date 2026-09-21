import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStoryHarness } from '../storyFixtures';

import { SeasonalLayout, TimeBasedLayout, WeatherLayout } from './index';

const meta: Meta = {
  title: 'Auth/Layouts/Dynamic',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Time, seasonal, and weather-aware dynamic login layouts: Time Based (adapts gradient and greeting from Morning to Night), Seasonal (adapts palette and animated particle shapes per season — petals, sun rays, leaves, snowflakes), and Weather (adaptive ambiance with atmospheric precipitation animations).',
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthStoryHarness>
        <Story />
      </AuthStoryHarness>
    ),
  ],
};

export default meta;

export const TimeBased: StoryObj = {
  render: () => <TimeBasedLayout />,
};

export const Seasonal: StoryObj = {
  render: () => <SeasonalLayout />,
};

export const Weather: StoryObj = {
  render: () => <WeatherLayout />,
};
