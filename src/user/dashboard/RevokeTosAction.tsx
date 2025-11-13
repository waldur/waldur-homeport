import { XIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

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
    <Dropdown.Item onClick={handleClick} className="text-danger">
      <XIcon size={16} className="me-2" weight="bold" />
      {translate('Revoke')}
    </Dropdown.Item>
  );
};
