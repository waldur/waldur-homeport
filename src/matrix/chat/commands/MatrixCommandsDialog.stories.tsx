import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ModalProvider } from '@/modal/ModalContext';

import { ComposerCommand } from './composerCommands';
import { MatrixCommandsDialog } from './MatrixCommandsDialog';

const MOCK_AVAILABLE_COMMANDS: ComposerCommand[] = [
  {
    name: 'ticket',
    description: 'Draft a support ticket from this conversation',
    args: '[description]',
    source: 'bot',
    available: true,
  },
  {
    name: 'call',
    description: 'Start or join a voice/video call in this room',
    source: 'client',
    available: true,
  },
  {
    name: 'hpc',
    description: 'Submit an HPC Slurm batch job or check job status',
    args: '<job-name>',
    source: 'bot',
    available: true,
  },
];

const MOCK_UNAVAILABLE_COMMANDS: ComposerCommand[] = [
  {
    name: 'ticket send',
    description: 'Send your drafted support ticket to the helpdesk',
    source: 'bot',
    available: false,
    reason: 'You have no open ticket draft in this room.',
  },
  {
    name: 'ticket cancel',
    description: 'Discard the current pending support ticket draft',
    source: 'bot',
    available: false,
    reason: 'No pending draft found.',
  },
];

const meta: Meta<typeof MatrixCommandsDialog> = {
  title: 'Matrix/MatrixCommandsDialog',
  component: MatrixCommandsDialog,
  parameters: {
    docs: {
      description: {
        component:
          'A dialog listing all slash and exclamation commands available in the active Matrix chat room. ' +
          'Includes bot commands (e.g. `/ticket`, `!ticket`), client commands marked "Waldur only" (e.g. `/call`), ' +
          'and an expandable collapsible section for unavailable commands with their reasons.',
      },
    },
  },
  args: {
    resolve: {
      onPick: fn(),
    },
    commands: [...MOCK_AVAILABLE_COMMANDS, ...MOCK_UNAVAILABLE_COMMANDS],
  },
  decorators: [
    (Story) => (
      <ModalProvider>
        <div className="w-[520px] max-w-full bg-primary border border-secondary rounded-lg shadow-lg overflow-hidden m-4">
          <Story />
        </div>
      </ModalProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MatrixCommandsDialog>;

export const Default: Story = {};

export const OnlyAvailable: Story = {
  args: {
    commands: MOCK_AVAILABLE_COMMANDS,
  },
};

export const OnlyUnavailable: Story = {
  args: {
    commands: MOCK_UNAVAILABLE_COMMANDS,
  },
};

export const Empty: Story = {
  args: {
    commands: [],
  },
};
