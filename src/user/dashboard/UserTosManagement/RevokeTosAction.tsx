import { XIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { RevokeTosDialog } from './RevokeTosDialog';

export const RevokeTosAction = ({ tos, offering, refetch, offeringUuid }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openModalDialog(RevokeTosDialog, {
        resolve: { tos, offering, refetch, offeringUuid },
        size: 'lg',
      }),
    );
  };

  return (
    <ActionItem
      title={translate('Revoke')}
      action={handleClick}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
