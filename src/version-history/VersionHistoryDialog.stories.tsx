import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import type { VersionHistory } from 'waldur-js-client';

import { ModalProvider } from '@/modal/ModalContext';
import { ModalRoot } from '@/modal/ModalRoot';

import { VersionHistoryButton } from './VersionHistoryButton';

/**
 * The version history dialog, opened the way the app opens it: a staff
 * user's "Version history" button, through the real modal root. The
 * revisions are seeded into the React Query cache, so nothing hits the API;
 * "Load" in the toolbar would, so it is not exercised here.
 *
 * The timeline lists revisions newest first and selects the current one;
 * the diff panel compares the selected revision with the one before it.
 */
const meta: Meta = {
  title: 'Version history/VersionHistoryDialog',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const ENTITY_UUID = '3f2a9c1e5b7d4e8fa0c1d2e3f4a5b6c7';

const ago = (hours: number) => DateTime.now().minus({ hours }).toISO();

const customer = {
  name: 'Big Corp',
  abbreviation: 'BC',
  email: 'billing@bigcorp.example',
  country: 'EE',
  blocked: false,
};

const versions: VersionHistory[] = [
  {
    id: 3,
    revision_date: ago(2),
    revision_user: { full_name: 'Alice Andersen', username: 'alice' },
    revision_comment:
      "Policy action 'block': blocked changed from False to True. Policy: CustomerEstimatedCostPolicy 4f1a2b3c.",
    serialized_data: {
      ...customer,
      country: 'FI',
      name: 'Big Corp International',
      email: 'finance@bigcorp.example',
      blocked: true,
    },
  },
  {
    id: 2,
    revision_date: ago(26),
    revision_user: { full_name: 'Bob Berg', username: 'bob' },
    revision_comment: 'Updated contact details',
    serialized_data: { ...customer, country: 'FI' },
  },
  {
    id: 1,
    revision_date: ago(24 * 30),
    revision_user: null,
    revision_comment: 'Created',
    serialized_data: customer,
  },
];

const Harness = ({ seed }: { seed: VersionHistory[] }) => {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    client.setQueryData(['versionHistory', 'customer', ENTITY_UUID], seed);
    return client;
  });
  const [store] = useState(() =>
    configureStore()({
      workspace: { user: { uuid: 'staff', is_staff: true } },
    }),
  );
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <ModalRoot />
          <VersionHistoryButton
            entityType="customer"
            entityUuid={ENTITY_UUID}
            entityName="Big Corp"
          />
        </ModalProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const openDialog = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Version history' }),
  );
  const dialog = within(await screen.findByRole('dialog'));
  // The dialog is a lazy chunk (it pulls in Monaco), so its body takes a
  // while on the first open, and then fades in.
  const title = await dialog.findByText(
    'Version history: Big Corp',
    undefined,
    {
      timeout: 15000,
    },
  );
  await waitFor(() => expect(title).toBeVisible());
  return dialog;
};

export const Default: Story = {
  render: () => <Harness seed={versions} />,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await expect(dialog.getByText('Version history: Big Corp')).toBeVisible();
    await expect(dialog.getByText('3 versions')).toBeVisible();
    // The current revision is selected and diffed against v2: name, email
    // and blocked changed.
    await expect(await dialog.findByText('3 field(s) changed')).toBeVisible();
    // A policy revision gets a badge and a readable comment.
    await expect(dialog.getByText('Policy')).toBeVisible();
    await expect(
      dialog.getByText('blocked: False → True (CustomerEstimatedCostPolicy)'),
    ).toBeVisible();
  },
};

export const SelectOlderRevision: Story = {
  render: () => <Harness seed={versions} />,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(await dialog.findByText('Updated contact details'));
    // v2 against the initial revision: only the country changed.
    await expect(await dialog.findByText('1 field(s) changed')).toBeVisible();
  },
};

/** The revisions are a named list of buttons; the shown one is current. */
export const KeyboardSelection: Story = {
  render: () => <Harness seed={versions} />,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    const list = dialog.getByRole('list', { name: 'Revisions' });
    const revisions = within(list).getAllByRole('button');
    await expect(revisions).toHaveLength(3);
    await expect(revisions[0]).toHaveAttribute('aria-current', 'true');
    await expect(revisions[1]).not.toHaveAttribute('aria-current');
    // The decorative initials are not part of the name.
    await expect(revisions[1]).toHaveAccessibleName(
      expect.stringMatching(/^Bob Berg/),
    );

    revisions[2].focus();
    await userEvent.keyboard('{Enter}');
    await expect(revisions[2]).toHaveAttribute('aria-current', 'true');
    await expect(revisions[0]).not.toHaveAttribute('aria-current');
  },
};

export const NoHistory: Story = {
  render: () => <Harness seed={[]} />,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await expect(
      await dialog.findByText('No version history available.'),
    ).toBeVisible();
    await expect(
      dialog.getByText('Select a version to view details'),
    ).toBeVisible();
  },
};

/** On a phone the list and the diff take turns: picking a revision opens
 * its diff with a back button, and going back returns focus to it. */
export const MobileListThenDiff: Story = {
  globals: { viewport: 'mobile' },
  // The Vitest runner ignores the viewport global (its window stays
  // desktop-wide), so the md query useBreakpointUp asks is answered
  // "no" here too.
  beforeEach: () => {
    const original = window.matchMedia;
    window.matchMedia = (query: string) =>
      query === '(min-width: 768px)'
        ? ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false,
          } as MediaQueryList)
        : original.call(window, query);
    return () => {
      window.matchMedia = original;
    };
  },
  render: () => <Harness seed={versions} />,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    // The list alone: no diff yet.
    const list = dialog.getByRole('list', { name: 'Revisions' });
    await expect(dialog.queryByText('Changes:')).not.toBeInTheDocument();

    await userEvent.click(
      within(list).getByRole('button', { name: /^Bob Berg/ }),
    );
    const back = await dialog.findByRole('button', { name: 'Revisions' });
    await expect(back).toHaveFocus();
    await expect(await dialog.findByText('1 field(s) changed')).toBeVisible();
    await expect(dialog.queryByRole('list')).not.toBeInTheDocument();

    await userEvent.click(back);
    const revision = within(
      await dialog.findByRole('list', { name: 'Revisions' }),
    ).getByRole('button', { name: /^Bob Berg/ });
    await expect(revision).toHaveFocus();
    await expect(revision).toHaveAttribute('aria-current', 'true');
  },
};
