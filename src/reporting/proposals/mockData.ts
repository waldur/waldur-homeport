import { translate } from '@/i18n/translate';

import { CallPerformanceStat, ReviewProgressStat } from './types';

/**
 * Calculate summary statistics from call performance data
 * Handles empty arrays gracefully by returning zeros
 */
export function calculateCallPerformanceSummary(data: CallPerformanceStat[]) {
  const activeCalls = data.filter((d) => d.state === 'active');
  const totalProposals = data.reduce((sum, d) => sum + d.total_proposals, 0);
  const totalAccepted = data.reduce((sum, d) => sum + d.proposals_accepted, 0);
  const totalRejected = data.reduce((sum, d) => sum + d.proposals_rejected, 0);
  const totalInReview = data.reduce((sum, d) => sum + d.proposals_in_review, 0);
  const dataWithScores = data.filter((d) => d.average_score !== null);
  const avgScore =
    dataWithScores.length > 0
      ? dataWithScores.reduce((sum, d) => sum + (d.average_score || 0), 0) /
        dataWithScores.length
      : 0;

  const overallAcceptanceRate =
    totalAccepted + totalRejected > 0
      ? Math.round(
          (totalAccepted / (totalAccepted + totalRejected)) * 100 * 10,
        ) / 10
      : 0;
  const averageScore = Math.round(avgScore * 10) / 10;

  return [
    { label: translate('Active calls'), value: activeCalls.length },
    { label: translate('Total proposals'), value: totalProposals },
    { label: translate('Accepted'), value: totalAccepted },
    { label: translate('In review'), value: totalInReview },
    {
      label: translate('Acceptance rate'),
      value: `${overallAcceptanceRate}%`,
    },
    { label: translate('Avg review score'), value: averageScore },
  ];
}

/**
 * Calculate summary statistics from review progress data
 * Handles empty arrays gracefully by returning zeros
 */
export function calculateReviewProgressSummary(data: ReviewProgressStat[]) {
  const totalReviewers = data.length;
  const totalAssigned = data.reduce((sum, d) => sum + d.total_assigned, 0);
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalPending = data.reduce((sum, d) => sum + d.pending, 0);
  const totalInProgress = data.reduce((sum, d) => sum + d.in_progress, 0);

  const dataWithTime = data.filter((d) => d.average_review_time_days !== null);
  const avgTime =
    dataWithTime.length > 0
      ? dataWithTime.reduce(
          (sum, d) => sum + (d.average_review_time_days || 0),
          0,
        ) / dataWithTime.length
      : 0;

  const overallCompletionRate =
    totalAssigned > 0
      ? Math.round((totalCompleted / totalAssigned) * 100 * 10) / 10
      : 0;
  const averageReviewTimeDays = Math.round(avgTime * 10) / 10;

  return [
    {
      label: translate('Active reviewers'),
      value: totalReviewers,
    },
    { label: translate('Total assigned'), value: totalAssigned },
    { label: translate('Completed'), value: totalCompleted },
    { label: translate('In progress'), value: totalInProgress },
    { label: translate('Pending'), value: totalPending },
    {
      label: translate('Completion rate'),
      value: `${overallCompletionRate}%`,
    },
    {
      label: translate('Avg days/review'),
      value: averageReviewTimeDays,
    },
  ];
}
