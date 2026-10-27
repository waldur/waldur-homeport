import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { Offering } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { useOfferingAccess } from './useOfferingAccess';

interface RequestAccessButtonProps {
  offering: Offering;
  /** Why ordering is unavailable; the application route is judged separately. */
  orderDisabledReason?: string;
}

/** Large hero variant on the public offering page. */
export const RequestAccessButton = ({
  offering,
  orderDisabledReason,
}: RequestAccessButtonProps) => {
  const { visible, loading, disabled, disabledReason, handleRequestAccess } =
    useOfferingAccess(offering, { orderDisabledReason });

  if (!visible) {
    return null;
  }

  return (
    <BaseButton
      variant="primary"
      size="lg"
      disabled={disabled || loading}
      disabledReason={disabledReason}
      onClick={handleRequestAccess}
      className="order-2 sm:order-1 sm:flex-none flex-1"
      iconNode={<PaperPlaneTiltIcon weight="bold" />}
      label={translate('Request')}
    />
  );
};
