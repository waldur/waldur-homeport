import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsList } from 'waldur-js-client';

import { useCallResourcePoolUsage } from '@/proposals/update/resource-pools/queries';
import {
  useCallWorkflowCheck,
  useCallWorkflowProgress,
} from '@/proposals/workflow-description/queries';
import { renderWithProviders } from '@/test/harness';

import { CallExpandableRow } from './CallExpandableRow';

vi.mock('@/proposals/workflow-description/queries', () => ({
  useCallWorkflowCheck: vi.fn(),
  useCallWorkflowProgress: vi.fn(),
}));
vi.mock('@/proposals/update/resource-pools/queries', () => ({
  useCallResourcePoolUsage: vi.fn(),
}));

const query = (data: unknown, extra = {}) =>
  ({ data, isLoading: false, ...extra }) as any;

const baseCall = {
  uuid: 'call-1',
  name: 'Regular access',
  state: 'draft',
  rounds: [],
  offerings: [],
  template_name: null,
  template_version: null,
  template_latest_version: null,
} as any;

const usageRow = (cell: Record<string, unknown>) => ({
  offering_component_uuid: 'component-1',
  requested_offering_uuid: 'offering-1',
  offering_name: 'GPU cluster',
  component_type: 'gpu',
  component_name: 'GPU hours',
  measured_unit: 'hours',
  limit_period: 'total',
  cells: [
    {
      round_uuid: null,
      round_name: null,
      pool_uuid: null,
      offered_total: null,
      requested: 0,
      awarded: 0,
      remaining: null,
      ...cell,
    },
  ],
});

const step = (overrides: Record<string, unknown>) => ({
  key: 'step',
  name: 'Step',
  enabled: true,
  waiting: 0,
  overdue: 0,
  completed: 0,
  total: 0,
  ...overrides,
});

describe('CallExpandableRow', () => {
  beforeEach(() => {
    vi.mocked(useCallWorkflowCheck).mockReturnValue(query(undefined));
    vi.mocked(useCallWorkflowProgress).mockReturnValue(query(undefined));
    vi.mocked(useCallResourcePoolUsage).mockReturnValue(query([]));
  });

  describe('a draft call', () => {
    it('says it can be activated when the check found no errors', () => {
      vi.mocked(useCallWorkflowCheck).mockReturnValue(
        query({
          can_activate: true,
          summary: { error: 0, warning: 0, info: 2 },
          findings: [],
        }),
      );
      renderWithProviders(<CallExpandableRow row={baseCall} />);
      expect(screen.getByTestId('workflow-check-verdict')).toHaveTextContent(
        'Can be activated',
      );
      expect(
        screen.getByRole('link', { name: 'Open validation' }),
      ).toBeInTheDocument();
    });

    it('counts the findings that stop activation', () => {
      vi.mocked(useCallWorkflowCheck).mockReturnValue(
        query({
          can_activate: false,
          summary: { error: 2, warning: 3, info: 0 },
          findings: [],
        }),
      );
      renderWithProviders(<CallExpandableRow row={baseCall} />);
      const verdict = screen.getByTestId('workflow-check-verdict');
      expect(verdict).toHaveTextContent('2 errors, 3 warnings');
      expect(verdict).not.toHaveTextContent('Can be activated');
    });

    it('lists its setup: rounds, offerings, pools and template', () => {
      vi.mocked(useCallResourcePoolUsage).mockReturnValue(
        query([usageRow({ pool_uuid: 'pool-1', offered_total: 1000 })]),
      );
      renderWithProviders(
        <CallExpandableRow
          row={{
            ...baseCall,
            rounds: [{ uuid: 'r1' }, { uuid: 'r2' }],
            offerings: [
              { uuid: 'o1', state: 'accepted' },
              { uuid: 'o2', state: 'requested' },
              { uuid: 'o3', state: 'canceled' },
            ],
            template_name: 'Regular Access',
            template_version: 2,
            template_latest_version: 3,
          }}
        />,
      );
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(
        screen.getByText('2, 1 awaiting provider approval'),
      ).toBeInTheDocument();
      expect(screen.getByText('1 defined')).toBeInTheDocument();
      expect(screen.getByText('Regular Access, version 2')).toBeInTheDocument();
      expect(screen.getByText('(version 3 is out)')).toBeInTheDocument();
    });

    it('leaves out the template of a call made without one', () => {
      renderWithProviders(<CallExpandableRow row={baseCall} />);
      expect(screen.queryByText(/Created from template/)).toBeNull();
      expect(screen.getByText('None defined')).toBeInTheDocument();
    });
  });

  describe('an active call', () => {
    const activeCall = {
      ...baseCall,
      state: 'active',
      rounds: [
        {
          uuid: 'r-old',
          name: 'Spring round',
          status: 'ended',
          start_time: '2026-01-01T00:00:00Z',
          cutoff_time: '2026-02-01T00:00:00Z',
        },
        {
          uuid: 'r-open',
          name: 'Autumn round',
          status: 'open',
          start_time: '2026-09-01T00:00:00Z',
          cutoff_time: null,
        },
      ],
    };

    it('names the open round and its cut-off', () => {
      renderWithProviders(<CallExpandableRow row={activeCall} />);
      expect(screen.getByText('Autumn round')).toBeInTheDocument();
      expect(screen.getByText('Continuously open')).toBeInTheDocument();
    });

    it('lists the enabled steps proposals wait at, flagging overdue ones', () => {
      vi.mocked(useCallWorkflowProgress).mockReturnValue(
        query({
          proposals: 14,
          steps: [
            step({ key: 'admin', name: 'Administrative check', waiting: 3 }),
            step({
              key: 'expert',
              name: 'Expert review',
              waiting: 8,
              overdue: 2,
            }),
            step({ key: 'done', name: 'Decision', waiting: 0 }),
            step({
              key: 'off',
              name: 'Switched off',
              waiting: 5,
              enabled: false,
            }),
          ],
        }),
      );
      renderWithProviders(<CallExpandableRow row={activeCall} />);
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('3 at Administrative check')).toBeInTheDocument();
      expect(screen.getByText('8 at Expert review')).toBeInTheDocument();
      expect(screen.getByText('2 overdue')).toBeInTheDocument();
      expect(screen.queryByText(/Decision/)).toBeNull();
      expect(screen.queryByText(/Switched off/)).toBeNull();
    });

    it('shows the call-wide pools, and no section without one', () => {
      vi.mocked(useCallResourcePoolUsage).mockReturnValue(
        query([
          usageRow({
            pool_uuid: 'pool-1',
            offered_total: 1000000,
            awarded: 400000,
            remaining: 600000,
          }),
        ]),
      );
      const { unmount } = renderWithProviders(
        <CallExpandableRow row={activeCall} />,
      );
      expect(screen.getByText('GPU hours:')).toBeInTheDocument();
      expect(
        screen.getByText(/400,000 of 1,000,000 hours awarded/),
      ).toBeInTheDocument();
      expect(screen.getByText(/600,000 left/)).toBeInTheDocument();
      unmount();

      vi.mocked(useCallResourcePoolUsage).mockReturnValue(
        query([usageRow({ awarded: 50 })]),
      );
      renderWithProviders(<CallExpandableRow row={activeCall} />);
      expect(screen.queryByTestId('call-row-pools')).toBeNull();
    });
  });

  describe('an archived call', () => {
    it('counts the decisions and what was awarded', async () => {
      vi.mocked(proposalProposalsList).mockImplementation(((options: any) =>
        Promise.resolve({
          response: {
            headers: new Headers({
              'x-result-count':
                options.query.state[0] === 'accepted' ? '7' : '4',
            }),
          },
        })) as any);
      vi.mocked(useCallResourcePoolUsage).mockReturnValue(
        query([usageRow({ awarded: 50 })]),
      );
      renderWithProviders(
        <CallExpandableRow row={{ ...baseCall, state: 'archived' }} />,
      );
      await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('50 hours awarded')).toBeInTheDocument();
    });
  });
});
