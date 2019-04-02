import * as React from 'react';
import { Options } from 'react-select';

import { FormContainer, NumberField, TextField, SelectField } from '@waldur/form-react';
import { StaticField } from '@waldur/form-react/StaticField';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

interface OwnProps {
  components: OfferingComponent[];
  periods: Options;
  submitting: boolean;
}

export const ResourceUsageForm = (props: OwnProps) => {
  const components = [];
  props.components.forEach((component: OfferingComponent, index) => {
    components.push(
      <NumberField
        name={`${component.type}.amount`}
        label={component.name}
        key={`${index}.amount`}
        description={component.description}
        unit={component.measured_unit}
        max={component.limit_period ? component.limit_amount : undefined}
      />
    );
    components.push(
      <TextField
        name={`${component.type}.description`}
        key={`${index}.description`}
        placeholder={translate('Comment')}
      />
    );
  });

  return (
    <div className="form-horizontal">
      <FormContainer
        submitting={props.submitting}
        labelClass="col-sm-2"
        controlClass="col-sm-10">
        {props.periods.length > 1 ? (
          <SelectField
            name="period"
            label={translate('Usage period')}
            options={props.periods}
          />
        ) : (
          <StaticField
            label={translate('Usage period')}
            value={props.periods[0].label}
            labelClass="col-sm-2"
            controlClass="col-sm-10"
          />
        )}
        {components}
      </FormContainer>
    </div>
  );
};
