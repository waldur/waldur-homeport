import { Project } from 'waldur-js-client';

import { getRestrictionsArray, RestrictionField } from '@/core/restrictions';

interface FormData {
  value: string[] | string;
}

// Lives here (not next to the dialog component) so that consumers like
// ProjectMembershipRestrictions can static-import the helper without
// dragging the lazy-loaded dialog into the parent chunk.
export const getInitialValues = (
  project: Project,
  field: RestrictionField,
): FormData => ({
  value: getRestrictionsArray(project[field]),
});
