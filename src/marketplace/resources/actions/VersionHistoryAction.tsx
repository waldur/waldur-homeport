import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { ResourceAction } from './constants';

const VersionHistoryDialog = lazyComponent(() =>
  import('@/version-history/VersionHistoryDialog').then((module) => ({
    default: module.VersionHistoryDialog,
  })),
);

export const VersionHistoryAction: ActionItemType = ({ resource }) => (
  <DialogActionItem
    title={translate('Version history')}
    modalComponent={VersionHistoryDialog}
    dialogSize="xl"
    resource={resource}
    extraResolve={{
      entityType: 'resource',
      entityUuid: resource.uuid,
      entityName: resource.name,
    }}
    iconNode={<ClockCounterClockwiseIcon weight="bold" />}
    staff
    actionId={ResourceAction.VERSION_HISTORY}
  />
);
