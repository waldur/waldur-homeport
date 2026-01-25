/**
 * Mock data generators for Proposal Reporting
 * These simulate realistic data based on the Waldur proposal domain model
 */

import { isMockDataEnabled } from '../utils';

import {
  CallPerformanceData,
  ReviewProgressData,
  ResourceDemandData,
} from './types';

/**
 * Generate mock call performance data
 * Returns empty array when experimental UI is disabled
 */
export function generateCallPerformanceData(): CallPerformanceData[] {
  if (!isMockDataEnabled()) {
    return [];
  }
  return [
    {
      call_uuid: 'call-001',
      call_name: '2024 Spring HPC Allocation',
      managing_organization_name: 'University Research Computing',
      state: 'active',
      total_proposals: 45,
      proposals_draft: 5,
      proposals_submitted: 8,
      proposals_in_review: 12,
      proposals_accepted: 15,
      proposals_rejected: 3,
      proposals_canceled: 2,
      acceptance_rate: 83.3,
      total_reviews: 80,
      reviews_completed: 65,
      average_score: 7.2,
      active_rounds: 1,
      last_submission_date: '2024-03-15',
    },
    {
      call_uuid: 'call-002',
      call_name: 'National Cloud Research Initiative Q1',
      managing_organization_name: 'Government Research Agency',
      state: 'active',
      total_proposals: 78,
      proposals_draft: 12,
      proposals_submitted: 15,
      proposals_in_review: 25,
      proposals_accepted: 20,
      proposals_rejected: 4,
      proposals_canceled: 2,
      acceptance_rate: 83.3,
      total_reviews: 150,
      reviews_completed: 120,
      average_score: 6.8,
      active_rounds: 2,
      last_submission_date: '2024-03-20',
    },
    {
      call_uuid: 'call-003',
      call_name: 'TechHub Startup Resources 2024',
      managing_organization_name: 'Innovation Hub',
      state: 'active',
      total_proposals: 32,
      proposals_draft: 8,
      proposals_submitted: 6,
      proposals_in_review: 8,
      proposals_accepted: 8,
      proposals_rejected: 1,
      proposals_canceled: 1,
      acceptance_rate: 88.9,
      total_reviews: 45,
      reviews_completed: 38,
      average_score: 7.5,
      active_rounds: 1,
      last_submission_date: '2024-03-18',
    },
    {
      call_uuid: 'call-004',
      call_name: 'AI Ethics Research Grant',
      managing_organization_name: 'Research Ethics Board',
      state: 'active',
      total_proposals: 25,
      proposals_draft: 3,
      proposals_submitted: 5,
      proposals_in_review: 10,
      proposals_accepted: 5,
      proposals_rejected: 1,
      proposals_canceled: 1,
      acceptance_rate: 83.3,
      total_reviews: 60,
      reviews_completed: 45,
      average_score: 7.8,
      active_rounds: 1,
      last_submission_date: '2024-03-10',
    },
    {
      call_uuid: 'call-005',
      call_name: '2023 Fall HPC Allocation',
      managing_organization_name: 'University Research Computing',
      state: 'archived',
      total_proposals: 52,
      proposals_draft: 0,
      proposals_submitted: 0,
      proposals_in_review: 0,
      proposals_accepted: 42,
      proposals_rejected: 8,
      proposals_canceled: 2,
      acceptance_rate: 84.0,
      total_reviews: 150,
      reviews_completed: 150,
      average_score: 7.0,
      active_rounds: 0,
      last_submission_date: '2023-09-30',
    },
  ];
}

/**
 * Generate mock review progress data
 * Returns empty array when experimental UI is disabled
 */
export function generateReviewProgressData(): ReviewProgressData[] {
  if (!isMockDataEnabled()) {
    return [];
  }
  return [
    {
      reviewer_uuid: 'rev-001',
      reviewer_name: 'Dr. Alice Johnson',
      reviewer_email: 'alice.johnson@university.edu',
      total_assigned: 15,
      pending: 2,
      in_progress: 3,
      completed: 9,
      declined: 1,
      average_score: 7.2,
      average_review_time_days: 4.5,
      completion_rate: 64.3,
    },
    {
      reviewer_uuid: 'rev-002',
      reviewer_name: 'Prof. Bob Smith',
      reviewer_email: 'bob.smith@research.org',
      total_assigned: 20,
      pending: 1,
      in_progress: 4,
      completed: 14,
      declined: 1,
      average_score: 6.8,
      average_review_time_days: 3.2,
      completion_rate: 73.7,
    },
    {
      reviewer_uuid: 'rev-003',
      reviewer_name: 'Dr. Carol Williams',
      reviewer_email: 'carol.w@techcorp.com',
      total_assigned: 12,
      pending: 0,
      in_progress: 2,
      completed: 10,
      declined: 0,
      average_score: 7.5,
      average_review_time_days: 2.8,
      completion_rate: 83.3,
    },
    {
      reviewer_uuid: 'rev-004',
      reviewer_name: 'Dr. David Chen',
      reviewer_email: 'd.chen@institute.edu',
      total_assigned: 18,
      pending: 5,
      in_progress: 2,
      completed: 10,
      declined: 1,
      average_score: 7.0,
      average_review_time_days: 5.1,
      completion_rate: 58.8,
    },
    {
      reviewer_uuid: 'rev-005',
      reviewer_name: 'Prof. Emily Brown',
      reviewer_email: 'e.brown@academy.org',
      total_assigned: 8,
      pending: 1,
      in_progress: 1,
      completed: 6,
      declined: 0,
      average_score: 7.8,
      average_review_time_days: 3.5,
      completion_rate: 75.0,
    },
    {
      reviewer_uuid: 'rev-006',
      reviewer_name: 'Dr. Frank Miller',
      reviewer_email: 'frank.miller@lab.gov',
      total_assigned: 22,
      pending: 3,
      in_progress: 5,
      completed: 12,
      declined: 2,
      average_score: 6.5,
      average_review_time_days: 6.2,
      completion_rate: 60.0,
    },
  ];
}

/**
 * Generate mock resource demand data
 * Returns empty array when experimental UI is disabled
 */
export function generateResourceDemandData(): ResourceDemandData[] {
  if (!isMockDataEnabled()) {
    return [];
  }
  return [
    {
      offering_uuid: 'off-001',
      offering_name: 'HPC Standard Compute',
      offering_type: 'HPC.Compute',
      provider_name: 'University HPC Center',
      proposal_count: 35,
      request_count: 42,
      approved_count: 28,
      pending_count: 10,
      total_requested_limits: {
        cpu_hours: 2500000,
        gpu_hours: 150000,
        storage_gb: 50000,
      },
      total_approved_limits: {
        cpu_hours: 1800000,
        gpu_hours: 100000,
        storage_gb: 35000,
      },
    },
    {
      offering_uuid: 'off-002',
      offering_name: 'Cloud VM - Production',
      offering_type: 'OpenStack.Instance',
      provider_name: 'National Cloud Provider',
      proposal_count: 48,
      request_count: 65,
      approved_count: 38,
      pending_count: 18,
      total_requested_limits: {
        vcpu: 850,
        memory_gb: 3400,
        storage_gb: 25000,
      },
      total_approved_limits: {
        vcpu: 620,
        memory_gb: 2480,
        storage_gb: 18000,
      },
    },
    {
      offering_uuid: 'off-003',
      offering_name: 'Object Storage - Research',
      offering_type: 'OpenStack.Volume',
      provider_name: 'National Cloud Provider',
      proposal_count: 22,
      request_count: 28,
      approved_count: 18,
      pending_count: 6,
      total_requested_limits: {
        storage_tb: 85,
        bandwidth_gbps: 10,
      },
      total_approved_limits: {
        storage_tb: 62,
        bandwidth_gbps: 8,
      },
    },
    {
      offering_uuid: 'off-004',
      offering_name: 'GPU Cluster Access',
      offering_type: 'HPC.GPU',
      provider_name: 'AI Research Institute',
      proposal_count: 18,
      request_count: 22,
      approved_count: 12,
      pending_count: 8,
      total_requested_limits: {
        gpu_hours: 80000,
        gpu_nodes: 45,
      },
      total_approved_limits: {
        gpu_hours: 55000,
        gpu_nodes: 30,
      },
    },
    {
      offering_uuid: 'off-005',
      offering_name: 'Development Environment',
      offering_type: 'PaaS.DevEnv',
      provider_name: 'Innovation Hub',
      proposal_count: 28,
      request_count: 28,
      approved_count: 22,
      pending_count: 4,
      total_requested_limits: {
        developer_seats: 85,
        environments: 42,
        monthly_compute_hours: 12000,
      },
      total_approved_limits: {
        developer_seats: 68,
        environments: 34,
        monthly_compute_hours: 9500,
      },
    },
  ];
}

/**
 * Calculate summary statistics from call performance data
 * Handles empty arrays gracefully by returning zeros
 */
export function calculateCallPerformanceSummary(data: CallPerformanceData[]) {
  const activeCalls = data.filter((d) => d.state === 'active');
  const totalProposals = data.reduce((sum, d) => sum + d.total_proposals, 0);
  const totalAccepted = data.reduce((sum, d) => sum + d.proposals_accepted, 0);
  const totalRejected = data.reduce((sum, d) => sum + d.proposals_rejected, 0);
  const totalInReview = data.reduce((sum, d) => sum + d.proposals_in_review, 0);
  const totalReviewsCompleted = data.reduce(
    (sum, d) => sum + d.reviews_completed,
    0,
  );
  const totalReviews = data.reduce((sum, d) => sum + d.total_reviews, 0);

  const dataWithScores = data.filter((d) => d.average_score !== null);
  const avgScore =
    dataWithScores.length > 0
      ? dataWithScores.reduce((sum, d) => sum + (d.average_score || 0), 0) /
        dataWithScores.length
      : 0;

  return {
    activeCalls: activeCalls.length,
    totalCalls: data.length,
    totalProposals,
    totalAccepted,
    totalRejected,
    totalInReview,
    overallAcceptanceRate:
      totalAccepted + totalRejected > 0
        ? Math.round(
            (totalAccepted / (totalAccepted + totalRejected)) * 100 * 10,
          ) / 10
        : 0,
    reviewCompletionRate:
      totalReviews > 0
        ? Math.round((totalReviewsCompleted / totalReviews) * 100 * 10) / 10
        : 0,
    averageScore: Math.round(avgScore * 10) / 10,
  };
}

/**
 * Calculate summary statistics from review progress data
 * Handles empty arrays gracefully by returning zeros
 */
export function calculateReviewProgressSummary(data: ReviewProgressData[]) {
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

  return {
    totalReviewers,
    totalAssigned,
    totalCompleted,
    totalPending,
    totalInProgress,
    overallCompletionRate:
      totalAssigned > 0
        ? Math.round((totalCompleted / totalAssigned) * 100 * 10) / 10
        : 0,
    averageReviewTimeDays: Math.round(avgTime * 10) / 10,
  };
}
