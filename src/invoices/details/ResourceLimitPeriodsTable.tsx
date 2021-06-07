import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { getBillingPeriodTitle } from './utils';

export const ResourceLimitPeriodsTable = ({ periods, unit }) => (
  <small>
    {periods.map((period, index) => (
      <div key={index}>
        <p>
          <strong>{translate('Start time')}</strong>:{' '}
          {formatDateTime(period.start)}
        </p>

        <p>
          <strong>{translate('End time')}</strong>: {formatDateTime(period.end)}
        </p>

        <p>
          <strong>{getBillingPeriodTitle(unit)}</strong>:{' '}
          {period.billing_periods}
        </p>

        <p>
          <strong>{translate('Quantity')}</strong>: {period.quantity}
        </p>

        <p>
          <strong>{translate('Total')}</strong>: {period.total}
        </p>
      </div>
    ))}
    <p>
      {translate(
        'Tracked using UTC timezone, displayed with your browser’s timezone.',
      )}
    </p>
  </small>
);
