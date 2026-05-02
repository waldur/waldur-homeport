import { PencilSimpleIcon } from '@phosphor-icons/react';
import type { ArrowVendorOfferingMapping } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const VendorOfferingMappingEditDialog = lazyComponent(() =>
  import('./VendorOfferingMappingEditDialog').then((module) => ({
    default: module.VendorOfferingMappingEditDialogWrapper,
  })),
);

export const VendorOfferingMappingEditAction = ({
  row,
  refetch,
}: {
  row: ArrowVendorOfferingMapping;
  refetch: () => void;
}) => {
  const { openDialog } = useModal();

  const handleEdit = () => {
    openDialog(VendorOfferingMappingEditDialog, {
      resolve: { mapping: row, refetch },
    });
  };

  return (
    <ActionItem
      title={translate('Edit')}
      action={handleEdit}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
