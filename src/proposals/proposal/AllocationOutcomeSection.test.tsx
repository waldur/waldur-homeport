import { screen, waitFor, within } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesList,
  projectsListUsersList,
  projectsRetrieve,
  proposalProposalsResourcesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderWithProviders } from '@/test/harness';

import { AllocationOutcomeSection } from './AllocationOutcomeSection';

// useTable reaches for the Redux store and the drawer context.
const renderSection = (ui: ReactElement) =>
  renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>{ui}</Provider>
    </DrawerProvider>,
  );

const PROJECT_UUID = 'aaaabbbbccccddddeeeeffff00001111';

const proposal = {
  uuid: 'proposal-1',
  project: `https://example.org/api/projects/${PROJECT_UUID}/`,
  project_name: 'Spring call - Quantum Error Correction',
} as any;

// The SDK's own return type carries `request`/`response` alongside `data`.
// Neither is used here, and omitting `response` is deliberate: getAllPages
// stops paging when a result carries none, which keeps these fixtures to a
// single page. Hence the casts — the shapes are intentionally partial.
const forbidden = () =>
  Promise.reject({
    detail: 'Not allowed.',
    response: { status: 403 },
  }) as any;

const page = (data: any[]) => Promise.resolve({ data }) as any;

describe('AllocationOutcomeSection', () => {
  it('renders nothing until the proposal has been allocated', () => {
    const { container } = renderSection(
      <AllocationOutcomeSection proposal={{ ...proposal, project: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  // Regression: list_users raises PermissionDenied for anyone holding no role
  // on the project — every reviewer looking at an accepted proposal. useTable
  // sets no `skipGlobalErrorRedirect`, so an uncaught 403 sends the whole page
  // to errorPage.noPermission. The rejection must stay inside this component.
  it('survives a 403 on project roles and hides that section', async () => {
    vi.mocked(projectsRetrieve).mockReturnValue(
      forbidden().catch(() => ({ data: null })) as any,
    );
    vi.mocked(projectsListUsersList).mockImplementation(forbidden);
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page([
        {
          uuid: 'req-1',
          resource: null,
          requested_offering: { offering_name: 'HPC Standard Allocation' },
        },
      ]),
    );

    const { queryClient } = renderSection(
      <AllocationOutcomeSection proposal={proposal} />,
    );

    // The requests still render...
    expect(
      await screen.findByText('HPC Standard Allocation'),
    ).toBeInTheDocument();

    // ...and the roles query settles as a *success* carrying null rather than
    // as an error. This is the assertion that matters: the app's QueryCache
    // onError redirects the whole page on a 403, so the rejection has to be
    // swallowed here. Asserting only that the section is hidden would pass
    // either way, since an errored query also renders nothing.
    await waitFor(() => {
      const state = queryClient.getQueryState([
        'proposal-allocated-roles',
        PROJECT_UUID,
      ]);
      expect(state?.status).toBe('success');
      expect(state?.data).toBeNull();
      expect(state?.error).toBeNull();
    });

    // And the unreadable roles are omitted rather than reported as "none".
    expect(screen.queryByText('Project access:')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No roles were granted on the project.'),
    ).not.toBeInTheDocument();
  });

  // A request whose offering the provider never accepted produces no resource;
  // the row must remain, so "asked for, got none" stays visible.
  it('keeps a request that produced no resource', async () => {
    vi.mocked(projectsRetrieve).mockImplementation(
      () =>
        Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
    );
    vi.mocked(projectsListUsersList).mockImplementation(() => page([]));
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page([
        {
          uuid: 'req-2',
          resource: null,
          requested_offering: { offering_name: 'GPU Burst Capacity' },
        },
      ]),
    );

    renderSection(<AllocationOutcomeSection proposal={proposal} />);

    expect(await screen.findByText('GPU Burst Capacity')).toBeInTheDocument();
    expect(vi.mocked(marketplaceResourcesList)).not.toHaveBeenCalled();
  });

  // Regression: useTable's query fires when the hook first runs, before the
  // roles query has resolved. A fetchData in the parent closing over `roles`
  // captured undefined, cached an empty page, never refetched — and every
  // granted member rendered as "No roles were granted on the project."
  it('shows the granted roles once they load', async () => {
    vi.mocked(projectsRetrieve).mockImplementation(
      () =>
        Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
    );
    vi.mocked(projectsListUsersList).mockImplementation(() =>
      page([
        {
          role_name: 'Project manager',
          user_full_name: 'Alice Reviewer',
          user_username: 'alice',
        },
      ]),
    );
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page([
        {
          uuid: 'req-1',
          resource: null,
          requested_offering: { offering_name: 'HPC Standard Allocation' },
        },
      ]),
    );

    renderSection(<AllocationOutcomeSection proposal={proposal} />);

    expect(await screen.findByText('Alice Reviewer')).toBeInTheDocument();
    expect(screen.getByText('Project manager')).toBeInTheDocument();
    expect(
      screen.queryByText('No roles were granted on the project.'),
    ).not.toBeInTheDocument();
  });
  // Anything but a 403 is a fault, not "not yours to see": the section says
  // it could not load instead of disappearing as if nobody had been granted.
  it('reports a failure to load the project roles', async () => {
    vi.mocked(projectsRetrieve).mockImplementation(
      () =>
        Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
    );
    vi.mocked(projectsListUsersList).mockImplementation(
      () =>
        Promise.reject({
          detail: 'Not found.',
          response: { status: 404 },
        }) as any,
    );
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page([]),
    );

    renderSection(<AllocationOutcomeSection proposal={proposal} />);

    expect(
      await screen.findByText(
        'Unable to load who was given access to the project.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Project access:')).toBeInTheDocument();
    expect(
      screen.queryByText('No roles were granted on the project.'),
    ).not.toBeInTheDocument();
  });

  // A reviewer may receive the granted members without their name or username
  // when the call conceals them: the member cell shows a dash, not a blank.
  it('shows a dash for a member whose identity is concealed', async () => {
    vi.mocked(projectsRetrieve).mockImplementation(
      () =>
        Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
    );
    vi.mocked(projectsListUsersList).mockImplementation(() =>
      page([{ role_name: 'Project member' }]),
    );
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page([]),
    );

    renderSection(<AllocationOutcomeSection proposal={proposal} />);

    const row = await screen.findByRole('row', { name: /Project member/ });
    const [memberCell] = within(row).getAllByRole('cell');
    expect(memberCell).toHaveTextContent(DASH_ESCAPE_CODE);
  });

  // The API names the system role; the table shows the description the
  // portal gives it.
  it('names a granted project role by its description', async () => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'PROJECT.MEMBER',
        description: 'Project member',
        content_type: 'project',
      },
    ] as any);
    vi.mocked(projectsRetrieve).mockImplementation(
      () =>
        Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
    );
    vi.mocked(projectsListUsersList).mockImplementation(() =>
      page([{ user_full_name: 'Alice Doe', role_name: 'PROJECT.MEMBER' }]),
    );
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page([]),
    );

    renderSection(<AllocationOutcomeSection proposal={proposal} />);

    const row = await screen.findByRole('row', { name: /Alice Doe/ });
    expect(row).toHaveTextContent('Project member');
    expect(row).not.toHaveTextContent('PROJECT.MEMBER');
    vi.restoreAllMocks();
  });

  describe('the Allocated column', () => {
    const RESOURCE_UUID = 'bbbbccccddddeeeeffff000011112222';
    const resourceUrl = `https://example.org/api/marketplace-resources/${RESOURCE_UUID}/`;

    const requestRow = (overrides: Record<string, any>) => ({
      uuid: `req-${Math.random()}`,
      resource: resourceUrl,
      requested_offering: {
        uuid: 'ro-1',
        state: 'accepted',
        offering_name: 'HPC Premium Allocation',
      },
      ...overrides,
    });

    const renderRequests = (rows: any[]) => {
      vi.mocked(projectsRetrieve).mockImplementation(
        () =>
          Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
      );
      vi.mocked(projectsListUsersList).mockImplementation(() => page([]));
      vi.mocked(marketplaceResourcesList).mockImplementation(() => page([]));
      vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
        page(rows),
      );
      return renderSection(<AllocationOutcomeSection proposal={proposal} />);
    };

    it.each([
      ['pending-provider', 'Awaiting the provider'],
      ['executing', 'Being provisioned'],
      ['erred', 'Provisioning failed'],
      ['rejected', 'Refused by the provider'],
      ['pending-start-date', 'Waiting for the project to start'],
    ])('explains an order that is %s', async (orderState, label) => {
      renderRequests([requestRow({ order_state: orderState })]);

      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(screen.getByText('Open resource')).toBeInTheDocument();
      expect(
        screen.getByText('0 of 1 requests were allocated.'),
      ).toBeInTheDocument();
    });

    it('shows the reason a refused order gives the viewer', async () => {
      renderRequests([
        requestRow({
          order_state: 'rejected',
          order_rejection_comment: 'The storage pool is fully committed.',
        }),
      ]);

      expect(
        await screen.findByText('The storage pool is fully committed.'),
      ).toBeInTheDocument();
    });

    it('links an allocated resource and adds no summary', async () => {
      renderRequests([requestRow({ order_state: 'done' })]);

      expect(await screen.findByText('Open')).toBeInTheDocument();
      expect(screen.queryByText(/requests were allocated/)).toBeNull();
    });

    it('explains an offering the provider has not accepted', async () => {
      renderRequests([
        requestRow({
          resource: null,
          order_state: null,
          requested_offering: {
            uuid: 'ro-2',
            state: 'canceled',
            offering_name: 'Cloud VM Package',
          },
        }),
      ]);

      expect(
        await screen.findByText('Offering not accepted for this call'),
      ).toBeInTheDocument();
    });

    it('keeps a dash, with a tooltip, when nothing explains the row', async () => {
      renderRequests([requestRow({ resource: null, order_state: null })]);

      expect(
        await screen.findByText('HPC Premium Allocation'),
      ).toBeInTheDocument();
      const row = screen.getByRole('row', { name: /HPC Premium Allocation/ });
      expect(within(row).getAllByRole('cell')[1]).toHaveTextContent(
        DASH_ESCAPE_CODE,
      );
    });

    it('reads the award: a reduced amount and a dropped request', async () => {
      vi.mocked(projectsRetrieve).mockImplementation(
        () =>
          Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
      );
      vi.mocked(projectsListUsersList).mockImplementation(() => page([]));
      vi.mocked(marketplaceResourcesList).mockImplementation(() => page([]));
      const hpc = {
        uuid: 'ro-1',
        state: 'accepted',
        offering_name: 'HPC Standard Allocation',
        offering_type: 'Marketplace.Basic',
        components: [
          {
            type: 'cpu_hours',
            name: 'CPU hours',
            measured_unit: 'h',
            billing_type: 'limit',
          },
        ],
      };
      const storage = {
        uuid: 'ro-2',
        state: 'accepted',
        offering_name: 'Research Data Storage',
      };
      const awardRows = [
        {
          uuid: 'aw-1',
          change: 'changed',
          requested: {
            uuid: 'req-1',
            requested_offering: hpc,
            limits: { cpu_hours: 80000 },
          },
          awarded: {
            uuid: 'aw-1',
            requested_offering: hpc,
            limits: { cpu_hours: 60000 },
            resource: RESOURCE_UUID,
            order_state: 'done',
          },
        },
        {
          uuid: 'req-2',
          change: 'removed',
          requested: {
            uuid: 'req-2',
            requested_offering: storage,
            limits: { storage: 200 },
          },
        },
      ] as any;

      renderSection(
        <AllocationOutcomeSection proposal={proposal} awardRows={awardRows} />,
      );

      expect(
        await screen.findByText('1 of 2 requests were allocated.'),
      ).toBeInTheDocument();
      expect(screen.getAllByText('Not awarded').length).toBeGreaterThan(0);
      expect(screen.getByText('60000 h')).toBeInTheDocument();
      expect(screen.getByText('requested 80000 h')).toBeInTheDocument();
    });

    // The award can load before the requests it pairs with. Paired with
    // nothing it reads as "added"; the table must rebuild once the request
    // arrives, or the line keeps a dash under Requested.
    it('rebuilds a line once its request arrives after the award', async () => {
      vi.mocked(projectsRetrieve).mockImplementation(
        () =>
          Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
      );
      vi.mocked(projectsListUsersList).mockImplementation(() => page([]));
      vi.mocked(marketplaceResourcesList).mockImplementation(() => page([]));
      const offering = {
        uuid: 'ro-1',
        state: 'accepted',
        offering_name: 'HPC Premium Allocation',
      };
      const awarded = {
        uuid: 'aw-1',
        requested_offering: offering,
        resource: RESOURCE_UUID,
        order_state: 'done',
      };
      const requested = {
        uuid: 'req-1',
        requested_offering: { ...offering, offering_name: 'Asked on premium' },
      };

      const { rerender } = renderSection(
        <AllocationOutcomeSection
          proposal={proposal}
          awardRows={[{ uuid: 'aw-1', awarded, change: 'added' }] as any}
        />,
      );
      expect(await screen.findByText('Added')).toBeInTheDocument();

      rerender(
        <DrawerProvider>
          <Provider store={configureStore()({ tables: {} })}>
            <AllocationOutcomeSection
              proposal={proposal}
              awardRows={
                [
                  { uuid: 'aw-1', awarded, requested, change: 'unchanged' },
                ] as any
              }
            />
          </Provider>
        </DrawerProvider>,
      );
      expect(await screen.findByText('Asked on premium')).toBeInTheDocument();
      expect(screen.queryByText('Added')).not.toBeInTheDocument();
    });
  });

  describe('the award against the request', () => {
    const offering = (name: string) => ({
      requested_offering: { offering_name: name },
    });
    const awardRow = (
      uuid: string,
      change: string,
      requested: string | null,
      awarded: string | null,
    ) => ({
      uuid,
      change,
      requested: requested
        ? { uuid: `req-${uuid}`, ...offering(requested) }
        : undefined,
      awarded: awarded
        ? { uuid, resource: null, ...offering(awarded) }
        : undefined,
    });

    const mockProject = () => {
      vi.mocked(projectsRetrieve).mockImplementation(
        () =>
          Promise.resolve({ data: { name: 'P', customer_name: 'Org' } }) as any,
      );
      vi.mocked(projectsListUsersList).mockImplementation(() => page([]));
    };

    it('says once that it matched, in one column, when every line is unchanged', async () => {
      mockProject();
      renderSection(
        <AllocationOutcomeSection
          proposal={proposal}
          awardRows={
            [
              awardRow('a1', 'unchanged', 'HPC Standard', 'HPC Standard'),
              awardRow('a2', 'unchanged', 'GPU Burst', 'GPU Burst'),
            ] as any
          }
        />,
      );

      expect(await screen.findByText('GPU Burst')).toBeInTheDocument();
      expect(screen.getByText('Awarded as requested.')).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Offering' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('columnheader', { name: 'Awarded' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('columnheader', { name: 'Requested' }),
      ).not.toBeInTheDocument();
      // Each offering once: the request, not the award repeating it.
      expect(screen.getAllByText('HPC Standard')).toHaveLength(1);
      expect(screen.queryByText('As requested')).not.toBeInTheDocument();
    });

    it('leaves unchanged lines blank under Awarded when some differ', async () => {
      mockProject();
      renderSection(
        <AllocationOutcomeSection
          proposal={proposal}
          awardRows={
            [
              awardRow('a1', 'unchanged', 'HPC Standard', 'HPC Standard'),
              awardRow('a2', 'moved', 'GPU Burst', 'GPU Reserved'),
              awardRow('a3', 'removed', 'Archive Storage', null),
            ] as any
          }
        />,
      );

      expect(await screen.findByText('GPU Reserved')).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Requested' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Awarded' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Awarded as requested.'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(
          'Rows left blank under Awarded were awarded as requested.',
        ),
      ).toBeInTheDocument();

      const unchanged = screen.getByRole('row', { name: /HPC Standard/ });
      const [, awardedCell] = within(unchanged).getAllByRole('cell');
      expect(awardedCell).toBeEmptyDOMElement();
      expect(screen.getAllByText('HPC Standard')).toHaveLength(1);

      const moved = screen.getByRole('row', { name: /GPU Burst/ });
      expect(within(moved).getByText('Moved')).toBeInTheDocument();
      // The Awarded cell carries the badge; the Allocated cell says the same
      // of the outcome, so the badge is looked for in its own cell.
      const removed = screen.getByRole('row', { name: /Archive Storage/ });
      const [, removedAwardedCell] = within(removed).getAllByRole('cell');
      expect(
        within(removedAwardedCell).getByText('Not awarded'),
      ).toBeInTheDocument();
    });
  });
});
