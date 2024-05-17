import { Trash } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { archivePlan } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ArchivePlanButton = ({ plan, refetch }) => {
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to archive plan {name}?',
          {
            name: <b>{plan.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      await archivePlan(plan.uuid);
      await refetch();
      dispatch(showSuccess(translate('Plan has been archived.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to archive plan.')));
    }
  };
  return (
    <Dropdown.Item onClick={handler}>
      <Trash size={18} /> {translate('Archive')}
    </Dropdown.Item>
  );
};
