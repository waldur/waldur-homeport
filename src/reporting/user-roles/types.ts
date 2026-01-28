import { CustomerMemberCount } from 'waldur-js-client';

export interface UserRolesStats {
  memberCounts: CustomerMemberCount[];
}

export interface UserRolesSummary {
  totalOrganizations: number;
  totalMembers: number;
  organizationsWithResources: number;
  averageMembersPerOrg: number;
}
