import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsReportsBudgetsGlobalRetrieve,
  callManagingOrganisationsReportsBudgetsRetrieve,
  callManagingOrganisationsReportsPortfolioGlobalRetrieve,
  callManagingOrganisationsReportsRoundsGlobalRetrieve,
  callManagingOrganisationsReportsPortfolioRetrieve,
  callManagingOrganisationsReportsReviewersRetrieve,
  callManagingOrganisationsReportsRoundsRetrieve,
  callManagingOrganisationsReportsWorkflowRetrieve,
  proposalProtectedCallsReportsBudgetsRetrieve,
  proposalProtectedCallsReportsPortfolioRetrieve,
  proposalProtectedCallsReportsRoundsRetrieve,
} from 'waldur-js-client';

import { queryClient as appQueryClient } from '@/core/queryClient';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { router } from '@/router';
import { createTablesStore } from '@/table/store';
import { renderWithProviders } from '@/test/harness';

import { CallReportsTab } from './CallReportsTab';
import {
  budgetReport,
  portfolioReport,
  reviewerReport,
  roundReport,
  workflowReport,
} from './fixtures';
import { ReportsPage } from './ReportsPage';

const ORGANIZATION = 'org1';
const AI_CALL = 'ca200000000000000000000000000002';
const AI_ROUND = 'ca500000000000000000000000000003';
// A round of no call in scope: the API answers it with 404.
const OTHER_ROUND = 'ca5000000000000000000000000000ff';

const portfolio = vi.mocked(callManagingOrganisationsReportsPortfolioRetrieve);

const setRoute = (name: string, params: Record<string, unknown> = {}) =>
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name },
    params,
  } as any);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <DrawerProvider>
    <Provider store={configureStore()({ tables: {} })}>{children}</Provider>
  </DrawerProvider>
);

const renderOrganizationReports = (params: Record<string, unknown> = {}) => {
  setRoute('call-management.reports', params);
  return renderWithProviders(
    <ReportsPage scope={{ organizationUuid: ORGANIZATION }} />,
    { wrapper: Wrapper },
  );
};

/** The states the page sent the router to. */
const navigatedTo = () =>
  vi.mocked(router.stateService.go).mock.calls.map(([state]) => state);

const queryOf = (mock: { mock: { calls: any[][] } }) =>
  mock.mock.calls.map(([options]) => options.query);

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    portfolio.mockResolvedValue({ data: portfolioReport } as any);
  });

  afterEach(() => {
    setRoute('home');
    appQueryClient.clear();
  });

  it('shows the portfolio cards, charts and a row per call', async () => {
    renderOrganizationReports();

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    // Accepted of decided, next to the rate.
    expect(screen.getAllByText('7 of 11 decided').length).toBeGreaterThan(0);
    expect(screen.getByText('Outcomes per call')).toBeInTheDocument();
    expect(screen.getByText('Submissions per month')).toBeInTheDocument();
    expect(
      await screen.findByText(
        'EuroHPC AI for Science and Collaborative EU Projects Access',
        { selector: 'a' },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('EuroHPC Regular Access', { selector: 'a' }),
    ).toBeInTheDocument();
    expect(portfolio).toHaveBeenCalledWith({
      path: { uuid: ORGANIZATION },
      query: {},
    });
  });

  it('puts the report in one card, titled and described, with its filters', async () => {
    renderOrganizationReports();

    expect(
      await screen.findByRole('heading', { level: 3, name: 'Portfolio' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Proposals per call and round: how many were submitted, where they stand and how many were accepted.',
      ),
    ).toBeInTheDocument();
    // The filters join the header once the calls in scope are known.
    expect(await screen.findByLabelText('Calls')).toBeInTheDocument();
    expect(screen.getByLabelText('Round')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Submitted between' }),
    ).toBeInTheDocument();
  });

  it('keeps the card while the scope loads', () => {
    portfolio.mockReturnValue(new Promise(() => undefined) as any);
    renderOrganizationReports();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Portfolio' }),
    ).toBeInTheDocument();
  });

  it('shows the workflow steps with their overdue proposals', async () => {
    vi.mocked(
      callManagingOrganisationsReportsWorkflowRetrieve,
    ).mockResolvedValue({ data: workflowReport } as any);
    renderOrganizationReports({ report: 'workflow' });

    expect(
      await screen.findByText('Proposals in the workflow'),
    ).toBeInTheDocument();
    expect(screen.getByText('Days per step')).toBeInTheDocument();
    expect(await screen.findByText('Technical assessment')).toBeInTheDocument();
    expect(screen.getByText('Administrative check')).toBeInTheDocument();
  });

  it('lists every workflow step on one page, in workflow order', async () => {
    const [step] = workflowReport.steps;
    const steps = Array.from({ length: 12 }, (_, index) => ({
      ...step,
      key: `step_${index + 1}`,
      name: `Step ${index + 1}`,
    }));
    vi.mocked(
      callManagingOrganisationsReportsWorkflowRetrieve,
    ).mockResolvedValue({ data: { ...workflowReport, steps } } as any);
    renderOrganizationReports({ report: 'workflow' });

    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(within(table).getByText('Step 12')).toBeInTheDocument(),
    );
    const names = within(table)
      .getAllByText(/^Step \d+$/)
      .map((cell) => cell.textContent);
    expect(names).toEqual(steps.map((item) => item.name));
  });

  it('shows each reviewer with their answers and reviews', async () => {
    vi.mocked(
      callManagingOrganisationsReportsReviewersRetrieve,
    ).mockResolvedValue({ data: reviewerReport } as any);
    renderOrganizationReports({ report: 'reviewers' });

    expect(await screen.findByText('Reviews per reviewer')).toBeInTheDocument();
    expect(await screen.findByText('Marie Curie')).toBeInTheDocument();
    // The parts add up to what was sent; only those holding any are named.
    expect(
      screen.getByText('3 sent: 1 accepted, 1 declined, 1 reassigned'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('1 sent: 1 blocked by a conflict of interest'),
    ).toBeInTheDocument();
    // The summary card breaks down every invitation of the scope.
    expect(
      screen.getByText(
        '8 sent: 4 accepted, 1 declined, 1 unanswered, 1 blocked by a conflict of interest, 1 reassigned',
      ),
    ).toBeInTheDocument();
  });

  // The chart leaves out reviewers with no review: only those count toward
  // whether it shows all of them.
  it.each([
    [16, 15, true],
    [15, 30, false],
  ])(
    'says the chart shows the busiest only when %i of its reviewers have reviews',
    async (withReviews, invitedOnly, noted) => {
      const [reviewer] = reviewerReport.reviewers;
      const person = (index: number, reviews: number) => ({
        ...reviewer,
        reviewer_uuid: `a4${String(index).padStart(30, '0')}`,
        reviewer_name: `Reviewer ${index}`,
        reviews_assigned: reviews,
      });
      vi.mocked(
        callManagingOrganisationsReportsReviewersRetrieve,
      ).mockResolvedValue({
        data: {
          ...reviewerReport,
          reviewers: [
            ...Array.from({ length: withReviews }, (_, i) => person(i, 3)),
            ...Array.from({ length: invitedOnly }, (_, i) =>
              person(100 + i, 0),
            ),
          ],
        },
      } as any);
      renderOrganizationReports({ report: 'reviewers' });

      expect(
        await screen.findByText('Reviews per reviewer'),
      ).toBeInTheDocument();
      expect(screen.queryByText('The 15 busiest reviewers') !== null).toBe(
        noted,
      );
    },
  );

  it('names an invitee with no account by the address invited', async () => {
    vi.mocked(
      callManagingOrganisationsReportsReviewersRetrieve,
    ).mockResolvedValue({ data: reviewerReport } as any);
    renderOrganizationReports({ report: 'reviewers' });

    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(
        within(table).getByText('new.reviewer@example.org'),
      ).toBeInTheDocument(),
    );
    expect(within(table).getByText('No account')).toBeInTheDocument();
    expect(within(table).getByText('1 sent: 1 unanswered')).toBeInTheDocument();
    // No account is not an inactive one.
    expect(within(table).queryByText('Inactive')).not.toBeInTheDocument();
  });

  it('shows each round and flags the one that came late', async () => {
    vi.mocked(callManagingOrganisationsReportsRoundsRetrieve).mockResolvedValue(
      { data: roundReport } as any,
    );
    renderOrganizationReports({ report: 'rounds' });

    expect(
      await screen.findByText('Late against the allocation date'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Round 11.12.2025-20.01.2026', {
        selector: 'a',
      }),
    ).toBeInTheDocument();
    // Whole days after the allocation date.
    expect(screen.getByText('+110')).toBeInTheDocument();
    expect(screen.getByText('Late')).toBeInTheDocument();
  });

  it('says what stage each round is at, and for how long', async () => {
    vi.mocked(callManagingOrganisationsReportsRoundsRetrieve).mockResolvedValue(
      { data: roundReport } as any,
    );
    renderOrganizationReports({ report: 'rounds' });

    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(within(table).getByText('Evaluating')).toBeInTheDocument(),
    );
    expect(within(table).getByText('17.4 days')).toBeInTheDocument();
    // A closed round is at no stage, and has no time at it.
    expect(within(table).getAllByText('Closed')).toHaveLength(2);
    // A round of an archived call is neither open nor late, whatever its
    // times say.
    expect(within(table).getByText('Call archived')).toBeInTheDocument();
    expect(within(table).queryByText('Open')).not.toBeInTheDocument();
    expect(within(table).getAllByText('Late')).toHaveLength(1);
  });

  it('draws the stage a round is at now after the ones it has done', async () => {
    vi.mocked(callManagingOrganisationsReportsRoundsRetrieve).mockResolvedValue(
      { data: roundReport } as any,
    );
    renderOrganizationReports({ report: 'rounds' });

    const options = JSON.parse(
      (await screen.findByTestId('echart')).textContent,
    );
    const names = options.series.map((series) => series.name);
    expect(names).toEqual([
      'Cut-off to evaluation',
      'Evaluating',
      'Deciding',
      'Under way, so far',
    ]);
    const underWay = options.series[3];
    // Only the round in evaluation is under way: its days so far, hatched.
    // The round of the archived call has nothing under way to draw.
    expect(underWay.data.filter(Boolean)).toHaveLength(1);
    const [bar] = underWay.data.filter(Boolean);
    expect(bar.value).toBe(17.4);
    expect(bar.itemStyle.decal).toBeTruthy();
    // Every bar of a stack, completed or not, comes from one stack.
    expect(new Set(options.series.map((series) => series.stack)).size).toBe(1);
  });

  it('lists each budget once, marking a round pool within the call pool', async () => {
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockResolvedValue({ data: budgetReport } as any);
    renderOrganizationReports({ report: 'budgets' });

    expect(await screen.findByText('Pools used up')).toBeInTheDocument();
    expect(screen.getByText('Pool use')).toBeInTheDocument();
    const table = await screen.findByRole('table');
    // The call-wide Booster pool and a round pool drawing on it, then the
    // Quantum round's awards outside any pool.
    await waitFor(() =>
      expect(within(table).getAllByText('Booster partition')).toHaveLength(2),
    );
    expect(within(table).getAllByText('HPC Standard Allocation')).toHaveLength(
      1,
    );
    // The row outside any pool offers nothing: a dash, with "No pool" in its
    // tooltip.
    expect(
      within(table).getByRole('columnheader', { name: /Offered/ }),
    ).toBeInTheDocument();
    expect(within(table).queryByText('No pool')).not.toBeInTheDocument();
    expect(
      within(table).getAllByText('Part of the call-wide pool'),
    ).toHaveLength(1);
  });

  it('names the budget of every row, a round pool under its call-wide pool', async () => {
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockResolvedValue({ data: budgetReport } as any);
    renderOrganizationReports({ report: 'budgets' });

    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(within(table).getByText('Call-wide pool')).toBeInTheDocument(),
    );
    expect(
      within(table).getByRole('columnheader', { name: /^Pool/ }),
    ).toBeInTheDocument();
    expect(
      within(table).getByText('Part of the call-wide pool'),
    ).toBeInTheDocument();
    expect(within(table).getByText('No pool of its own')).toBeInTheDocument();
    // The call-wide pool's row comes first, the round's share right under it.
    const rows = within(table).getAllByRole('row').slice(1);
    expect(within(rows[0]).queryByText('Call-wide pool')).toBeInTheDocument();
    expect(
      within(rows[1]).queryByText('Part of the call-wide pool'),
    ).toBeInTheDocument();
  });

  it('names chart bars by component and scope', async () => {
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockResolvedValue({ data: budgetReport } as any);
    renderOrganizationReports({ report: 'budgets' });

    const options = JSON.parse(
      (await screen.findByTestId('echart')).textContent,
    );
    expect(options.yAxis.data).toEqual([
      'GPU Hours · call-wide · EuroHPC Extreme Scale Access',
      'GPU Hours · Round 11.12.2025-20.01.2026 · EuroHPC Extreme Scale Access',
    ]);
  });

  it('shows an overspent pool as over budget, not as a glitch', async () => {
    const [callPool, ...others] = budgetReport.pools;
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockResolvedValue({
      data: {
        ...budgetReport,
        pools: [
          {
            ...callPool,
            offered_total: 10,
            awarded: 36010,
            remaining: -36000,
            awarded_share: 3601,
          },
          ...others,
        ],
      },
    } as any);
    renderOrganizationReports({ report: 'budgets' });

    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(within(table).getByText(/^Over by 36K/)).toBeInTheDocument(),
    );
    expect(within(table).getByText('Over budget')).toBeInTheDocument();
    expect(within(table).queryByText(/360,100%/)).not.toBeInTheDocument();
    // The bar stops at the whole offer, in the danger colour.
    const options = JSON.parse(screen.getByTestId('echart').textContent);
    const [overspent] = options.series[0].data;
    expect(overspent.value).toBe(1);
    expect(overspent.itemStyle.color).toBeDefined();
    // Used up, and more.
    expect(screen.getByText('Pools used up')).toBeInTheDocument();
  });

  it('counts requests instead of pools when no row has a pool', async () => {
    const [, , noPool] = budgetReport.pools;
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockResolvedValue({
      data: {
        totals: { pools: 0, pools_exhausted: 0 },
        pools: [
          noPool,
          { ...noPool, component_type: 'storage', component_name: 'Storage' },
        ],
      },
    } as any);
    renderOrganizationReports({ report: 'budgets' });

    expect(
      await screen.findByText(
        'These calls have no resource pools, so there is nothing to measure awards against. Requests and awards are listed below.',
      ),
    ).toBeInTheDocument();
    // No pool tiles or empty pool chart to contradict the rows below.
    expect(screen.queryByText('Pools used up')).not.toBeInTheDocument();
    expect(screen.queryByText('Pool use')).not.toBeInTheDocument();
    expect(screen.getByText('Offerings requested')).toBeInTheDocument();
    expect(screen.getByText('Components awarded')).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(
      within(table).queryByRole('columnheader', { name: /Offered/ }),
    ).not.toBeInTheDocument();
    expect(
      within(table).queryByRole('columnheader', { name: /Remaining/ }),
    ).not.toBeInTheDocument();
  });

  it('hides the call and round every row repeats once the filters name them', async () => {
    const noPool = budgetReport.pools[2];
    const qu = noPool.call_uuid;
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockImplementation(((options) =>
      Promise.resolve({
        data: options.query?.round_uuid
          ? { ...budgetReport, pools: [noPool] }
          : budgetReport,
      })) as any);
    renderOrganizationReports({
      report: 'budgets',
      call: [qu],
      round: noPool.round_uuid,
    });

    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(
        within(table).getByText('HPC Standard Allocation'),
      ).toBeInTheDocument(),
    );
    expect(
      within(table).queryByRole('columnheader', { name: /^Pool/ }),
    ).not.toBeInTheDocument();
    expect(
      within(table).queryByRole('columnheader', { name: /^Call/ }),
    ).not.toBeInTheDocument();
    // A round with no pool of its own: the note mirrors the call's.
    expect(
      screen.getByText(
        'This round has no resource pools, so there is nothing to measure awards against. Requests and awards are listed below.',
      ),
    ).toBeInTheDocument();
  });

  it('keeps the pool column while a row is the call-wide pool', async () => {
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockResolvedValue({ data: budgetReport } as any);
    const [callPool, roundPool] = budgetReport.pools;
    renderOrganizationReports({
      report: 'budgets',
      call: [callPool.call_uuid],
      round: roundPool.round_uuid,
    });

    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(
        within(table).getByRole('columnheader', { name: /^Pool/ }),
      ).toBeInTheDocument(),
    );
    expect(within(table).getByText('Call-wide pool')).toBeInTheDocument();
  });

  it('does not send the dates to the budgets, and says why', async () => {
    vi.mocked(
      callManagingOrganisationsReportsBudgetsRetrieve,
    ).mockResolvedValue({ data: budgetReport } as any);
    renderOrganizationReports({
      report: 'budgets',
      from: '2026-01-01',
      to: '2026-06-30',
    });

    expect(await screen.findByText('Pools used up')).toBeInTheDocument();
    expect(
      queryOf(vi.mocked(callManagingOrganisationsReportsBudgetsRetrieve)),
    ).toEqual([{}]);
    const dates = screen.getByRole('group', { name: 'Submitted between' });
    within(dates)
      .getAllByRole('textbox')
      .forEach((input) => expect(input).toBeDisabled());
  });

  it('reads the filters from the URL and sends them', async () => {
    renderOrganizationReports({
      call: [AI_CALL],
      round: AI_ROUND,
      from: '2026-01-01',
      to: '2026-06-30',
    });

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    expect(queryOf(portfolio)).toContainEqual({
      call_uuid: [AI_CALL],
      round_uuid: AI_ROUND,
      submitted_from: '2026-01-01',
      submitted_to: '2026-06-30',
    });
    // The chosen round shows in its picker.
    expect(screen.getByText('Round 22.10.2026-22.10.2027')).toBeInTheDocument();
  });

  it('neither sends nor shows a lone date from the URL', async () => {
    renderOrganizationReports({ from: '2026-01-01' });

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    expect(queryOf(portfolio)).toEqual([{}]);
    const dates = screen.getByRole('group', { name: 'Submitted between' });
    within(dates)
      .getAllByRole('textbox')
      .forEach((input) => expect(input).toHaveValue(''));
  });

  // A table fetches on mount, sort and page: handed the report's refetch,
  // it asked for the report again and again. With the app's own client, as
  // in the browser.
  // The reports across every organization share the page: same check.
  it.each([
    [
      'of an organization',
      { organizationUuid: ORGANIZATION },
      'call-management.reports',
      callManagingOrganisationsReportsBudgetsRetrieve,
    ],
    [
      'across every organization',
      { global: true },
      'reporting-proposals-list',
      callManagingOrganisationsReportsBudgetsGlobalRetrieve,
    ],
  ])(
    'fetches the budgets %s once, and again only from the card Refresh',
    async (_label, scope, route, fetcher) => {
      const budgets = vi.mocked(
        fetcher as typeof callManagingOrganisationsReportsBudgetsRetrieve,
      );
      budgets.mockResolvedValue({ data: budgetReport } as any);
      vi.mocked(
        callManagingOrganisationsReportsPortfolioGlobalRetrieve,
      ).mockResolvedValue({ data: portfolioReport } as any);
      setRoute(route, { report: 'budgets' });
      // The app's table reducer too: the mock store keeps tables from ever
      // leaving their first state.
      const store = createTablesStore();
      renderWithProviders(<ReportsPage scope={scope} />, {
        wrapper: ({ children }) => (
          <DrawerProvider>
            <Provider store={store}>{children}</Provider>
          </DrawerProvider>
        ),
        queryClient: appQueryClient,
      });

      const table = await screen.findByRole('table');
      await waitFor(() =>
        expect(within(table).getByText('Call-wide pool')).toBeInTheDocument(),
      );
      // Let the table settle: its mount fetch, the rows arriving, re-paging.
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(budgets).toHaveBeenCalledTimes(1);
      // One Refresh, the card's: the table shows none of its own.
      const refreshes = screen.getAllByRole('button', { name: 'Refresh' });
      expect(refreshes).toHaveLength(1);
      await userEvent.click(refreshes[0]);
      await waitFor(() => expect(budgets).toHaveBeenCalledTimes(2));
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(budgets).toHaveBeenCalledTimes(2);
    },
  );

  it('writes a chosen round to the URL', async () => {
    renderOrganizationReports({ call: [AI_CALL] });

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    await userEvent.click(screen.getByText('All rounds'));
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(router.stateService.go).toHaveBeenCalledWith(
      'call-management.reports',
      { round: AI_ROUND },
      { location: 'replace' },
    );
  });

  it('clears every filter at once', async () => {
    renderOrganizationReports({ call: [AI_CALL], round: AI_ROUND });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Clear filters' }),
    );
    expect(router.stateService.go).toHaveBeenCalledWith(
      'call-management.reports',
      { call: null, round: null, from: null, to: null },
      { location: 'replace' },
    );
  });

  it('says when nothing matches the filters, and offers to clear them', async () => {
    portfolio.mockImplementation(((options) =>
      Promise.resolve({
        data: options.query?.round_uuid
          ? {
              ...portfolioReport,
              totals: { ...portfolioReport.totals, proposals: 0 },
            }
          : portfolioReport,
      })) as any);
    renderOrganizationReports({ round: AI_ROUND });

    expect(
      await screen.findByText('Nothing matches these filters'),
    ).toBeInTheDocument();
  });

  it('says when the scope has nothing to report yet', async () => {
    portfolio.mockResolvedValue({
      data: {
        totals: { ...portfolioReport.totals, proposals: 0 },
        calls: portfolioReport.calls,
        months: [],
      },
    } as any);
    renderOrganizationReports();

    expect(
      await screen.findByText('Nothing to report yet'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No proposal has been made to these calls yet.'),
    ).toBeInTheDocument();
  });

  it('says when the organization has no call to report on', async () => {
    portfolio.mockResolvedValue({
      data: { ...portfolioReport, calls: [] },
    } as any);
    renderOrganizationReports();

    expect(
      await screen.findByText('No calls to report on'),
    ).toBeInTheDocument();
  });

  it('tells a filter outside the scope from a failure', async () => {
    portfolio.mockImplementation(((options) =>
      options.query?.round_uuid
        ? Promise.reject({ response: { status: 404 } })
        : Promise.resolve({ data: portfolioReport })) as any);
    renderOrganizationReports({ round: OTHER_ROUND });

    expect(
      await screen.findByText('These filters do not match the reports'),
    ).toBeInTheDocument();
  });

  it.each([
    [
      'dates in the wrong order',
      { submitted_to: ['The end date is before the start date.'] },
      'The start date must not be after the end date.',
    ],
    [
      'anything else',
      { round_uuid: ['Not a valid UUID.'] },
      'These filters are not valid.',
    ],
  ])('explains a refused filter: %s', async (_label, body, message) => {
    portfolio.mockImplementation(((options) =>
      options.query?.round_uuid
        ? Promise.reject({ ...body, response: { status: 400 }, status: 400 })
        : Promise.resolve({ data: portfolioReport })) as any);
    renderOrganizationReports({ round: AI_ROUND });

    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  // The app's query client sends a 404 to the Not Found page unless the
  // query says it explains that status itself.
  it('keeps a filter outside the scope on the page with the app client', async () => {
    portfolio.mockImplementation(((options) =>
      options.query?.round_uuid
        ? Promise.reject({ response: { status: 404 }, status: 404 })
        : Promise.resolve({ data: portfolioReport })) as any);
    setRoute('call-management.reports', { round: OTHER_ROUND });
    renderWithProviders(
      <ReportsPage scope={{ organizationUuid: ORGANIZATION }} />,
      { wrapper: Wrapper, queryClient: appQueryClient },
    );

    expect(
      await screen.findByText('These filters do not match the reports'),
    ).toBeInTheDocument();
    expect(navigatedTo()).not.toContain('errorPage.notFound');
  });

  it('says there is nothing to report on when the scope is refused, with the app client', async () => {
    portfolio.mockRejectedValue({ response: { status: 404 }, status: 404 });
    setRoute('call-management.reports', {});
    renderWithProviders(
      <ReportsPage scope={{ organizationUuid: ORGANIZATION }} />,
      { wrapper: Wrapper, queryClient: appQueryClient },
    );

    expect(
      await screen.findByText('No calls to report on'),
    ).toBeInTheDocument();
    expect(navigatedTo()).not.toContain('errorPage.notFound');
  });
});

describe('CallReportsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setRoute('protected-call.manage', { tab: 'reports' });
  });

  afterEach(() => {
    setRoute('home');
  });

  it('reports on the call alone, with no call filter', async () => {
    const callPortfolio = vi.mocked(
      proposalProtectedCallsReportsPortfolioRetrieve,
    );
    callPortfolio.mockResolvedValue({
      data: { ...portfolioReport, calls: [portfolioReport.calls[1]] },
    } as any);
    renderWithProviders(<CallReportsTab call={{ uuid: 'call1' } as any} />, {
      wrapper: Wrapper,
    });

    expect(await screen.findByText('Outcomes per round')).toBeInTheDocument();
    expect(callPortfolio).toHaveBeenCalledWith({
      path: { uuid: 'call1' },
      query: {},
    });
    expect(portfolio).not.toHaveBeenCalled();
    expect(screen.queryByText('All calls')).not.toBeInTheDocument();
    expect(screen.getByText('All rounds')).toBeInTheDocument();
  });

  it('points a call with no pools to its Resource pools tab', async () => {
    setRoute('protected-call.manage', { tab: 'reports', report: 'budgets' });
    vi.mocked(proposalProtectedCallsReportsPortfolioRetrieve).mockResolvedValue(
      { data: portfolioReport } as any,
    );
    vi.mocked(proposalProtectedCallsReportsBudgetsRetrieve).mockResolvedValue({
      data: {
        totals: { pools: 0, pools_exhausted: 0 },
        pools: [budgetReport.pools[2]],
      },
    } as any);
    renderWithProviders(<CallReportsTab call={{ uuid: 'call1' } as any} />, {
      wrapper: Wrapper,
    });

    expect(
      await screen.findByText(
        'This call has no resource pools, so there is nothing to measure awards against. Requests and awards are listed below.',
      ),
    ).toBeInTheDocument();
    const link = screen.getByText('Open resource pools');
    // The test router renders a link's state and params as its href.
    expect(link.getAttribute('href')).toContain('protected-call.manage');
    expect(link.getAttribute('href')).toContain('"tab":"resource-pools"');
    expect(link.getAttribute('href')).toContain('"report":null');
  });

  it('sends the round but never a call filter', async () => {
    setRoute('protected-call.manage', {
      tab: 'reports',
      report: 'rounds',
      call: [AI_CALL],
      round: AI_ROUND,
    });
    vi.mocked(proposalProtectedCallsReportsPortfolioRetrieve).mockResolvedValue(
      { data: portfolioReport } as any,
    );
    const rounds = vi.mocked(proposalProtectedCallsReportsRoundsRetrieve);
    rounds.mockResolvedValue({ data: roundReport } as any);
    renderWithProviders(<CallReportsTab call={{ uuid: 'call1' } as any} />, {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(rounds).toHaveBeenCalledWith({
        path: { uuid: 'call1' },
        query: { round_uuid: AI_ROUND },
      }),
    );
  });
});

describe('the call reports across every organization', () => {
  const ORG_ONE = 'cb000000000000000000000000000001';
  const ORG_TWO = 'cb000000000000000000000000000002';
  const globalPortfolio = vi.mocked(
    callManagingOrganisationsReportsPortfolioGlobalRetrieve,
  );

  const renderGlobal = (params: Record<string, unknown> = {}) => {
    setRoute('reporting-proposals-list', params);
    return renderWithProviders(<ReportsPage scope={{ global: true }} />, {
      wrapper: Wrapper,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalPortfolio.mockResolvedValue({ data: portfolioReport } as any);
  });

  afterEach(() => {
    setRoute('home');
  });

  it('asks the global endpoint, with no organization in the path', async () => {
    renderGlobal();

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    expect(globalPortfolio).toHaveBeenCalledWith({ query: {} });
    expect(portfolio).not.toHaveBeenCalled();
  });

  it('reads the organizations from the URL, sends them and narrows the calls', async () => {
    renderGlobal({ organization: [ORG_TWO] });

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    expect(queryOf(globalPortfolio)).toContainEqual({
      organisation_uuid: [ORG_TWO],
    });
    expect(screen.getByText('Regional Computing Board')).toBeInTheDocument();
    // Only the chosen organization's calls are offered.
    await userEvent.click(screen.getByText('All calls'));
    expect(
      await screen.findByRole('option', { name: 'EuroHPC Regular Access' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', {
        name: 'EuroHPC AI for Science and Collaborative EU Projects Access',
      }),
    ).not.toBeInTheDocument();
  });

  it('writes a chosen organization to the URL', async () => {
    renderGlobal();

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    await userEvent.click(screen.getByText('All organizations'));
    await userEvent.click(
      await screen.findByRole('option', { name: 'National Research Council' }),
    );

    expect(router.stateService.go).toHaveBeenCalledWith(
      'reporting-proposals-list',
      { organization: [ORG_ONE] },
      { location: 'replace' },
    );
  });

  it('drops the calls of an organization no longer chosen', async () => {
    renderGlobal({ organization: [ORG_ONE, ORG_TWO], call: [AI_CALL] });

    expect(await screen.findByText('Success rate')).toBeInTheDocument();
    // Remove the first organization, whose call is chosen.
    const [remove] = screen.getAllByRole('button', { name: /^Remove/ });
    await userEvent.click(remove);

    expect(router.stateService.go).toHaveBeenCalledWith(
      'reporting-proposals-list',
      { organization: [ORG_TWO], call: null },
      { location: 'replace' },
    );
  });

  it('names the organization on each row while the rows span several', async () => {
    const rounds = vi.mocked(
      callManagingOrganisationsReportsRoundsGlobalRetrieve,
    );
    // The rows of the chosen organization only, as the API answers.
    rounds.mockImplementation(((options) =>
      Promise.resolve({
        data: options.query?.organisation_uuid
          ? {
              ...roundReport,
              rounds: roundReport.rounds.filter((round) =>
                options.query.organisation_uuid.includes(
                  round.organisation_uuid,
                ),
              ),
            }
          : roundReport,
      })) as any);
    const { unmount } = renderGlobal({ report: 'rounds' });

    let table = await screen.findByRole('table');
    await waitFor(() =>
      expect(
        within(table).getByRole('columnheader', { name: /^Organization/ }),
      ).toBeInTheDocument(),
    );
    expect(
      within(table).getAllByText('Regional Computing Board').length,
    ).toBeGreaterThan(0);
    unmount();

    renderGlobal({ report: 'rounds', organization: [ORG_ONE] });
    table = await screen.findByRole('table');
    await waitFor(() =>
      expect(
        within(table).getByText('Round 11.12.2025-20.01.2026', {
          selector: 'a',
        }),
      ).toBeInTheDocument(),
    );
    expect(
      within(table).queryByRole('columnheader', { name: /^Organization/ }),
    ).not.toBeInTheDocument();
  });

  // Every call of one organization, as on a deployment with only one: the
  // organization tells nothing apart, and would only crowd the call names.
  it('leaves the organization out when every row is of one', async () => {
    globalPortfolio.mockResolvedValue({
      data: {
        ...portfolioReport,
        calls: portfolioReport.calls.map((call) => ({
          ...call,
          organisation_uuid: ORG_ONE,
          organisation_name: 'National Research Council',
        })),
      },
    } as any);
    renderGlobal();

    const options = JSON.parse(
      (await screen.findAllByTestId('echart'))[0].textContent,
    );
    expect(options.yAxis.data).toEqual([
      'EuroHPC AI for Science and Collaborative EU Projects Access',
      'EuroHPC Regular Access',
    ]);
    const table = await screen.findByRole('table');
    await waitFor(() =>
      expect(
        within(table).getByText('EuroHPC Regular Access', { selector: 'a' }),
      ).toBeInTheDocument(),
    );
    expect(
      within(table).queryByRole('columnheader', { name: /^Organization/ }),
    ).not.toBeInTheDocument();
  });

  it('suffixes the organization to the call in the outcomes chart across several', async () => {
    renderGlobal();

    const options = JSON.parse(
      (await screen.findAllByTestId('echart'))[0].textContent,
    );
    expect(options.yAxis.data).toEqual([
      'EuroHPC AI for Science and Collaborative EU Projects Access · National Research Council',
      'EuroHPC Regular Access · Regional Computing Board',
    ]);
  });
});
