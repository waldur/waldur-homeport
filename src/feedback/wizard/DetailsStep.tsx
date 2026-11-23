import { FC } from 'react';

import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { MarkdownGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';

import { getDisabledReason, requiredText } from './validation';

export const DetailsStep: FC<WizardStepProps> = (props) => (
  <WizardModal
    {...props}
    submitTooltip={props.invalid ? getDisabledReason(props.errors) : undefined}
  >
    <StringGroup
      name="name"
      label={translate('Name')}
      required
      validate={requiredText}
    />
    <MarkdownGroup
      name="intro"
      label={translate('Intro')}
      description={translate(
        'Shown above the questions. Tell respondents that staff will see who answered.',
      )}
    />
  </WizardModal>
);
