import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const UpdateResourceOptionsDialog = lazyComponent(
  () => import('./UpdateResourceOptionsDialog'),
  'UpdateResourceOptionsDialog',
);

export const UpdateResourceOptionsAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    title={translate('Update options')}
    modalComponent={UpdateResourceOptionsDialog}
    resource={resource}
    extraResolve={{ refetch }}
  />
);
