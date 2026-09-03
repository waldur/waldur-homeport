import { TrashIcon } from '@phosphor-icons/react';
import { marketplacePlansArchive } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const ArchivePlanButton = ({ plan, refetch }) => {
  const archiveMutation = useManagedMutation<any, any, void>({
    mutationFn: () => marketplacePlansArchive({ path: { uuid: plan.uuid } }),
    successMessage: translate('Plan has been archived.'),
    errorMessage: translate('Unable to archive plan.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to archive plan {name}?',
        {
          name: <b>{plan.name}</b>,
        },
        formatJsxTemplate,
      ),
    },
  });
  return (
    <ActionItem
      title={translate('Archive')}
      action={() => archiveMutation.mutate()}
      iconNode={<TrashIcon weight="bold" />}
      disabled={archiveMutation.isPending}
    />
  );
};
