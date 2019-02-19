import * as React from 'react';

import { FormContainer, NumberField } from '@waldur/form-react';
import { DateField } from '@waldur/form-react/DateField';
import { translate } from '@waldur/i18n';
import { PlanUnit } from '@waldur/marketplace/orders/types';
import { OfferingComponent } from '@waldur/marketplace/types';

interface OwnProps {
  components: OfferingComponent[];
  plan_unit: PlanUnit;
  submitting: boolean;
}

const formatUnit = (unit: PlanUnit) => {
  switch (unit) {
    case 'day':
    return translate('Usage period corresponds to one day.');

    case 'month':
    return translate('Usage period corresponds to one month.');

    case 'half_month':
    return translate('Usage period corresponds to one half of month.');
  }
};

const formatDescription = (unit: PlanUnit) => {
  // tslint:disable-next-line:max-line-length
  const message = translate('If value for usage period does not exist yet, it will be created, otherwise new value wíll override old value.');
  return `${formatUnit(unit)} ${message}`;
};

export const ResourceUsageForm = (props: OwnProps) => (
  <div className="form-horizontal">
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-4"
      controlClass="col-sm-8">
      <DateField
        name="date"
        label={translate('Usage period')}
        description={formatDescription(props.plan_unit)}
      />
      {props.components.map((component: OfferingComponent, index) => (
        <NumberField
          name={component.type}
          label={component.name}
          key={index}
          description={component.description}
          unit={component.measured_unit}
          max={component.limit_period ? component.limit_amount : undefined}
        />
      ))}
    </FormContainer>
  </div>
);
