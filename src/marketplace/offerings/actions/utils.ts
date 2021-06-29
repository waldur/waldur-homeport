import { ARCHIVED, DRAFT } from '@waldur/marketplace/offerings/store/constants';
import { Division } from '@waldur/marketplace/types';

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
