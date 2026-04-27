import { FormLabel } from 'react-bootstrap';
import { Field } from 'redux-form';

import { loadLocationOptions } from '@/azure/vm/utils';
import { required } from '@/core/validators';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { SelectField } from '@/form/SelectField';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';

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
        required={true}
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
        required={true}
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
