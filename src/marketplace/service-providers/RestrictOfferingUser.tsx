import { Check, Prohibit } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { updateOfferingUserRestrictionStatus } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

export const RestrictOfferingUserButton: FC<{
  row: any;
  refetch;
}> = (props) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to update the restriction status of this user?',
        ),
      );
    } catch {
      return;
    }
    try {
      await updateOfferingUserRestrictionStatus(props.row.uuid, {
        is_restricted: !props.row.is_restricted,
      });
      dispatch(showSuccess(translate('Restriction status has been updated.')));
      await props.refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to update the restriction status.'),
        ),
      );
    }
  };
  return (
    <RowActionButton
      action={callback}
      title={
        props.row.is_restricted
          ? translate('Unrestrict')
          : translate('Restrict')
      }
      iconNode={props.row.is_restricted ? <Check /> : <Prohibit />}
      size="sm"
    />
  );
};
