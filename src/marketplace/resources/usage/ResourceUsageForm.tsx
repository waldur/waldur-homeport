import * as React from 'react';
import { Options } from 'react-select';
import { InjectedFormProps } from 'redux-form';

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
      />
    );
    components.push(
      <TextField
        name={`components.${component.type}.description`}
        key={`${index}.description`}
        placeholder={translate('Comment')}
      />
    );
  });

  return (
    <form onSubmit={props.handleSubmit(props.submitReport)}>
      <div className="form-horizontal">
        <FormContainer
          submitting={props.submitting}
          labelClass="col-sm-2"
          controlClass="col-sm-10">
          <SelectField
            name="period"
            label={translate('Plan')}
            description={translate('Each usage report must be connected with a billing plan to assure correct calculation of accounting data.')}
            options={props.periods}
            onChange={props.onPeriodChange}
            clearable={false}
          />
          {components}
        </FormContainer>
      </div>
    </form>
  );
};
