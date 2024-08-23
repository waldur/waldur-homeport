import { Eye } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { ACTIVE, PAUSED } from '../store/constants';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);
export const PreviewOfferingButton = ({ row }) => {
  const dispatch = useDispatch();

  if (![ACTIVE, PAUSED].includes(row.state)) {
    return null;
  }
  return (
    <Dropdown.Item
      as="button"
      onClick={() => {
        dispatch(
          openModalDialog(PreviewOfferingDialog, {
            resolve: { offering: row },
            size: 'lg',
          }),
        );
      }}
    >
      <span className="svg-icon svg-icon-2">
        <Eye />
      </span>
      {translate('Preview order form')}
    </Dropdown.Item>
  );
};
