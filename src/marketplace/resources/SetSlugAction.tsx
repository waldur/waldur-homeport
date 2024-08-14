import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const SetSlugDialog = lazyComponent(
  () => import('./SetSlugDialog'),
  'SetSlugDialog',
);

export const SetSlugAction: ActionItemType = ({ resource, refetch }) => {
  return (
    <DialogActionItem
      title={translate('Set slug')}
      modalComponent={SetSlugDialog}
      extraResolve={{ refetch }}
      resource={resource}
      staff
    />
  );
};
