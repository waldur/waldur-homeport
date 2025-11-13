import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { FormGroup, TextField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { orderProjectSelector } from '@waldur/marketplace/deploy/selectors';
import { TerminationDateField } from '@waldur/marketplace/deploy/steps/TerminationDateField';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { ResourceNameGroup } from '@waldur/openportal/ResourceNameGroup';

export const FormFinalConfigurationStep = (props: FormStepProps) => {
  const project = useSelector(orderProjectSelector);

  return (
    <VStepperFormStepCard
      title={translate('Final configuration')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <ResourceNameGroup
        nameValidate={props.params?.nameValidate}
        nameLabel={props.params?.nameLabel}
        offering={props.offering}
        project={project}
      />

      <Field
        name="attributes.description"
        component={FormGroup}
        maxLength={1000}
        label={translate('Description')}
      >
        <TextField />
      </Field>
      <div className="mb-7 border-bottom" />
      <TerminationDateField offering={props.offering} />
    </VStepperFormStepCard>
  );
};
