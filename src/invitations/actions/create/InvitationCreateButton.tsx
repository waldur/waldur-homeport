import { AtIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { InvitationContext } from '../types';
import { useCreateInvitation } from '../useCreateInvitation';

export const InvitationCreateButton: FC<
  Omit<InvitationContext, 'customer' | 'user'>
> = (context) => {
  const { callback, canInvite } = useCreateInvitation(context);

  const tooltip = !canInvite
    ? translate("You don't have enough privileges to perform this operation.")
    : null;

  return (
    <ActionItem
      action={callback}
      title={translate('Invite by mail')}
      iconNode={<AtIcon weight="bold" />}
      disabled={!canInvite}
      tooltip={tooltip}
    />
  );
};
