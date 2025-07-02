import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  marketplaceProviderResourcesSetEndDateByStaff,
  Resource,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const EditResourceEndDateDialog = lazyComponent(() =>
  import('./EditResourceEndDateDialog').then((module) => ({
    default: module.EditResourceEndDateDialog,
  })),
);

interface EditResourceEndDateByProviderActionProps {
  resource: Resource;
  refetch?(): void;
}

export const EditResourceEndDateByStaffAction = ({
  resource,
  refetch,
}: EditResourceEndDateByProviderActionProps) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () =>
    dispatch(
      openModalDialog(EditResourceEndDateDialog, {
        resolve: {
          resource,
          refetch,
          updateEndDate: (uuid, end_date) =>
            marketplaceProviderResourcesSetEndDateByStaff({
              path: { uuid },
              body: { end_date },
            }),
        },
      }),
    );

  return isStaff ? (
    <ActionItem
      title={translate('Set termination date')}
      action={callback}
      staff
      iconNode={<CalendarBlankIcon weight="bold" />}
    />
  ) : null;
};
