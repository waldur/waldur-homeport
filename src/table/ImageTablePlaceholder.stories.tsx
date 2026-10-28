import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from 'waldur-ui';

import { ImageTablePlaceholder } from './ImageTablePlaceholder';

/**
 * `ImageTablePlaceholder` is an empty state with an illustration: a centred
 * column, a third of the width from `sm` up and full width below.
 */
const meta: Meta<typeof ImageTablePlaceholder> = {
  title: 'Tables/ImageTablePlaceholder',
  component: ImageTablePlaceholder,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ImageTablePlaceholder>;

export const Default: Story = {
  args: {
    illustration: (
      <div
        aria-hidden
        className="h-40 w-full rounded-md bg-tertiary border-[1px] border-secondary"
      />
    ),
    title: 'No resources yet',
    description: 'Resources you order from the marketplace show up here.',
    action: <BaseButton variant="tertiary" label="Go to marketplace" />,
  },
};
