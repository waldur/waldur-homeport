import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

const AllocationDetailsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SlurmAllocationDetailsDialog" */ './details/AllocationDetailsDialog'
    ),
  'AllocationDetailsDialog',
);

export const DetailsAction = ({ resource }) => (
  <DialogActionItem
    title={translate('Details')}
    modalComponent={AllocationDetailsDialog}
    resource={resource}
    dialogSize="lg"
  />
);
