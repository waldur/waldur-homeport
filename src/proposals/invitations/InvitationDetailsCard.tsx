import { FC, PropsWithChildren } from 'react';
import { PublicInvitation } from 'waldur-js-client';

import { formatDate, formatDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';

const DetailRow: FC<PropsWithChildren<{ label: string }>> = ({
  label,
  children,
}) => (
  <div className="flex gap-3">
    <div className="min-w-[125px]">{label}</div>
    <div className="text-quaternary">{children}</div>
  </div>
);

export const InvitationDetailsCard: FC<{ invitation: PublicInvitation }> = ({
  invitation,
}) => (
  <div className="card card-bordered mb-5">
    <div className="card-header">
      <div className="card-title">
        <h3>{translate('Invitation details')}</h3>
      </div>
    </div>
    <div className="card-body">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2.5">
        <div className="flex flex-col gap-2.5">
          <DetailRow label={translate('Call name:')}>
            {invitation.call_name}
          </DetailRow>
          {invitation.invited_by_name && (
            <DetailRow label={translate('Invited by:')}>
              {invitation.invited_by_name}
            </DetailRow>
          )}
          {invitation.max_assignments != null && (
            <DetailRow label={translate('Max. proposals:')}>
              {invitation.max_assignments}
            </DetailRow>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {invitation.invited_at && (
            <DetailRow label={translate('Invited on:')}>
              {formatDateTime(invitation.invited_at)}
            </DetailRow>
          )}
          {invitation.expires_at && (
            <DetailRow label={translate('Respond by:')}>
              {formatDate(invitation.expires_at)} ·{' '}
              {formatRelative(invitation.expires_at)}
            </DetailRow>
          )}
        </div>
      </div>
    </div>
  </div>
);
