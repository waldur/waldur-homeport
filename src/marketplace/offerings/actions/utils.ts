import { OrganizationGroup } from 'waldur-js-client';

import { ARCHIVED, DRAFT } from '@/marketplace/offerings/store/constants';

export const formatRequestBodyForSetAccessPolicyForm = (
  formData,
  organizationGroups: OrganizationGroup[],
): string[] => {
  const organizationGroupsUrls: string[] = [];
  Object.entries(formData).forEach(([key, value]) => {
    if (value) {
      const selectedOrganizationGroups = organizationGroups.find(
        (organizationGroup) => organizationGroup.uuid === key,
      );
      organizationGroupsUrls.push(selectedOrganizationGroups?.url);
    }
  });
  return organizationGroupsUrls;
};

export const isVisible = (
  offeringState: string,
  userIsStaff: boolean,
): boolean =>
  offeringState !== ARCHIVED && (offeringState === DRAFT || userIsStaff);
