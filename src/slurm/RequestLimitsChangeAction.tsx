import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const RequestLimitsChangeDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RequestLimitsChangeDialog" */ './RequestLimitsChangeDialog'
    ),
  'RequestLimitsChangeDialog',
);

export const RequestLimitsChangeAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Request limits change')}
    modalComponent={RequestLimitsChangeDialog}
    resource={resource}
  />
);
