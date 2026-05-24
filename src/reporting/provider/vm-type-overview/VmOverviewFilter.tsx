import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';

import './VmOverviewFilter.scss';

interface VmOverviewFilterProps {
  serviceProviders: any[];
}

export const VmOverviewFilter: FunctionComponent<VmOverviewFilterProps> = (
  props,
) => (
  <div className="card">
    <div className="card-body mb-2 border-bottom">
      <form className="form-inline" id="vm-overview-filter">
        <Field
          name="shared"
          component={AwesomeCheckboxField}
          label={translate('Show shared')}
        />

        <Form.Group>
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
        </Form.Group>
      </form>
    </div>
  </div>
);
