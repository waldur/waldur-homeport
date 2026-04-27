import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const VendorOfferingMappingCreateDialog = lazyComponent(() =>
  import('./VendorOfferingMappingCreateDialog').then((module) => ({
    default: module.VendorOfferingMappingCreateDialog,
  })),
);

interface VendorOfferingMappingCreateButtonProps {
  settings?: { uuid: string } | null;
  refetch: () => void;
}

export const VendorOfferingMappingCreateButton = ({
  settings,
  refetch,
}: VendorOfferingMappingCreateButtonProps) => {
  const dispatch = useDispatch();

  const openDialog = () => {
    dispatch(
      openModalDialog(VendorOfferingMappingCreateDialog, {
        resolve: { settings, refetch },
      }),
    );
  };

  return (
    <ActionButton
      title={translate('Add mapping')}
      action={openDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      disabled={!settings?.uuid}
      disabledReason={translate('Settings UUID is required')}
    />
  );
};
