import { FC } from 'react';
import { openportalProjectTemplateDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const ProjectTemplateDeleteButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      openportalProjectTemplateDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Delete project template'),

      body: translate(
        'Are you sure you would like to delete this project template?',
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Project template has been deleted.'),
    errorMessage: translate('Unable to delete this project template.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
