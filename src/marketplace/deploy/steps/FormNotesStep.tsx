import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

import { FormStepProps } from '../types';

import { OrderAttachmentField } from './OrderAttachmentField';
import { OrderCommentField } from './OrderCommentField';

export const FormNotesStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Notes and attachments')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <OrderCommentField />
      <OrderAttachmentField />
    </VStepperFormStepCard>
  );
};
