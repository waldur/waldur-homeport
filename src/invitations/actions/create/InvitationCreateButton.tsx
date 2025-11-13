import { AtIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { InvitationContext } from '../types';
import { useCreateInvitation } from '../useCreateInvitation';

export const InvitationCreateButton: FC<
  Omit<InvitationContext, 'customer' | 'user'>
> = (context) => {
  const { callback, canInvite, loadingProjects } = useCreateInvitation(context);

  const tooltip = !canInvite
    ? translate("You don't have enough privileges to perform this operation.")
    : null;

  return (
    <ActionItem
      action={loadingProjects ? null : callback}
      title={translate('Invite by mail')}
      iconNode={
        // eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight
        loadingProjects ? <LoadingSpinnerIcon /> : <AtIcon weight="bold" />
      }
      disabled={!canInvite}
      tooltip={tooltip}
    />
  );
};
