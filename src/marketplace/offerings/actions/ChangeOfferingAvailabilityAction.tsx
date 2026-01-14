import { ArrowClockwiseIcon, ArrowFatDownIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { Offering } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff } from '@waldur/workspace/selectors';

const ChangeOfferingAvailabilityDialog = lazyComponent(() =>
  import('./ChangeOfferingAvailabilityDialog').then((module) => ({
    default: module.ChangeOfferingAvailabilityDialog,
  })),
);

export const ChangeOfferingAvailabilityAction = ({
  row,
  refetch,
}: {
  row: Offering;
  refetch;
}) => {
  const dispatch = useDispatch();

  const callback = () => {
    dispatch(
      openModalDialog(ChangeOfferingAvailabilityDialog, {
        resolve: { offering: row, refetch },
        size: 'lg',
      }),
    );
  };

  const isUserStaff = useSelector(isStaff);
  if (!isUserStaff) return null;

  return (
    <ActionItem
      title={
        row.state === 'Unavailable'
          ? translate('Restore')
          : translate('Set as down')
      }
      action={callback}
      iconNode={
        row.state === 'Unavailable' ? (
          <ArrowClockwiseIcon weight="bold" />
        ) : (
          <ArrowFatDownIcon weight="bold" />
        )
      }
      staff
    />
  );
};
