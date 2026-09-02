import {
  ArrowsClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { ActionItem } from '@/resource/actions/ActionItem';

import { ActionsDropdown } from './ActionsDropdown';

/**
 * The row-actions menu — the single highest-leverage component in the
 * Metronic/react-bootstrap -> Radix dropdown migration: `ActionsDropdown`
 * is reachable from ~184 files and `ActionItem` from ~520, so rewriting
 * these two internally converts the bulk of the app's dropdowns without
 * touching a call site.
 *
 * These stories exist to make that rewrite verifiable: they render the
 * menu open so its computed styles (item padding, font, hover fill, icon
 * sizing, panel radius/shadow) can be measured and compared against the
 * Bootstrap values recorded in docs/tailwind-shadcn-migration-notes.md.
 */
const meta: Meta<typeof ActionsDropdown> = {
  title: 'Table/ActionsDropdown',
  component: ActionsDropdown,
  parameters: {
    docs: {
      description: {
        component:
          'Row-actions menu. `open` renders the menu contents; the story ' +
          'wrapper leaves room below the trigger so the panel is visible.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-10" style={{ minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ActionsDropdown>;

const items = (
  <>
    <ActionItem
      title="Edit"
      action={() => undefined}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
    <ActionItem
      title="Refresh"
      action={() => undefined}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
    <ActionItem
      title="Delete"
      action={() => undefined}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  </>
);

/** The default icon-only (three dots) trigger. */
export const Dots: Story = {
  render: () => <ActionsDropdown>{items}</ActionsDropdown>,
};

/** The labelled variant, used where the toolbar has room for a caption. */
export const Labeled: Story = {
  render: () => (
    <ActionsDropdown labeled label="Actions">
      {items}
    </ActionsDropdown>
  ),
};

/** A disabled action carrying its explanatory tooltip, plus a staff-only row. */
export const DisabledAndStaffItems: Story = {
  render: () => (
    <ActionsDropdown labeled label="Actions">
      <ActionItem
        title="Edit"
        action={() => undefined}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      <ActionItem
        title="Delete"
        action={() => undefined}
        iconNode={<TrashIcon weight="bold" />}
        disabled
        tooltip="Resource is still provisioning"
      />
      <ActionItem title="Force destroy" action={() => undefined} staff />
    </ActionsDropdown>
  ),
};

/** Grouped actions — ActionGroup renders the section caption. */
export const Grouped: Story = {
  render: () => (
    <ActionsDropdown labeled label="Actions">
      <ActionGroup title="Lifecycle">
        <ActionItem
          title="Restart"
          action={() => undefined}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
        />
      </ActionGroup>
      <ActionGroup title="Danger zone">
        <ActionItem
          title="Delete"
          action={() => undefined}
          iconNode={<TrashIcon weight="bold" />}
          className="text-danger"
        />
      </ActionGroup>
    </ActionsDropdown>
  ),
};

/** The loading and empty states ActionsDropdown renders on its own. */
export const LoadingState: Story = {
  render: () => <ActionsDropdown labeled label="Actions" loading />,
};

export const EmptyState: Story = {
  render: () => <ActionsDropdown labeled label="Actions" />,
};
