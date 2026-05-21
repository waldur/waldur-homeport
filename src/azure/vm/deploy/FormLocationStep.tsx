import { FormLabel } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { loadLocationOptions } from '@/azure/vm/utils';
import { required } from '@/core/validators';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { SelectField } from '@/form/SelectField';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { VStepperFormStepCard } from '@/wizard';

export const FormLocationStep = (props: FormStepProps) => (
  <VStepperFormStepCard
    title={translate('Location')}
    id={props.id}
    disabled={props.disabled}
    disabledTooltip={props.disabledTooltip}
  >
    <div className="mb-7">
      <FormLabel className="required">{translate('Location')}</FormLabel>
      <AsyncSelectField
        name="attributes.location"
        loadOptions={(query, prevOptions, currentPage) =>
          loadLocationOptions(
            props.offering.scope_uuid,
            query,
            prevOptions,
            currentPage,
          )
        }
        validate={required}
      />
    </div>
    <div className="mb-7">
      <FormLabel className="required">
        {translate('Availability zone')}
      </FormLabel>
      <Field
        name="attributes.availability_zone"
        options={[
          { label: translate('First'), value: 1 },
          { label: translate('Second'), value: 2 },
          { label: translate('Third'), value: 3 },
        ]}
        validate={required}
        component={SelectField}
      />
    </div>
  </VStepperFormStepCard>
);
