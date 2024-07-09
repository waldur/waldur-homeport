import { Money } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const MarkAsPaidDialog = lazyComponent(
  () => import('./MarkAsPaidDialog'),
  'MarkAsPaidDialog',
);

export const MarkAsPaidButton: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }
  return (
    <RowActionButton
      title={translate('Mark as paid')}
      disabled={row.state !== 'created'}
      iconNode={<Money />}
      size="sm"
      tooltip={
        row.state !== 'created'
          ? translate('Only a created invoice can be marked as paid.')
          : ''
      }
      action={() =>
        dispatch(
          openModalDialog(MarkAsPaidDialog, {
            resolve: { invoice: row, refetch },
            size: 'lg',
          }),
        )
      }
    />
  );
};
