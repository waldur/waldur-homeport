import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStoryHarness } from '../storyFixtures';

import { CarouselLayout, NewsLayout, StatsLayout } from './index';

const meta: Meta = {
  title: 'Auth/Layouts/Content',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Content-rich landing and login layouts: Stats (showcasing platform scale, active users, uptime, and organizations), News (displaying release notes and announcement cards beside sign-in), and Carousel (rotating marketing and capability slides with auto-play indicators).',
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

export const Stats: StoryObj = {
  render: () => <StatsLayout />,
};

export const News: StoryObj = {
  render: () => <NewsLayout />,
};

export const Carousel: StoryObj = {
  render: () => <CarouselLayout />,
};
