import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Rule } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const RuleFormDialog = lazyComponent(() =>
  import('./RuleFormDialog').then((module) => ({
    default: module.RuleFormDialog,
  })),
);

interface RuleEditButtonProps {
  row: Rule;
  refetch;
}

export const RuleEditButton: FC<RuleEditButtonProps> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(RuleFormDialog, {
          resolve: { refetch, rule: row },
          initialValues: {
            name: row.name,
            customer: {
              url: row.customer,
              name: row.customer_name,
            },
            project_role: row.project_role_display_name,
            user_affiliations: row.user_affiliations?.join(', ') || '',
            user_email_patterns: row.user_email_patterns?.join(' ') || '',
          },
        }),
      ),
    [dispatch, row, refetch],
  );

  return <EditAction action={callback} />;
};
