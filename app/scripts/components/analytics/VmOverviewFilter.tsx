import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { ServiceProvider } from '@waldur/analytics/types';
import { TranslateProps } from '@waldur/i18n';

import './VmOverviewFilter.scss';

interface VmOverviewFilterProps extends TranslateProps {
  serviceProviders: ServiceProvider[];
}

export const VmOverviewFilter = (props: VmOverviewFilterProps) => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline" id="vm-overview-filter">
        <div className="checkbox awesome-checkbox m-r-sm">
          <Field name="shared" component="input" type="checkbox" id="show-shared"/>
          <label htmlFor="show-shared">
            {props.translate('Show shared')}
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
                options={props.serviceProviders}
                multi={true}
                disabled={props.serviceProviders.length === 0}
              />
            }
          />
        </div>
      </form>
    </div>
  </div>
);
