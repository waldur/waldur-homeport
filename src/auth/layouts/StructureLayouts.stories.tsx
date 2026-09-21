import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStoryHarness } from '../storyFixtures';

import { BottomSheetLayout, TabbedLayout, WizardLayout } from './index';

const meta: Meta = {
  title: 'Auth/Layouts/Structure',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Structural variations for the login workflow: Bottom Sheet (mobile-first bottom sheet drawer over top hero section), Tabbed (explicit tabs between Single Sign-On and Local credentials), and Wizard (step-by-step onboarding flow from welcome to authentication selection).',
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

export const BottomSheet: StoryObj = {
  render: () => <BottomSheetLayout />,
};

export const Tabbed: StoryObj = {
  render: () => <TabbedLayout />,
};

export const Wizard: StoryObj = {
  render: () => <WizardLayout />,
};
