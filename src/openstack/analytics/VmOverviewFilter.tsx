import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
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
          component={AwesomeCheckboxField}
          label={translate('Show shared')}
        />
        <div className="form-group">
          <Field
            name="service_provider"
            component={(prop) => (
              <Select
                className="service-provider-selector"
                placeholder={translate('Select service provider')}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.name}
                value={prop.input.value}
                onChange={prop.input.onChange}
                onBlur={() => prop.input.onBlur(prop.input.value)}
                options={props.serviceProviders}
                isMulti={true}
                isDisabled={props.serviceProviders.length === 0}
                isClearable={true}
              />
            )}
          />
        </div>
      </form>
    </div>
  </div>
);
