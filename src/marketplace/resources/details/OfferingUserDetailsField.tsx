import { OfferingUser } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';

export const OfferingUserDetailsField = ({
  offeringUser,
}: {
  offeringUser: OfferingUser;
}) => {
  if (!offeringUser) {
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
          {username !== 'N/A' && <CopyToClipboardButton value={username} />}
          {showStateBadge && <OfferingUserStateField row={offeringUser} />}
        </div>
      }
    />
  );
};
