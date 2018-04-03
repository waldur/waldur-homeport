import * as React from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import Panel from '@waldur/core/Panel';
import { StringField, FormContainer, SelectField } from '@waldur/form-react';
import { CheckboxField } from '@waldur/form-react/CheckboxField';
import { withTranslation, TranslateProps } from '@waldur/i18n';

interface UsageMapFilterProps extends TranslateProps {
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
    name: 'DISK',
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
const PureUsageMapFilter = (props: UsageMapFilterProps) => (
  <Panel title={props.translate('Apply filters')}>
    <form>
      <FormContainer
        submitting={props.submitting}>
        <StringField
          label={props.translate('Month')}
          name="month"/>
        <SelectField
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
          label={props.translate('Service Provider Type')}
          name="service_provider_type"
          options={serviceProviderTypeOptions}
          labelKey="name"
          valueKey="value"
        />
      </FormContainer>
    </form>
  </Panel>
);

const enhance = compose(
  reduxForm({form: 'usageMapFilter'}),
  withTranslation,
);

export const UsageMapFilter = enhance(PureUsageMapFilter);
