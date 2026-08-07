import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { Offering } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
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
    <Tip
      id="tip-request-access"
      label={disabledReason}
      className="order-2 order-sm-1 flex-sm-column-auto flex-root"
    >
      <button
        type="button"
        className="btn btn-lg btn-primary w-100"
        disabled={disabled || loading}
        onClick={handleRequestAccess}
      >
        <span className="svg-icon svg-icon-2">
          <PaperPlaneTiltIcon weight="bold" />
        </span>
        {translate('Request')}
      </button>
    </Tip>
  );
};
