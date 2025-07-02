import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { Offering } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff } from '@waldur/workspace/selectors';

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

  if (!isStaff) return null;

  return (
    <ActionItem
      title={translate('Move offering')}
      action={callback}
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
      staff
    />
  );
};
