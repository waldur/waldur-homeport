import { BuildingsIcon, UserIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImagePlaceholder } from './ImagePlaceholder';

/**
 * ImagePlaceholder provides a fallback container for missing or loading images,
 * avatars, offering logos, and organization graphics.
 */
const meta: Meta<typeof ImagePlaceholder> = {
  title: 'Data Display/ImagePlaceholder',
  component: ImagePlaceholder,
  parameters: {
    docs: {
      description: {
        component:
          'Fallback placeholder container for images, logos, and avatars with automatic proportional typography, rounded or circular shapes, and Tailwind styling.',
      },
    },
  },
  args: {
    width: '40px',
    height: '40px',
    circle: false,
    children: 'WL',
  },
  argTypes: {
    width: { control: 'text' },
    height: { control: 'text' },
    circle: { control: 'boolean' },
    backgroundColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof ImagePlaceholder>;

export const Default: Story = {};

export const Circle: Story = {
  args: {
    circle: true,
    children: 'AB',
  },
};

export const WithIcon: Story = {
  args: {
    width: '48px',
    height: '48px',
    circle: true,
    children: <UserIcon size={24} weight="bold" />,
  },
};

export const OrganizationLogo: Story = {
  args: {
    width: '48px',
    height: '48px',
    circle: false,
    children: <BuildingsIcon size={24} weight="bold" />,
  },
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ImagePlaceholder width="24px" height="24px">
        XS
      </ImagePlaceholder>
      <ImagePlaceholder width="32px" height="32px">
        SM
      </ImagePlaceholder>
      <ImagePlaceholder width="40px" height="40px">
        MD
      </ImagePlaceholder>
      <ImagePlaceholder width="48px" height="48px">
        LG
      </ImagePlaceholder>
      <ImagePlaceholder width="64px" height="64px">
        XL
      </ImagePlaceholder>
      <ImagePlaceholder width="80px" height="80px">
        2XL
      </ImagePlaceholder>
    </div>
  ),
};

export const CircleSizeVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ImagePlaceholder width="24px" height="24px" circle>
        XS
      </ImagePlaceholder>
      <ImagePlaceholder width="32px" height="32px" circle>
        SM
      </ImagePlaceholder>
      <ImagePlaceholder width="40px" height="40px" circle>
        MD
      </ImagePlaceholder>
      <ImagePlaceholder width="48px" height="48px" circle>
        LG
      </ImagePlaceholder>
      <ImagePlaceholder width="64px" height="64px" circle>
        XL
      </ImagePlaceholder>
      <ImagePlaceholder width="80px" height="80px" circle>
        2XL
      </ImagePlaceholder>
    </div>
  ),
};
