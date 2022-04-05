import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { StringField, FormContainer, SelectField } from '@waldur/form';
import { CheckboxField } from '@waldur/form/CheckboxField';
import { withTranslation, TranslateProps } from '@waldur/i18n';

interface FlowMapFilterProps extends TranslateProps {
  submitting: boolean;
}

const metricOptions = [
  {
    label: 'CPU',
    value: 'cpu',
  },
  {
    label: 'GPU',
    value: 'gpu',
  },
  {
    label: 'RAM',
    value: 'ram',
  },
  {
    label: 'Disk',
    value: 'disk',
  },
];

const serviceProviderTypeOptions = [
  {
    label: 'Batch',
    value: 'batch',
  },
  {
    label: 'VPC',
    value: 'vpc',
  },
];

const PureFlowMapFilter: FunctionComponent<FlowMapFilterProps> = (props) => (
  <Card>
    <Card.Body>
      <form className="form-inline" id="flow-map-form">
        <FormContainer
          labelClass="me-3"
          controlClass="me-3"
          submitting={props.submitting}
        >
          <StringField label={props.translate('Month')} name="month" />
          <SelectField
            className="metrics-select"
            label={props.translate('Metric')}
            name="metric"
            options={metricOptions}
            isClearable={true}
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
            isClearable={true}
          />
        </FormContainer>
      </form>
    </Card.Body>
  </Card>
);

const enhance = compose(reduxForm({ form: 'flowMapFilter' }), withTranslation);

export const FlowMapFilter = enhance(PureFlowMapFilter);
