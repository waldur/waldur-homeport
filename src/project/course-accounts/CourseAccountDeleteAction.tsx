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
    successMessage: translate('Course account has been deleted.'),
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

  return (
    <RemovalActionItem
      action={() => deleteMutation.mutate()}
      title={translate('Delete')}
      disabled={deleteMutation.isPending || row.state === 'Closed'}
      tooltip={
        row.state === 'Closed'
          ? translate('Cannot delete closed course account.')
          : undefined
      }
    />
  );
};
