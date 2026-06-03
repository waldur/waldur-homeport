import { WarningOctagonIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  marketplaceResourceProjectsDestroy,
  ResourceProject,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const ForceDeleteProjectAction: FC<{
  row: ResourceProject;
  resourceUuid: string;
  refetch(): void;
}> = ({ row, resourceUuid, refetch }) => {
  const forceDeleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourceProjectsDestroy({
        path: { uuid: row.uuid },
        query: { force: true },
      }),
    successMessage: translate('Project permanently deleted.'),
    errorMessage: translate('Unable to permanently delete project.'),
    refetch,
    invalidateQueries: [{ queryKey: ['resource-details', resourceUuid] }],
    confirmation: {
      title: translate('Permanent deletion'),
      body: translate(
        'This will hard-delete project {name} from the database, bypassing soft delete. The action cannot be undone. Continue?',
        { name: <b>{row.name}</b> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Permanently delete')}
      action={() => forceDeleteMutation.mutate()}
      iconNode={<WarningOctagonIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      staff
      disabled={forceDeleteMutation.isPending}
    />
  );
};
