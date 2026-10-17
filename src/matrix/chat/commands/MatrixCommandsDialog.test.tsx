import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';

import { ComposerCommand } from './composerCommands';
import { MatrixCommandsDialog } from './MatrixCommandsDialog';

const h = vi.hoisted(() => ({ commands: [] as ComposerCommand[] }));

vi.mock('./useComposerCommands', () => ({
  useComposerCommands: () => ({ commands: h.commands }),
}));

const COMMANDS: ComposerCommand[] = [
  {
    name: 'ticket',
    description: 'Draft a support ticket',
    args: '[description]',
    source: 'bot',
    available: true,
  },
  {
    name: 'ticket send',
    description: 'Send your draft',
    source: 'bot',
    available: false,
    reason: 'You have no open ticket draft in this room.',
  },
  {
    name: 'call',
    description: 'Start a call in this room',
    source: 'client',
    available: true,
  },
];

describe('MatrixCommandsDialog', () => {
  beforeEach(() => {
    h.commands = COMMANDS;
  });

  it('lists the available commands in both forms', () => {
    render(<MatrixCommandsDialog resolve={{ onPick: vi.fn() }} />);
    expect(screen.getByText('/ticket')).toBeInTheDocument();
    expect(screen.getByText('!ticket')).toBeInTheDocument();
    expect(screen.getByText('[description]', { exact: false })).toBeVisible();
    expect(
      screen.getByText(
        'A summary of the conversation goes to the helpdesk, and only you can confirm it.',
      ),
    ).toBeInTheDocument();
    // A client command has no ! form and is marked as Waldur's own.
    expect(screen.getByText('/call')).toBeInTheDocument();
    expect(screen.queryByText('!call')).toBeNull();
    expect(screen.getByText('Waldur only')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Type / or ! in the message box to pick a command. In other Matrix apps, type the ! form.',
      ),
    ).toBeInTheDocument();
  });

  it('lists unavailable commands with their reason, collapsed', async () => {
    render(<MatrixCommandsDialog resolve={{ onPick: vi.fn() }} />);
    const toggle = screen.getByRole('button', {
      name: 'Not available here (1)',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const reason = 'You have no open ticket draft in this room.';
    expect(screen.queryByText(reason)).toBeNull();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(reason)).toBeVisible();
  });

  it('puts a picked command in the composer and closes', async () => {
    const onPick = vi.fn();
    render(<MatrixCommandsDialog resolve={{ onPick }} />);
    await userEvent.click(screen.getByRole('button', { name: /\/call/ }));
    expect(onPick).toHaveBeenCalledWith(COMMANDS[2]);
    expect(useModal().closeDialog).toHaveBeenCalled();
  });

  it('says so when no command is available', () => {
    h.commands = [COMMANDS[1]];
    render(<MatrixCommandsDialog resolve={{ onPick: vi.fn() }} />);
    expect(
      screen.getByText('No commands are available in this room.'),
    ).toBeInTheDocument();
  });

  it('shows the list as it is now, not as it was when opened', () => {
    const { rerender } = render(
      <MatrixCommandsDialog resolve={{ onPick: vi.fn() }} />,
    );
    expect(screen.queryByRole('button', { name: /\/ticket send/ })).toBeNull();
    // A draft was made meanwhile.
    h.commands = COMMANDS.map((c) => ({ ...c, available: true }));
    rerender(<MatrixCommandsDialog resolve={{ onPick: vi.fn() }} />);
    expect(
      screen.getByRole('button', { name: /\/ticket send/ }),
    ).toBeInTheDocument();
  });
});
