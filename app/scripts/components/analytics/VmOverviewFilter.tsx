import * as React from 'react';
import Select from 'react-select';
import { compose } from 'redux';
import { reduxForm, Field } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import './VmOverviewFilter.scss';

const serviceProviderOptions = [
  {
    name: 'University of Tartu',
    value: 'uni_of_tartu',
  },
  {
    name: 'University of Oslo',
    value: 'uni_of_oslo',
  },
];

const PureVmOverviewFilter = (props: TranslateProps) => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline" id="vm-overview-filter">
        <div className="checkbox awesome-checkbox">
          <Field name="show_shared" component="input" type="checkbox" id="show-shared"/>
          <label htmlFor="show-shared">
            {props.translate('Show shared')}
          </label>
        </div>
        <div className="checkbox awesome-checkbox m-r-sm">
          <Field name="show_private" component="input" type="checkbox" id="show-private"/>
          <label htmlFor="show-private">
            {props.translate('Show private')}
          </label>
        </div>
        <div className="form-group">
          <Field name="service_provider"
            component={prop =>
              <Select
                className="service-provider-selector"
                placeholder={props.translate('Select service provider')}
                labelKey="name"
                valueKey="value"
                value={prop.input.value}
                onChange={prop.input.onChange}
                onBlur={() => prop.input.onBlur(prop.input.value)}
                options={serviceProviderOptions}
                multi={true}
              />
            }
          />
        </div>
      </form>
    </div>
  </div>
);

const enhance = compose(
  reduxForm({form: 'vmOverviewFilter'}),
  withTranslation,
);

export const VmOverviewFilter = enhance(PureVmOverviewFilter);
