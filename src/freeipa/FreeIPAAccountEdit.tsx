import React from 'react';

import { FormField, FormLabel } from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';

interface FreeIPAAccountEditOwnProps {
  profile: any;
}

const UsernameGroup = ({ profile }) => (
  <FormField className=" mb-5.5">
    <FormLabel>{translate('Username')}</FormLabel>
    <BaseInputField readOnly defaultValue={profile.username} solid />
  </FormField>
);

export const FreeIPAAccountEdit: React.FC<FreeIPAAccountEditOwnProps> = ({
  profile,
}) => {
  return (
    <div>
      <UsernameGroup profile={profile} />
      <FormField>
        <div className="float-right">
          {profile.is_active
            ? translate('Profile is enabled.')
            : translate('Profile is disabled.')}
        </div>
      </FormField>
    </div>
  );
};
