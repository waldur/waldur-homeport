import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isStaff } from '@/workspace/selectors';

const MoveOfferingDialog = lazyComponent(() =>
  import('./MoveOfferingDialog').then((module) => ({
    default: module.MoveOfferingDialog,
  })),
);

export const MoveOfferingAction = ({
  row,
  refetch,
}: {
  row: Offering;
  refetch;
}) => {
  const dispatch = useDispatch();

  const callback = () => {
    dispatch(
      openModalDialog(MoveOfferingDialog, {
        resolve: { offering: row, refetch },
      }),
    );
  };

  const isUserStaff = useSelector(isStaff);
  if (!isUserStaff) return null;

  return (
    <ActionItem
      title={translate('Move offering')}
      action={callback}
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
      staff
    />
  );
};
