import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { AccountingPeriodField } from './AccountingPeriodField';
import { AccountingPeriodOption } from './types';

interface Props {
  options: AccountingPeriodOption[];
}

export const AccountingPeriodFilter: FunctionComponent<Props> = (props) => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Accounting period')}</label>
    <AccountingPeriodField options={props.options} />
  </div>
);
