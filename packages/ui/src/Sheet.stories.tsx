import type { Meta, StoryObj } from '@storybook/react-vite';

import { BaseButton } from './BaseButton';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Overlays/Sheet',
  component: Sheet,
  parameters: {
    docs: {
      description: {
        component:
          'Slide-in Sheet / Drawer primitive built on Radix Dialog. Used for sidebar mobile menus, filter panels, and detail drawers with smooth entrance transitions.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Sheet>;

/**
 * Standard right-side slide-in drawer panel.
 */
export const RightDrawer: Story = {
  render: () => (
    <div className="p-6">
      <Sheet>
        <SheetTrigger asChild>
          <BaseButton variant="secondary" label="Open Right Drawer" />
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Resource Properties</SheetTitle>
            <SheetDescription>
              Detailed metadata and provisioning state for the selected item.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-4 text-sm text-[var(--surface-text-secondary)]">
            <div className="rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] p-3">
              <div className="font-medium text-[var(--surface-text-primary)]">
                Instance UUID
              </div>
              <div className="font-mono text-xs text-[var(--surface-text-muted)] mt-1">
                9c42b10a-48d1-4cb3-a7bb-1294dbe8a901
              </div>
            </div>
            <div className="rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] p-3">
              <div className="font-medium text-[var(--surface-text-primary)]">
                Network Interfaces
              </div>
              <div className="text-xs text-[var(--surface-text-muted)] mt-1">
                eth0 (10.0.0.15/24)
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <BaseButton variant="secondary" label="Close" />
            </SheetClose>
            <SheetClose asChild>
              <BaseButton variant="primary" label="Save Changes" />
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

/**
 * Left-side navigation drawer (matches mobile sidebar behavior).
 */
export const LeftNavigationDrawer: Story = {
  render: () => (
    <div className="p-6">
      <Sheet>
        <SheetTrigger asChild>
          <BaseButton variant="primary" label="Open Navigation Sheet" />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Waldur Cloud</SheetTitle>
            <SheetDescription>Main navigation menu</SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-2">
            <div className="rounded-md px-3 py-2 text-sm font-medium bg-[var(--surface-hover-bg)] text-[var(--surface-text-primary)]">
              Dashboard
            </div>
            <div className="rounded-md px-3 py-2 text-sm font-medium text-[var(--surface-text-secondary)] hover:bg-[var(--surface-hover-bg)]">
              Marketplace
            </div>
            <div className="rounded-md px-3 py-2 text-sm font-medium text-[var(--surface-text-secondary)] hover:bg-[var(--surface-hover-bg)]">
              Organizations
            </div>
            <div className="rounded-md px-3 py-2 text-sm font-medium text-[var(--surface-text-secondary)] hover:bg-[var(--surface-hover-bg)]">
              Settings
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

/**
 * Bottom slide-up panel.
 */
export const BottomSheet: Story = {
  render: () => (
    <div className="p-6">
      <Sheet>
        <SheetTrigger asChild>
          <BaseButton variant="tertiary" label="Open Bottom Drawer" />
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-96">
          <SheetHeader>
            <SheetTitle>Export Queue</SheetTitle>
            <SheetDescription>
              Background export tasks scheduled for download.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 text-sm text-[var(--surface-text-secondary)]">
            No active downloads in progress.
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
};
