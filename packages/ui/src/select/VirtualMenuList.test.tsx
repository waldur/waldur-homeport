import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WindowedSelect } from './WindowedSelect';

const makeOptions = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    value: `opt-${i}`,
    label: `Option ${i}`,
  }));

describe('VirtualMenuList — real render through WindowedSelect', () => {
  it('mounts the virtualized menu without crashing for a 150-option list', async () => {
    render(
      <WindowedSelect
        autoFocus
        openMenuOnFocus
        defaultMenuIsOpen
        options={makeOptions(150)}
      />,
    );

    // jsdom has no layout (`getBoundingClientRect` returns zeros), so
    // `VariableSizeList` sees a 0-height viewport and renders zero rows.
    // That's fine — what we're asserting is that VirtualMenuList mounted
    // without throwing and react-select wired the listbox role onto our
    // menu-list. For a short list the same listbox would render, but
    // would also contain every option row (see the other test below);
    // here it should NOT contain any "Option N" text because the
    // virtualizer suppressed all rows.
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(within(listbox).queryByText('Option 0')).toBeNull();
  });

  it('renders option text eagerly for a short list (default MenuList path)', async () => {
    render(
      <WindowedSelect
        autoFocus
        openMenuOnFocus
        defaultMenuIsOpen
        options={makeOptions(5)}
      />,
    );

    // Below the threshold, react-select's default MenuList is used and
    // every option row renders eagerly in the DOM. This is the smoke
    // test that the threshold gate actually picks the unvirtualized
    // path — if VirtualMenuList accidentally mounted here, jsdom's
    // zero-height viewport would suppress these rows.
    await waitFor(() => {
      expect(screen.getByText('Option 0')).toBeInTheDocument();
      expect(screen.getByText('Option 4')).toBeInTheDocument();
    });
  });
});
