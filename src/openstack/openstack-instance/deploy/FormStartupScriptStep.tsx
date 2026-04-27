import classNames from 'classnames';
import { useState } from 'react';
import { Field } from 'redux-form';

import { AccordionCard } from '@/core/AccordionCard';
import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { Tip } from '@/core/Tooltip';
import { FormGroup, TextField } from '@/form';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';

export const FormStartupScriptStep = (props: FormStepProps) => {
  const [scriptEnabled, setScriptEnabled] = useState(false);

  return (
    <Tip id={`tip-${props.id}`} label={props.disabledTooltip}>
      <AccordionCard
        title={translate('Automation')}
        id={props.id}
        className={classNames('step-card', props.disabled && 'step-disabled')}
      >
        <Field
          name="attributes.user_data"
          component={FormGroup}
          label={translate('Start script')}
          spaceless
          description={
            scriptEnabled
              ? null
              : translate(
                  'This field is only editable when startup script is enabled.',
                )
          }
          quickAction={
            <AwesomeCheckbox
              value={scriptEnabled}
              size="sm"
              onChange={setScriptEnabled}
              className="align-self-center"
            />
          }
        >
          {scriptEnabled ? (
            <MonacoField language="shell" height={200} />
          ) : (
            <TextField disabled rows={3} />
          )}
        </Field>
      </AccordionCard>
    </Tip>
  );
};
