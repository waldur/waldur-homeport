import { FunnelSimpleIcon, GearIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BaseButton } from './BaseButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Overlays/Popover',
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          'Radix Popover for the Metronic `menu-sub-dropdown` popups that hold ' +
          'form controls rather than command rows — see Popover.tsx for the ' +
          'menu-vs-popover rule and the Bootstrap parity values.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

/**
 * The case that makes this component necessary: a text input inside the
 * floating panel. Typing here must reach the input. The same content
 * inside a DropdownMenu would route keystrokes to the menu's typeahead
 * instead, which is why the table filter popups cannot migrate to
 * DropdownMenu.
 */
export const WithFormControls: Story = {
  render: () => {
    const [name, setName] = useState('');
    return (
      <div className="p-[40px]">
        <Popover>
          <PopoverTrigger asChild>
            <BaseButton
              size="lg"
              variant="secondary"
              label="Add filter"
              iconNode={<FunnelSimpleIcon weight="bold" />}
            />
          </PopoverTrigger>
          <PopoverContent align="start">
            <div className="flex flex-col gap-[12px]">
              <label
                className="text-sm font-medium text-[var(--surface-text-primary)]"
                htmlFor="popover-story-name"
              >
                Name contains
              </label>
              <input
                id="popover-story-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] px-[10px] py-[6px] text-sm text-[var(--surface-text-primary)]"
                placeholder="Type here…"
              />
              <div className="text-sm text-[var(--surface-text-muted)]">
                Echoed back from React state, to prove the keystrokes actually
                landed: {name.length} character(s), {name}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};

/**
 * BaseButton as a Radix `asChild` trigger — the composition every migrated
 * dropdown depends on. It only works because BaseButton forwards its ref
 * and spreads the trigger props Radix injects; the icon-only variant here
 * additionally routes through BaseButton's own Tooltip, so this exercises
 * the full Trigger -> Tooltip -> button relay described in Tooltip.tsx.
 */
export const BaseButtonAsTrigger: Story = {
  render: () => (
    <div className="flex gap-[16px] p-[40px]">
      <Popover>
        <PopoverTrigger asChild>
          <BaseButton
            size="lg"
            variant="tertiary"
            tooltip="Toggle visible columns"
            iconNode={<GearIcon weight="bold" />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <div className="text-sm">Popover from a tooltipped icon button.</div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <BaseButton size="lg" variant="secondary" label="Actions" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
