import { FormLabel } from 'react-bootstrap';
import { Field } from 'redux-form';

import { loadLocationOptions } from '@waldur/azure/vm/utils';
import { required } from '@waldur/core/validators';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { SelectField } from '@waldur/form/SelectField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

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
