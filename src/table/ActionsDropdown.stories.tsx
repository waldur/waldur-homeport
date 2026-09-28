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
 * ActionsDropdown renders row-actions or toolbar dropdown menus.
 */
const meta: Meta<typeof ActionsDropdown> = {
  title: 'Navigation/ActionsDropdown',
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

/**
 * The labelled variant on a filled variant (`primary`), not just the
 * default `tertiary` — the caret's own color used to come from `.svg-icon`'s
 * fixed muted-gray fill, invisible against `tertiary`'s already-dark text
 * but a real mismatch against `primary`'s white text once the toggle
 * stopped emitting `.btn` (confirmed live on ProviderCard's "Enabled"
 * toggle). Exists to keep that regression visible here instead of only on
 * a real admin page behind auth.
 */
export const LabeledPrimary: Story = {
  render: () => (
    <ActionsDropdown labeled label="Enabled" variant="primary">
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

/** Toggle sizes for labeled dropdowns. */
export const LabeledSizes: Story = {
  render: () => (
    <div className="d-flex align-items-center gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ActionsDropdown
          key={size}
          labeled
          label={size}
          size={size}
          className="w-auto"
        >
          {items}
        </ActionsDropdown>
      ))}
    </div>
  ),
};
