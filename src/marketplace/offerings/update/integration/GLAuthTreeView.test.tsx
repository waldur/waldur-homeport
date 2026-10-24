import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { GLAuthTreeView, type GlauthTree } from './GLAuthTreeView';

const offering = {
  uuid: '6f0c1e7a9b2d4c3e8f1a2b3c4d5e6f70',
  name: 'HPC cluster',
  slug: 'hpc-cluster',
};

const user = (username: string, uidnumber: number) => ({
  username,
  uidnumber,
  personal_group: uidnumber,
  givenname: null,
  sn: null,
  mail: null,
  home_dir: `/home/${username}`,
  login_shell: '/bin/bash',
  disabled: false,
  ssh_keys: [],
  memberships: [],
});

const tree = {
  offering,
  groups: [
    {
      gid: 60000,
      name: 'proj-climate',
      kind: 'project',
      scope: { type: 'project', uuid: 'a1', name: 'Climate modelling' },
      role: null,
      members: ['alice'],
    },
  ],
  users: [user('alice', 70000), user('bob', 70001)],
  robot_accounts: [],
} as unknown as GlauthTree;

const large = {
  ...tree,
  users: Array.from({ length: 600 }, (_, i) => user(`user${i}`, 80000 + i)),
} as unknown as GlauthTree;

const ROOT = 'dc=⟨base⟩';
const GROUPS = 'ou=groups,dc=⟨base⟩';
const USERS = 'ou=users,dc=⟨base⟩';
const ALICE = 'cn=alice,ou=users,dc=⟨base⟩';
const BOB = 'cn=bob,ou=users,dc=⟨base⟩';
const GROUP = 'cn=proj-climate,ou=groups,dc=⟨base⟩';

const rows = () => screen.queryAllByRole('treeitem');

const item = (name: string) =>
  rows().find((row) => within(row).queryByText(name) !== null);

const names = () =>
  rows().map((row) => within(row).getAllByTitle(/.+/)[0].getAttribute('title'));

/** The row the tree's aria-activedescendant points at, if it is rendered. */
const active = () => {
  const id = screen.getByRole('tree').getAttribute('aria-activedescendant');
  return rows().find((row) => row.id === id);
};

/** Scroll the list as a mouse wheel would. jsdom lays nothing out, so the
 * viewport is given the sizes react-window clamps a scroll against. */
const scrollTo = (top: number) => {
  const viewport = screen.getByTestId('ldap-tree-viewport');
  Object.defineProperty(viewport, 'clientHeight', { value: 500 });
  Object.defineProperty(viewport, 'scrollHeight', { value: 1_000_000 });
  viewport.scrollTop = top;
  fireEvent.scroll(viewport);
};

const focusTree = async () => {
  await userEvent.click(screen.getByRole('textbox'));
  await userEvent.tab();
};

describe('GLAuthTreeView', () => {
  it('opens every node on first render, with nothing selected yet', () => {
    render(<GLAuthTreeView tree={tree} />);

    expect(item(ROOT)).toHaveAttribute('aria-level', '1');
    expect(item(ROOT)).toHaveAttribute('aria-expanded', 'true');
    expect(item(GROUPS)).toHaveAttribute('aria-level', '2');
    expect(item(GROUP)).toHaveAttribute('aria-level', '3');
    // A group's attributes are its children, shown open too.
    expect(names()).toContain('cn: proj-climate');
    // Attributes are leaves: no aria-expanded.
    expect(
      rows().find((row) => row.textContent?.includes('gidNumber:')),
    ).not.toHaveAttribute('aria-expanded');
    expect(
      rows().filter((row) => row.getAttribute('aria-selected') === 'true'),
    ).toHaveLength(0);
  });

  it('gives each row its position among the siblings shown', () => {
    render(<GLAuthTreeView tree={tree} />);

    expect(item(ROOT)).toHaveAttribute('aria-setsize', '1');
    expect(item(ROOT)).toHaveAttribute('aria-posinset', '1');
    expect(item(GROUPS)).toHaveAttribute('aria-setsize', '2');
    expect(item(GROUPS)).toHaveAttribute('aria-posinset', '1');
    expect(item(USERS)).toHaveAttribute('aria-posinset', '2');
    expect(item(BOB)).toHaveAttribute('aria-setsize', '2');
    expect(item(BOB)).toHaveAttribute('aria-posinset', '2');
  });

  it('shows matches with their ancestors, opened', async () => {
    render(<GLAuthTreeView tree={tree} />);

    await userEvent.type(screen.getByRole('textbox'), 'bob');

    expect(names()).toEqual([
      ROOT,
      USERS,
      BOB,
      'uid: bob',
      'cn: bob',
      'homeDirectory: /home/bob',
    ]);
    expect(item(USERS)).toHaveAttribute('aria-expanded', 'true');
    // Only the shown siblings count.
    expect(item(USERS)).toHaveAttribute('aria-setsize', '1');
  });

  it('closes a match whose children do not match, and opens it in full', async () => {
    render(<GLAuthTreeView tree={tree} />);

    // Matches the users OU by its badge only.
    await userEvent.type(screen.getByRole('textbox'), '2 entries');

    expect(names()).toEqual([ROOT, USERS]);
    expect(item(USERS)).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(within(item(USERS)).getByText(USERS));

    expect(item(USERS)).toHaveAttribute('aria-expanded', 'true');
    expect(names()).toEqual([ROOT, USERS, ALICE, BOB]);
    expect(item(ALICE)).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows an empty tree when nothing matches', async () => {
    render(<GLAuthTreeView tree={tree} />);

    await userEvent.type(screen.getByRole('textbox'), 'no such entry');

    expect(rows()).toHaveLength(0);
  });

  it('toggles a node on click and brings the open state back after a search', async () => {
    render(<GLAuthTreeView tree={tree} />);

    await userEvent.click(within(item(USERS)).getByText(USERS));
    expect(item(USERS)).toHaveAttribute('aria-expanded', 'false');
    expect(item(USERS)).toHaveAttribute('aria-selected', 'true');
    expect(names()).not.toContain(ALICE);

    // A search opens the ancestors of its matches...
    await userEvent.type(screen.getByRole('textbox'), 'alice');
    expect(names()).toContain(ALICE);

    // ...and clearing it restores what the user had closed.
    await userEvent.clear(screen.getByRole('textbox'));
    expect(item(USERS)).toHaveAttribute('aria-expanded', 'false');
    expect(names()).not.toContain(ALICE);
    expect(names()).toContain(GROUP);
  });

  it('is one Tab stop and follows the tree keyboard pattern', async () => {
    render(<GLAuthTreeView tree={tree} />);
    expect(screen.getByRole('tree')).toHaveAttribute('tabindex', '0');
    expect(rows().filter((row) => row.hasAttribute('tabindex'))).toHaveLength(
      0,
    );

    await focusTree();
    expect(screen.getByRole('tree')).toHaveFocus();
    expect(active()).toBe(item(ROOT));
    expect(item(ROOT)).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe(item(GROUPS));

    // Left closes an open node, Right opens it again.
    await userEvent.keyboard('{ArrowLeft}');
    expect(item(GROUPS)).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowRight}');
    expect(item(GROUPS)).toHaveAttribute('aria-expanded', 'true');

    // Right on an open node moves to its first child, Left back to the parent.
    await userEvent.keyboard('{ArrowRight}');
    expect(active()).toBe(item(GROUP));
    await userEvent.keyboard('{ArrowLeft}');
    expect(item(GROUP)).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowLeft}');
    expect(active()).toBe(item(GROUPS));

    // Enter and Space toggle.
    await userEvent.keyboard('{Enter}');
    expect(item(GROUPS)).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    expect(item(GROUPS)).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{End}');
    expect(active()).toBe(rows()[rows().length - 1]);
    await userEvent.keyboard('{Home}');
    expect(active()).toBe(item(ROOT));
  });

  it('leaves shortcuts with modifier keys alone', async () => {
    render(<GLAuthTreeView tree={tree} />);
    await focusTree();
    await userEvent.keyboard('{ArrowDown}');

    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}');
    await userEvent.keyboard('{Meta>}{End}{/Meta}');
    await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');

    expect(active()).toBe(item(GROUPS));
    expect(item(GROUPS)).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not take focus back after Home or End on the row it is on', async () => {
    render(<GLAuthTreeView tree={tree} />);
    await focusTree();
    await userEvent.keyboard('{Home}{Home}{End}{End}');

    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.keyboard('al');

    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('textbox')).toHaveValue('al');
  });

  it('keeps its Tab stop when the active row scrolls out of view', async () => {
    render(<GLAuthTreeView tree={large} />);
    await focusTree();
    await userEvent.keyboard('{End}');
    const last = active();
    expect(last).toBeDefined();

    // Scroll back to the top: the active row leaves the DOM.
    scrollTo(0);
    expect(active()).toBeUndefined();

    // Leave the tree and Tab back in: focus lands on the tree, and the
    // active row is scrolled back into view.
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    expect(screen.getByRole('tree')).toHaveFocus();
    expect(active()).toBeDefined();
    expect(active()).toHaveAttribute('aria-selected', 'true');
  });

  it('moves a page of rows with Page Down and Page Up', async () => {
    render(<GLAuthTreeView tree={large} />);
    await focusTree();

    // 500 px of 28 px rows: 17 rows to a page.
    await userEvent.keyboard('{PageDown}');
    expect(
      screen.getByRole('tree').getAttribute('aria-activedescendant'),
    ).toMatch(/-17$/);
    expect(active()).toBeDefined();
    await userEvent.keyboard('{PageUp}');
    expect(active()).toBe(item(ROOT));
  });

  it('brings the first row into view when Tab enters a scrolled tree', async () => {
    render(<GLAuthTreeView tree={large} />);
    scrollTo(5000);
    expect(item(ROOT)).toBeUndefined();

    await focusTree();

    expect(active()).toBe(item(ROOT));
  });

  it('activates the clicked row without jumping to the previous one', async () => {
    render(<GLAuthTreeView tree={large} />);
    await focusTree();
    await userEvent.keyboard('{End}');
    await userEvent.tab({ shift: true });
    scrollTo(0);

    // react-window turns pointer events off for a moment after a scroll.
    await userEvent
      .setup({ pointerEventsCheck: 0 })
      .click(within(item(GROUPS)).getByText(GROUPS));

    expect(screen.getByTestId('ldap-tree-viewport').scrollTop).toBe(0);
    expect(active()).toBe(item(GROUPS));
    expect(item(GROUPS)).toHaveAttribute('aria-expanded', 'false');
  });

  it('acts on the active row after the list was scrolled away from it', async () => {
    render(<GLAuthTreeView tree={large} />);
    await focusTree();
    await userEvent.keyboard('{ArrowDown}');
    scrollTo(8000);
    expect(active()).toBeUndefined();

    await userEvent.keyboard('{ArrowDown}');

    expect(active()).toBe(item(GROUP));
  });

  it('renders only the rows in view of a large directory', () => {
    render(<GLAuthTreeView tree={large} />);

    // 600 users with their attributes are over 5,000 rows; a 500 px viewport
    // of 28 px rows shows about 18 of them, plus react-window's overscan.
    expect(rows().length).toBeLessThan(30);
  });
});
