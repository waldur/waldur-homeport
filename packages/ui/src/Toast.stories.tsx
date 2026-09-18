import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Toast, ToastProvider, ToastViewport } from './Toast';

const VARIANTS = ['info', 'success', 'warning', 'error'] as const;

/**
 * Every story needs a live ToastProvider/Viewport: Toast.Root, .Close and
 * .Action all read Radix's toast context, which only a Provider ancestor
 * supplies — see src/store/notify.tsx and src/NotificationContainer.tsx in
 * waldur-homeport for the real callable-from-anywhere integration this
 * title's other ('Overlays/Toast') stories exercise; these render the
 * bare, statically-open component instead.
 */
const withToastProvider = (Story: () => ReactNode) => (
  <ToastProvider swipeDirection="right">
    <div className="relative flex max-w-[400px] flex-col gap-3">
      <Story />
    </div>
    <ToastViewport className="static w-auto max-w-none" />
  </ToastProvider>
);

const meta: Meta<typeof Toast> = {
  title: 'Overlays/Toast',
  component: Toast,
  decorators: [withToastProvider],
  parameters: {
    docs: {
      description: {
        component:
          "AlertItem in its floating form, mounted on Radix's Toast.Root for accessibility, auto-dismiss and swipe-to-dismiss.",
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
  },
  args: {
    open: true,
    onOpenChange: () => undefined,
    variant: 'info',
    title: 'Resources are activated on 12 Oct 2026',
  },
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Playground: Story = {};

export const VariantMatrix: Story = {
  render: () => (
    <>
      {VARIANTS.map((variant) => (
        <Toast
          key={variant}
          open
          onOpenChange={() => undefined}
          variant={variant}
          title={`${variant} toast`}
        />
      ))}
    </>
  ),
};

export const SupportingMessage: Story = {
  args: {
    variant: 'success',
    title: "We've just released a new feature",
    message:
      "I've finished adding my notes. Happy for us to review whenever you're ready!",
  },
};

export const ActionButtons: Story = {
  render: () => (
    <>
      <Toast
        open
        onOpenChange={() => undefined}
        variant="success"
        title="We've just released a new feature"
        message="I've finished adding my notes. Happy for us to review whenever you're ready!"
        actions={[{ label: 'Dismiss' }, { label: 'Reply', primary: true }]}
      />
      <Toast
        open
        onOpenChange={() => undefined}
        variant="error"
        title="Unable to update the resource."
        actions={[{ label: 'Retry', primary: true }]}
      />
    </>
  ),
};
