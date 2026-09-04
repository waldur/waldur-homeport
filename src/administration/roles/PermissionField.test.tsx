import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { getPermissionSummary, PermissionField } from './PermissionField';
import { PermissionOptions } from './PermissionOptions';

// Groups keep the generated file's alphabetical order, so Call management opens
// first.
const [FIRST] = PermissionOptions;

// The picker is a react-final-form field; drive it through a tiny controlled
// host instead of standing up a whole form.
const Host = ({ initial = [] as string[] }) => {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <>
      <output data-testid="selected-count">{value.length}</output>
      <PermissionField input={{ value, onChange: setValue }} />
    </>
  );
};

const selectedCount = () =>
  Number(screen.getByTestId('selected-count').textContent);

const search = () => screen.getByPlaceholderText('Search...');

// A group reads as "<label><coverage>"; anchoring on the trailing badge keeps
// "Customer" from also matching "Customer actions for resources".
const groupItem = (label: string) => {
  const item = screen
    .getAllByRole('button')
    .find(
      (candidate) =>
        ['None', 'Partial', 'Full'].includes(
          candidate.textContent.slice(label.length),
        ) && candidate.textContent.startsWith(label),
    );
  if (!item) {
    throw new Error(`No group labelled "${label}"`);
  }
  return item;
};

describe('PermissionField', () => {
  it('opens on the first group and shows only its permissions', () => {
    render(<Host />);
    expect(groupItem(FIRST.label)).toHaveClass('active');
    expect(screen.getByLabelText(FIRST.options[0].label)).toBeInTheDocument();
    // A permission from another group is not rendered until its group is opened.
    expect(screen.queryByLabelText('List users')).not.toBeInTheDocument();
  });

  it('reads out how much of each group is granted', () => {
    render(<Host initial={['CUSTOMER.LIST_USERS']} />);
    // Customer has three permissions, so one of them is partial coverage.
    expect(groupItem('Customer').textContent).toBe('CustomerPartial');
    expect(groupItem('Offering').textContent).toBe('OfferingNone');
  });

  it('reads Full once every permission in a group is granted', () => {
    render(<Host initial={FIRST.options.map((option) => option.value)} />);
    expect(groupItem(FIRST.label).textContent).toBe(`${FIRST.label}Full`);
  });

  it('switches groups from the list on the left', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(groupItem('Customer'));

    expect(groupItem('Customer')).toHaveClass('active');
    expect(screen.getByLabelText('List users')).toBeInTheDocument();
  });

  it('searches across every group, not just the open one', async () => {
    const user = userEvent.setup();
    render(<Host />);
    // "List users" lives in the Customer group while Call management is open;
    // the search must jump to it rather than come up empty.
    await user.type(search(), 'list users');
    await waitFor(() =>
      expect(screen.getByLabelText('List users')).toBeInTheDocument(),
    );
  });

  it('matches on the technical code as well as the label', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.type(search(), 'CUSTOMER.CONTACT_UPDATE');
    await waitFor(() =>
      expect(screen.getByLabelText('Contact update')).toBeInTheDocument(),
    );
  });

  it('selects and clears the whole group at once', async () => {
    const user = userEvent.setup();
    render(<Host />);
    const selectAll = screen.getByLabelText('Select all');

    await user.click(selectAll);
    expect(selectedCount()).toBe(FIRST.options.length);
    expect(groupItem(FIRST.label).textContent).toBe(`${FIRST.label}Full`);

    await user.click(selectAll);
    expect(selectedCount()).toBe(0);
  });

  it('limits "Select all" to what the search actually shows', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.type(search(), 'round');

    // "Close rounds" and "List round" match; the rest of the group does not.
    const shown = screen.getAllByRole('checkbox').length - 1; // minus Select all
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(FIRST.options.length);

    await user.click(screen.getByLabelText('Select all'));
    expect(selectedCount()).toBe(shown);
  });

  it('offers to clear a search that matches nothing', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.type(search(), 'zzzz no such permission');

    expect(await screen.findByText('No permissions found')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('ticks a single permission', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(screen.getByLabelText(FIRST.options[0].label));

    expect(selectedCount()).toBe(1);
    expect(screen.getByLabelText(FIRST.options[0].label)).toBeChecked();
  });
});

describe('getPermissionSummary', () => {
  it('counts the groups touched and the permissions granted', () => {
    expect(getPermissionSummary(['CALL.CREATE', 'CUSTOMER.LIST_USERS'])).toBe(
      `2/${PermissionOptions.length} groups · 2 permissions`,
    );
  });

  it('reads zero when nothing is granted', () => {
    expect(getPermissionSummary([])).toBe(
      `0/${PermissionOptions.length} groups · 0 permissions`,
    );
  });
});
