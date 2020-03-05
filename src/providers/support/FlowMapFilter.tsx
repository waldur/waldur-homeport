import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { StringField, FormContainer, SelectField } from '@waldur/form-react';
import { CheckboxField } from '@waldur/form-react/CheckboxField';
import { withTranslation, TranslateProps } from '@waldur/i18n';

interface FlowMapFilterProps extends TranslateProps {
  submitting: boolean;
}

const metricOptions = [
  {
    name: 'CPU',
    value: 'cpu',
  },
  {
    name: 'GPU',
    value: 'gpu',
  },
  {
    name: 'RAM',
    value: 'ram',
  },
  {
    name: 'Disk',
    value: 'disk',
  },
];

const serviceProviderTypeOptions = [
  {
    name: 'Batch',
    value: 'batch',
  },
  {
    name: 'VPC',
    value: 'vpc',
  },
];

const PureFlowMapFilter = (props: FlowMapFilterProps) => (
  <div className="ibox">
    <div className="ibox-content">
      <form className="form-inline" id="flow-map-form">
        <FormContainer
          labelClass="m-r-md"
          controlClass="m-r-md"
          submitting={props.submitting}
        >
          <StringField label={props.translate('Month')} name="month" />
          <SelectField
            className="metrics-select"
            label={props.translate('Metric')}
            name="metric"
            options={metricOptions}
            labelKey="name"
            valueKey="value"
          />
          <CheckboxField
            checked={false}
            label={props.translate('Show shared')}
            name="show_shared"
          />
          <CheckboxField
            checked={false}
            label={props.translate('Show private')}
            name="show_private"
          />
          <SelectField
            className="metrics-select"
            label={props.translate('Service provider type')}
            name="service_provider_type"
            options={serviceProviderTypeOptions}
            labelKey="name"
            valueKey="value"
          />
        </FormContainer>
      </form>
    </div>
  </div>
);

const enhance = compose(reduxForm({ form: 'flowMapFilter' }), withTranslation);

export const FlowMapFilter = enhance(PureFlowMapFilter);
