import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  marketplaceResourceProjectsDestroy,
  ResourceProject,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const DeleteProjectAction: FC<{
  row: ResourceProject;
  resourceUuid: string;
  refetch(): void;
}> = ({ row, resourceUuid, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourceProjectsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Project deleted.'),
    errorMessage: translate('Unable to delete project.'),
    refetch,
    // Refresh the parent resource so the quota header (e.g. "CPU 0/100")
    // reflects the freed allocation immediately instead of waiting for
    // the next page load.
    invalidateQueries: [{ queryKey: ['resource-details', resourceUuid] }],
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete project {name}?',
        { name: <b>{row.name}</b> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={deleteMutation.isPending}
    />
  );
};
