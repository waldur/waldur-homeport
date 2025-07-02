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
  const isDisabled = !currentUser.agreement_date;

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
        {!currentUser.agreement_date && <AcceptTosWarning />}
        <FormTable>
          {currentUser.uuid === user.uuid && (
            <FormTable.Item value={<TermsOfServiceCheckbox user={user} />} />
          )}
          <UserEditAvatarFormItem user={user} disabled={isDisabled} />
          <UserEditRows user={user} disabled={isDisabled} />
        </FormTable>
      </FormTable.Card>
    </>
  );
};
