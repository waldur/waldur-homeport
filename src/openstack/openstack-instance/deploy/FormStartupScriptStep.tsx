import { useState } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { TextField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

export const FormStartupScriptStep = (props: FormStepProps) => {
  const [scriptEnabled, setScriptEnabled] = useState(false);

  return (
    <StepCard
      title={translate('Startup script')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
      actions={
        <AwesomeCheckbox value={scriptEnabled} onChange={setScriptEnabled} />
      }
    >
      {scriptEnabled ? (
        <Field
          name="startup_script"
          mode="shell"
          component={MonacoField}
          height={200}
          options={{ scrollBeyondLastLine: false }}
        />
      ) : (
        <TextField
          disabled
          placeholder={translate(
            'This field is only editable when startup script is enabled.',
          )}
        />
      )}
    </StepCard>
  );
};
