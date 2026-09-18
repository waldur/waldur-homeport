import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from '@/core/buttons/BaseButton';
import { NotificationContainer } from '@/NotificationContainer';
import { NotifyService } from '@/store/notify';

const meta: Meta = {
  title: 'Overlays/Toast',
  parameters: {
    docs: {
      description: {
        component:
          'Toast notifications. Each toast is the design system Alert in its floating size, so the card, icon and colours come from AlertItem and the design tokens — switch the Theme toolbar to dark to see light/dark fall out of the token bundle with no second theme definition.',
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <NotificationContainer />
        <Story />
      </>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const Row = ({ children }) => (
  <div className="d-flex flex-wrap gap-4 mb-6">{children}</div>
);

/** Every status, in the plain title-only form most of the app uses today. */
export const Statuses: Story = {
  render: () => (
    <Row>
      <BaseButton
        label="Success"
        variant="success"
        onClick={() => NotifyService.success('Resource was updated.')}
      />
      <BaseButton
        label="Error"
        variant="danger"
        onClick={() => NotifyService.error('Unable to update the resource.')}
      />
      <BaseButton
        label="Warning"
        variant="warning"
        onClick={() =>
          NotifyService.warning(
            'You need to sign in',
            'This invitation link requires a login to proceed.',
          )
        }
      />
      <BaseButton
        label="Info"
        variant="tertiary"
        onClick={() => NotifyService.info('Export has been queued.')}
      />
    </Row>
  ),
};

/** Title plus supporting message — the two-line form from the mock. */
export const WithMessage: Story = {
  render: () => (
    <Row>
      <BaseButton
        label="With message"
        variant="tertiary"
        onClick={() =>
          NotifyService.success(
            "We've just released a new feature",
            "I've finished adding my notes. Happy for us to review whenever you're ready!",
          )
        }
      />
    </Row>
  ),
};

/** Action buttons — new; the previous implementation could not render these. */
export const WithActions: Story = {
  render: () => (
    <Row>
      <BaseButton
        label="With actions"
        variant="tertiary"
        onClick={() =>
          NotifyService.success(
            "We've just released a new feature",
            "I've finished adding my notes. Happy for us to review whenever you're ready!",
            {
              actions: [
                { label: 'Dismiss' },

                {
                  label: 'Reply',
                  primary: true,
                  onClick: () => undefined,
                },
              ],
            },
          )
        }
      />
      <BaseButton
        label="Error with retry"
        variant="danger"
        onClick={() =>
          NotifyService.error('Unable to update the resource.', {
            actions: [
              {
                label: 'Retry',
                primary: true,
                onClick: () => undefined,
              },
            ],
          })
        }
      />
    </Row>
  ),
};

/** A pending toast that turns into success or error in place, rather than stacking a second one. */
export const LoadingTransition: Story = {
  render: () => (
    <Row>
      <BaseButton
        label="Resolves"
        variant="tertiary"
        onClick={() =>
          NotifyService.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            { loading: 'Updating resource…', success: 'Resource was updated.' },
          )
        }
      />
      <BaseButton
        label="Rejects"
        variant="tertiary"
        onClick={() =>
          NotifyService.promise(
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Backend is unavailable.')),
                2000,
              ),
            ),
            { loading: 'Updating resource…', success: 'Resource was updated.' },
          )
        }
      />
    </Row>
  ),
};

/** Repeated failures reuse one id, so the stack shows one toast instead of five. */
export const Deduplicated: Story = {
  render: () => (
    <Row>
      <BaseButton
        label="Fire the same error 5×"
        variant="danger"
        onClick={() =>
          Array.from({ length: 5 }).forEach(() =>
            NotifyService.error('Unable to update the resource.', {
              id: 'resource-update-failed',
            }),
          )
        }
      />
      <BaseButton
        label="Fire 5× without an id"
        variant="tertiary"
        onClick={() =>
          Array.from({ length: 5 }).forEach((_, i) =>
            NotifyService.error(`Unable to update resource ${i + 1}.`),
          )
        }
      />
    </Row>
  ),
};
