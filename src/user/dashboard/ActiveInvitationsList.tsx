import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Invitation, User, userInvitationsList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { InvitationAlertItem } from './InvitationAlertItem';

interface ActiveInvitationsListProps {
  user: User;
}

export const ActiveInvitationsList: FunctionComponent<
  ActiveInvitationsListProps
> = ({ user }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activeInvitations', user.email],
    queryFn: async () => {
      const response = await userInvitationsList({
        query: {
          state: ['pending', 'project'],
          email_exact: user.email,
        },
      });
      return response.data as Invitation[];
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-danger">
        {translate('Failed to load invitations')}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-muted text-center py-4">
        {translate('No pending invitations')}
      </div>
    );
  }

  return (
    <div>
      {data.map((invitation) => (
        <InvitationAlertItem key={invitation.uuid} invitation={invitation} />
      ))}
      <p className="text-muted mt-4 mb-0">
        {translate('Check your email for the invitation link to accept.')}
      </p>
    </div>
  );
};
