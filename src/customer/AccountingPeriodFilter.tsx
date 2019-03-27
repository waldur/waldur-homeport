import * as React from 'react';

import { translate } from '@waldur/i18n';

import { AccountingPeriodField } from './AccountingPeriodField';

export const AccountingPeriodFilter = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">
      {translate('Accounting period')}
    </label>
    <AccountingPeriodField/>
  </div>
);
