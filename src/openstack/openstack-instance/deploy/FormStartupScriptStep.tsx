import classNames from 'classnames';
import { useState } from 'react';
import { Field } from 'react-final-form';

import { AccordionCard } from '@/core/AccordionCard';
import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { Tip } from '@/core/Tooltip';
import { FormGroup, TextField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
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
        <Field
          name="attributes.config_drive"
          component={AwesomeCheckboxField}
          label={translate('Enable config drive')}
          tooltip={translate(
            'Config drive is a small read-only disk attached to the instance at boot. Cloud-init reads metadata, the SSH key and your start script from it, without needing to reach the OpenStack metadata service over the network (http://169.254.169.254). Enable this when the instance has no DHCP, sits on an isolated network, or must be configured before networking is up. Leave it off when the metadata service is reachable — that is the usual case.',
          )}
        />
      </AccordionCard>
    </Tip>
  );
};
