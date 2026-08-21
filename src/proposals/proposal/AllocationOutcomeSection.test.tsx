import { screen, waitFor } from '@testing-library/react';
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

import { DrawerProvider } from '@/drawer/DrawerContext';
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
});
