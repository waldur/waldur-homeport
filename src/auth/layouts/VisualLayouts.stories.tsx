import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStoryHarness } from '../storyFixtures';

import {
  AnimatedGradientLayout,
  GlassmorphismLayout,
  NeumorphismLayout,
  RightSplitLayout,
  VideoBackgroundLayout,
} from './index';

const meta: Meta = {
  title: 'Auth/Layouts/Visual',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visual and background-centric login page layouts: Right Split (reversed two-column split with hero on left), Glassmorphism (frosted glass card over photo backdrop with high-contrast text), Neumorphism (soft extruded shadows), Animated Gradient (fluid continuous multi-stop background shift), and Video Background (cinematic video loop with image fallback).',
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

export const RightSplit: StoryObj = {
  render: () => <RightSplitLayout />,
};

export const Glassmorphism: StoryObj = {
  render: () => <GlassmorphismLayout />,
};

export const Neumorphism: StoryObj = {
  render: () => <NeumorphismLayout />,
};

export const AnimatedGradient: StoryObj = {
  render: () => <AnimatedGradientLayout />,
};

export const VideoBackground: StoryObj = {
  render: () => <VideoBackgroundLayout />,
};
