import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

import { AudienceFields } from '../AudienceFields';
import { RecipientsList } from '../RecipientsList';
import { BroadcastFormData } from '../types';

const RecipientsListQuery = () => {
  const { values } = useFormState<BroadcastFormData>();
  return <RecipientsList query={values} />;
};

export const RecipientsStep: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-5">
      <div
        className="sm:col-span-4"
        style={{
          borderRight: '2px solid #eff2f5',
          paddingRight: 20,
        }}
      >
        <AudienceFields
          allUsersLabel={translate('Send message to all users')}
        />
      </div>
      <div className="sm:col-span-7">
        <RecipientsListQuery />
      </div>
    </div>
  </WizardModal>
);
