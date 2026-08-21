import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { PlanPeriod } from './types';

export const ComponentRowTotal = (props: {
  amount: number;
  period?: PlanPeriod;
  setPeriod?;
  /**
   * Set when some components have no quantity yet, so the amount is the
   * lowest the plan can cost rather than its price.
   */
  isFloor?: boolean;
}) => {
  const amount =
    defaultCurrency(props.amount ?? 0) +
    (props.period ? (props.period === 'annual' ? ' /year' : ' /month') : '');
  return (
    <tr className="total">
      <th className="col-md title fs-4 fw-normal">{translate('Total')}</th>
      <td colSpan={2} className="col-md-auto col-actions">
        <div className="d-flex align-items-center justify-content-end gap-4">
          {props.period && props.setPeriod && (
            <AwesomeCheckbox
              label={translate('Yearly estimate')}
              value={props.period === 'monthly' ? false : true}
              size="sm"
              onChange={(value) =>
                props.setPeriod(value ? 'annual' : 'monthly')
              }
            />
          )}
          <span className="fs-4 text-gray-700 min-w-150px text-start">
            {!props.isFloor
              ? amount
              : // Nothing in the plan has a known quantity, so there is no
                // floor to quote either — "From 0.00" would read as free.
                props.amount
                ? translate('From {amount}', { amount })
                : DASH_ESCAPE_CODE}
          </span>
        </div>
      </td>
    </tr>
  );
};
