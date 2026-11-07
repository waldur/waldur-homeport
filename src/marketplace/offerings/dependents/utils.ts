import { OfferingDependent } from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

/**
 * Whether what depends on the object refuses the change for this viewer, the
 * way the backend decides it: `blocks_staff` refuses everyone, `blocks`
 * everyone but staff. The reason is the tooltip of the disabled confirm.
 */
export const getDependentsBlock = (
  dependents: OfferingDependent[] | undefined,
  isStaff: boolean,
): { blocked: boolean; reason?: string } => {
  const refusing = (dependents ?? []).filter(
    (dependent) => dependent.blocks_staff || (dependent.blocks && !isStaff),
  );
  if (!refusing.length) {
    return { blocked: false };
  }
  return {
    blocked: true,
    reason: refusing.some((dependent) => dependent.blocks_staff)
      ? translate(
          'Calls depend on it, and the change would break them. Resolve them first.',
        )
      : translate(
          'Calls depend on it. Resolve them first, or ask staff to make the change.',
        ),
  };
};

/** The `detail` of a refused (409) change, to say why in the dialog. */
export const getConflictDetail = (error): string | undefined => {
  if (!error || error.status !== 409) {
    return undefined;
  }
  const detail = getErrorBody(error)?.detail;
  return typeof detail === 'string' ? detail : undefined;
};
