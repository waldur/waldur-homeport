import type { Meta, StoryObj } from '@storybook/react-vite';

import { AvatarFallback, AvatarImage, AvatarRoot } from './Avatar';

const meta: Meta<typeof AvatarRoot> = {
  title: 'Primitives/Avatar',
  component: AvatarRoot,
  parameters: {
    docs: {
      description: {
        component:
          'Avatar component wrapping Radix Avatar primitive (AvatarRoot, AvatarImage, AvatarFallback) with brand token styling. Gracefully renders initials when an image fails or is unavailable.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof AvatarRoot>;

/**
 * Standard Avatar with fallback initials when no image URL is provided.
 */
export const WithInitials: Story = {
  render: () => (
    <div className="flex gap-4 p-6 items-center">
      <AvatarRoot>
        <AvatarFallback>VM</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot>
        <AvatarFallback>TU</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot>
        <AvatarFallback>AB</AvatarFallback>
      </AvatarRoot>
    </div>
  ),
};

/**
 * Avatar with an image URL, which falls back to initials if the image cannot load.
 */
export const WithImageAndFallback: Story = {
  render: () => (
    <div className="flex gap-4 p-6 items-center">
      {/* Real image */}
      <AvatarRoot>
        <AvatarImage
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
          alt="User Profile"
        />
        <AvatarFallback>UP</AvatarFallback>
      </AvatarRoot>

      {/* Broken image testing fallback */}
      <AvatarRoot>
        <AvatarImage
          src="https://broken-url-example.com/missing.png"
          alt="Fallback"
        />
        <AvatarFallback>JD</AvatarFallback>
      </AvatarRoot>
    </div>
  ),
};

/**
 * Avatar sizes demonstrating standard sizing utility overrides.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 p-6 items-center">
      <AvatarRoot className="size-6 text-[10px]">
        <AvatarFallback>SM</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot className="size-8 text-xs">
        <AvatarFallback>MD</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot className="size-12 text-sm">
        <AvatarFallback>LG</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot className="size-16 text-base">
        <AvatarFallback>XL</AvatarFallback>
      </AvatarRoot>
    </div>
  ),
};
