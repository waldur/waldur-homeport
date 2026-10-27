import { TrashIcon, WarningIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BaseButton } from '../Button';
import { Input } from '../Input';

import {
  ModalBody,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalShell,
  type ModalShellProps,
  ModalTitle,
  useModalHide,
} from './Modal';

const meta: Meta<typeof ModalShell> = {
  title: 'Overlays/Modal',
  component: ModalShell,
  parameters: {
    docs: {
      description: {
        component:
          "waldur-homeport's own modal without Bootstrap: ModalShell (Radix Dialog in Bootstrap's scrollable-overlay shape, with sizes, centring, a scrolling body, a static backdrop and a confirm layer) and ModalDialog (the header with icon, title, subtitle and close button, the body and the footer), in the app's px geometry.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ModalShell>;

const Paragraphs = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <p key={index} className="mb-[13px]">
        Allocations are reviewed monthly. Usage above the approved limit is
        billed at the on-demand rate, and a project that stays over its limit
        for a full billing period is moved to the next plan automatically.
      </p>
    ))}
  </>
);

const CancelButton = () => {
  const hide = useModalHide();
  return (
    <BaseButton
      variant="tertiary"
      size="lg"
      label="Cancel"
      onClick={() => hide?.()}
    />
  );
};

/** Opens a ModalShell from a button; `shell` props are passed through. */
const Demo = ({
  label = 'Open modal',
  shell,
  children,
}: {
  label?: string;
  shell?: Partial<ModalShellProps>;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-5">
      <BaseButton
        variant="primary"
        label={label}
        onClick={() => setOpen(true)}
      />
      <ModalShell open={open} onHide={() => setOpen(false)} {...shell}>
        {children}
      </ModalShell>
    </div>
  );
};

/**
 * The usual dialog: title, subtitle, body and a footer of buttons.
 */
export const Default: Story = {
  render: () => (
    <Demo>
      <ModalDialog
        title="Edit project"
        subtitle="Changes apply to every member of the project."
        footer={
          <>
            <CancelButton />
            <BaseButton variant="primary" size="lg" label="Save" />
          </>
        }
      >
        <Input placeholder="Project name" aria-label="Project name" />
      </ModalDialog>
    </Demo>
  ),
};

/**
 * A featured icon over the radial rings, as confirmation dialogs have.
 */
export const WithIcon: Story = {
  render: () => (
    <Demo label="Delete resource" shell={{ size: 'sm' }}>
      <ModalDialog
        iconNode={<TrashIcon weight="bold" />}
        iconColor="danger"
        title="Delete virtual machine"
        subtitle="This cannot be undone."
        footer={
          <>
            <CancelButton />
            <BaseButton variant="danger" size="lg" label="Delete" />
          </>
        }
      >
        The instance and its volumes will be destroyed.
      </ModalDialog>
    </Demo>
  ),
};

/**
 * sm 400px, md 544px (the default width), lg 840px from 992px and xl
 * 1140px from 1200px.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-1.5">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Demo key={size} label={`Open ${size}`} shell={{ size }}>
          <ModalDialog title={`Size ${size}`}>
            <Paragraphs count={2} />
          </ModalDialog>
        </Demo>
      ))}
    </div>
  ),
};

/**
 * In a scrollable dialog (the default) the header and footer stay put and
 * only the body scrolls, even with a <form> wrapped around the dialog.
 */
export const ScrollableBody: Story = {
  render: () => (
    <Demo shell={{ size: 'lg' }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <ModalDialog
          title="Terms of service"
          footer={
            <>
              <CancelButton />
              <BaseButton
                type="submit"
                variant="primary"
                size="lg"
                label="Accept"
              />
            </>
          }
        >
          <Paragraphs count={30} />
        </ModalDialog>
      </form>
    </Demo>
  ),
};

/**
 * Not scrollable: the whole page-sized overlay scrolls instead.
 */
export const ScrollingOverlay: Story = {
  render: () => (
    <Demo shell={{ scrollable: false }}>
      <ModalDialog title="Release notes">
        <Paragraphs count={30} />
      </ModalDialog>
    </Demo>
  ),
};

/**
 * A static backdrop: a click outside does not close the dialog, nor does
 * Escape with `keyboard={false}`.
 */
export const StaticBackdrop: Story = {
  render: () => (
    <Demo shell={{ backdrop: 'static', keyboard: false }}>
      <ModalDialog
        title="Upgrade in progress"
        closeButton={false}
        footer={<CancelButton />}
      >
        Closing only from the footer.
      </ModalDialog>
    </Demo>
  ),
};

const ConfirmOverModal = () => {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <ModalDialog
        title="Edit project"
        footer={
          <>
            <CancelButton />
            <BaseButton
              variant="danger"
              size="lg"
              label="Remove"
              onClick={() => setConfirming(true)}
            />
          </>
        }
      >
        <Paragraphs count={1} />
      </ModalDialog>
      <ModalShell
        open={confirming}
        onHide={() => setConfirming(false)}
        size="sm"
        layer="confirm"
      >
        <ModalDialog
          iconNode={<WarningIcon weight="bold" />}
          iconColor="warning"
          title="Remove the project?"
          footer={
            <>
              <CancelButton />
              <BaseButton variant="danger" size="lg" label="Remove" />
            </>
          }
        >
          Its resources stay with the organization.
        </ModalDialog>
      </ModalShell>
    </>
  );
};

/**
 * A `layer="confirm"` dialog stacks over an open modal, with its own
 * backdrop over the first dialog.
 */
export const ConfirmLayer: Story = {
  render: () => (
    <Demo>
      <ConfirmOverModal />
    </Demo>
  ),
};

/**
 * The parts on their own, for a layout ModalDialog doesn't cover.
 */
export const Composed: Story = {
  render: () => (
    <Demo>
      <ModalHeader closeButton className="pb-0">
        <ModalTitle as="h2" className="text-[16.25px]">
          Production Web
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Paragraphs count={1} />
      </ModalBody>
      <ModalFooter>
        <CancelButton />
      </ModalFooter>
    </Demo>
  ),
};
