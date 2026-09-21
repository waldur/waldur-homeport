import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStoryHarness } from '../storyFixtures';

import {
  CenteredCardLayout,
  FullHeroLayout,
  GradientLayout,
  MinimalLayout,
  SplitScreenLayout,
  StackedLayout,
} from './index';

const meta: Meta = {
  title: 'Auth/Layouts/Classic',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Classic login page layouts: Split Screen (hero on right), Centered Card (darkened backdrop with centered credentials card), Minimal (clean and focused, no background photo), Full Hero Overlay (split row with large hero copy), Gradient Background (brand multi-color gradient), and Stacked (hero banner over credentials).',
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

export const SplitScreen: StoryObj = {
  render: () => <SplitScreenLayout />,
};

export const CenteredCard: StoryObj = {
  render: () => <CenteredCardLayout />,
};

export const Minimal: StoryObj = {
  render: () => <MinimalLayout />,
};

export const FullHero: StoryObj = {
  render: () => <FullHeroLayout />,
};

export const Gradient: StoryObj = {
  render: () => <GradientLayout />,
};

export const Stacked: StoryObj = {
  render: () => <StackedLayout />,
};
