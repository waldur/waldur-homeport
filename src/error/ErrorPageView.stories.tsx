import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorPageView } from './ErrorPageView';

const meta: Meta<typeof ErrorPageView> = {
  title: 'Feedback/ErrorPageView',
  component: ErrorPageView,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ErrorPageView>;

export const NotFound: Story = {
  args: {
    code: '404',
    altTitle: 'Page is not found',
    altDescription: 'The URL may be incorrect, or the feature may be disabled.',
  },
};

export const NotFoundMobile: Story = {
  ...NotFound,
  globals: { viewport: { value: 'mobile' } },
};

export const ServerError: Story = {
  args: { code: '500' },
};

export const FeatureDisabled: Story = {
  args: {
    code: '404',
    altTitle: 'This feature is disabled',
    altDescription:
      'The page you are trying to reach belongs to a feature that is not enabled in this deployment. Contact an administrator to enable it.',
  },
};
