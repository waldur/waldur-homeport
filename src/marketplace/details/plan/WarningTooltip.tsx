import { WarningCircleIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { FieldError } from '@waldur/form';
import { formSubmitErrorsSelector } from '@waldur/marketplace/deploy/selectors';
import { concealPricesSelector } from '@waldur/marketplace/deploy/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

export const WarningTooltip = () => {
  const submitErrors = useSelector(formSubmitErrorsSelector);
  const shouldConcealPrices = useSelector(concealPricesSelector);

  return (
    <>
      {submitErrors && 'plan_entries' in submitErrors && (
        <Tip
          label={<FieldError error={submitErrors.plan_entries} />}
          id="order-plan-errors"
          autoWidth
        >
          <WarningCircleIcon
            size={18}
            weight="bold"
            className="ms-2 text-warning mb-1"
            data-testid="warning"
          />
        </Tip>
      )}
      {!shouldConcealPrices && (
        <div className="ms-auto text-muted">
          <PriceTooltip size={20} />
        </div>
      )}
    </>
  );
};
