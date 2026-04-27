import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

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

import { useReviewProgressStats } from './hooks';
import { ReviewProgressData } from './types';

/**
 * Simulation parameters for Review Progress "What if" analysis
 */
const reviewProgressSimulationParams: SimulationParam[] = [
  {
    id: 'reviewDeadlineDays',
    label: translate('Review deadline'),
    description: translate('Days given to reviewers to complete reviews'),
    type: 'slider',
    defaultValue: 14,
    min: 7,
    max: 30,
    step: 1,
    unit: ' days',
  },
  {
    id: 'reviewerPoolChange',
    label: translate('Reviewer pool change'),
    description: translate('Increase or decrease available reviewers'),
    type: 'slider',
    defaultValue: 0,
    min: -30,
    max: 50,
    step: 5,
    unit: '%',
  },
  {
    id: 'maxAssignments',
    label: translate('Max assignments per reviewer'),
    description: translate('Maximum reviews a single reviewer can handle'),
    type: 'select',
    defaultValue: '15',
    options: [
      { value: '10', label: translate('10 (light load)') },
      { value: '15', label: translate('15 (standard)') },
      { value: '20', label: translate('20 (heavy load)') },
      { value: '25', label: translate('25 (maximum)') },
    ],
  },
];

/**
 * Calculate simulation results for Review Progress "What if" analysis
 */
function calculateReviewProgressSimulation(
  params: Record<string, number | string>,
  data: unknown,
): SimulationResult[] {
  const reviewers = data as ReviewProgressData[];
  if (!reviewers || reviewers.length === 0) return [];

  const deadlineDays = Number(params.reviewDeadlineDays);
  const poolChangeRate = Number(params.reviewerPoolChange) / 100;
  const maxAssignments = Number(params.maxAssignments);

  // Current totals
  const totalReviewers = reviewers.length;
  const totalAssigned = reviewers.reduce((sum, r) => sum + r.total_assigned, 0);
  const totalCompleted = reviewers.reduce((sum, r) => sum + r.completed, 0);
  const avgTime =
    reviewers.reduce((sum, r) => sum + (r.average_review_time_days || 0), 0) /
    totalReviewers;

  // Projected values
  const projectedReviewers = Math.round(totalReviewers * (1 + poolChangeRate));

  // More time = higher completion rate (up to a point)
  const timeModifier = Math.min(1.3, 1 + (deadlineDays - 14) * 0.02);

  // Projected completion based on deadline and pool changes
  const completionRate = totalCompleted / totalAssigned;
  const projectedCompletionRate = Math.min(
    0.95,
    completionRate * timeModifier * (projectedReviewers / totalReviewers),
  );

  // Capacity = reviewers * max assignments
  const currentCapacity = totalReviewers * 15; // Assuming current max is 15
  const projectedCapacity = projectedReviewers * maxAssignments;

  // Average workload
  const currentWorkload = Math.round(totalAssigned / totalReviewers);
  const projectedWorkload = Math.round(totalAssigned / projectedReviewers);

  // Estimate time adjustment
  const projectedAvgTime = avgTime * (14 / deadlineDays);

  // Bottleneck risk - reviews per reviewer approaching max
  const currentBottleneckRisk = Math.round((currentWorkload / 15) * 100);
  const projectedBottleneckRisk = Math.round(
    (projectedWorkload / maxAssignments) * 100,
  );

  return [
    createSimulationResult(
      'reviewer-pool',
      translate('Active reviewers'),
      totalReviewers,
      projectedReviewers,
    ),
    createSimulationResult(
      'completion-rate',
      translate('Completion rate'),
      Math.round(completionRate * 100),
      Math.round(projectedCompletionRate * 100),
      '%',
    ),
    createSimulationResult(
      'capacity',
      translate('Review capacity'),
      currentCapacity,
      projectedCapacity,
    ),
    createSimulationResult(
      'avg-workload',
      translate('Avg reviews per reviewer'),
      currentWorkload,
      projectedWorkload,
    ),
    createSimulationResult(
      'avg-time',
      translate('Avg review time'),
      Math.round(avgTime * 10) / 10,
      Math.round(projectedAvgTime * 10) / 10,
      ' days',
    ),
    createSimulationResult(
      'bottleneck-risk',
      translate('Capacity utilization'),
      currentBottleneckRisk,
      projectedBottleneckRisk,
      '%',
    ),
  ];
}

/**
 * Transform reviewer data for drill-down analysis by completion status
 */
function transformReviewersToDrillDownItems(
  reviewers: ReviewProgressData[],
): DrillDownDataItem[] {
  const totalAssigned = reviewers.reduce((sum, r) => sum + r.total_assigned, 0);

  return reviewers
    .map((reviewer) => ({
      id: reviewer.reviewer_uuid,
      label: reviewer.reviewer_name,
      value: reviewer.total_assigned,
      percentage:
        totalAssigned > 0 ? (reviewer.total_assigned / totalAssigned) * 100 : 0,
      canDrillDown: true,
      metadata: {
        email: reviewer.reviewer_email,
        completionRate: reviewer.completion_rate,
        avgScore: reviewer.average_score,
      },
      change: {
        value: reviewer.completed - reviewer.pending,
        percent: Math.round(reviewer.completion_rate - 70),
        direction: (reviewer.completion_rate >= 70 ? 'up' : 'down') as
          | 'up'
          | 'down',
      },
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Generate drill-down data for review states within a reviewer
 */
function getReviewerBreakdown(
  reviewers: ReviewProgressData[],
  reviewerId: string,
): DrillDownDataItem[] {
  const reviewer = reviewers.find((r) => r.reviewer_uuid === reviewerId);
  if (!reviewer) return [];

  const states = [
    {
      id: 'completed',
      label: translate('Completed'),
      value: reviewer.completed,
    },
    {
      id: 'in_progress',
      label: translate('In progress'),
      value: reviewer.in_progress,
    },
    { id: 'pending', label: translate('Pending'), value: reviewer.pending },
    { id: 'declined', label: translate('Declined'), value: reviewer.declined },
  ];

  const total = states.reduce((sum, s) => sum + s.value, 0);

  return states
    .filter((s) => s.value > 0)
    .map((state) => ({
      id: state.id,
      label: state.label,
      value: state.value,
      percentage: total > 0 ? (state.value / total) * 100 : 0,
      canDrillDown: false,
    }))
    .sort((a, b) => b.value - a.value);
}

function getReviewProgressAnalyticsCapability(
  reviewers: ReviewProgressData[],
): any {
  const drillDownPaths: DrillDownPath[] = [
    {
      from: translate('Reviewer'),
      to: translate('Review status'),
      dimension: 'reviewer',
      fetchData: (reviewerId: string) =>
        Promise.resolve(getReviewerBreakdown(reviewers, reviewerId)),
    },
  ];

  return {
    supportedModes: ['what-if', 'why-so'],
    simulationParams: reviewProgressSimulationParams,
    calculateSimulation: calculateReviewProgressSimulation,
    initialDimension: translate('Reviewer'),
    drillDownPaths,
  };
}

const modeConfig: Record<
  AnalyticsMode,
  { label: string; description: string }
> = {
  'what-if': {
    label: translate('What if'),
    description: translate(
      'Simulate how review deadlines and reviewer pool size affect completion rates',
    ),
  },
  'why-so': {
    label: translate('Why so'),
    description: translate(
      'Analyze individual reviewer performance to find bottlenecks',
    ),
  },
};

export const ReviewProgressAnalyticsPage: FC = () => {
  const { params } = useCurrentStateAndParams();
  const initialMode = (params.mode as AnalyticsMode) || 'what-if';
  const [activeMode, setActiveMode] = useState<AnalyticsMode>(initialMode);

  const { data, isLoading, error, refetch } = useReviewProgressStats();
  const reviewers = data || [];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  const capability = useMemo(
    () => getReviewProgressAnalyticsCapability(reviewers),
    [reviewers],
  );
  const drillDownData = useMemo(
    () => transformReviewersToDrillDownItems(reviewers),
    [reviewers],
  );

  const breadcrumbs = useMemo(
    () => [{ key: 'analytics', text: translate('Analytics'), active: true }],
    [],
  );

  return (
    <>
      <ReportingTitle
        reportKey="reporting-review-progress-analytics"
        backState="reporting-review-progress"
        additionalBreadcrumbs={breadcrumbs}
      />

      <AnalyticsPageContent
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        capability={capability}
        data={reviewers}
        drillDownData={drillDownData}
        modeConfig={modeConfig}
      />
    </>
  );
};
