import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import type { ArrowVendorOfferingMapping } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
  const dispatch = useDispatch();

  const handleEdit = () => {
    dispatch(
      openModalDialog(VendorOfferingMappingEditDialog, {
        resolve: { mapping: row, refetch },
      }),
    );
  };

  return (
    <ActionItem
      title={translate('Edit')}
      action={handleEdit}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
