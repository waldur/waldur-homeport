import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStoryHarness } from '../storyFixtures';

import {
  BrandPatternLayout,
  DiagonalLayout,
  DuotoneLayout,
  LogoWatermarkLayout,
} from './index';

const meta: Meta = {
  title: 'Auth/Layouts/Brand',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Brand-focused login layouts: Logo Watermark (subtle background brand mark watermark), Brand Pattern (repeating brand SVG geometric dot matrix), Duotone (grayscale photo tinted with the dynamic brand accent color), and Diagonal (striking diagonal color-split geometry).',
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

export const LogoWatermark: StoryObj = {
  render: () => <LogoWatermarkLayout />,
};

export const BrandPattern: StoryObj = {
  render: () => <BrandPatternLayout />,
};

export const Duotone: StoryObj = {
  render: () => <DuotoneLayout />,
};

export const Diagonal: StoryObj = {
  render: () => <DiagonalLayout />,
};
