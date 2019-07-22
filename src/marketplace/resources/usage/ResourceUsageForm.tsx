import * as React from 'react';
import { Options } from 'react-select';
import { InjectedFormProps, Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, NumberField, TextField, SelectField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { UsageReportContext } from './types';

export interface ResourceUsageFormProps extends InjectedFormProps {
  components: OfferingComponent[];
  periods: Options;
  params: UsageReportContext;
  submitReport(): void;
  onPeriodChange(): void;
}

const StaticPlanField = () => (
  <Field
    name="period"
    component={fieldProps => (
      <p>
        <strong>{translate('Period')}</strong>:
        {' '}
        {fieldProps.input.value.label}
      </p>
    )}
  />
);

export const ResourceUsageForm = (props: ResourceUsageFormProps) => {
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
      />
    );
    components.push(
      <TextField
        name={`components.${component.type}.description`}
        key={`${index}.description`}
        placeholder={translate('Comment')}
        hideLabel={true}
      />
    );
  });

  return (
    <form onSubmit={props.handleSubmit(props.submitReport)}>
      <FormContainer
        submitting={props.submitting}
        layout="vertical"
      >
        {props.periods.length > 1 ? (
          <SelectField
            name="period"
            label={translate('Plan')}
            tooltip={translate('Each usage report must be connected with a billing plan to assure correct calculation of accounting data.')}
            options={props.periods}
            onChange={props.onPeriodChange}
            clearable={false}
          />
        ) : <StaticPlanField/>}
        {components}
      </FormContainer>
    </form>
  );
};
