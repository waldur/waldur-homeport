import type { Meta, StoryObj } from '@storybook/react-vite';

import { UploadContainer } from './UploadContainer';

/** The drop zone for a file field: drag a file onto it, or click to browse. */
const meta: Meta<typeof UploadContainer> = {
  title: 'Forms/UploadContainer',
  component: UploadContainer,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof UploadContainer>;

export const Default: Story = {
  args: { onDrop: () => undefined },
};

export const Disabled: Story = {
  args: { onDrop: () => undefined, disabled: true },
};
