import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { supportIssueStatusesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/hooks';

import { IssueStatusAdmin } from './api';

export const IssueStatusDeleteAction = ({
  row,
  refetch,
}: {
  row: IssueStatusAdmin;
  refetch: () => void;
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  const handleDelete = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete issue status'),
        translate(
          'Are you sure you want to delete {name}? This may affect order processing if issues use this status.',
          { name: <strong>{row.name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await supportIssueStatusesDestroy({ path: { uuid: row.uuid } });
      showSuccess(translate('Issue status has been deleted.'));
      refetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to delete issue status.'));
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      iconNode={<TrashIcon weight="bold" />}
      action={handleDelete}
      className="text-danger"
    />
  );
};
