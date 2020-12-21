import { FunctionComponent } from 'react';
import { Field, InjectedFormProps } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  NumberField,
  SelectField,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { UsageReportContext } from './types';

export interface ResourceUsageFormProps extends InjectedFormProps {
  components: OfferingComponent[];
  periods: any;
  params: UsageReportContext;
  submitReport(): void;
  onPeriodChange(): void;
}

const StaticPlanField: FunctionComponent = () => (
  <Field
    name="period"
    component={(fieldProps) => (
      <p>
        <strong>{translate('Period')}</strong>: {fieldProps.input.value.label}
      </p>
    )}
  />
);

const SummaryField = ({ label, value }) => (
  <p>
    <strong>{label}</strong>: {value}
  </p>
);

export const ResourceUsageForm: FunctionComponent<ResourceUsageFormProps> = (
  props,
) => {
  const components = [];
  props.components.forEach((component: OfferingComponent, index) => {
    components.push(
      <NumberField
        name={`components.${component.type}.amount`}
        label={component.name}
        key={`${index}.amount`}
        description={component.description}
        unit={component.measured_unit}
        max={component.limit_period ? component.limit_amount : undefined}
        required={true}
        validate={required}
        placeholder={translate('Amount')}
      />,
    );
    components.push(
      <TextField
        name={`components.${component.type}.description`}
        key={`${index}.description`}
        placeholder={translate('Comment')}
        hideLabel={true}
      />,
    );
    components.push(
      <AwesomeCheckboxField
        name={`components.${component.type}.recurring`}
        key={`${index}.recurring`}
        label={translate('Reported value is reused every month until changed.')}
        hideLabel={true}
      />,
    );
  });

  return (
    <form onSubmit={props.handleSubmit(props.submitReport)}>
      <FormContainer submitting={props.submitting} layout="vertical">
        <SummaryField
          label={translate('Client organization')}
          value={props.params.customer_name}
        />
        <SummaryField
          label={translate('Client project')}
          value={props.params.project_name}
        />
        {props.params.backend_id && (
          <SummaryField
            label={translate('Backend ID')}
            value={props.params.backend_id}
          />
        )}
        {props.periods.length > 1 ? (
          <SelectField
            name="period"
            label={translate('Plan')}
            tooltip={translate(
              'Each usage report must be connected with a billing plan to assure correct calculation of accounting data.',
            )}
            options={props.periods}
            onChange={props.onPeriodChange}
            isClearable={false}
          />
        ) : (
          <StaticPlanField />
        )}
        {components}
      </FormContainer>
    </form>
  );
};
