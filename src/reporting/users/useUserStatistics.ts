import { useQuery } from '@tanstack/react-query';
import {
  marketplaceStatsUserAffiliationCountList,
  marketplaceStatsUserAuthMethodCountList,
  marketplaceStatsUserIdentitySourceCountList,
  marketplaceStatsUserJobTitleCountList,
  marketplaceStatsUserNationalityList,
  marketplaceStatsUserOrganizationCountList,
  marketplaceStatsUserOrganizationTypeCountList,
  marketplaceStatsUserResidenceCountryList,
  UserAffiliationCount,
  usersUserActiveStatusCountList,
  usersUserLanguageCountList,
  usersUserRegistrationTrendList,
} from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

import { UserStatistics, UserStatisticsSummary } from './types';

/**
 * Known federated authentication methods
 */
const FEDERATED_AUTH_METHODS = ['saml2', 'oidc', 'keycloak', 'eduteams']; // 5 minutes

/**
 * Helper to safely fetch and return empty array on failure
 */
async function safeFetch<T>(
  fetchFn: () => Promise<{ data?: T[] } | T[]>,
): Promise<T[]> {
  try {
    const response = await fetchFn();
    if (Array.isArray(response)) {
      return response;
    }
    return response.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch all user statistics from all API endpoints
 * Only fetches data for enabled profile attributes
 * Used by demographics pages that need comprehensive data
 */
async function fetchUserStatistics(
  signal?: AbortSignal,
): Promise<UserStatistics> {
  // Check which attributes are enabled
  const showIdentitySource = isProfileAttributeEnabled('identity_source');
  const showAffiliations = isProfileAttributeEnabled('affiliations');
  const showOrganization = isProfileAttributeEnabled('organization');
  const showOrganizationType = isProfileAttributeEnabled('organization_type');
  const showJobTitle = isProfileAttributeEnabled('job_title');
  const showNationality = isProfileAttributeEnabled('nationality');

  const [
    authMethods,
    identitySources,
    organizations,
    affiliations,
    activeStatus,
    languages,
    registrationTrend,
    organizationTypes,
    jobTitles,
    nationalities,
    residenceCountries,
  ] = await Promise.all([
    // Core stats - always fetch
    safeFetch(() => marketplaceStatsUserAuthMethodCountList({ signal })),
    // Conditional stats based on enabled attributes
    showIdentitySource
      ? safeFetch(() => marketplaceStatsUserIdentitySourceCountList({ signal }))
      : Promise.resolve([]),
    showOrganization
      ? safeFetch(() => marketplaceStatsUserOrganizationCountList({ signal }))
      : Promise.resolve([]),
    showAffiliations
      ? safeFetch(() => marketplaceStatsUserAffiliationCountList({ signal }))
      : Promise.resolve([]),
    // User stats - always fetch
    safeFetch(() => usersUserActiveStatusCountList({ signal })),
    safeFetch(() => usersUserLanguageCountList({ signal })),
    safeFetch(() => usersUserRegistrationTrendList({ signal })),
    // Organization type and job title stats
    showOrganizationType
      ? safeFetch(() =>
          marketplaceStatsUserOrganizationTypeCountList({ signal }),
        )
      : Promise.resolve([]),
    showJobTitle
      ? safeFetch(() => marketplaceStatsUserJobTitleCountList({ signal }))
      : Promise.resolve([]),
    // Nationality and Residence Country stats
    showNationality
      ? safeFetch(() => marketplaceStatsUserNationalityList({ signal }))
      : Promise.resolve([]),
    showNationality
      ? safeFetch(() => marketplaceStatsUserResidenceCountryList({ signal }))
      : Promise.resolve([]),
  ]);

  return {
    authMethods,
    identitySources,
    organizations,
    affiliations,
    activeStatus,
    languages,
    registrationTrend,
    organizationTypes,
    jobTitles,
    nationalities,
    residenceCountries,
  };
}

/**
 * Compute summary metrics from user statistics
 */
export function computeStatisticsSummary(
  stats: UserStatistics,
): UserStatisticsSummary {
  const totalUsers = stats.authMethods.reduce((sum, m) => sum + m.count, 0);

  // Get active users count from activeStatus endpoint
  const activeStatusItem = stats.activeStatus.find(
    (s) => s.status.toLowerCase() === 'active',
  );
  const activeUsers = activeStatusItem?.count ?? 0;
  const activePercent =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const federatedUsers = stats.authMethods
    .filter((m) =>
      FEDERATED_AUTH_METHODS.some((fed) =>
        m.method?.toLowerCase().includes(fed),
      ),
    )
    .reduce((sum, m) => sum + m.count, 0);

  const federatedPercent =
    totalUsers > 0 ? Math.round((federatedUsers / totalUsers) * 100) : 0;

  return {
    totalUsers,
    activeUsers,
    activePercent,
    federatedUsers,
    federatedPercent,
    identitySourceCount: stats.identitySources.length,
    organizationCount: stats.organizations.length,
    affiliationCount: stats.affiliations.length,
  };
}

/**
 * Hook to fetch all user statistics from all endpoints
 * Use this only for pages that need comprehensive data (e.g., Demographics)
 */
export function useUserStatistics() {
  return useQuery({
    queryKey: ['userStatistics'],
    queryFn: ({ signal }) => fetchUserStatistics(signal),
    staleTime: STALE_TIME,
  });
}

/**
 * Hook to fetch only user affiliations data
 * Use this for the Affiliations page
 */
export function useUserAffiliations() {
  return useQuery({
    queryKey: ['userAffiliations'],
    queryFn: ({ signal }): Promise<UserAffiliationCount[]> => {
      if (!isProfileAttributeEnabled('affiliations')) {
        return Promise.resolve([]);
      }
      return safeFetch(() =>
        marketplaceStatsUserAffiliationCountList({ signal }),
      );
    },
    staleTime: STALE_TIME,
  });
}
