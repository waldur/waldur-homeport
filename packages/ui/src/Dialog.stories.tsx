import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BaseButton } from './BaseButton';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Overlays/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          'Modal Dialog primitive built on @radix-ui/react-dialog with backdrop blur, centered auto-margin layout, keyframe entrance/exit animation, and full keyboard/screen-reader accessibility.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

/**
 * Standard confirmation modal dialog with Trigger, Title, Description, and action buttons.
 */
export const ConfirmationModal: Story = {
  render: () => (
    <div className="p-6">
      <Dialog>
        <DialogTrigger asChild>
          <BaseButton variant="primary" label="Open Confirmation Dialog" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Project Allocation</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this resource allocation request?
              This action will provision resources in the target cloud provider.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <BaseButton variant="secondary" label="Cancel" />
            </DialogClose>
            <DialogClose asChild>
              <BaseButton variant="primary" label="Approve Allocation" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

/**
 * Destructive action modal dialog with error/danger styling.
 */
export const DestructiveDialog: Story = {
  render: () => (
    <div className="p-6">
      <Dialog>
        <DialogTrigger asChild>
          <BaseButton variant="danger" label="Delete Resource" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Virtual Machine</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently destroy the
              virtual machine instance and purge associated storage volumes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <BaseButton variant="secondary" label="Keep Instance" />
            </DialogClose>
            <DialogClose asChild>
              <BaseButton variant="danger" label="Permanently Delete" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

/**
 * Dialog containing form inputs with state management.
 */
export const FormDialog: Story = {
  render: () => {
    const [name, setName] = useState('');
    return (
      <div className="p-6">
        <Dialog>
          <DialogTrigger asChild>
            <BaseButton variant="secondary" label="Create New Project" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
              <DialogDescription>
                Provide project credentials and description for organizational
                tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 my-2">
              <label
                htmlFor="dialog-proj-name"
                className="text-xs font-semibold text-[var(--surface-text-primary)]"
              >
                Project Name
              </label>
              <input
                id="dialog-proj-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HPC Research Q4"
                className="rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] px-3 py-2 text-sm text-[var(--surface-text-primary)] outline-hidden focus:border-[var(--waldur-brand-color)]"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <BaseButton variant="secondary" label="Cancel" />
              </DialogClose>
              <DialogClose asChild>
                <BaseButton
                  variant="primary"
                  label="Create Project"
                  disabled={!name.trim()}
                  tooltip="Please enter a project name"
                />
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
