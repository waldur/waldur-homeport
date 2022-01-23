import { ARCHIVED, DRAFT } from '@waldur/marketplace/offerings/store/constants';
import { Division, Offering } from '@waldur/marketplace/types';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';
import { User } from '@waldur/workspace/types';

export const getInitialValuesForSetAccessPolicyForm = (divisions) => {
  const divisionsUuids = divisions.map((division) => division.uuid);
  return divisionsUuids.reduce((acc, curr) => ((acc[curr] = true), acc), {});
};

export const formatRequestBodyForSetAccessPolicyForm = (
  formData,
  divisions: Division[],
): string[] => {
  const divisionsUrls: string[] = [];
  Object.entries(formData).forEach(([key, value]) => {
    if (value) {
      const selectedDivision = divisions.find(
        (division) => division.uuid === key,
      );
      divisionsUrls.push(selectedDivision?.url);
    }
  });
  return divisionsUrls;
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
