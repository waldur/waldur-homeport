import {
  UserActiveStatusCount,
  UserAffiliationCount,
  UserAuthMethodCount,
  UserIdentitySourceCount,
  UserJobTitleCount,
  UserLanguageCount,
  UserOrganizationCount,
  UserOrganizationTypeCount,
  UserRegistrationTrend,
} from 'waldur-js-client';

/**
 * Aggregated user statistics from all endpoints
 */
export interface UserStatistics {
  authMethods: UserAuthMethodCount[];
  identitySources: UserIdentitySourceCount[];
  organizations: UserOrganizationCount[];
  affiliations: UserAffiliationCount[];
  activeStatus: UserActiveStatusCount[];
  languages: UserLanguageCount[];
  registrationTrend: UserRegistrationTrend[];
  organizationTypes: UserOrganizationTypeCount[];
  jobTitles: UserJobTitleCount[];
  nationalities: Array<{ nationality: string; count: number }>;
  residenceCountries: Array<{ country_of_residence: string; count: number }>;
}

/**
 * Summary metrics computed from user statistics (frontend-only)
 */
export interface UserStatisticsSummary {
  /** Total number of users across all auth methods */
  totalUsers: number;
  /** Number of active users */
  activeUsers: number;
  /** Percentage of active users */
  activePercent: number;
  /** Number of users using federated authentication */
  federatedUsers: number;
  /** Percentage of users using federated authentication */
  federatedPercent: number;
  /** Number of distinct identity sources */
  identitySourceCount: number;
  /** Number of distinct organizations */
  organizationCount: number;
  /** Number of distinct affiliations */
  affiliationCount: number;
}
