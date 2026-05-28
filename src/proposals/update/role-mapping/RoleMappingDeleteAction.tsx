import { FunctionComponent } from 'react';
import { callProposalProjectRoleMappingsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const RoleMappingDeleteAction: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      callProposalProjectRoleMappingsDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Delete mapping'),

      body: translate('Are you sure you would like to delete the mapping?'),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Mapping has been deleted.'),
    errorMessage: translate('Unable to delete mapping.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
