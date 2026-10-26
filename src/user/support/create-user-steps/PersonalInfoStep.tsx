import { FC } from 'react';

import { StringGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';
import { WizardModal, WizardStepProps } from '@/wizard';

import { lockedProps } from './lockedFields';

export const PersonalInfoStep: FC<WizardStepProps> = (props) => {
  return (
    <WizardModal {...props}>
      <div className="row">
        <div className="col-sm-6">
          <StringGroup
            name="first_name"
            label={translate('First name')}
            {...lockedProps(props.data, 'first_name')}
          />
        </div>
        <div className="col-sm-6">
          <StringGroup
            name="last_name"
            label={translate('Last name')}
            {...lockedProps(props.data, 'last_name')}
          />
        </div>
      </div>
      {isProfileAttributeEnabled('native_name') && (
        <StringGroup
          name="native_name"
          label={translate('Native name')}
          {...lockedProps(props.data, 'native_name')}
        />
      )}
      <h6 className="font-medium mb-4 mt-6">
        {translate('Organization & Contact')}
      </h6>
      <StringGroup
        name="organization"
        label={translate('Organization name')}
        {...lockedProps(props.data, 'organization')}
      />
      <StringGroup
        name="job_title"
        label={translate('Job position')}
        {...lockedProps(props.data, 'job_title')}
      />
      {isProfileAttributeEnabled('phone_number') && (
        <StringGroup
          name="phone_number"
          label={translate('Phone number')}
          description={translate(
            'International format with country code, e.g. +1 202 555 1234',
          )}
          {...lockedProps(props.data, 'phone_number')}
        />
      )}
      <TextGroup
        name="description"
        label={translate('Description')}
        description={translate(
          'Additional account description invisible to user',
        )}
        spaceless
      />
    </WizardModal>
  );
};
