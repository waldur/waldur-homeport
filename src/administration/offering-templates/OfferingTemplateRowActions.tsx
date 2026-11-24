import {
  ClockCounterClockwiseIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import {
  marketplaceOfferingTemplatesDestroy,
  OfferingTemplate,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const OfferingTemplateFormDialog = lazyComponent(() =>
  import('./OfferingTemplateFormDialog').then((module) => ({
    default: module.OfferingTemplateFormDialog,
  })),
);

const OfferingTemplateVersionsDialog = lazyComponent(() =>
  import('./OfferingTemplateVersionsDialog').then((module) => ({
    default: module.OfferingTemplateVersionsDialog,
  })),
);

interface OfferingTemplateRowActionsProps {
  row: OfferingTemplate;
  refetch(): void;
}

const DeleteAction: FC<OfferingTemplateRowActionsProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () =>
      marketplaceOfferingTemplatesDestroy({ path: { uuid: row.uuid } }),
    refetch,
    closeModal: false,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the offering template {name}? Offerings created from it are not affected.',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('Offering template deleted.'),
    errorMessage: translate('Unable to delete the offering template.'),
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => mutate()}
      disabled={isPending}
    />
  );
};

export const OfferingTemplateRowActions: FC<
  OfferingTemplateRowActionsProps
> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionsDropdown row={row} refetch={refetch}>
      <ActionItem
        title={translate('Edit')}
        action={() =>
          openDialog(OfferingTemplateFormDialog, {
            resolve: { template: row, refetch },
            size: 'lg',
          })
        }
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Version history')}
        action={() =>
          openDialog(OfferingTemplateVersionsDialog, {
            resolve: { template: row },
            size: 'lg',
          })
        }
        iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      />
      <DeleteAction row={row} refetch={refetch} />
    </ActionsDropdown>
  );
};
