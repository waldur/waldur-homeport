import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';

import { parseBroadcast } from './utils';

const BroadcastUpdateDialog = lazyComponent(() =>
  import('./BroadcastFormDialog').then((module) => ({
    default: module.BroadcastFormDialog,
  })),
);

export const BroadcastUpdateButton: FunctionComponent<{
  row: BroadcastMessage;
  refetch;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={BroadcastUpdateDialog}
    row={row}
    buildResolve={(r) => ({ uuid: r.uuid, refetch })}
    getInitialValues={parseBroadcast}
    size="xl"
    title={translate('Update')}
  />
);
