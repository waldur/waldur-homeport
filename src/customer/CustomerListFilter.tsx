import * as React from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import { AccountingPeriodField, accountingPeriods } from './AccountingPeriodField';
import './CustomerListFilter.scss';

export const PureCustomerListFilter: React.SFC<TranslateProps> = props => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline" id="customer-list-filter">
        <div className="row">
          <div className="col-sm-9">
            <Field
              name="accounting_is_running"
              component={prop =>
                <AwesomeCheckbox
                  label={props.translate('Show with running accounting')}
                  id="accounting-is-running"
                  {...prop.input}
                />
              }
            />
          </div>
          <div className="col-sm-3">
            <div className="form-group">
              <AccountingPeriodField/>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);

const enhance = compose(
  reduxForm({
    form: 'customerListFilter',
    initialValues: {
      accounting_period: accountingPeriods[0],
    },
  }),
  withTranslation,
);

export const CustomerListFilter = enhance(PureCustomerListFilter);
