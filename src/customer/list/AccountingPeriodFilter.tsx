import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

import { AccountingPeriodField } from './AccountingPeriodField';

interface AccountingPeriodFilterProps {
  options: PeriodOption[];
}

export const AccountingPeriodFilter: FunctionComponent<AccountingPeriodFilterProps> =
  (props) => (
    <Form.Group className="col-sm-3">
      <Form.Label>{translate('Accounting period')}</Form.Label>
      <AccountingPeriodField options={props.options} />
    </Form.Group>
  );
