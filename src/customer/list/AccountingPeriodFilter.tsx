import { FunctionComponent } from 'react';

import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

import { AccountingPeriodField } from './AccountingPeriodField';

interface Props {
  options: PeriodOption[];
}

export const AccountingPeriodFilter: FunctionComponent<Props> = (props) => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Accounting period')}</label>
    <AccountingPeriodField options={props.options} />
  </div>
);
