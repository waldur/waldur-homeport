import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateResourceEndDateByProvider } from '@waldur/marketplace/common/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const EditResourceEndDateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "EditResourceEndDateDialog" */ './EditResourceEndDateDialog'
    ),
  'EditResourceEndDateDialog',
);

interface EditResourceEndDateByProviderActionProps {
  resource: Resource;
  reInitResource?(): void;
  refreshList?(): void;
}

export const EditResourceEndDateByProviderAction = ({
  resource,
  reInitResource,
  refreshList,
}: EditResourceEndDateByProviderActionProps) => {
  const dispatch = useDispatch();

  const callback = () =>
    dispatch(
      openModalDialog(EditResourceEndDateDialog, {
        resolve: {
          resource,
          reInitResource,
          refreshList,
          updateEndDate: updateResourceEndDateByProvider,
        },
        size: 'md',
      }),
    );

  return <ActionItem title={translate('Edit end date')} action={callback} />;
};
