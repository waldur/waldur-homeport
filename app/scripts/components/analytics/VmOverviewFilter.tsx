import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SelectField } from '@waldur/form-react';
import { CheckboxField } from '@waldur/form-react/CheckboxField';
import { withTranslation, TranslateProps } from '@waldur/i18n';

import './VmOverviewFilter.scss';

interface VMOverviewFilterProps extends TranslateProps {
  submitting: boolean;
}

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

const PureVmOverviewFilter = (props: VMOverviewFilterProps) => (
  <div className="ibox">
    <div className="ibox-content m-b-sm border-bottom">
      <form className="form-inline" id="vm-overview-filter">
        <FormContainer
          labelClass="m-r-md"
          controlClass="m-r-md"
          submitting={props.submitting}>
          <CheckboxField
            label={props.translate('Show shared')}
            name="show_shared"
          />
          <CheckboxField
            label={props.translate('Show private')}
            name="show_private"
          />
          <SelectField
            className="service-provider-selector"
            label={props.translate('Service provider')}
            name="service_provider"
            options={serviceProviderOptions}
            labelKey="name"
            valueKey="value"
          />
        </FormContainer>
      </form>
    </div>
  </div>
);

const enhance = compose(
  reduxForm({form: 'vmOverviewFilter'}),
  withTranslation,
);

export const VmOverviewFilter = enhance(PureVmOverviewFilter);
