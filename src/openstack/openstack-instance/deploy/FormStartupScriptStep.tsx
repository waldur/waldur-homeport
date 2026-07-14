import classNames from 'classnames';
import { useState } from 'react';
import { Alert } from 'react-bootstrap';

import { AccordionCard } from '@/core/AccordionCard';
import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { Tip } from '@/core/Tooltip';
import { BooleanGroup, MonacoGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';

export const FormStartupScriptStep = (props: FormStepProps) => {
  const [scriptEnabled, setScriptEnabled] = useState(false);

  const scriptLabel = translate('Start script');
  const scriptDescription = scriptEnabled
    ? null
    : translate('This field is only editable when startup script is enabled.');
  const quickAction = (
    <AwesomeCheckbox
      value={scriptEnabled}
      size="sm"
      onChange={setScriptEnabled}
      className="align-self-center"
    />
  );

  return (
    <Tip id={`tip-${props.id}`} label={props.disabledTooltip}>
      <AccordionCard
        title={translate('Automation')}
        id={props.id}
        className={classNames('step-card', props.disabled && 'step-disabled')}
      >
        <Alert variant="warning" className="mb-4">
          {translate(
            'Cloud-init user data is stored and transmitted in plain text — it is kept unencrypted in the database, forwarded to OpenStack where any process on the instance can read it via the metadata service, and it may appear in logs. Do not put unencrypted secrets (passwords, private keys, API tokens) here; reference a secrets manager or inject them through an encrypted channel instead.',
          )}
        </Alert>
        {scriptEnabled ? (
          <MonacoGroup
            name="attributes.user_data"
            label={scriptLabel}
            description={scriptDescription}
            quickAction={quickAction}
            language="shell"
            height={200}
          />
        ) : (
          <TextGroup
            name="attributes.user_data"
            label={scriptLabel}
            description={scriptDescription}
            quickAction={quickAction}
            disabled
            rows={3}
          />
        )}
        <BooleanGroup
          name="attributes.config_drive"
          label={translate('Enable config drive')}
          tooltip={translate(
            'Config drive is a small read-only disk attached to the instance at boot. Cloud-init reads metadata, the SSH key and your start script from it, without needing to reach the OpenStack metadata service over the network (http://169.254.169.254). Enable this when the instance has no DHCP, sits on an isolated network, or must be configured before networking is up. Leave it off when the metadata service is reachable — that is the usual case.',
          )}
        />
      </AccordionCard>
    </Tip>
  );
};
