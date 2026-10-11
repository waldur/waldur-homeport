import { CaretDownIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './Collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'Data Display/Collapsible',
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          'A single show/hide panel on Radix Collapsible. Unstyled apart from the slide, so the caller owns the look. `keepMounted` keeps the children mounted (hidden) while closed — needed for form fields, whose values and validation would otherwise be dropped.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Collapsible>;

const Panel = ({ keepMounted }: { keepMounted?: boolean }) => (
  <div className="max-w-sm bg-[var(--surface-page-bg)] p-6">
    <Collapsible
      keepMounted={keepMounted}
      className="rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] text-[var(--surface-text-primary)]"
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between px-6 py-5 text-sm font-semibold">
        Advanced settings
        <CaretDownIcon
          size={16}
          weight="bold"
          aria-hidden="true"
          className="transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 px-6 pb-5 text-sm">
          <label htmlFor={`note-${keepMounted}`}>Note</label>
          <input
            id={`note-${keepMounted}`}
            className="rounded-md border border-[var(--surface-card-border)] px-3 py-2"
            placeholder="Type, collapse, reopen"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
);

/**
 * Default: animated, and the panel's children unmount while closed — text
 * typed into the field is lost when you collapse and reopen.
 */
export const Default: Story = {
  render: () => <Panel />,
};

/**
 * `keepMounted`: children stay mounted and hidden while closed, so the typed
 * text survives collapse and reopen. Slides via a grid-row transition.
 */
export const KeepMounted: Story = {
  render: () => <Panel keepMounted />,
};
