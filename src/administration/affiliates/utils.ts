import { translate } from '@/i18n';

export interface OrganizationOption {
  url: string;
  name: string;
  uuid: string;
}

export interface AffiliateLinkFormData {
  // On create these hold the selected organization option object (the raw
  // AsyncSelect stores the whole option); the backend expects the org URL.
  customer?: OrganizationOption;
  affiliate?: OrganizationOption;
  customer_name?: string;
  affiliate_name?: string;
  fee_percent?: number | string;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

// Referred organization UUID → name of its current active affiliate.
export type ActiveAffiliates = Map<string, string>;

// An organization has at most one active affiliate, so a new active link
// conflicts with an existing one; an inactive link never does.
export const getActiveAffiliateConflict = (
  organizationUuid: string | undefined,
  isActive: boolean | undefined,
  activeAffiliates: ActiveAffiliates | undefined,
): string | undefined =>
  organizationUuid && isActive !== false
    ? activeAffiliates?.get(organizationUuid)
    : undefined;

export const validateAffiliateLinkForm = (
  values: AffiliateLinkFormData,
  activeAffiliates?: ActiveAffiliates,
) => {
  const errors: Record<string, string> = {};
  if (
    values.start_date &&
    values.end_date &&
    values.end_date <= values.start_date
  ) {
    errors.end_date = translate('End date must be after the start date.');
  }
  if (
    values.customer &&
    values.affiliate &&
    values.customer.uuid === values.affiliate.uuid
  ) {
    errors.affiliate = translate(
      'An organization cannot be its own affiliate.',
    );
  }
  const currentAffiliate = getActiveAffiliateConflict(
    values.customer?.uuid,
    values.is_active,
    activeAffiliates,
  );
  if (currentAffiliate) {
    errors.customer = translate(
      '{name} is already referred by {affiliate}. Deactivate that link first, or create this one inactive.',
      { name: values.customer.name, affiliate: currentAffiliate },
    );
  }
  return errors;
};
