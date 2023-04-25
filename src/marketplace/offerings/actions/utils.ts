import { ARCHIVED, DRAFT } from '@waldur/marketplace/offerings/store/constants';
import { OrganizationGroup, Offering } from '@waldur/marketplace/types';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';
import { User } from '@waldur/workspace/types';

export const getInitialValuesForSetAccessPolicyForm = (organizationGroups) => {
  const organizationGroupsUuids = organizationGroups.map(
    (organizationGroup) => organizationGroup.uuid,
  );
  return organizationGroupsUuids.reduce(
    (acc, curr) => ((acc[curr] = true), acc),
    {},
  );
};

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

export const supportOfferingActionVisible = (
  offering: Offering,
  user: User,
  isOwner: boolean,
  isServiceManager: boolean,
) =>
  offering.type === SUPPORT_OFFERING_TYPE &&
  offering.state !== ARCHIVED &&
  (user?.is_staff ||
    (offering.state === DRAFT && (isOwner || isServiceManager)));
