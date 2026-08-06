import { PauseCircleIcon } from '@phosphor-icons/react';
import {
  RemoteProject,
  openportalRemoteProjectsHoldIndefinitely,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface Props {
  row: RemoteProject;
  refetch: () => void;
}

export const HoldIndefinitelyButton = ({ row, refetch }: Props) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openportalRemoteProjectsHoldIndefinitely({
        path: { uuid: row.uuid },
      }),
    refetch,
    successMessage: translate('Remote project is now held indefinitely.'),
    errorMessage: translate('Unable to hold remote project.'),
    confirmation: {
      title: translate('Hold indefinitely'),
      body: translate(
        'This suspends automatic approval for this project until it is explicitly approved. Continue?',
      ),
    },
  });

  return (
    <ActionItem
      title={translate('Hold indefinitely')}
      action={mutate}
      disabled={isPending}
      iconNode={<PauseCircleIcon weight="bold" />}
    />
  );
};
