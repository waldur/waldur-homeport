import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { ActionDropdownButton } from './ActionDropdownButton';

/**
 * Regression coverage: `Toggle` is rendered under `RadixDropdownMenu.Trigger
 * asChild`, which merges its own onClick/onPointerDown/aria-* props onto
 * whatever it clones. `Toggle` used to destructure only its own named props
 * and never spread the rest onto the underlying `<button>`, silently
 * dropping every prop Radix's Slot injected — the button rendered
 * correctly but clicking it did nothing. Reported live: every provider
 * card's "Enabled"/"Not configured" toggle on the admin Identity Providers
 * page (built on this component) did nothing on click.
 */
describe('ActionDropdownButton', () => {
  it('opens the menu when the toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdownButton title="Enabled">
        <div>Disable</div>
      </ActionDropdownButton>,
    );

    expect(screen.queryByText('Disable')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Enabled/ }));

    expect(await screen.findByText('Disable')).toBeInTheDocument();
  });
});
