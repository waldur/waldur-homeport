import { TrashIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplacePlansArchive } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
      await marketplacePlansArchive({ path: { uuid: plan.uuid } });
      await refetch();
      dispatch(showSuccess(translate('Plan has been archived.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to archive plan.')));
    }
  };
  return (
    <Dropdown.Item onClick={handler}>
      <TrashIcon size={18} weight="bold" /> {translate('Archive')}
    </Dropdown.Item>
  );
};
