import { OfferingUser, Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import { isProjectMember } from '@/permissions/isProjectMember';
import { Field } from '@/resource/summary';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

export const OfferingUserDetailsField = ({
  offeringUser,
  resource,
}: {
  offeringUser: OfferingUser;
  resource: Resource;
}) => {
  const user = useUser();

  if (!offeringUser) {
    return null;
  }

  // Only reveal the offering username to users who are directly connected to
  // the resource's project. Privileged users browsing a
  // project they don't belong to should not see it, even if an offering user
  // exists for them on the offering.
  if (!isProjectMember(user, resource?.project_uuid, { includeStaff: false })) {
    return null;
  }

  const username = renderFieldOrDash(offeringUser.username);
  const showStateBadge = offeringUser.state && offeringUser.state !== 'OK';

  return (
    <Field
      label={translate('Username')}
      value={
        <div className="d-flex align-items-center gap-2">
          <b>{username}</b>
          {username !== DASH_ESCAPE_CODE && (
            <CopyToClipboardButton value={username} />
          )}
          {showStateBadge && <OfferingUserStateField row={offeringUser} />}
        </div>
      }
    />
  );
};
