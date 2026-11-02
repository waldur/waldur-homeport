import { OfferingUser, Resource } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import { isProjectMember } from '@/permissions/isProjectMember';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

export const OfferingUserDetailsField = ({
  offeringUser,
  resource,
}: {
  offeringUser: Pick<
    OfferingUser,
    'state' | 'uuid' | 'service_provider_comment' | 'username'
  >;
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

  const showStateBadge = offeringUser.state && offeringUser.state !== 'OK';

  return (
    <PropertyItem
      label={translate('Username')}
      value={
        <div className="flex items-center gap-1.5">
          <b>{renderFieldOrDash(offeringUser.username)}</b>
          {showStateBadge && <OfferingUserStateField row={offeringUser} />}
        </div>
      }
      copyValue={offeringUser.username || undefined}
    />
  );
};
