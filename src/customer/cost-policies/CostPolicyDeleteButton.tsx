import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

import { deleteOrganizationCostPolicy, deleteProjectCostPolicy } from './api';
import { CostPolicyType } from './types';

export const CostPolicyDeleteButton = ({
  row,
  refetch,
  type,
}: {
  row;
  refetch;
  type: CostPolicyType;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        type === 'project'
          ? translate(
              'Are you sure you want to delete the cost policy for project {name}?',
              { name: <strong>{row.scope_name}</strong> },
              formatJsxTemplate,
            )
          : translate(
              'Are you sure you want to delete the cost policy for organization {name}?',
              { name: <strong>{row.scope_name}</strong> },
              formatJsxTemplate,
            ),
      );
    } catch {
      return;
    }
    if (type === 'project') {
      deleteProjectCostPolicy(row.uuid).then(() => {
        refetch();
      });
    } else {
      deleteOrganizationCostPolicy(row.uuid).then(() => {
        refetch();
      });
    }
  };
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="outline-danger"
      iconNode={<Trash />}
      size="sm"
    />
  );
};
