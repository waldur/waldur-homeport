import { Offering } from 'waldur-js-client';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';

import { useOfferingAccess } from './useOfferingAccess';

interface CardRequestAccessButtonProps {
  offering: Offering;
  /** Why ordering is unavailable; the application route is judged separately. */
  orderDisabledReason?: string;
}

/** Compact variant for marketplace offering cards. */
export const CardRequestAccessButton = ({
  offering,
  orderDisabledReason,
}: CardRequestAccessButtonProps) => {
  const { visible, loading, disabled, disabledReason, handleRequestAccess } =
    useOfferingAccess(offering, { orderDisabledReason });

  if (!visible) {
    return null;
  }

  return (
    <CompactSubmitButton
      submitting={loading}
      type="button"
      variant="text-secondary"
      disabled={disabled}
      onClick={handleRequestAccess}
      label={translate('Request')}
      disabledReason={disabledReason}
    />
  );
};
