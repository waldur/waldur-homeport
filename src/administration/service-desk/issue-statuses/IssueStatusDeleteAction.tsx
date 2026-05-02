import { supportIssueStatusesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { IssueStatusAdmin } from './api';

export const IssueStatusDeleteAction = ({
  row,
  refetch,
}: {
  row: IssueStatusAdmin;
  refetch: () => void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => supportIssueStatusesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Issue status has been deleted.'),
    errorMessage: translate('Unable to delete issue status.'),
    refetch,
    confirmation: {
      title: translate('Delete issue status'),
      body: translate(
        'Are you sure you want to delete {name}? This may affect order processing if issues use this status.',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
