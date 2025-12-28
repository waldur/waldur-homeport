import React from 'react';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { AcceptTosWarning } from './AcceptTosWarning';
import { IdentityProviderCard } from './IdentityProviderCard';
import { TermsOfServiceCheckbox } from './TermsOfServiceCheckbox';
import { UserEditAvatarFormItem } from './UserEditAvatarFormItem';
import { UserEditRows } from './UserEditRows';

interface UserEditTabProps {
  user: User;
}

export const UserEditTab: React.FC<UserEditTabProps> = ({ user }) => {
  const currentUser = useSelector(getUser);

  const isSelf = currentUser.uuid === user.uuid;
  // Disable editing if viewing own profile and haven't accepted ToS
  const isDisabled = isSelf && !currentUser.agreement_date;
  // Show warning if the viewed user hasn't accepted ToS
  const showTosWarning = !user.agreement_date;

  return (
    <>
      <IdentityProviderCard user={user} />
      <FormTable.Card
        title={
          isSelf
            ? translate('Personal information')
            : translate('Profile settings')
        }
        className="card-bordered mb-7"
      >
        {showTosWarning && (
          <AcceptTosWarning isSelf={isSelf} userName={user.full_name} />
        )}
        <FormTable>
          {isSelf && !user.agreement_date && (
            <FormTable.Item value={<TermsOfServiceCheckbox user={user} />} />
          )}
          <UserEditAvatarFormItem user={user} disabled={isDisabled} />
          <UserEditRows user={user} disabled={isDisabled} />
        </FormTable>
      </FormTable.Card>
    </>
  );
};
