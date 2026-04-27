import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { ExternalLink } from '@/core/ExternalLink';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { getUser } from '@/workspace/selectors';

import { AcceptTosWarning } from './AcceptTosWarning';
import { IdentityProviderIndicator } from './IdentityProviderIndicator';
import { TermsOfServiceCheckbox } from './TermsOfServiceCheckbox';
import { UserProfileTabs } from './UserProfileTabs';

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
      {showTosWarning && (
        <AcceptTosWarning isSelf={isSelf} userName={user.full_name} />
      )}
      {isSelf && !user.agreement_date && (
        <Card className="card-bordered mb-7">
          <Card.Body>
            <FormTable>
              <FormTable.Item value={<TermsOfServiceCheckbox user={user} />} />
            </FormTable>
          </Card.Body>
        </Card>
      )}
      <Card className="card-bordered mb-7">
        <Card.Header>
          <Card.Title>
            {isSelf
              ? translate('Personal information')
              : translate('Profile settings')}
          </Card.Title>
          <div className="card-toolbar gap-4">
            <IdentityProviderIndicator user={user} showManagementLink={false} />
            {user.identity_provider_management_url && (
              <ExternalLink
                label={translate('Manage profile')}
                url={user.identity_provider_management_url}
                className="btn btn-light-primary"
              />
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <UserProfileTabs user={user} disabled={isDisabled} />
        </Card.Body>
      </Card>
    </>
  );
};
