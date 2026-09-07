import {
  ArchiveIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BaseButton } from './BaseButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Overlays/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Radix DropdownMenu primitive styled with Waldur surface tokens. Supports roving-tabindex keyboard navigation, typeahead, nested submenus, radio groups, and destructive actions.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

/**
 * Standard action menu with items, icons, and a destructive action.
 */
export const StandardActions: Story = {
  render: () => (
    <div className="p-12">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <BaseButton
            variant="secondary"
            size="sm"
            label="Actions"
            iconNode={<DotsThreeVerticalIcon weight="bold" />}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Manage Resource</DropdownMenuLabel>
          <DropdownMenuItem>
            <PencilSimpleIcon size={14} weight="bold" className="mr-2" />
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CopyIcon size={14} weight="bold" className="mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArchiveIcon size={14} weight="bold" className="mr-2" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <TrashIcon size={14} weight="bold" className="mr-2" />
            Delete resource
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

/**
 * Nested submenus with DropdownMenuSub, DropdownMenuSubTrigger, and DropdownMenuSubContent.
 */
export const NestedSubmenus: Story = {
  render: () => (
    <div className="p-12">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <BaseButton variant="secondary" label="More Options" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem>Quick Action</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export As</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>PDF Report</DropdownMenuItem>
              <DropdownMenuItem>CSV Spreadsheet</DropdownMenuItem>
              <DropdownMenuItem>JSON Payload</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Access</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Project Admin</DropdownMenuItem>
              <DropdownMenuItem>Team Member</DropdownMenuItem>
              <DropdownMenuItem>Read Only</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Remove Access
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

/**
 * Radio group selection using DropdownMenuRadioGroup and DropdownMenuRadioItem.
 */
export const RadioGroupSelection: Story = {
  render: () => {
    const [theme, setTheme] = useState('system');
    return (
      <div className="p-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <BaseButton variant="tertiary" label={`Theme: ${theme}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Interface Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">
                  Light Theme
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  Dark Theme
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  System Preference
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
};
