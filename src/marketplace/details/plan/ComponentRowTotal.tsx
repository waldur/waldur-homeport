import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { PlanPeriod } from './types';

export const ComponentRowTotal = (props: {
  amount: number;
  period?: PlanPeriod;
  setPeriod?;
}) => {
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
            {defaultCurrency(props.amount ?? 0)}
            {Boolean(props.period) && (
              <>
                {' /'}
                {props.period === 'annual' ? 'year' : 'month'}
              </>
            )}
          </span>
        </div>
      </td>
    </tr>
  );
};
