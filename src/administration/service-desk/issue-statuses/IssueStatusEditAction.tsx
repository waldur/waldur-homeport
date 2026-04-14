import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { IssueStatusAdmin } from './api';

const IssueStatusFormDialog = lazyComponent(() =>
  import('./IssueStatusForm').then((module) => ({
    default: module.IssueStatusForm,
  })),
);

export const IssueStatusEditAction = ({
  row,
  refetch,
}: {
  row: IssueStatusAdmin;
  refetch: () => void;
}) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        dispatch(
          openModalDialog(IssueStatusFormDialog, {
            size: 'sm',
            resolve: { issueStatus: row, refetch },
          }),
        )
      }
    />
  );
};
