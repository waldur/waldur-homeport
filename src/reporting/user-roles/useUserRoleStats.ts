import { useQuery } from '@tanstack/react-query';
import {
  marketplaceStatsCustomerMemberCountList,
  marketplaceStatsCustomerMemberSummaryRetrieve,
  CustomerMemberSummary as ApiCustomerMemberSummary,
} from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';

import { UserRolesStats, UserRolesSummary } from './types'; // 5 minutes

async function fetchUserRoleStats(
  signal?: AbortSignal,
): Promise<UserRolesStats> {
  const response = await marketplaceStatsCustomerMemberCountList({ signal });
  return {
    memberCounts: response.data ?? [],
  };
}

async function fetchUserRolesSummary(
  signal?: AbortSignal,
): Promise<UserRolesSummary> {
  const response = await marketplaceStatsCustomerMemberSummaryRetrieve({
    signal,
  });
  const data = response.data as ApiCustomerMemberSummary;
  return {
    totalOrganizations: data.total_organizations,
    totalMembers: data.total_members,
    organizationsWithResources: data.organizations_with_resources,
    averageMembersPerOrg: data.average_members_per_org,
  };
}

export function useUserRoleStats() {
  return useQuery({
    queryKey: ['userRoleStats'],
    queryFn: ({ signal }) => fetchUserRoleStats(signal),
    staleTime: STALE_TIME,
  });
}

export function useUserRolesSummary() {
  return useQuery({
    queryKey: ['userRolesSummary'],
    queryFn: ({ signal }) => fetchUserRolesSummary(signal),
    staleTime: STALE_TIME,
  });
}
