import { TagIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Data Display/Tag',
  component: Tag,
  parameters: {
    docs: {
      description: {
        component:
          'A compact chip for categorization, filters, multi-value select items, and metadata tags. Supports three sizes, custom removal callbacks, and click interactions.',
      },
    },
  },
  args: {
    children: 'Tag text',
  },
  argTypes: {
    size: {
      control: 'select',
      options: [undefined, 'sm', 'lg'],
      description: 'Size variant of the tag chip',
    },
    onClick: { action: 'clicked' },
    onClear: { action: 'cleared' },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    children: 'Basic Tag',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Tag size="sm">Small (12px / sm)</Tag>
      <Tag>Default (14px / base)</Tag>
      <Tag size="lg">Large (14px / lg padding)</Tag>
    </div>
  ),
};

export const Clearable: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Tag size="sm" onClear={fn()} clearLabel="Remove small tag">
        Small Clearable
      </Tag>
      <Tag onClear={fn()} clearLabel="Remove default tag">
        Default Clearable
      </Tag>
      <Tag size="lg" onClear={fn()} clearLabel="Remove large tag">
        Large Clearable
      </Tag>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Tag size="sm" onClick={fn()}>
        Clickable small
      </Tag>
      <Tag onClick={fn()}>Clickable default</Tag>
      <Tag size="lg" onClick={fn()}>
        Clickable large
      </Tag>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Tag size="sm">
        <TagIcon size={12} weight="bold" />
        Filter tag
      </Tag>
      <Tag>
        <TagIcon size={14} weight="bold" />
        Category
      </Tag>
    </div>
  ),
};
