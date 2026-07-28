import { EventGroup } from '@/events/types';
import { getAffectedUserContext } from '@/events/utils';
import { translate } from '@/i18n';

import { AuthEnum } from '../EventsEnums';

// Human-readable, translatable text for each pat_authentication_rejected
// reason. The backend stores the raw reason enum in the event context; the
// frontend owns the display string so it localises. Resolved per render, not
// at module load, so it follows a language switch the way event titles do.
const getRejectionReasonLabel = (reason: string) => {
  switch (reason) {
    case 'revoked':
      return translate('the token has been revoked');
    case 'user_inactive':
      return translate('the owner account is inactive');
    case 'permission_revoked':
      return translate('the owner may no longer use personal access tokens');
    default:
      return reason || '';
  }
};

const getPatEventContext = (event: any) => ({
  ...getAffectedUserContext(event),
  reason_label: getRejectionReasonLabel(event.reason),
});

export const PatEvents: EventGroup = {
  title: translate('Personal access token events'),
  context: getPatEventContext,
  events: [
    {
      key: AuthEnum.pat_created,
      title: translate(
        'Personal access token {pat_name} has been created for user {affected_user_link}.',
      ),
    },
    {
      key: AuthEnum.pat_revoked,
      title: translate(
        'Personal access token {pat_name} has been revoked for user {affected_user_link}.',
      ),
    },
    {
      key: AuthEnum.pat_rotated,
      title: translate(
        'Personal access token {pat_name} has been rotated for user {affected_user_link}.',
      ),
    },
    {
      key: AuthEnum.pat_expired,
      title: translate(
        'Personal access token {pat_name} has expired for user {affected_user_link}.',
      ),
    },
    {
      key: AuthEnum.pat_used_from_new_ip,
      title: translate(
        'Personal access token {pat_name} for user {affected_user_link} was used from a new IP address.',
      ),
    },
    {
      key: AuthEnum.pat_access_denied_from_ip,
      title: translate(
        'Personal access token {pat_name} for user {affected_user_link} was rejected: source address outside the token network ACL.',
      ),
    },
    {
      key: AuthEnum.pat_authentication_rejected,
      title: translate(
        'Personal access token {pat_name} for user {affected_user_link} was rejected: {reason_label}.',
      ),
    },
    {
      key: AuthEnum.pat_network_acl_updated,
      title: translate(
        'Network ACL of personal access token {pat_name} has been updated for user {affected_user_link}.',
      ),
    },
  ],
};
