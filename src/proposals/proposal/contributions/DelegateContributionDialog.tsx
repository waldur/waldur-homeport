import { ComponentProps, FC } from 'react';

import { DelegateContributionDialog as SharedDelegateContributionDialog } from 'waldur-proposals';

import { useUser } from '@/workspace/hooks';

type DialogProps = ComponentProps<typeof SharedDelegateContributionDialog>;

/**
 * The hand-on dialog lives in waldur-proposals, which knows no signed-in
 * user of its own: the portal tells it who is handing the contribution on,
 * so that person is not offered as a target.
 */
export const DelegateContributionDialog: FC<DialogProps> = ({ resolve }) => {
  const user = useUser();
  return (
    <SharedDelegateContributionDialog
      resolve={{ ...resolve, currentUserUuid: user?.uuid }}
    />
  );
};
