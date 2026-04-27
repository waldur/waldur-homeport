import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ProposalBadge } from '@/proposals/proposal/ProposalBadge';

import {
  AnalyticsMode,
  AnalyticsPageContent,
  DrillDownDataItem,
  DrillDownPath,
  SimulationParam,
  SimulationResult,
  createSimulationResult,
} from '../analytics';
import { ReportingTitle } from '../ReportingTitle';

import { useCallPerformanceStats } from './hooks';
import { CallPerformanceStat } from './types';

/**
 * Simulation parameters for Call Performance "What if" analysis
 */
const callPerformanceSimulationParams: SimulationParam[] = [
  {
    id: 'acceptanceThreshold',
    label: translate('Acceptance threshold'),
    description: translate('Minimum review score required for acceptance'),
    type: 'slider',
    defaultValue: 7,
    min: 1,
    max: 10,
    step: 0.5,
    unit: '/10',
  },
  {
    id: 'reviewerCount',
    label: translate('Reviewers per proposal'),
    description: translate('Number of reviewers assigned to each proposal'),
    type: 'select',
    defaultValue: '3',
    options: [
      { value: '2', label: translate('2 reviewers') },
      { value: '3', label: translate('3 reviewers (standard)') },
      { value: '4', label: translate('4 reviewers') },
      { value: '5', label: translate('5 reviewers (thorough)') },
    ],
  },
  {
    id: 'submissionGrowth',
    label: translate('Submission growth'),
    description: translate('Expected change in proposal submissions'),
    type: 'slider',
    defaultValue: 0,
    min: -30,
    max: 50,
    step: 5,
    unit: '%',
  },
];

/**
 * Calculate simulation results for Call Performance "What if" analysis
 */
function calculateCallPerformanceSimulation(
  params: Record<string, number | string>,
  data: unknown,
): SimulationResult[] {
  const calls = data as CallPerformanceStat[];
  if (!calls || calls.length === 0) return [];

  const threshold = Number(params.acceptanceThreshold);
  const reviewerCount = Number(params.reviewerCount);
  const growthRate = Number(params.submissionGrowth) / 100;

  // Current totals
  const totalProposals = calls.reduce((sum, c) => sum + c.total_proposals, 0);
  const totalAccepted = calls.reduce((sum, c) => sum + c.proposals_accepted, 0);
  const totalRejected = calls.reduce((sum, c) => sum + c.proposals_rejected, 0);
  const totalReviews = calls.reduce((sum, c) => sum + c.total_reviews, 0);

  // Projected values
  const projectedProposals = Math.round(totalProposals * (1 + growthRate));
  const projectedReviews = Math.round(
    projectedProposals * reviewerCount * 0.85,
  ); // 85% review rate

  // Estimate acceptance based on threshold change
  // Higher threshold = fewer acceptances
  const thresholdDelta = threshold - 7; // 7 is baseline
  const acceptanceModifier = 1 - thresholdDelta * 0.1;
  const projectedAccepted = Math.round(
    (totalAccepted / totalProposals) * projectedProposals * acceptanceModifier,
  );
  const projectedRejected = Math.round(
    ((totalRejected / totalProposals) * projectedProposals) /
      acceptanceModifier,
  );

  const currentAcceptanceRate =
    totalAccepted + totalRejected > 0
      ? (totalAccepted / (totalAccepted + totalRejected)) * 100
      : 0;
  const projectedAcceptanceRate =
    projectedAccepted + projectedRejected > 0
      ? (projectedAccepted / (projectedAccepted + projectedRejected)) * 100
      : 0;

  // Workload per reviewer (assuming 20 active reviewers)
  const reviewerPoolSize = 20;
  const currentWorkload = Math.round(totalReviews / reviewerPoolSize);
  const projectedWorkload = Math.round(projectedReviews / reviewerPoolSize);

  return [
    createSimulationResult(
      'total-proposals',
      translate('Total proposals'),
      totalProposals,
      projectedProposals,
    ),
    createSimulationResult(
      'accepted',
      translate('Proposals accepted'),
      totalAccepted,
      projectedAccepted,
    ),
    createSimulationResult(
      'acceptance-rate',
      translate('Acceptance rate'),
      Math.round(currentAcceptanceRate),
      Math.round(projectedAcceptanceRate),
      '%',
    ),
    createSimulationResult(
      'total-reviews',
      translate('Total reviews needed'),
      totalReviews,
      projectedReviews,
    ),
    createSimulationResult(
      'reviewer-workload',
      translate('Avg reviews per reviewer'),
      currentWorkload,
      projectedWorkload,
    ),
  ];
}

/**
 * Transform call data for drill-down analysis
 */
function transformCallsToDrillDownItems(
  calls: CallPerformanceStat[],
): DrillDownDataItem[] {
  const totalProposals = calls.reduce((sum, c) => sum + c.total_proposals, 0);

  return calls
    .map((call) => ({
      id: call.call_uuid,
      label: call.call_name,
      value: call.total_proposals,
      percentage:
        totalProposals > 0 ? (call.total_proposals / totalProposals) * 100 : 0,
      canDrillDown: true,
      metadata: {
        organization: call.managing_organization_name,
        state: call.state,
        acceptanceRate: call.acceptance_rate,
      },
      change: {
        value: call.proposals_accepted - call.proposals_rejected,
        percent: Math.round(call.acceptance_rate - 80),
        direction: (call.acceptance_rate >= 80 ? 'up' : 'down') as
          | 'up'
          | 'down',
      },
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Generate drill-down data for proposal states within a call
 */
function getProposalStateBreakdown(
  calls: CallPerformanceStat[],
  callId: string,
): DrillDownDataItem[] {
  const call = calls.find((c) => c.call_uuid === callId);
  if (!call) return [];

  const states = [
    {
      id: 'accepted',
      label: translate('Accepted'),
      value: call.proposals_accepted,
    },
    {
      id: 'in_review',
      label: translate('In review'),
      value: call.proposals_in_review,
    },
    {
      id: 'submitted',
      label: translate('Submitted'),
      value: call.proposals_submitted,
    },
    { id: 'draft', label: translate('Draft'), value: call.proposals_draft },
    {
      id: 'rejected',
      label: translate('Rejected'),
      value: call.proposals_rejected,
    },
    {
      id: 'canceled',
      label: translate('Canceled'),
      value: call.proposals_canceled,
    },
  ];

  const total = states.reduce((sum, s) => sum + s.value, 0);

  return states
    .filter((s) => s.value > 0)
    .map((state) => ({
      id: state.id,
      label: state.label,
      renderLabel: () => <ProposalBadge state={state.id} />,
      value: state.value,
      percentage: total > 0 ? (state.value / total) * 100 : 0,
      canDrillDown: false,
    }))
    .sort((a, b) => b.value - a.value);
}

function getCallPerformanceAnalyticsCapability(
  calls: CallPerformanceStat[],
): any {
  const drillDownPaths: DrillDownPath[] = [
    {
      from: translate('Call'),
      to: translate('Proposal state'),
      dimension: 'call',
      fetchData: (callId: string) =>
        Promise.resolve(getProposalStateBreakdown(calls, callId)),
    },
  ];

  return {
    supportedModes: ['what-if', 'why-so'],
    simulationParams: callPerformanceSimulationParams,
    calculateSimulation: calculateCallPerformanceSimulation,
    initialDimension: translate('Call'),
    drillDownPaths,
    whySoValueLabel: (total) => translate('Proposals ({total})', { total }),
  };
}

const modeConfig: Record<
  AnalyticsMode,
  { label: string; description: string }
> = {
  'what-if': {
    label: translate('What if'),
    description: translate(
      'Simulate how thresholds and reviewer settings change outcomes',
    ),
  },
  'why-so': {
    label: translate('Why so'),
    description: translate(
      'Identify root causes by drilling down into specific calls and states',
    ),
  },
};

export const CallPerformanceAnalyticsPage: FC = () => {
  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  const { data, isLoading, error, refetch } = useCallPerformanceStats();
  const calls = data || [];

  const capability = useMemo(
    () => getCallPerformanceAnalyticsCapability(calls),
    [calls],
  );
  const drillDownData = useMemo(
    () => transformCallsToDrillDownItems(calls),
    [calls],
  );

  const breadcrumbs = useMemo(
    () => [{ key: 'analytics', text: translate('Analytics'), active: true }],
    [],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  return (
    <>
      <ReportingTitle
        reportKey="reporting-call-performance-analytics"
        backState="reporting-call-performance"
        additionalBreadcrumbs={breadcrumbs}
      />

      <AnalyticsPageContent
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        capability={capability}
        data={calls}
        drillDownData={drillDownData}
        modeConfig={modeConfig}
      />
    </>
  );
};
