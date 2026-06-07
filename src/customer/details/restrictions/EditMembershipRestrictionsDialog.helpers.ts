import { getRestrictionsArray, RestrictionField } from '@/core/restrictions';
import { Customer } from '@/workspace/types';

interface FormData {
  value: string[] | string;
}

// Lives here (not next to the dialog component) so that consumers like
// CustomerMembershipRestrictionsPanel can static-import the helper
// without dragging the lazy-loaded dialog into the parent chunk.
export const getInitialValues = (
  customer: Customer,
  field: RestrictionField,
): FormData => ({
  value: getRestrictionsArray(customer[field]),
});
