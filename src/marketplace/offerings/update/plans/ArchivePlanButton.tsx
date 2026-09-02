import { TrashIcon } from '@phosphor-icons/react';
import { marketplacePlansArchive } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';

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
    <ActionsDropdownItem
      onSelect={() => archiveMutation.mutate()}
      disabled={archiveMutation.isPending}
    >
      <TrashIcon size={18} weight="bold" /> {translate('Archive')}
    </ActionsDropdownItem>
  );
};
