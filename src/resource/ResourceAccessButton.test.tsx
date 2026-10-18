import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ResourceAccessButton } from './ResourceAccessButton';

describe('ResourceAccessButton', () => {
  it('offers the link and its copy action as separate menu items', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(
      <ResourceAccessButton
        resource={{
          endpoints: [{ name: 'Login node', url: 'ssh://login.example:2222' }],
          username: 'alice',
        }}
        offering={{}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Access resource' }));

    const link = await screen.findByRole('menuitem', { name: 'Login node' });
    const copy = screen.getByRole('menuitem', {
      name: 'Copy ssh://alice@login.example:2222',
    });
    // Siblings, not one control inside the other (axe nested-interactive).
    expect(link).not.toContainElement(copy);
    expect(copy).not.toContainElement(link);

    await user.click(copy);
    expect(writeText).toHaveBeenCalledWith('ssh alice@login.example -p 2222');
  });
});
