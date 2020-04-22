import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';

import './VmOverviewFilter.scss';

interface VmOverviewFilterProps {
  serviceProviders: any[];
}

export const VmOverviewFilter = (props: VmOverviewFilterProps) => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline" id="vm-overview-filter">
        <Field
          name="shared"
          component={prop => (
            <AwesomeCheckbox
              id="show-shared"
              label={translate('Show shared')}
              {...prop.input}
            />
          )}
        />
        <div className="form-group">
          <Field
            name="service_provider"
            component={prop => (
              <Select
                className="service-provider-selector"
                placeholder={translate('Select service provider')}
                labelKey="name"
                valueKey="value"
                value={prop.input.value}
                onChange={prop.input.onChange}
                onBlur={() => prop.input.onBlur(prop.input.value)}
                options={props.serviceProviders}
                multi={true}
                disabled={props.serviceProviders.length === 0}
              />
            )}
          />
        </div>
      </form>
    </div>
  </div>
);
