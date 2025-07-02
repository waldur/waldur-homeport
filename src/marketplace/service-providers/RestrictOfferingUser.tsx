import { CheckIcon, ProhibitIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOfferingUsersUpdateRestricted } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
      await marketplaceOfferingUsersUpdateRestricted({
        path: { uuid: props.row.uuid },
        body: {
          is_restricted: !props.row.is_restricted,
        },
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
    <ActionItem
      action={callback}
      title={
        props.row.is_restricted
          ? translate('Unrestrict')
          : translate('Restrict')
      }
      iconNode={
        props.row.is_restricted ? (
          <CheckIcon weight="bold" />
        ) : (
          <ProhibitIcon weight="bold" />
        )
      }
    />
  );
};
