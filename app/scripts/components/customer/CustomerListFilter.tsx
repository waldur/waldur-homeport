import * as moment from 'moment';
import * as React from 'react';

import Select from 'react-select';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { TranslateProps, withTranslation } from '@waldur/i18n';

import './CustomerListFilter.scss';

const makeAccountingPeriods = () => {
  let date = moment().startOf('month');
  const choices = [];
  for (let i = 0; i < 12; i++) {
    const month = date.month() + 1;
    const year = date.year();
    const label = date.format('MMMM, YYYY');
    choices.push({
      label,
      value: { year, month, current: i === 0},
    });
    date = date.subtract(1, 'month');
  }
  return choices;
};

const accountingPeriods = makeAccountingPeriods();

export const PureCustomerListFilter = props => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline" id="customer-list-filter">
        <div className="row">
          <div className="col-sm-9">
            <div className="checkbox awesome-checkbox checkbox-primary m-r-sm">
              <Field name="accounting_is_running" component="input" type="checkbox" id="accounting-is-running"/>
              <label htmlFor="accounting-is-running">
                {props.translate('Show with running accounting')}
              </label>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form-group">
              <Field name="accounting_period"
                component={prop =>
                  <Select
                    className="accounting-period-selector"
                    placeholder={props.translate('Select accounting period')}
                    labelKey="label"
                    valueKey="value"
                    value={prop.input.value}
                    onChange={prop.input.onChange}
                    onBlur={() => prop.input.onBlur(prop.input.value)}
                    options={accountingPeriods}
                    clearable={false}
                  />
                }
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);

const enhance = compose(
  withTranslation,
  reduxForm<any, TranslateProps>({
    form: 'customerListFilter',
    initialValues: {
      accounting_period: accountingPeriods[0],
    },
  }),
);

export const CustomerListFilter = enhance(PureCustomerListFilter);
