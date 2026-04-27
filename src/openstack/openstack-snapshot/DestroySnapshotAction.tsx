import { openstackSnapshotsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DestroyActionItem } from '@/resource/actions/DestroyActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroySnapshotAction: ActionItemType = ({
  resource,
  refetch,
}) => {
  const backups: { name?: string }[] = resource.backups ?? [];
  const dialogSubtitle = backups.length
    ? translate('The following VM snapshots will also be deleted: {backups}.', {
        backups: backups.map((b) => b.name).join(', '),
      })
    : '';

  return (
    <DestroyActionItem
      validators={validators}
      resource={resource}
      refetch={refetch}
      dialogSubtitle={dialogSubtitle}
      apiMethod={(id) => openstackSnapshotsDestroy({ path: { uuid: id } })}
    />
  );
};
