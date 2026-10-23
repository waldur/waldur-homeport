import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { hasPermission } from '@/permissions/hasPermission';
import { setTableQueryRows } from '@/table/mockTableQuery';
import { useTable } from '@/table/useTable';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ResourceApiKeysCard } from './ResourceApiKeysCard';
import { RevealApiKeyDialog } from './RevealApiKeyDialog';

// Serves the rows given to setTableQueryRows (none by default); no request fires.
vi.mock('@/table/useTableQuery', () => import('@/table/mockTableQuery'));
vi.mock('@/permissions/hasPermission', () => ({ hasPermission: vi.fn() }));
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('./useResourceApiKeys', () => ({
  TRANSITIONAL: ['Creating', 'Updating', 'Deleting'],
  useInvalidateRevealedKey: vi.fn(() => vi.fn()),
}));

const RESOURCE = {
  uuid: 'res-1',
  project_uuid: 'proj-1',
  customer_uuid: 'cust-1',
} as any;

const KEYS = [
  {
    uuid: 'k1',
    state: 'OK',
    client_id: 'EUMVPW5J5U2ZUQ5AL9L4',
    modified: '2026-07-30T12:00:00Z',
    error_message: '',
  },
  {
    uuid: 'k2',
    state: 'Updating',
    client_id: '9LEVW594YBQ97LE4WKNY',
    modified: '2026-07-30T13:00:00Z',
    error_message: '',
  },
];

const tableId = `resource-api-keys-${RESOURCE.uuid}`;
const mockStore = configureStore();

const USER = { uuid: 'me', is_staff: false, is_support: false };

// Key management is the offering's opt-in; its component and model list feed
// the settings dialog.
const MANAGED_OFFERING = {
  components: [{ type: 'daily', name: 'Daily usage', measured_unit: 'EUR' }],
  plugin_options: { enable_api_key_provisioning: true },
  resource_options: { options: { models: { choices: ['gpt-4o'] } } },
} as any;

const makeStore = (keys: any[]) => {
  setTableQueryRows(keys);
  return mockStore({
    tables: {
      [tableId]: {
        loading: false,
        pagination: { pageSize: 10, resultCount: keys.length, currentPage: 1 },
        toggled: {},
        activeColumns: {},
        columnPositions: [],
      },
    },
  });
};

// The parent owns useTable and passes the props down; here the Harness plays
// that role so the card renders through the real Table.
const Harness: FC<{ offering?: any; resource?: any }> = ({
  offering,
  resource = RESOURCE,
}) => {
  const props = useTable({ table: tableId, fetchData: vi.fn() as any });
  return (
    <ResourceApiKeysCard {...props} resource={resource} offering={offering} />
  );
};

const renderCard = (
  keys: any[],
  {
    offering,
    user = USER,
    resource,
  }: { offering?: any; user?: any; resource?: any } = {},
) => {
  // useUser is mocked globally (test/mocks/workspace.js).
  vi.mocked(useUser).mockReturnValue(user);
  return renderWithProviders(
    <Provider store={makeStore(keys)}>
      <DrawerProvider>
        <Harness offering={offering} resource={resource} />
      </DrawerProvider>
    </Provider>,
  );
};

const renderManaged = (key: any, user?: any) =>
  renderCard([{ uuid: 'k1', client_id: 'KEY1', ...key }], {
    offering: MANAGED_OFFERING,
    user,
  });

const offered = (name: string) =>
  screen.queryByRole('menuitem', { name: new RegExp(`^${name}`) });

// Fails on a missing item, so "enabled" never passes for an absent action.
const isEnabled = (name: string) => {
  const item = offered(name);
  expect(item, `${name} is offered`).not.toBeNull();
  return item!.getAttribute('aria-disabled') !== 'true';
};

// What the reveal dialog was opened with: it offers rotation on canRotate.
const revealDialogProps = async () => {
  await userEvent.click(offered('Reveal')!);
  const { openDialog } = vi.mocked(useModal)();
  expect(openDialog).toHaveBeenCalledWith(
    RevealApiKeyDialog,
    expect.anything(),
  );
  return vi.mocked(openDialog).mock.calls[0][1].resolve;
};

// getAllByRole('row')[0] is the header; data rows follow. The Table renders
// row actions inside an aria-hidden wrapper, so target the 3-dots toggle by its
// icon (the click bubbles to the toggle button).
const openRowActions = async (rowIndex: number) => {
  const row = screen.getAllByRole('row')[rowIndex + 1];
  await userEvent.click(within(row).getByTestId('DotsThreeVerticalIcon'));
};

describe('ResourceApiKeysCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists the keys with their state via the standard table', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard(KEYS);
    // The id is what a user matches against their own configuration.
    expect(await screen.findByText('EUMVPW5J5U2ZUQ5AL9L4')).toBeInTheDocument();
    expect(screen.getByText('9LEVW594YBQ97LE4WKNY')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Updating')).toBeInTheDocument();
  });

  // A paused resource leaves each key's own state alone; the tab says what that
  // state cannot: none of them is served.
  it('shows a paused resource above its keys and on the serving ones', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard(KEYS, {
      resource: {
        ...RESOURCE,
        paused: true,
        usage_limit_restriction: 'paused',
      },
    });
    expect(
      await screen.findByText(
        'This resource is paused, so none of its keys is served.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/usage reached its limit/)).toBeInTheDocument();
    expect(screen.getByText('Blocked: resource paused')).toBeInTheDocument();
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
    expect(screen.getByText('Updating')).toBeInTheDocument();
  });

  // The Usage tab names the limit and the resume time; so does the banner.
  it('names the limit that paused the resource and when it resumes', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard(KEYS, {
      resource: {
        ...RESOURCE,
        paused: true,
        usage_limit_restriction: 'paused',
        offering_components: [{ type: 'tokens', name: 'Tokens' }],
        spending_limit_status: [
          { component_type: 'tokens', period: 'week', reached: true },
        ],
        usage_limit_resumes_at: new Date(
          Date.now() + 2 * 86400_000,
        ).toISOString(),
      },
    });
    expect(
      await screen.findByText(
        /Held by: Tokens — Weekly limit\. Access resumes/,
      ),
    ).toBeInTheDocument();
  });

  it('shows no pause on a resource that is not paused', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard(KEYS);
    await screen.findByText('EUMVPW5J5U2ZUQ5AL9L4');
    expect(
      screen.queryByText(/This resource is paused/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Blocked: resource paused'),
    ).not.toBeInTheDocument();
  });

  it('offers reveal to everyone and rotate to managers, no add or revoke', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard(KEYS);
    await screen.findByText('EUMVPW5J5U2ZUQ5AL9L4');
    // The count is fixed at provisioning: rotate re-mints in place, and neither
    // adding nor removing a key is offered.
    expect(
      screen.queryByRole('button', { name: /Add key/ }),
    ).not.toBeInTheDocument();
    await openRowActions(0);
    expect(screen.getByText('Reveal')).toBeInTheDocument();
    expect(screen.getByText('Rotate')).toBeInTheDocument();
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
  });

  it('offers only reveal without manage permission', async () => {
    vi.mocked(hasPermission).mockReturnValue(false);
    renderCard(KEYS);
    await screen.findByText('EUMVPW5J5U2ZUQ5AL9L4');
    await openRowActions(0);
    expect(screen.getByText('Reveal')).toBeInTheDocument();
    expect(screen.queryByText('Rotate')).not.toBeInTheDocument();
  });

  it('shows the standard empty state with no keys', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard([]);
    expect(await screen.findByText('No api keys found')).toBeInTheDocument();
    expect(screen.getByText('There are no api keys yet.')).toBeInTheDocument();
  });

  it('says how to get a key when a managed resource has none', async () => {
    // Under key management a new resource starts with no keys.
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard([], { offering: MANAGED_OFFERING });
    expect(await screen.findByText('No api keys found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'API keys are requested here, one at a time, by people who can manage the resource.',
      ),
    ).toBeInTheDocument();
  });

  describe('with key management', () => {
    beforeEach(() => vi.mocked(hasPermission).mockReturnValue(true));

    it('lets a manager request a key and govern an active one', async () => {
      renderManaged({ state: 'OK' });
      await screen.findByText('KEY1');
      expect(
        screen.getByRole('button', { name: /Request key/ }),
      ).toBeInTheDocument();
      await openRowActions(0);
      for (const name of [
        'Reveal',
        'Pause',
        'Rotate',
        'Edit key settings',
        'Delete',
      ]) {
        expect(isEnabled(name)).toBe(true);
      }
      expect(offered('Retry')).toBeNull();
    });

    it('offers nothing but reveal without manage permission', async () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      renderManaged({ state: 'OK' });
      await screen.findByText('KEY1');
      expect(
        screen.queryByRole('button', { name: /Request key/ }),
      ).not.toBeInTheDocument();
      await openRowActions(0);
      expect(offered('Reveal')).not.toBeNull();
      for (const name of ['Pause', 'Rotate', 'Edit key settings', 'Delete']) {
        expect(offered(name)).toBeNull();
      }
    });

    it('drops models the offering no longer lists from the key', async () => {
      renderManaged({ state: 'OK', allowed_models: ['gpt-4o', 'retired'] });
      await screen.findByText('KEY1');
      expect(screen.getByText('gpt-4o')).toBeInTheDocument();
      expect(screen.queryByText('retired')).not.toBeInTheDocument();
    });

    it('tells a key open to every model from one with none and one whose models are retired', async () => {
      renderCard(
        [
          { uuid: 'k1', client_id: 'KEY1', state: 'OK', allowed_models: ['*'] },
          { uuid: 'k2', client_id: 'KEY2', state: 'OK', allowed_models: [] },
          {
            uuid: 'k3',
            client_id: 'KEY3',
            state: 'OK',
            allowed_models: ['retired'],
          },
        ],
        { offering: MANAGED_OFFERING },
      );
      const [open, none, retired] = (await screen.findAllByRole('row')).slice(
        1,
      );
      expect(within(open).getByText('All models')).toBeInTheDocument();
      for (const row of [none, retired]) {
        expect(within(row).getByText('No models')).toBeInTheDocument();
        expect(within(row).queryByText('All models')).not.toBeInTheDocument();
      }
    });

    it('shows a key what its resource allows', async () => {
      const offering = {
        ...MANAGED_OFFERING,
        resource_options: {
          options: {
            models: {
              type: 'select_string_multi',
              choices: ['gpt-4o', 'qwen'],
            },
          },
        },
      };
      const keys = [
        { uuid: 'k1', client_id: 'KEY1', state: 'OK', allowed_models: ['*'] },
        {
          uuid: 'k2',
          client_id: 'KEY2',
          state: 'OK',
          allowed_models: ['gpt-4o', 'qwen'],
        },
      ];
      const { unmount } = renderCard(keys, {
        offering,
        resource: { ...RESOURCE, options: { models: ['qwen'] } },
      });
      const [open, narrowed] = (await screen.findAllByRole('row')).slice(1);
      expect(within(open).getByText('All models')).toBeInTheDocument();
      expect(within(narrowed).getByText('qwen')).toBeInTheDocument();
      expect(within(narrowed).queryByText('gpt-4o')).not.toBeInTheDocument();
      unmount();

      // All models of a resource that allows none is none.
      renderCard(keys, {
        offering,
        resource: { ...RESOURCE, options: { models: [] } },
      });
      for (const row of (await screen.findAllByRole('row')).slice(1)) {
        expect(within(row).getByText('No models')).toBeInTheDocument();
      }
    });

    it('lets only the assignee, staff or support reveal a personal key', async () => {
      renderManaged({ state: 'OK', user_uuid: 'someone-else' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Reveal')).toBe(false);
    });

    it('lets staff reveal a key assigned to someone else', async () => {
      renderManaged(
        { state: 'OK', user_uuid: 'someone-else' },
        { ...USER, is_staff: true },
      );
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Reveal')).toBe(true);
    });

    it('lets the assignee reveal their own key', async () => {
      renderManaged({ state: 'OK', user_uuid: USER.uuid });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Reveal')).toBe(true);
    });

    describe('for an assignee without manage permission', () => {
      beforeEach(() => vi.mocked(hasPermission).mockReturnValue(false));

      it('offers rotate next to reveal, and nothing else', async () => {
        renderManaged({ state: 'OK', user_uuid: USER.uuid });
        await screen.findByText('KEY1');
        expect(
          screen.queryByRole('button', { name: /Request key/ }),
        ).not.toBeInTheDocument();
        await openRowActions(0);
        expect(isEnabled('Reveal')).toBe(true);
        expect(isEnabled('Rotate')).toBe(true);
        for (const name of ['Pause', 'Retry', 'Edit key settings', 'Delete']) {
          expect(offered(name)).toBeNull();
        }
      });

      it('offers rotation in the reveal dialog too', async () => {
        renderManaged({ state: 'OK', user_uuid: USER.uuid });
        await screen.findByText('KEY1');
        await openRowActions(0);
        expect((await revealDialogProps()).canRotate).toBe(true);
      });

      it('offers no rotation in the reveal dialog of a shared key', async () => {
        renderManaged({ state: 'OK' });
        await screen.findByText('KEY1');
        await openRowActions(0);
        expect((await revealDialogProps()).canRotate).toBe(false);
      });

      it('offers no rotate for a key assigned to someone else', async () => {
        renderManaged({ state: 'OK', user_uuid: 'someone-else' });
        await screen.findByText('KEY1');
        await openRowActions(0);
        expect(offered('Rotate')).toBeNull();
      });

      it('retries a rotation that failed', async () => {
        renderManaged({
          state: 'Erred',
          pending_action: 'rotate',
          user_uuid: USER.uuid,
        });
        await screen.findByText('KEY1');
        await openRowActions(0);
        expect(isEnabled('Retry')).toBe(true);
        expect(offered('Rotate')).toBeNull();
      });

      it.each(['pause', 'resume', 'update', 'delete', 'create'])(
        'offers neither retry nor rotate after a failed %s',
        async (pending_action) => {
          renderManaged({
            state: 'Erred',
            pending_action,
            user_uuid: USER.uuid,
          });
          await screen.findByText('KEY1');
          await openRowActions(0);
          for (const name of ['Retry', 'Rotate', 'Resume', 'Delete']) {
            expect(offered(name)).toBeNull();
          }
        },
      );

      it('cannot rotate a paused key, nor resume it', async () => {
        renderManaged({ state: 'Paused', user_uuid: USER.uuid });
        await screen.findByText('KEY1');
        await openRowActions(0);
        expect(isEnabled('Rotate')).toBe(false);
        expect(offered('Resume')).toBeNull();
      });

      // A rotation in flight would hold off the pause its limit calls for.
      describe('a key that reached its limit this month', () => {
        const AT_LIMIT = {
          state: 'OK',
          user_uuid: USER.uuid,
          limits: { daily: 10 },
          current_usages: { daily: 10 },
          usage_period: `${new Date().toISOString().slice(0, 7)}-01`,
        };
        const REASON =
          'This key has reached its limit this month. A manager can rotate it.';

        it('cannot be rotated by its assignee', async () => {
          renderManaged(AT_LIMIT);
          await screen.findByText('KEY1');
          await openRowActions(0);
          expect(isEnabled('Rotate')).toBe(false);
          expect((await revealDialogProps()).rotateDisabledReason).toBe(REASON);
        });

        it('can be rotated below its limit', async () => {
          renderManaged({ ...AT_LIMIT, current_usages: { daily: 9 } });
          await screen.findByText('KEY1');
          await openRowActions(0);
          expect(isEnabled('Rotate')).toBe(true);
          expect(
            (await revealDialogProps()).rotateDisabledReason,
          ).toBeUndefined();
        });

        // Usage of an earlier month counts against no limit.
        it('can be rotated once a new month begins', async () => {
          renderManaged({ ...AT_LIMIT, usage_period: '2020-01-01' });
          await screen.findByText('KEY1');
          await openRowActions(0);
          expect(isEnabled('Rotate')).toBe(true);
        });
      });
    });

    // The key is paused once the rotation settles.
    it('lets a manager rotate a key that reached its limit', async () => {
      vi.mocked(hasPermission).mockReturnValue(true);
      renderManaged({
        state: 'OK',
        limits: { daily: 10 },
        current_usages: { daily: 12 },
        usage_period: `${new Date().toISOString().slice(0, 7)}-01`,
      });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Rotate')).toBe(true);
    });

    it.each(['Creating', 'Updating', 'Deleting'])(
      'refuses a second command while the key is %s',
      async (state) => {
        renderManaged({ state, pending_action: 'pause' });
        await screen.findByText('KEY1');
        await openRowActions(0);
        for (const name of ['Pause', 'Rotate', 'Delete']) {
          expect(isEnabled(name)).toBe(false);
        }
        // A key that holds a secret changes hands by rotation, which waits
        // for the command in flight like any other.
        expect(isEnabled('Edit key settings')).toBe(false);
      },
    );

    // A request not yet created holds nothing at the backend, so it can be
    // withdrawn at once; everything else waits for the request to settle.
    it('lets a pending request be withdrawn', async () => {
      renderCard([{ uuid: 'k1', client_id: '', state: 'Creating' }], {
        offering: MANAGED_OFFERING,
      });
      await openRowActions(0);
      expect(isEnabled('Delete')).toBe(true);
      // Only the assignee: limits and models wait for the key to settle.
      expect(isEnabled('Edit key settings')).toBe(true);
    });

    it('retries the failed command in place of rotating', async () => {
      renderManaged({ state: 'Erred', pending_action: 'pause' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Retry')).toBe(true);
      expect(offered('Rotate')).toBeNull();
      // Limits and models are locked, and so is the assignee: a new one
      // would rotate the key, which waits for the retry.
      expect(isEnabled('Edit key settings')).toBe(false);
    });

    // The rotation is retried with the new assignee.
    it('lets a key whose rotation failed change hands', async () => {
      renderManaged({ state: 'Erred', pending_action: 'rotate' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Edit key settings')).toBe(true);
    });

    it('locks a deleting key against edits', async () => {
      renderManaged({ state: 'Deleting' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Edit key settings')).toBe(false);
    });

    it('retries a failed settings update by editing the settings', async () => {
      renderManaged({ state: 'Erred', pending_action: 'update' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Edit key settings')).toBe(true);
    });

    it('resumes rather than rotates a paused key', async () => {
      renderManaged({ state: 'Paused' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Resume')).toBe(true);
      expect(isEnabled('Rotate')).toBe(false);
      expect(isEnabled('Reveal')).toBe(false);
    });
  });

  describe('without key management', () => {
    beforeEach(() => vi.mocked(hasPermission).mockReturnValue(true));

    const renderUnmanaged = (key: any, user?: any) =>
      renderCard([{ uuid: 'k1', client_id: 'KEY1', ...key }], {
        offering: {
          ...MANAGED_OFFERING,
          plugin_options: { enable_api_key_provisioning: false },
        },
        user,
      });

    // Backends that cannot govern keys one by one (ceph-s3 / croit) keep the
    // plain table: no assignee, limits, usage or models, and nothing to expand.
    it('keeps the plain key table of a backend without per-key governance', async () => {
      renderUnmanaged({
        state: 'OK',
        // Even if a governed field slipped through, it is not rendered.
        allowed_models: ['gpt-4o'],
      });
      await screen.findByText('KEY1');
      const headers = screen
        .getAllByRole('columnheader')
        .map((header) => header.textContent);
      for (const title of ['Key ID', 'State', 'Issued']) {
        expect(headers.some((text) => text?.includes(title))).toBe(true);
      }
      for (const title of ['Assignee', 'Limits & usage', 'Models']) {
        expect(headers.some((text) => text?.includes(title))).toBe(false);
      }
      expect(
        screen.queryByRole('button', { name: 'Expand all rows' }),
      ).not.toBeInTheDocument();
    });

    // Reveal still honours an assignee set while management was on, so the
    // portal shows whose key it is. Nobody can unassign it: an assignee is
    // fixed when the key is requested.
    it('shows the assignee of a key assigned while management was on', async () => {
      renderUnmanaged({
        state: 'OK',
        user_uuid: 'someone-else',
        user_full_name: 'Alice',
      });
      await screen.findByText('KEY1');
      const headers = screen
        .getAllByRole('columnheader')
        .map((header) => header.textContent);
      expect(headers.some((text) => text?.includes('Assignee'))).toBe(true);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      await openRowActions(0);
      expect(isEnabled('Reveal')).toBe(false);
      expect(offered('Unassign')).toBeNull();
    });

    it('lets the assignee reveal their key', async () => {
      renderUnmanaged({ state: 'OK', user_uuid: USER.uuid });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Reveal')).toBe(true);
    });

    it('still lets the assignee rotate their key', async () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      renderUnmanaged({ state: 'OK', user_uuid: USER.uuid });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Rotate')).toBe(true);
    });

    // Rotating or resuming in a failed command's place is a manager's call:
    // for the assignee it would undo a pause meant for them.
    it('leaves a stranded key to a manager, not its assignee', async () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      renderUnmanaged({
        state: 'Erred',
        pending_action: 'pause',
        user_uuid: USER.uuid,
      });
      await screen.findByText('KEY1');
      await openRowActions(0);
      for (const name of ['Rotate', 'Retry', 'Resume']) {
        expect(offered(name)).toBeNull();
      }
    });

    it('lets the assignee retry a failed rotation', async () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      renderUnmanaged({
        state: 'Erred',
        pending_action: 'rotate',
        user_uuid: USER.uuid,
      });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Retry')).toBe(true);
    });

    it('offers no request, pause, settings or delete', async () => {
      renderUnmanaged({ state: 'OK' });
      await screen.findByText('KEY1');
      expect(
        screen.queryByRole('button', { name: /Request key/ }),
      ).not.toBeInTheDocument();
      await openRowActions(0);
      expect(isEnabled('Rotate')).toBe(true);
      for (const name of ['Pause', 'Edit key settings', 'Delete']) {
        expect(offered(name)).toBeNull();
      }
    });

    it('still resumes a key paused while management was on', async () => {
      renderUnmanaged({ state: 'Paused' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Resume')).toBe(true);
    });

    it('rotates or resumes a key whose governed command failed, so it is not stranded', async () => {
      renderUnmanaged({ state: 'Erred', pending_action: 'pause' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(offered('Retry')).toBeNull();
      expect(isEnabled('Rotate')).toBe(true);
      // A failed pause leaves the key live or not; resume settles it either way.
      expect(isEnabled('Resume')).toBe(true);
      expect(offered('Pause')).toBeNull();
    });

    it('sends resume, not pause, for a stranded key', async () => {
      renderUnmanaged({ state: 'Erred', pending_action: 'pause' });
      await screen.findByText('KEY1');
      const messages = vi
        .mocked(useManagedMutation)
        .mock.calls.map(([options]) => options.successMessage);
      expect(messages).toContain('API key resume requested');
      expect(messages).not.toContain('API key pause requested');
    });

    it('offers no resume in place of a failed ungoverned command', async () => {
      renderUnmanaged({ state: 'Erred', pending_action: 'rotate' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(offered('Resume')).toBeNull();
    });

    it('retries a failed rotation', async () => {
      renderUnmanaged({ state: 'Erred', pending_action: 'rotate' });
      await screen.findByText('KEY1');
      await openRowActions(0);
      expect(isEnabled('Retry')).toBe(true);
    });
  });
});
