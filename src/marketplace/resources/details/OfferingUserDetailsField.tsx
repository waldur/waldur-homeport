import { OfferingUser } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { translate } from '@waldur/i18n';
import { OfferingUserStateField } from '@waldur/marketplace/OfferingUserStateField';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

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
