import {
  CourseAccount,
  marketplaceCourseAccountsDestroy,
} from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface OwnProps {
  row: CourseAccount;
  refetch;
}

export const CourseAccountDeleteAction = ({ row, refetch }: OwnProps) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceCourseAccountsDestroy({ path: { uuid: row.uuid } }),
    // Closing now happens asynchronously on the backend: the request only
    // queues it, the row moves to Pending, and it settles into Closed (or
    // Erred) once the task runs.
    successMessage: translate('Course account closure has been requested.'),
    errorMessage: translate('Unable to delete course account.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the {name} course account?',
        {
          name: (
            <strong>{row.project_name || row.email || row.username}</strong>
          ),
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true, size: 'sm' },
    },
  });

  const disabledReason =
    row.state === 'Closed'
      ? translate('Cannot delete closed course account.')
      : row.state === 'Pending'
        ? translate('Course account is already being processed.')
        : undefined;

  return (
    <RemovalActionItem
      action={() => deleteMutation.mutate()}
      title={translate('Delete')}
      disabled={deleteMutation.isPending || Boolean(disabledReason)}
      tooltip={disabledReason}
    />
  );
};
