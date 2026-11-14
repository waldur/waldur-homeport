import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalShell,
} from './Modal';

const Confirm = ({ field }: { field?: 'first' | 'autofocus' }) => (
  <ModalShell open onHide={vi.fn()} title="Delete virtual machine">
    {field === 'first' && <input aria-label="Name" />}
    <ModalHeader>
      <ModalCloseButton />
    </ModalHeader>
    <ModalBody>
      {field === 'autofocus' && (
        // eslint-disable-next-line jsx-a11y/no-autofocus -- the case under test
        <input aria-label="Name" autoFocus />
      )}
      This cannot be undone.
    </ModalBody>
    <ModalFooter>
      <button type="button">Cancel</button>
    </ModalFooter>
  </ModalShell>
);

describe('ModalShell initial focus', () => {
  it('starts on the dialog, not its close button, when that comes first', async () => {
    render(<Confirm />);
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(dialog).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Close' })).not.toHaveFocus();
  });

  it('leaves Radix on a field that is the first tabbable element', async () => {
    render(<Confirm field="first" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await waitFor(() => expect(input).toHaveFocus());
  });

  it('keeps an autofocused field focused', async () => {
    render(<Confirm field="autofocus" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await waitFor(() => expect(input).toHaveFocus());
  });
});
